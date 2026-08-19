import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useLeadFormModal } from "@/contexts/LeadFormModalContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Shield, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  trackModalStepView,
  trackModalStepCompleted,
  trackFormError,
  trackFormStart,
  trackFormSubmit,
  trackFormSubmitFailed,
  createEventId,
} from "@/lib/analytics";
import { getLeadContext } from "@/lib/leadContext";

// Zod validation schema
const formSchema = z.object({
  // Schritt 1
  fahrzeugtyp: z.string().min(1, "Bitte wählen Sie einen Fahrzeugtyp."),
  tonnage: z.string().min(1, "Bitte wählen Sie die gewünschte Tonnage."),
  mietdauer: z.string().min(1, "Bitte wählen Sie die Mietdauer."),
  starttermin: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Bitte geben Sie ein gültiges Startdatum an.",
  }),
  plz: z.string().min(3, "Bitte geben Sie eine gültige PLZ oder Region ein."),
  bereitstellung: z.string().min(1, "Bitte wählen Sie eine Option."),
  nachricht: z.string().optional(),
  versicherung: z.boolean(),

  // Schritt 2
  vorname: z.string().min(2, "Bitte geben Sie Ihren Vornamen an."),
  nachname: z.string().min(2, "Bitte geben Sie Ihren Nachnamen an."),
  unternehmen: z.string().min(2, "Bitte geben Sie Ihr Unternehmen an."),
  email: z.string().min(1, "Bitte geben Sie Ihre E-Mail-Adresse an.").email("Bitte geben Sie eine gültige E-Mail-Adresse an."),
  telefon: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "Bitte stimmen Sie der Datenschutzerklärung zu.",
  }),

  // Hidden fields
  offer_type: z.string(),
  lead_path: z.string(),
  website: z.string().optional(), // Honeypot – muss leer bleiben
});

interface FormData {
  fahrzeugtyp: string;
  tonnage: string;
  mietdauer: string;
  starttermin: string;
  plz: string;
  bereitstellung: string;
  nachricht?: string;
  versicherung: boolean;
  vorname: string;
  nachname: string;
  unternehmen: string;
  email: string;
  telefon?: string;
  consent: boolean;
  offer_type: string;
  lead_path: string;
  website?: string;
}

// Lead Scoring Algorithm Utility
// Lead-Scoring Algorithm (Brevo-Master-Scoring compatible: Hot >=70, Warm 40-69, Cold <40)
function calculateLeadScore(data: FormData): { grade: "Hot" | "Warm" | "Cold"; points: number } {
  let points = 0;

  // 1. Tonnage (Auftragswert-Indikator, staerkster Faktor)
  const tonnagePoints: Record<string, number> = {
    "7_5t": 40,
    "5_5t": 30,
    "3_5t": 20,
    "2_6t": 10,
  };
  points += tonnagePoints[data.tonnage] ?? 10;

  // 2. Starttermin (Dringlichkeit)
  const today = new Date();
  const start = new Date(data.starttermin);
  const diffTime = start.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    points += 30;
  } else if (diffDays <= 21) {
    points += 20;
  } else {
    points += 10;
  }

  // 3. Mietdauer (Auftragsgroesse/Bindung)
  const mietdauerPoints: Record<string, number> = {
    "90plus": 30,
    "30plus": 20,
    "8-30": 15,
    "1-7": 10,
  };
  points += mietdauerPoints[data.mietdauer] ?? 10;

  // 4. Versicherung gewaehlt (Zusatzverkauf-Bonus)
  if (data.versicherung) {
    points += 10;
  }

  // Map points to Hot/Warm/Cold
  let grade: "Hot" | "Warm" | "Cold";
  if (points >= 70) grade = "Hot";
  else if (points >= 40) grade = "Warm";
  else grade = "Cold";

  return { grade, points };
}

const CATEGORY_TO_FAHRZEUGTYP: Record<string, string> = {
  "Kleiner Transporter": "sprinter",
  "Großer Transporter": "transporter",
  "Wechselbrücke": "wechselbruecke",
  "Kipper": "kipper",
  "Sattelzug": "sattelzug",
  "Gliederzug": "gliederzug",
};

function LeadForm() {
  const { selectedCategory, closeLeadForm, reportStep, reportCompleted } = useLeadFormModal();
  const initialFahrzeugtyp = selectedCategory
    ? (CATEGORY_TO_FAHRZEUGTYP[selectedCategory] ?? selectedCategory.toLowerCase())
    : "";

  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      fahrzeugtyp: initialFahrzeugtyp,
      tonnage: "",
      mietdauer: "",
      starttermin: "",
      plz: "",
      bereitstellung: "",
      nachricht: "",
      versicherung: false,
      vorname: "",
      nachname: "",
      unternehmen: "",
      email: "",
      telefon: "",
      consent: false,
      offer_type: "vermietung",
      lead_path: "Standard-Mietanfrage-Pfad",
      website: "",
    },
  });

  // Bei jedem Mount (= jedes Öffnen des Modals, siehe LeadFormModal.tsx key={renderKey})
  // Schritt 1 + form_start tracken
  useEffect(() => {
    trackModalStepView(1, "Fahrzeugdetails", 2);
    trackFormStart();
    reportStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextStep = async () => {
    // Validieren Sie AUSSCHLIESSLICH die Felder von Schritt 1
    const valid = await trigger([
      "fahrzeugtyp",
      "tonnage",
      "mietdauer",
      "starttermin",
      "plz",
      "bereitstellung",
    ]);
    if (valid) {
      trackModalStepCompleted(1, "Fahrzeugdetails");
      trackModalStepView(2, "Kontaktdaten", 2);
      reportStep(2);
      setStep(2);
    } else {
      const errorFields = ["fahrzeugtyp", "tonnage", "mietdauer", "starttermin", "plz", "bereitstellung"].filter(
        (field) => !!errors[field as keyof typeof errors]
      );
      trackFormError(1, errorFields);
    }
  };

  const handlePrevStep = () => {
    reportStep(1);
    setStep(1);
  };

  const onSubmit = async (data: FormData) => {
    // Honeypot: Feld ist fuer echte Nutzer unsichtbar, nur Bots fuellen es aus.
    // Bewusst KEIN Worker-Aufruf und KEIN form_submit/reportCompleted, damit
    // Bot-Treffer die Conversion-Zahlen nicht verfaelschen. Der Worker wuerde
    // auf den Honeypot mit 200 antworten, was hier sonst als Lead zaehlt.
    if (data.website) {
      setIsSuccess(true);
      return;
    }

    setIsSubmitting(true);

    // Einmal pro Absendeversuch. Ein Retry erzeugt bewusst eine neue ID.
    const eventId = createEventId();

    try {
      const { grade, points } = calculateLeadScore(data);
      const leadGrade = grade;

      const payload = {
        event_id: eventId,
        firstName: data.vorname,
        lastName: data.nachname,
        email: data.email,
        phone: data.telefon ?? "",
        category: data.fahrzeugtyp,
        message: data.nachricht ?? "",
        consent: data.consent,
        leadScore: points,
        leadGrade,
        website: data.website ?? "",
        unternehmen: data.unternehmen,
        tonnage: data.tonnage,
        mietdauer: data.mietdauer,
        starttermin: data.starttermin,
        plz: data.plz,
        bereitstellung: data.bereitstellung,
        versicherung: data.versicherung,
        offer_type: data.offer_type,
        lead_path: data.lead_path,
        ...getLeadContext(),
      };

      const response = await fetch(import.meta.env.VITE_LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const ergebnis = await response.json().catch(() => ({} as Record<string, unknown>));

      if (!response.ok) {
        const referenz = typeof ergebnis.reference === "string" ? ergebnis.reference : undefined;
        trackFormSubmitFailed("lp1_mietanfrage", response.status, referenz);
        toast.error("Es gab einen Fehler beim Senden.", {
          description: referenz
            ? `Bitte erneut versuchen. Referenznummer: ${referenz}`
            : "Bitte versuchen Sie es erneut oder rufen Sie uns an.",
        });
        return;
      }

      // Der Worker rechnet den Score selbst und liefert ihn zurueck. Der
      // Clientwert dient nur noch als Rueckfallebene fuer GA4.
      const serverGrade = typeof ergebnis.leadGrade === "string" ? ergebnis.leadGrade : leadGrade;

      // Wichtig: reportCompleted() VOR setIsSuccess, damit modal_close (falls der
      // Nutzer direkt danach schließt) NICHT zusätzlich als form_abandon zählt.
      reportCompleted();
      trackFormSubmit("lp1_mietanfrage", 2, eventId, {
        lead_grade: serverGrade,
        fahrzeugtyp: data.fahrzeugtyp,
        tonnage: data.tonnage,
        mietdauer: data.mietdauer,
      });
      // Meta-Lead bewusst direkt statt ueber GTM: der GTM-Trigger loeste
      // reproduzierbar dreimal aus (Klick, Formular senden, form_submit),
      // davon zweimal ohne event_id. Siehe Testprotokoll 19.08.2026.
      // fbq existiert nur, wenn das consent-gegatete Basis-Tag geladen wurde.
      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead", {}, { eventID: eventId });
      }

      setIsSuccess(true);
      toast.success("Anfrage erfolgreich gesendet! Wir melden uns in Kürze.");
      reset();
      setStep(1); // Zurück auf Schritt 1 nach erfolgreichem Reset
    } catch (error) {
      trackFormSubmitFailed("lp1_mietanfrage", 0);
      toast.error("Die Verbindung wurde unterbrochen.", {
        description: "Bitte prüfen Sie Ihre Internetverbindung und senden Sie erneut.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl border border-brand-grey/15 p-8 md:p-12 shadow-xl text-center relative overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Tech Grid Background */}
        <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-[linear-gradient(to_right,#6e7c950a_1px,transparent_1px),linear-gradient(to_bottom,#6e7c950a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-brand-cyan/15 text-brand-cyan flex items-center justify-center">
            <CheckCircle2 className="h-11 w-11" />
          </div>

          <h3 className="text-2xl md:text-3xl font-extrabold text-brand-navy tracking-tight leading-snug">
            Ihre Mietanfrage ist eingegangen!
          </h3>

          <p className="text-brand-grey leading-relaxed">
            Wir prüfen Ihre Angaben und melden uns innerhalb von 24 Stunden mit Ihrem individuellen Mietangebot.
          </p>

          <Button
            onClick={() => {
              setIsSuccess(false);
              setStep(1);
              reset();
              closeLeadForm();
            }}
            className="bg-brand-cyan text-brand-navy hover:bg-brand-cyan/90 font-bold text-base px-8 py-3 shadow-lg shadow-brand-cyan/10 hover:shadow-brand-cyan/20 transition-all active:scale-97 uppercase tracking-wider rounded-xl"
          >
            Schließen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-brand-grey/15 p-4 sm:p-6 md:p-10 shadow-xl relative overflow-hidden">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy md:text-4xl">
          Ihr Mietangebot in 24h.
        </h2>
        <p className="mt-2 text-sm sm:text-base md:text-lg text-brand-grey max-w-xl mx-auto">
          Kostenlos, unverbindlich und ohne Verkaufsgespräch. Formular ausfüllen, Angebot abwarten, fertig.
        </p>
      </div>

      <div className="space-y-8">
              {/* Fortschrittsanzeige */}
              <div className="relative flex items-center justify-between max-w-md mx-auto mb-10">
              {/* Verbindungslinie */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-grey/20 -z-0">
                <div 
                  className="h-full bg-brand-cyan transition-all duration-300"
                  style={{ width: step === 2 ? "100%" : "0%" }}
                />
              </div>

              {/* Schritt 1 */}
              <div className="flex flex-col items-center relative z-10">
                <div 
                  className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                    step === 2 
                      ? "bg-brand-cyan text-brand-navy" 
                      : "bg-brand-cyan text-brand-navy ring-4 ring-brand-cyan/20"
                  }`}
                >
                  {step === 2 ? <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" /> : "1"}
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-brand-navy mt-1.5">Fahrzeugdetails</span>
              </div>

              {/* Schritt 2 */}
              <div className="flex flex-col items-center relative z-10">
                <div 
                  className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                    step === 2 
                      ? "bg-brand-cyan text-brand-navy ring-4 ring-brand-cyan/20" 
                      : "bg-brand-cyan/20 text-brand-navy"
                  }`}
                >
                  2
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-brand-navy mt-1.5">Ihre Kontaktdaten</span>
              </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-8 overflow-hidden">
                <AnimatePresence mode="wait">
                  {/* SCHRITT 1: Fahrzeugdetails */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-4 sm:space-y-6"
                    >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                      {/* Fahrzeugtyp */}
                      <div className="space-y-2">
                        <Label htmlFor="fahrzeugtyp" className="font-semibold text-brand-navy">Fahrzeugtyp *</Label>
                        <Select
                          value={watch("fahrzeugtyp")}
                          onValueChange={(val) => setValue("fahrzeugtyp", val, { shouldValidate: true })}
                        >
                          <SelectTrigger className="border-brand-grey/30 focus:border-brand-cyan focus:ring-brand-cyan h-11 bg-white">
                            <SelectValue placeholder="Bitte wählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sprinter">Kleiner Transporter (bis 3,5t)</SelectItem>
                            <SelectItem value="transporter">Großer Transporter (3,5t - 7,5t)</SelectItem>
                            <SelectItem value="wechselbruecke">Wechselbrücke (BDF System)</SelectItem>
                            <SelectItem value="kipper">Kipper (Bau & Schüttgut)</SelectItem>
                            <SelectItem value="sattelzug">Sattelzug (Schwerer Fernverkehr)</SelectItem>
                            <SelectItem value="gliederzug">Gliederzug (Großvolumen)</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.fahrzeugtyp && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{errors.fahrzeugtyp.message as string}</span>
                          </p>
                        )}
                      </div>

                      {/* Gewünschte Tonnage */}
                      <div className="space-y-2">
                        <Label htmlFor="tonnage" className="font-semibold text-brand-navy">Gewünschte Tonnage *</Label>
                        <Select
                          value={watch("tonnage")}
                          onValueChange={(val) => setValue("tonnage", val, { shouldValidate: true })}
                        >
                          <SelectTrigger className="border-brand-grey/30 focus:border-brand-cyan focus:ring-brand-cyan h-11 bg-white">
                            <SelectValue placeholder="Bitte wählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2_6t">2,6 t</SelectItem>
                            <SelectItem value="3_5t">3,5 t</SelectItem>
                            <SelectItem value="5_5t">5,5 t</SelectItem>
                            <SelectItem value="7_5t">7,5 t</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.tonnage && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{errors.tonnage.message as string}</span>
                          </p>
                        )}
                      </div>

                      {/* Mietdauer */}
                      <div className="space-y-2">
                        <Label htmlFor="mietdauer" className="font-semibold text-brand-navy">Mietdauer *</Label>
                        <Select
                          value={watch("mietdauer")}
                          onValueChange={(val) => setValue("mietdauer", val, { shouldValidate: true })}
                        >
                          <SelectTrigger className="border-brand-grey/30 focus:border-brand-cyan focus:ring-brand-cyan h-11 bg-white">
                            <SelectValue placeholder="Bitte wählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-7">Tagesmiete (1 - 7 Tage)</SelectItem>
                            <SelectItem value="8-30">Wochenmiete (8 - 30 Tage)</SelectItem>
                            <SelectItem value="30plus">Monatsmiete (1 - 3 Monate)</SelectItem>
                            <SelectItem value="90plus">Langzeitmiete (&gt; 3 Monate)</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.mietdauer && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{errors.mietdauer.message as string}</span>
                          </p>
                        )}
                      </div>

                      {/* Starttermin */}
                      <div className="space-y-2">
                        <Label htmlFor="starttermin" className="font-semibold text-brand-navy">Gewünschter Starttermin *</Label>
                        <div className="relative">
                          <Input
                            type="date"
                            id="starttermin"
                            {...register("starttermin")}
                            className="border-brand-grey/30 focus:border-brand-cyan focus:ring-brand-cyan h-11 bg-white pl-10"
                            min={new Date().toISOString().split("T")[0]}
                          />
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-grey" />
                        </div>
                        {errors.starttermin && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{errors.starttermin.message as string}</span>
                          </p>
                        )}
                      </div>

                      {/* Einsatzregion / PLZ */}
                      <div className="space-y-2">
                        <Label htmlFor="plz" className="font-semibold text-brand-navy">Einsatzregion / PLZ *</Label>
                        <Input
                          type="text"
                          id="plz"
                          placeholder="z.B. 42799 oder Leichlingen"
                          {...register("plz")}
                          className="border-brand-grey/30 focus:border-brand-cyan focus:ring-brand-cyan h-11 bg-white"
                        />
                        {errors.plz && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{errors.plz.message as string}</span>
                          </p>
                        )}
                      </div>

                      {/* Abholung oder Lieferung */}
                      <div className="space-y-2">
                        <Label htmlFor="bereitstellung" className="font-semibold text-brand-navy">Bereitstellung *</Label>
                        <Select
                          value={watch("bereitstellung")}
                          onValueChange={(val) => setValue("bereitstellung", val, { shouldValidate: true })}
                        >
                          <SelectTrigger className="border-brand-grey/30 focus:border-brand-cyan focus:ring-brand-cyan h-11 bg-white">
                            <SelectValue placeholder="Bitte wählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="abholung">Selbstabholung in Leichlingen</SelectItem>
                            <SelectItem value="lieferung">Lieferung an Einsatzort</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.bereitstellung && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{errors.bereitstellung.message as string}</span>
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Ihre Nachricht / Sonderwünsche */}
                    <div className="space-y-1.5">
                      <Label htmlFor="nachricht" className="font-semibold text-brand-navy text-sm sm:text-base">Ihre Nachricht / Sonderwünsche (optional)</Label>
                      <Textarea
                        id="nachricht"
                        placeholder="Spezielle Anforderungen wie Ladebordwand, AHK, etc."
                        {...register("nachricht")}
                        className="border-brand-grey/30 focus:border-brand-cyan focus:ring-brand-cyan bg-white min-h-[80px] text-sm sm:text-base p-2.5"
                      />
                    </div>

                    {/* Add-on Versicherungspaket */}
                    <div className="p-3 sm:p-4 rounded-xl bg-brand-light border border-brand-grey/10 flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-brand-cyan shrink-0 mt-0.5" />
                        <div>
                          <Label htmlFor="versicherung" className="font-bold text-brand-navy text-xs sm:text-sm cursor-pointer">
                            Add-on Versicherungspaket hinzufügen
                          </Label>
                          <p className="text-[10px] sm:text-xs text-brand-grey mt-0.5 leading-tight">
                            Vollkaskoversicherung mit reduzierter Selbstbeteiligung für maximale Sorgenfreiheit.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center shrink-0">
                        <Checkbox
                          id="versicherung"
                          checked={watch("versicherung")}
                          onCheckedChange={(checked) => setValue("versicherung", !!checked)}
                          className="h-5 w-5 sm:h-6 sm:w-6 border-brand-grey text-brand-cyan focus:ring-brand-cyan"
                        />
                      </div>
                    </div>

                      {/* Button Schritt 1 */}
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full bg-brand-cyan text-brand-navy hover:bg-brand-cyan/90 font-bold text-sm sm:text-base py-4 sm:py-6 shadow-lg shadow-brand-cyan/10 hover:shadow-brand-cyan/20 transition-all active:scale-98 flex items-center justify-center gap-2"
                      >
                        <span>Weiter zu Schritt 2</span>
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </motion.div>
                  )}

                  {/* SCHRITT 2: Kontaktdaten */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-4 sm:space-y-6"
                    >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                      {/* Vorname */}
                      <div className="space-y-2">
                        <Label htmlFor="vorname" className="font-semibold text-brand-navy">Vorname *</Label>
                        <Input
                          type="text"
                          id="vorname"
                          placeholder="z.B. Max"
                          {...register("vorname")}
                          className="border-brand-grey/30 focus:border-brand-cyan focus:ring-brand-cyan h-11 bg-white"
                        />
                        {errors.vorname && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{errors.vorname.message as string}</span>
                          </p>
                        )}
                      </div>

                      {/* Nachname */}
                      <div className="space-y-2">
                        <Label htmlFor="nachname" className="font-semibold text-brand-navy">Nachname *</Label>
                        <Input
                          type="text"
                          id="nachname"
                          placeholder="z.B. Mustermann"
                          {...register("nachname")}
                          className="border-brand-grey/30 focus:border-brand-cyan focus:ring-brand-cyan h-11 bg-white"
                        />
                        {errors.nachname && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{errors.nachname.message as string}</span>
                          </p>
                        )}
                      </div>

                      {/* Unternehmen */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="unternehmen" className="font-semibold text-brand-navy">Unternehmen *</Label>
                        <Input
                          type="text"
                          id="unternehmen"
                          placeholder="z.B. Logistik GmbH"
                          {...register("unternehmen")}
                          className="border-brand-grey/30 focus:border-brand-cyan focus:ring-brand-cyan h-11 bg-white"
                        />
                        {errors.unternehmen && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{errors.unternehmen.message as string}</span>
                          </p>
                        )}
                      </div>

                      {/* E-Mail */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email" className="font-semibold text-brand-navy">E-Mail-Adresse *</Label>
                        <Input
                          type="email"
                          id="email"
                          placeholder="z.B. info@firma.de"
                          {...register("email")}
                          className="border-brand-grey/30 focus:border-brand-cyan focus:ring-brand-cyan h-11 bg-white"
                        />
                        {errors.email && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{errors.email.message as string}</span>
                          </p>
                        )}
                      </div>

                      {/* Telefon */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="telefon" className="font-semibold text-brand-navy">Telefonnummer (optional)</Label>
                        <Input
                          type="tel"
                          id="telefon"
                          placeholder="z.B. +49 170 1234567"
                          {...register("telefon")}
                          className="border-brand-grey/30 focus:border-brand-cyan focus:ring-brand-cyan h-11 bg-white"
                        />
                        {errors.telefon && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{errors.telefon.message as string}</span>
                          </p>
                        )}

                      </div>
                    </div>

                    {/* Einwilligung Datenschutz */}
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2.5">
                        <Checkbox
                          id="consent"
                          checked={watch("consent")}
                          onCheckedChange={(checked) => setValue("consent", !!checked, { shouldValidate: true })}
                          className="h-5 w-5 border-brand-grey text-brand-cyan focus:ring-brand-cyan mt-0.5 shrink-0"
                        />
                        <Label htmlFor="consent" className="text-xs sm:text-sm text-brand-grey font-normal cursor-pointer leading-tight">
                          Ich habe die{" "}
                          <a
                            href="/datenschutz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-brand-navy hover:text-brand-cyan"
                          >
                            Datenschutzerklärung
                          </a>{" "}
                          gelesen und stimme der Verarbeitung meiner Daten zu. *
                        </Label>
                      </div>
                      {errors.consent && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{errors.consent.message as string}</span>
                        </p>
                      )}
                    </div>

                      {/* Buttons Schritt 2 */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Button
                          type="button"
                          onClick={handlePrevStep}
                          variant="outline"
                          className="border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white font-semibold py-4 sm:py-6 flex-1 flex items-center justify-center gap-2 text-sm sm:text-base order-2 sm:order-1"
                        >
                          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Zurück</span>
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-brand-cyan text-brand-navy hover:bg-brand-cyan/90 font-bold text-sm sm:text-base py-4 sm:py-6 shadow-lg shadow-brand-cyan/10 hover:shadow-brand-cyan/20 transition-all active:scale-98 flex-1 order-1 sm:order-2 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                              <span>Wird gesendet...</span>
                            </>
                          ) : (
                            <span>Mietangebot anfordern</span>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hidden Fields */}
                <input type="hidden" {...register("offer_type")} />
                <input type="hidden" {...register("lead_path")} />

                {/* Honeypot Feld gegen Spam-Bots – für echte Nutzer unsichtbar */}
                <input
                  type="text"
                  id="website"
                  {...register("website")}
                  aria-hidden="true"
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden opacity-0"
                />
              </form>
            </div>
      </div>
    );
  }

export default LeadForm;

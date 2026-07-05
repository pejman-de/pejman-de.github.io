import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLeadFormModal } from "@/contexts/LeadFormModalContext";

const faqs = [
  {
    question: "Wie schnell erhalte ich mein Mietangebot?",
    answer: "In der Regel innerhalb von 24 Stunden an Werktagen. Oft schneller, wenn das passende Fahrzeug bereitsteht.",
  },
  {
    question: "Welche Versicherungen sind im Mietpreis enthalten?",
    answer: "Eine Grunddeckung ist enthalten. Auf Wunsch buchen Sie ein Vollkasko-Paket dazu, damit Sie ruhig schlafen können.",
  },
  {
    question: "Kann ich den Mietvertrag flexibel verlängern?",
    answer: "Ja. Sagen Sie uns rechtzeitig Bescheid und wir verlängern unkompliziert, solange das Fahrzeug verfügbar ist.",
  },
  {
    question: "Bieten Sie auch eine Lieferung der Fahrzeuge an?",
    answer: "Ja, auf Wunsch liefern wir direkt zu Ihrer Einsatzstelle. Sie entscheiden, ob Sie abholen oder wir kommen.",
  },
];

export default function FAQ() {
  const { openLeadForm } = useLeadFormModal();

  return (
    <>
      <section className="py-20 bg-brand-light/50 border-t border-brand-grey/10">
        <div className="container max-w-xl text-center bg-white rounded-2xl border border-brand-grey/15 shadow-xl p-8 md:p-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan">
            B2B Fahrzeugvermietung
          </span>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
            Bereit für Ihr Mietangebot?
          </h3>
          <p className="mt-3 text-brand-grey">
            Fahrzeug wählen, Formular ausfüllen, in 24h ein individuelles Angebot erhalten. Unverbindlich und kostenlos.
          </p>
          <Button
            onClick={() => openLeadForm()}
            className="mt-6 bg-brand-cyan text-brand-navy hover:bg-brand-cyan/90 font-bold px-6 py-3 shadow-md hover:shadow-brand-cyan/20 hover:shadow-lg transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <span>Jetzt Mietangebot anfordern</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-brand-grey/10">
      <div className="container max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
            Häufig gestellte Fragen.
          </h2>
          <p className="mt-4 text-lg text-brand-grey">
            Schnelle Antworten, bevor Sie fragen. Falls etwas fehlt, melden Sie sich einfach.
          </p>
        </div>

        {/* Accordion Component */}
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="border border-b! border-brand-grey/15 rounded-xl px-6 py-2 bg-brand-light/50 hover:bg-brand-light transition-colors data-[state=open]:bg-brand-light data-[state=open]:border-brand-cyan/30"
            >
              <AccordionTrigger className="text-base font-bold text-brand-navy hover:text-brand-cyan hover:no-underline transition-colors py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-brand-grey leading-relaxed pt-2 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      </section>
    </>
  );
}

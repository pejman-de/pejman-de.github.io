import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import LeadForm from "@/components/LeadForm";
import { useLeadFormModal } from "@/contexts/LeadFormModalContext";

export default function LeadFormModal() {
  const { isOpen, closeLeadForm } = useLeadFormModal();
  const [renderKey, setRenderKey] = useState(0);

  // Bei jedem Oeffnen das Formular frisch mounten (setzt Validierungszustand zurueck)
  useEffect(() => {
    if (isOpen) setRenderKey((k) => k + 1);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeLeadForm("overlay_click")}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col w-full h-[100dvh] max-h-[100dvh] max-w-none top-0 left-0 translate-x-0 translate-y-0 rounded-none border-0 gap-0 sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:w-full sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl p-0 bg-transparent shadow-none overflow-hidden"
      >
        <DialogTitle className="sr-only">Mietangebot anfordern</DialogTitle>
        <DialogClose
          onClick={() => closeLeadForm("close_button")}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur border border-brand-grey/15 text-brand-navy shadow-md hover:bg-white transition-colors"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Schließen</span>
        </DialogClose>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {isOpen && <LeadForm key={renderKey} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

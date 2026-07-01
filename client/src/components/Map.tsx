import { cn } from "@/lib/utils";

const COMPANY_ADDRESS = "ED Rent & Sale, Bremsen 13 A, 42799 Leichlingen (Rheinland)";

interface MapViewProps {
  className?: string;
}

export function MapView({ className }: MapViewProps) {
  return (
    <div className={cn("w-full aspect-video rounded-2xl overflow-hidden", className)}>
      <iframe
        src={`https://www.google.com/maps?q=${encodeURIComponent(COMPANY_ADDRESS)}&output=embed`}
        className="w-full h-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Standort ED Rent & Sale"
      />
    </div>
  );
}

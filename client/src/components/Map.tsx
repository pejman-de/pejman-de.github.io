import { cn } from "@/lib/utils";

const COMPANY_ADDRESS = "ED Rent & Sale, Bremsen 13 A, 42799 Leichlingen (Rheinland)";

interface MapViewProps {
  className?: string;
}

export function MapView({ className }: MapViewProps) {
  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-white/10 h-[200px]">
              <iframe
                src="https://www.google.com/maps?q=ED%20Rent%20%26%20Sale%2C%20Bremsen%2013%20A%2C%2042799%20Leichlingen&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Standort ED Rent & Sale"
              />
            </div>
  );
}

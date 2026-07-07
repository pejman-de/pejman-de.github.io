/**
 * VehicleIcons.tsx
 * -----------------------------------------------------------------------
 * Eigene zweifarbige Silhouetten-Icons für die 6 Fahrzeugkategorien
 * in VehicleCategories.tsx (Runde 2).
 *
 * Gestaltungsprinzip ("Laderaum-Signatur"):
 * - CYAN (text-brand-cyan) markiert in jedem Icon konsequent den
 *   Laderaum/Aufbau – also genau den Teil, den der Kunde mietet.
 * - NAVY (currentColor, vom Card-Container vererbt) zeichnet Kabine,
 *   Chassis, Räder und Bodenlinie.
 * Dadurch sind die Icons kein generisches Library-Set mehr, sondern
 * kodieren eine Information: "Das Farbige ist dein Nutzraum."
 *
 * Aufrufkonvention wie lucide-react: <SprinterIcon className="h-6 w-6" />
 * - Body-Strokes: stroke="currentColor" -> erben die Textfarbe inkl.
 *   group-hover-Farbwechsel der Karte (auf Hover wird das ganze Icon
 *   einheitlich cyan = Aktivierungs-Feedback).
 * - Laderaum-Strokes: fest text-brand-cyan, bleiben auch im Ruhezustand
 *   farbig.
 * - viewBox 0 0 24 24, strokeWidth 1.5, Radmitte auf Bodenlinie
 *   (lucide-Konvention).
 * -----------------------------------------------------------------------
 */
import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Sprinter: kompakter Kastenwagen – Laderaum hinten (cyan), Kabine vorn */
export function SprinterIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <g className="text-brand-cyan" stroke="currentColor">
        <path d="M10.5 8H5a2 2 0 0 0-2 2v7" />
        <path d="M10.5 8v9" />
      </g>
      <path d="M10.5 8h2.8l3.7 3.6H18a1 1 0 0 1 1 1V17" />
      <path d="M3 17h16" />
      <circle cx="7" cy="17" r="1.6" />
      <circle cx="15" cy="17" r="1.6" />
    </svg>
  );
}

/** Transporter: Kofferaufbau + abgesenkte Hebebühne am Heck (beides cyan) */
export function TransporterIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <g className="text-brand-cyan" stroke="currentColor">
        <path d="M2.5 17V7a1 1 0 0 1 1-1H10v11" />
        <path d="M2.5 17v1.5" />
        <path d="M0.8 18.5h3.4" />
      </g>
      <path d="M11.5 17v-4.5h2l2.5 2.8V17" />
      <path d="M3 17h14.5" />
      <circle cx="5.5" cy="17" r="1.6" />
      <circle cx="13.8" cy="17" r="1.6" />
    </svg>
  );
}

/** Wechselbrücke: BDF-Brücke auf Stützbeinen (cyan), abgesetztes Fahrgestell darunter (navy) */
export function WechselbrueckeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <g className="text-brand-cyan" stroke="currentColor">
        <rect x="4.5" y="5" width="15" height="6.5" rx="1" />
        <path d="M9.5 5v6.5" />
        <path d="M14.5 5v6.5" />
        <path d="M6 11.5v7" />
        <path d="M18 11.5v7" />
        <path d="M4.9 18.5h2.2" />
        <path d="M16.9 18.5h2.2" />
      </g>
      <path d="M9 15.5h6" />
      <circle cx="10.7" cy="17.6" r="1.4" />
      <circle cx="13.7" cy="17.6" r="1.4" />
    </svg>
  );
}

/** Kipper: am Chassis aufliegende, klar gekippte Mulde + fallendes Schüttgut (cyan) */
export function KipperIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <g className="text-brand-cyan" stroke="currentColor">
        <rect x="3" y="11" width="10" height="5.5" rx="1" transform="rotate(-26 3.5 16.5)" />
        <circle fill="currentColor" stroke="none" cx="1.7" cy="16.4" r="0.7" />
        <circle fill="currentColor" stroke="none" cx="2.9" cy="18.2" r="0.7" />
        <circle fill="currentColor" stroke="none" cx="1.1" cy="19" r="0.7" />
      </g>
      <path d="M15 17v-4.5h2l2.2 2.6V17" />
      <path d="M6 17h14" />
      <circle cx="9" cy="17" r="1.6" />
      <circle cx="17" cy="17" r="1.6" />
    </svg>
  );
}

/** Sattelzug: EIN langer durchgehender Auflieger (cyan) + Zugmaschine, 3 Achsen */
export function SattelzugIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <g className="text-brand-cyan" stroke="currentColor">
        <rect x="1.5" y="6" width="15.5" height="8.5" rx="1" />
      </g>
      <path d="M17.5 17v-7h1.6a1 1 0 0 1 .8.4l1.5 2a1 1 0 0 1 .2.6V17" />
      <path d="M2 17h20" />
      <circle cx="4.5" cy="17" r="1.4" />
      <circle cx="8" cy="17" r="1.4" />
      <circle cx="19.3" cy="17" r="1.4" />
    </svg>
  );
}

/** Gliederzug: ZWEI eigenständige Ladeeinheiten (cyan) mit sichtbarer Deichsel-Lücke */
export function GliederzugIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <g className="text-brand-cyan" stroke="currentColor">
        <rect x="1" y="7.5" width="6.5" height="7.5" rx="1" />
        <rect x="10" y="7" width="7" height="8" rx="1" />
      </g>
      <path d="M7.5 15.7h2.5" />
      <path d="M17 17v-5h1.8l1.9 2.2V17" />
      <path d="M1.5 17h20" />
      <circle cx="3.2" cy="17" r="1.3" />
      <circle cx="5.8" cy="17" r="1.3" />
      <circle cx="12" cy="17" r="1.3" />
      <circle cx="15" cy="17" r="1.3" />
      <circle cx="19.2" cy="17" r="1.3" />
    </svg>
  );
}

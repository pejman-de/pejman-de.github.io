import { ArrowRight } from "lucide-react";
import {
  SprinterIcon,
  TransporterIcon,
  WechselbrueckeIcon,
  KipperIcon,
  SattelzugIcon,
  GliederzugIcon,
} from "@/components/icons/VehicleIcons";
import { trackClick } from "@/lib/analytics";
import { useSectionView } from "@/hooks/useSectionView";

interface Category {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  badge: string;
  specs: string[];
  description: string;
}

const categories: Category[] = [
  {
    id: "sprinter",
    title: "Sprinter",
    icon: SprinterIcon,
    badge: "Führerschein B",
    specs: ["Zul. Gesamtgewicht: 3,5t", "Ladevolumen: bis 14 m³", "Führerscheinklasse: B"],
    description: "Der Wendige für Stadt, Kurier und kleinere Touren. Passt in jede Lücke.",
  },
  {
    id: "transporter",
    title: "Transporter",
    icon: TransporterIcon,
    badge: "Mit Hebebühne",
    specs: ["Zul. Gesamtgewicht: 3,5t - 7,5t", "Kofferaufbau mit Hebebühne"],
    description: "Der Allrounder mit Ladebordwand für Verteilerverkehr und Umzüge.",
  },
  {
    id: "wechselbruecke",
    title: "Wechselbrücke",
    icon: WechselbrueckeIcon,
    badge: "BDF-System",
    specs: ["System: BDF", "Fahrgestell: 2- oder 3-Achs", "Hubhöhe: Standard & Low"],
    description: "Maximale Flexibilität für kombinierten Ladungsverkehr und Systemlogistik.",
  },
  {
    id: "kipper",
    title: "Kipper",
    icon: KipperIcon,
    badge: "3-Seiten-Kipper",
    specs: ["3-Seiten-Kipper", "Allradantrieb optional"],
    description: "Robust und geländegängig. Für Baustelle, Schüttgut und alles, was Dreck macht.",
  },
  {
    id: "sattelzug",
    title: "Sattelzug",
    icon: SattelzugIcon,
    badge: "Fernverkehr",
    specs: ["Sattelzugmaschine 4x2 / 6x2", "Euro 6 Abgasnorm", "Mietauflieger verfügbar"],
    description: "Für den schweren Fernverkehr und volle Ladekapazität auf Langstrecke.",
  },
  {
    id: "gliederzug",
    title: "Gliederzug",
    icon: GliederzugIcon,
    badge: "Bis 120 m³",
    specs: ["Motorwagen + Anhänger", "Durchladezug-Option", "Volumen: bis 120 m³"],
    description: "Maximales Volumen, flexibles Handling. Wenn es richtig viel werden soll.",
  },
];

interface VehicleCategoriesProps {
  onSelectCategory: (categoryTitle: string) => void;
}

export default function VehicleCategories({ onSelectCategory }: VehicleCategoriesProps) {
  const sectionRef = useSectionView<HTMLElement>("vehicle_categories");

  const handleSelect = (category: Category) => {
    trackClick("tile_click", {
      element_id: `tile_${category.id}`,
      element_text: "Mietangebot anfordern",
      element_location: "categories",
      extra: { category_name: category.title },
    });
    onSelectCategory(category.title);
  };

  return (
    <section id="vehicles" ref={sectionRef} className="py-20 bg-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
            Welches Fahrzeug brauchen Sie?
          </h2>
          <p className="mt-4 text-lg text-brand-grey">
            Wählen Sie Ihre Klasse. Alle gepflegt, alle sofort startklar, keine Überraschungen.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                onClick={() => handleSelect(category)}
                className="group relative flex cursor-pointer flex-col justify-between p-8 rounded-2xl border border-brand-grey/15 bg-white shadow-sm hover:shadow-xl hover:border-brand-cyan/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  {/* Icon Stage + Key-Spec Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy group-hover:bg-brand-cyan/15 group-hover:text-brand-cyan transition-colors">
                      <Icon className="h-9 w-9 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none" />
                    </div>
                    <span className="mt-1 shrink-0 rounded-full bg-brand-cyan/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-cyan">
                      {category.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-6 text-xl font-bold text-brand-navy">
                    {category.title}
                  </h3>
                  <p className="mt-3 text-sm text-brand-grey leading-relaxed">
                    {category.description}
                  </p>

                  {/* Technical Specs Sheet */}
                  <div className="mt-6 pt-6 border-t border-brand-grey/10">
                    <ul className="space-y-2">
                      {category.specs.map((spec, idx) => (
                        <li key={idx} className="flex items-center text-xs text-brand-grey">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan mr-2 shrink-0" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Text Link with Hover Animation */}
                <div className="mt-8 pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(category);
                    }}
                    className="inline-flex items-center rounded text-sm font-bold text-brand-navy group-hover:text-brand-cyan transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2"
                  >
                    <span>Mietangebot anfordern</span>
                    <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

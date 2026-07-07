import { ArrowRight } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import { useSectionView } from "@/hooks/useSectionView";

interface Category {
  id: string;
  title: string;
  image: string;
  badge: string;
  description: string;
}

const categories: Category[] = [
  {
    id: "sprinter",
    title: "Kleiner Transporter",
    image: "/images/sprinter.webp",
    badge: "Führerschein B",
    description: "Der Wendige für Stadt, Kurier und kleinere Touren. Passt in jede Lücke.",
  },
  {
    id: "transporter",
    title: "Großer Transporter",
    image: "/images/transporter.webp",
    badge: "Mit Hebebühne",
    description: "Der Allrounder mit Ladebordwand für Verteilerverkehr und Umzüge.",
  },
  {
    id: "kipper",
    title: "Kipper",
    image: "/images/kipper.webp",
    badge: "3-Seiten-Kipper",
    description: "Robust und geländegängig. Für Baustelle, Schüttgut und alles, was Dreck macht.",
  },
  {
    id: "wechselbruecke",
    title: "Wechselbrücke",
    image: "/images/wechselbruecke.webp",
    badge: "BDF-System",
    description: "Maximale Flexibilität für kombinierten Ladungsverkehr und Systemlogistik.",
  },
  {
    id: "sattelzug",
    title: "Sattelzug",
    image: "/images/sattelzug.webp",
    badge: "Fernverkehr",
    description: "Für den schweren Fernverkehr und volle Ladekapazität auf Langstrecke.",
  },
  {
    id: "gliederzug",
    title: "Gliederzug",
    image: "/images/gliederzug.webp",
    badge: "Bis 120 m³",
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleSelect(category)}
              className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={category.image}
                alt={category.description}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-x-0 bottom-0 bg-brand-navy px-5 py-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-brand-cyan">
                  {category.badge}
                </p>
                <h3 className="mt-1 text-xl font-bold text-white">
                  {category.title}
                </h3>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(category);
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-cyan px-4 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-cyan/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
                >
                  <span>Mietangebot anfordern</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

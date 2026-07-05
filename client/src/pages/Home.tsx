import { motion } from "framer-motion";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SocialProofBar from "@/components/SocialProofBar";
import VehicleCategories from "@/components/VehicleCategories";
import ProcessSection from "@/components/ProcessSection";
import TrustMetrics from "@/components/TrustMetrics";
import ProofBlock from "@/components/ProofBlock";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { useLeadFormModal } from "@/contexts/LeadFormModalContext";
import { useScrollDepth } from "@/hooks/useScrollDepth";
import { useSectionView } from "@/hooks/useSectionView";

// Animation Variants for clean scroll-reveals
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as any }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export default function Home() {
  const { openLeadForm } = useLeadFormModal();
  useScrollDepth();

  const processRef = useSectionView<HTMLDivElement>("process_section");
  const trustRef = useSectionView<HTMLDivElement>("trust_metrics");
  const proofRef = useSectionView<HTMLDivElement>("proof_block");
  const faqRef = useSectionView<HTMLDivElement>("faq_section");

  const scrollToVehicles = () => {
    const vehiclesElement = document.getElementById("vehicles");
    vehiclesElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSelectCategory = (categoryTitle: string) => {
    openLeadForm(categoryTitle, "vehicle_tile");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sticky Header */}
      <Header onCtaClick={() => openLeadForm(undefined, "header_cta")} />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero onCtaClick={() => openLeadForm(undefined, "hero_primary_cta")} onExploreClick={scrollToVehicles} />

        {/* Social Proof Bar */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <SocialProofBar />
        </motion.div>

        {/* Vehicle Categories */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <VehicleCategories onSelectCategory={handleSelectCategory} />
        </motion.div>

        {/* Process Section */}
        <motion.div
          ref={processRef}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <ProcessSection />
        </motion.div>

        {/* Trust Metrics */}
        <motion.div
          ref={trustRef}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <TrustMetrics />
        </motion.div>

        {/* Proof Block */}
        <motion.div
          ref={proofRef}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <ProofBlock />
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          ref={faqRef}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <FAQ />
        </motion.div>
      </main>

      {/* Footer */}
      <Footer onScrollToTop={scrollToTop} />
    </div>
  );
}

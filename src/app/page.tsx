import { Footer } from "@/components/common/Footer";
import { Navbar } from "@/components/common/Navbar";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectShowcase } from "@/components/sections/ProjectShowcase";
import { ResearchSection } from "@/components/sections/ResearchSection";
import { SkillsSection } from "@/components/sections/SkillsSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-24 px-4 py-12 sm:px-6 lg:px-8">
        <HeroSection />
        <ProjectShowcase />
        <ExperienceSection />
        <ResearchSection />
        <SkillsSection />
      </main>
      <Footer />
    </>
  );
}

import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { CoursesSection } from "@/components/courses-section"
import { StatsSection } from "@/components/stats-section"
import { CTASection } from "@/components/cta-section"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CoursesSection />
      <CTASection />
      <Footer />
    </main>
  )
}

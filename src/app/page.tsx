import LandingNav from '@/components/landing/LandingNav'
import HeroSection from '@/components/landing/HeroSection'
import LogoStrip from '@/components/landing/LogoStrip'
import FeatureAgent from '@/components/landing/FeatureAgent'
import FeatureAutonomous from '@/components/landing/FeatureAutonomous'
import FeatureCollaboration from '@/components/landing/FeatureCollaboration'
import DatabaseSection from '@/components/landing/DatabaseSection'
import CTASection from '@/components/landing/CTASection'
import LandingFooter from '@/components/landing/LandingFooter'

export default function Home() {
  return (
    <main className="bg-black min-h-screen overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <LogoStrip />
      <FeatureAgent />
      <FeatureAutonomous />
      <FeatureCollaboration />
      <DatabaseSection />
      <CTASection />
      <LandingFooter />
    </main>
  )
}

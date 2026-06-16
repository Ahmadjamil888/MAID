import SpotlightHero from '@/components/landing/SpotlightHero'
import LandingNav from '@/components/landing/LandingNav'
import LandingSections from '@/components/landing/LandingSections'

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em', background: '#111110' }}
    >
      <LandingNav />
      <SpotlightHero />
      <LandingSections />
    </div>
  )
}

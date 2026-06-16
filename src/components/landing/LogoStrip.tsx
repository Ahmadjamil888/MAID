const LOGOS = [
  { name: 'PubChem',        svg: <text x="0" y="14" fontSize="13" fontWeight="600" fill="currentColor">PubChem</text> },
  { name: 'ChEMBL',         svg: <text x="0" y="14" fontSize="13" fontWeight="600" fill="currentColor">ChEMBL</text> },
  { name: 'OpenFDA',        svg: <text x="0" y="14" fontSize="13" fontWeight="600" fill="currentColor">OpenFDA</text> },
  { name: 'ClinicalTrials', svg: <text x="0" y="14" fontSize="11" fontWeight="600" fill="currentColor">ClinicalTrials</text> },
  { name: 'UniProt',        svg: <text x="0" y="14" fontSize="13" fontWeight="600" fill="currentColor">UniProt</text> },
  { name: 'RxNorm',         svg: <text x="0" y="14" fontSize="13" fontWeight="600" fill="currentColor">RxNorm</text> },
  { name: 'AlphaFold',      svg: <text x="0" y="14" fontSize="13" fontWeight="600" fill="currentColor">AlphaFold</text> },
  { name: 'Groq',           svg: <text x="0" y="14" fontSize="13" fontWeight="600" fill="currentColor">Groq</text> },
]

export default function LogoStrip() {
  return (
    <section
      className="border-t border-b border-white/[0.06] py-10 px-6 mt-20"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
    >
      <p className="text-center text-white/25 text-xs mb-8 uppercase tracking-widest">
        Powered by the world&apos;s leading scientific databases
      </p>
      <div className="flex items-center justify-center flex-wrap gap-x-10 gap-y-5 max-w-4xl mx-auto">
        {LOGOS.map(logo => (
          <div key={logo.name} className="text-white/30 hover:text-white/60 transition-colors cursor-default">
            <svg height="18" viewBox={`0 0 ${logo.name.length * 8.5} 18`} fill="none" xmlns="http://www.w3.org/2000/svg">
              {logo.svg}
            </svg>
          </div>
        ))}
      </div>
    </section>
  )
}

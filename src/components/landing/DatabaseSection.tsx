const DATABASES = [
  {
    name: 'PubChem',
    tag: 'Chemistry',
    stat: '100M+',
    statLabel: 'compounds',
    desc: 'SMILES, InChI, molecular properties, and 2D structure images for every compound.',
  },
  {
    name: 'ChEMBL',
    tag: 'Bioactivity',
    stat: '2.4M+',
    statLabel: 'bioactivity records',
    desc: 'Drug targets, mechanisms of action, binding affinities, and phase data.',
  },
  {
    name: 'OpenFDA',
    tag: 'Regulatory',
    stat: '10M+',
    statLabel: 'adverse event reports',
    desc: 'Drug labelling, adverse events, recalls, and NDC directory data.',
  },
  {
    name: 'ClinicalTrials',
    tag: 'Clinical',
    stat: '400K+',
    statLabel: 'global trials',
    desc: 'Search by condition, intervention, phase, and status. Worldwide coverage.',
  },
  {
    name: 'RxNorm',
    tag: 'Interactions',
    stat: '800K+',
    statLabel: 'drug–drug pairs',
    desc: 'NLM interaction graph with severity classification and clinical management notes.',
  },
  {
    name: 'UniProt',
    tag: 'Proteins',
    stat: '230M+',
    statLabel: 'protein sequences',
    desc: 'Gene names, accessions, organism data, and cross-references to PDB/AlphaFold.',
  },
  {
    name: 'OpenTargets',
    tag: 'Genomics',
    stat: '60K+',
    statLabel: 'target–disease links',
    desc: 'Evidence-based target-disease associations with scoring across multiple data types.',
  },
  {
    name: 'AlphaFold',
    tag: 'Structures',
    stat: '200M+',
    statLabel: '3D structures',
    desc: 'DeepMind\'s predicted protein structures accessible per UniProt accession.',
  },
]

export default function DatabaseSection() {
  return (
    <section
      id="databases"
      className="py-24 px-6 border-t border-white/[0.06]"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <p className="text-white/30 text-xs font-medium uppercase tracking-widest mb-4">Data Sources</p>
            <h2
              className="text-white font-semibold leading-tight"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.03em' }}
            >
              8 scientific databases,<br />
              searched in parallel by MAID
            </h2>
          </div>
          <p className="text-white/35 text-sm leading-relaxed max-w-xs md:text-right">
            No tab-switching. No manual cross-referencing. MAID retrieves and synthesizes data from every source before writing your report.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {DATABASES.map(db => (
            <div
              key={db.name}
              className="p-6 group hover:bg-white/[0.03] transition-colors"
              style={{ background: '#000' }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-white font-semibold text-sm">{db.name}</span>
                <span className="text-white/25 text-[10px] border border-white/10 rounded-full px-2 py-0.5">
                  {db.tag}
                </span>
              </div>
              <div className="mb-3">
                <span className="text-white text-2xl font-light">{db.stat}</span>
                <span className="text-white/30 text-xs ml-1.5">{db.statLabel}</span>
              </div>
              <p className="text-white/35 text-xs leading-relaxed">{db.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

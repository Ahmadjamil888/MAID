// This file is used ONLY in the Node.js API route (server-side PDF rendering).
// Do NOT import this in any client component.

import {
  Document, Page, Text, View, StyleSheet, Font, Image, Link,
} from '@react-pdf/renderer'

// ── Styles ───────────────────────────────────────────────────────────────────
const C = {
  black:   '#0a0a0a',
  dark:    '#111111',
  grey:    '#374151',
  mid:     '#6b7280',
  light:   '#9ca3af',
  border:  '#e5e7eb',
  bg:      '#f9fafb',
  accent:  '#059669',
  accent2: '#047857',
  red:     '#dc2626',
  blue:    '#2563eb',
  white:   '#ffffff',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.dark,
    backgroundColor: C.white,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 56,
  },
  // Cover page
  coverPage: {
    fontFamily: 'Helvetica',
    backgroundColor: C.black,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  coverTop: {
    backgroundColor: C.black,
    padding: 56,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  coverBar: {
    backgroundColor: C.accent,
    height: 6,
  },
  coverBottom: {
    backgroundColor: '#111',
    padding: 40,
    paddingTop: 28,
    paddingBottom: 28,
  },
  coverTag: {
    color: C.accent,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  coverTitle: {
    color: C.white,
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.2,
    marginBottom: 16,
    maxWidth: 400,
  },
  coverSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 1.6,
    maxWidth: 380,
    marginBottom: 40,
  },
  coverMeta: {
    color: '#6b7280',
    fontSize: 9,
    lineHeight: 1.8,
  },
  coverMetaVal: {
    color: C.white,
    fontSize: 9,
  },
  // Header / footer
  header: {
    position: 'absolute',
    top: 24,
    left: 56,
    right: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    paddingBottom: 10,
  },
  headerBrand: {
    color: C.accent,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: C.light,
    fontSize: 8,
    maxWidth: 260,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 56,
    right: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 10,
  },
  footerText: {
    color: C.light,
    fontSize: 8,
  },
  footerDisclaimer: {
    color: C.light,
    fontSize: 7,
    maxWidth: 300,
    textAlign: 'right',
  },
  // Body typography
  h1: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: C.black,
    marginBottom: 8,
    marginTop: 24,
    lineHeight: 1.2,
  },
  h2: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 15,
    color: C.black,
    marginBottom: 6,
    marginTop: 20,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: C.accent,
  },
  h3: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: C.grey,
    marginBottom: 4,
    marginTop: 14,
  },
  h4: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: C.grey,
    marginBottom: 3,
    marginTop: 10,
  },
  p: {
    fontSize: 10,
    color: C.grey,
    lineHeight: 1.75,
    marginBottom: 8,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  // List
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 4,
  },
  bullet: {
    color: C.accent,
    fontSize: 10,
    marginRight: 8,
    fontFamily: 'Helvetica-Bold',
  },
  listText: {
    flex: 1,
    fontSize: 10,
    color: C.grey,
    lineHeight: 1.65,
  },
  // Table
  table: {
    marginTop: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: C.black,
    flexDirection: 'row',
  },
  tableHeaderCell: {
    color: C.white,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    padding: '7 10',
    flex: 1,
  },
  tableCell: {
    color: C.grey,
    fontSize: 9,
    padding: '6 10',
    flex: 1,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
  },
  tableEven: {
    backgroundColor: C.bg,
  },
  // Callout box
  callout: {
    backgroundColor: '#ecfdf5',
    borderLeftWidth: 3,
    borderLeftColor: C.accent,
    padding: '10 14',
    marginBottom: 12,
    marginTop: 4,
    borderRadius: 3,
  },
  calloutText: {
    color: '#065f46',
    fontSize: 9.5,
    lineHeight: 1.65,
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 3,
    borderLeftColor: '#d97706',
    padding: '10 14',
    marginBottom: 12,
    marginTop: 4,
    borderRadius: 3,
  },
  warningText: {
    color: '#92400e',
    fontSize: 9.5,
    lineHeight: 1.65,
  },
  // Section divider
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    marginVertical: 16,
  },
  // Code / data
  mono: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: C.grey,
    backgroundColor: C.bg,
    padding: '6 10',
    borderRadius: 3,
    marginBottom: 8,
  },
  // TOC
  tocItem: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 5,
    paddingBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  tocTitle: {
    fontSize: 10,
    color: C.grey,
    flex: 1,
  },
  tocDots: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderBottomStyle: 'dotted',
    marginHorizontal: 6,
    marginBottom: 3,
  },
  tocPage: {
    fontSize: 9,
    color: C.light,
  },
  // Tags
  tag: {
    backgroundColor: '#ecfdf5',
    color: C.accent2,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    padding: '3 8',
    borderRadius: 99,
    marginRight: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 4,
  },
})

// ── Markdown parser → PDF elements ──────────────────────────────────────────
// Parses a subset of markdown and returns @react-pdf/renderer elements.

function parseMarkdown(content: string, _title: string): React.ReactElement[] {
  const lines = content.split('\n')
  const elements: React.ReactElement[] = []
  let i = 0
  let key = 0
  const k = () => `el-${key++}`

  // Table parser
  function parseTable(startIdx: number): { el: React.ReactElement; endIdx: number } {
    const rows: string[][] = []
    let idx = startIdx
    while (idx < lines.length && lines[idx].includes('|')) {
      const row = lines[idx]
        .split('|')
        .map(c => c.trim())
        .filter(c => c !== '')
      if (row.length > 0 && !row.every(c => /^[-:]+$/.test(c))) {
        rows.push(row)
      }
      idx++
    }
    const [header, ...body] = rows
    const el = (
      <View key={k()} style={styles.table}>
        {header && (
          <View style={styles.tableHeader}>
            {header.map((cell, ci) => (
              <Text key={ci} style={styles.tableHeaderCell}>{cell}</Text>
            ))}
          </View>
        )}
        {body.map((row, ri) => (
          <View key={ri} style={[styles.tableRow, ri % 2 === 1 ? styles.tableEven : {}]}>
            {row.map((cell, ci) => (
              <Text key={ci} style={styles.tableCell}>{cell}</Text>
            ))}
          </View>
        ))}
      </View>
    )
    return { el, endIdx: idx }
  }

  while (i < lines.length) {
    const line = lines[i]

    // Skip empty
    if (!line.trim()) { i++; continue }

    // H1
    if (line.startsWith('# ')) {
      elements.push(<Text key={k()} style={styles.h1}>{line.slice(2).replace(/\*\*/g, '')}</Text>)
      i++; continue
    }
    // H2
    if (line.startsWith('## ')) {
      elements.push(<Text key={k()} style={styles.h2}>{line.slice(3).replace(/\*\*/g, '')}</Text>)
      i++; continue
    }
    // H3
    if (line.startsWith('### ')) {
      elements.push(<Text key={k()} style={styles.h3}>{line.slice(4).replace(/\*\*/g, '')}</Text>)
      i++; continue
    }
    // H4
    if (line.startsWith('#### ')) {
      elements.push(<Text key={k()} style={styles.h4}>{line.slice(5).replace(/\*\*/g, '')}</Text>)
      i++; continue
    }
    // HR
    if (/^---+$/.test(line.trim())) {
      elements.push(<View key={k()} style={styles.divider} />)
      i++; continue
    }
    // Table
    if (line.includes('|') && line.trim().startsWith('|')) {
      const { el, endIdx } = parseTable(i)
      elements.push(el)
      i = endIdx; continue
    }
    // Blockquote / callout
    if (line.startsWith('> ') || line.startsWith('>')) {
      const text = line.replace(/^>+\s*/, '')
      const isWarning = text.includes('⚠️') || text.toLowerCase().includes('warning') || text.toLowerCase().includes('caution')
      elements.push(
        <View key={k()} style={isWarning ? styles.warningBox : styles.callout}>
          <Text style={isWarning ? styles.warningText : styles.calloutText}>{text.replace(/\*\*/g, '')}</Text>
        </View>
      )
      i++; continue
    }
    // Bullet list
    if (line.match(/^[\s]*[-*+]\s+/)) {
      const text = line.replace(/^[\s]*[-*+]\s+/, '').replace(/\*\*/g, '')
      elements.push(
        <View key={k()} style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>{text}</Text>
        </View>
      )
      i++; continue
    }
    // Numbered list
    if (line.match(/^\d+\.\s+/)) {
      const num = line.match(/^(\d+)\./)?.[1] ?? '•'
      const text = line.replace(/^\d+\.\s+/, '').replace(/\*\*/g, '')
      elements.push(
        <View key={k()} style={styles.listItem}>
          <Text style={[styles.bullet, { color: C.grey }]}>{num}.</Text>
          <Text style={styles.listText}>{text}</Text>
        </View>
      )
      i++; continue
    }
    // Code block
    if (line.startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(<Text key={k()} style={styles.mono}>{codeLines.join('\n')}</Text>)
      i++; continue
    }
    // Regular paragraph — strip markdown bold/italic/code
    const clean = line
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim()
    if (clean) {
      elements.push(<Text key={k()} style={styles.p}>{clean}</Text>)
    }
    i++
  }

  return elements
}

// ── TOC entries ───────────────────────────────────────────────────────────────
const TOC_ENTRIES = [
  { title: 'Executive Summary', page: 3 },
  { title: '1. Introduction & Background', page: 4 },
  { title: '2. Pharmacological Profile', page: 5 },
  { title: '3. Pharmacokinetics (ADMET)', page: 6 },
  { title: '4. Molecular Properties & Drug-Likeness', page: 7 },
  { title: '5. Clinical Evidence & Efficacy', page: 8 },
  { title: '6. Safety Profile & Adverse Events', page: 9 },
  { title: '7. Drug Interactions', page: 10 },
  { title: '8. Therapeutic Applications', page: 11 },
  { title: '9. Comparative Analysis', page: 12 },
  { title: '10. Regulatory Status', page: 13 },
  { title: '11. Future Research Directions', page: 14 },
  { title: '12. Conclusion & Recommendations', page: 15 },
  { title: 'References & Data Sources', page: 16 },
]

// ── Header / Footer helpers ───────────────────────────────────────────────────
function PageHeader({ title }: { title: string }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerBrand}>MAID RESEARCH</Text>
      <Text style={styles.headerTitle}>{title.slice(0, 60)}</Text>
    </View>
  )
}

function PageFooter({ generatedAt }: { generatedAt: string }) {
  const date = new Date(generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Generated by MAID · {date}</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} style={styles.footerText} />
    </View>
  )
}

// ── Main document component ───────────────────────────────────────────────────
interface Props {
  title: string
  content: string
  generatedAt: string
  author: string
}

export function MaidReportDoc({ title, content, generatedAt, author }: Props) {
  const bodyElements = parseMarkdown(content, title)
  const date = new Date(generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <Document
      title={title}
      author="MAID — Medical AI for Intelligent Drug-discovery"
      subject="Pharmaceutical Research Report"
      creator="MAID Platform"
      keywords="pharmaceutical, research, drug discovery, medical AI"
    >
      {/* ── Cover Page ── */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverTop}>
          <Text style={styles.coverTag}>Medical AI Research Report</Text>
          <Text style={styles.coverTitle}>{title}</Text>
          <Text style={styles.coverSubtitle}>
            Comprehensive pharmaceutical research report synthesized from PubChem, ChEMBL, OpenFDA, ClinicalTrials.gov, UniProt, and RxNorm databases.
          </Text>
          <View style={{ flexDirection: 'row', gap: 40 }}>
            <View>
              <Text style={styles.coverMeta}>Generated by</Text>
              <Text style={styles.coverMetaVal}>MAID Platform</Text>
            </View>
            <View>
              <Text style={styles.coverMeta}>Author</Text>
              <Text style={styles.coverMetaVal}>{author}</Text>
            </View>
            <View>
              <Text style={styles.coverMeta}>Date</Text>
              <Text style={styles.coverMetaVal}>{date}</Text>
            </View>
          </View>
        </View>
        <View style={styles.coverBar} />
        <View style={styles.coverBottom}>
          <Text style={{ color: '#4b5563', fontSize: 8, lineHeight: 1.6 }}>
            ⚠️ This report is generated by AI for research purposes only. All findings require verification by qualified medical and pharmaceutical professionals before clinical application. MAID does not provide medical advice.
          </Text>
        </View>
      </Page>

      {/* ── Table of Contents ── */}
      <Page size="A4" style={styles.page}>
        <PageHeader title={title} />
        <PageFooter generatedAt={generatedAt} />
        <Text style={styles.h2}>Table of Contents</Text>
        <View style={{ marginTop: 12 }}>
          {TOC_ENTRIES.map((entry, i) => (
            <View key={i} style={styles.tocItem}>
              <Text style={styles.tocTitle}>{entry.title}</Text>
              <View style={styles.tocDots} />
              <Text style={styles.tocPage}>{entry.page}</Text>
            </View>
          ))}
        </View>
        <View style={{ ...styles.callout, marginTop: 30 }}>
          <Text style={styles.calloutText}>
            This report was generated using MAID — Medical AI for Intelligent Drug-discovery. Data sourced from peer-reviewed databases and regulatory sources.
          </Text>
        </View>
      </Page>

      {/* ── Report Body ── */}
      <Page size="A4" style={styles.page} wrap>
        <PageHeader title={title} />
        <PageFooter generatedAt={generatedAt} />
        {bodyElements}
        {/* Final disclaimer */}
        <View style={{ ...styles.warningBox, marginTop: 24 }}>
          <Text style={styles.warningText}>
            ⚠️ IMPORTANT DISCLAIMER: This pharmaceutical research report has been generated by MAID (Medical AI for Intelligent Drug-discovery) using artificial intelligence and publicly available scientific databases. All information is for research purposes only. This report does not constitute medical advice, diagnosis, or treatment recommendations. All findings must be independently verified by qualified pharmaceutical scientists and medical professionals before any clinical application. MAID, its developers, and associated parties accept no liability for decisions made based on this report.
          </Text>
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 8, color: C.light, textAlign: 'center' }}>
            Generated by MAID Platform · {date} · Data from PubChem · ChEMBL · OpenFDA · ClinicalTrials.gov · UniProt · RxNorm
          </Text>
        </View>
      </Page>
    </Document>
  )
}

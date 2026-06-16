'use client'

import { useMemo } from 'react'

interface Props {
  content: string
}

// Lightweight markdown renderer — no heavy deps
export default function MarkdownRenderer({ content }: Props) {
  const html = useMemo(() => parseMarkdown(content), [content])
  return (
    <div
      className="prose-maid"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function parseMarkdown(md: string): string {
  let html = md

  // Escape HTML
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Tables
  html = html.replace(/(\|.+\|\n)+/g, (table) => {
    const rows = table.trim().split('\n')
    if (rows.length < 2) return table
    const header = rows[0]
    const isHeaderRow = rows[1] && /^\|[\s\-|]+\|$/.test(rows[1])
    const bodyRows = isHeaderRow ? rows.slice(2) : rows.slice(1)

    const thCells = header.split('|').filter(c => c.trim()).map(c =>
      `<th>${c.trim()}</th>`
    ).join('')

    const trs = bodyRows.map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c =>
        `<td>${c.trim()}</td>`
      ).join('')
      return `<tr>${cells}</tr>`
    }).join('')

    return `<table><thead><tr>${thCells}</tr></thead><tbody>${trs}</tbody></table>`
  })

  // Unordered lists
  html = html.replace(/(^[-*] .+$\n?)+/gm, (block) => {
    const items = block.trim().split('\n').map(l =>
      `<li>${l.replace(/^[-*] /, '')}</li>`
    ).join('')
    return `<ul>${items}</ul>`
  })

  // Ordered lists
  html = html.replace(/(^\d+\. .+$\n?)+/gm, (block) => {
    const items = block.trim().split('\n').map(l =>
      `<li>${l.replace(/^\d+\. /, '')}</li>`
    ).join('')
    return `<ol>${items}</ol>`
  })

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr class="border-white/10 my-4" />')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

  // Paragraphs — wrap double-newline separated blocks
  html = html
    .split(/\n{2,}/)
    .map(block => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (/^<(h[1-6]|ul|ol|pre|table|blockquote|hr)/.test(trimmed)) return trimmed
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`
    })
    .join('\n')

  return html
}

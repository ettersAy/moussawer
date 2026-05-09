const ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ENTITY_MAP[c] || c)
}

function renderInline(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
}

export function renderMarkdown(text) {
  if (!text) return ''
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return '<br>'
      if (/^###\s/.test(trimmed)) return `<h3>${renderInline(trimmed.replace(/^###\s*/, ''))}</h3>`
      if (/^##\s/.test(trimmed)) return `<h2>${renderInline(trimmed.replace(/^##\s*/, ''))}</h2>`
      if (/^#\s/.test(trimmed)) return `<h1>${renderInline(trimmed.replace(/^#\s*/, ''))}</h1>`
      if (/^[-*]\s/.test(trimmed)) return `<li>${renderInline(trimmed.replace(/^[-*]\s*/, ''))}</li>`
      return `<p>${renderInline(trimmed)}</p>`
    })
    .join('\n')
}

const HTML_TAG_RE = /<[a-z][\s\S]*?>/i;

function decodeHtmlEntities(text) {
  if (typeof document === 'undefined') {
    return text
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

export function stripInsightHtml(text) {
  if (!text) {
    return '';
  }

  const trimmed = text.trim();
  if (!HTML_TAG_RE.test(trimmed)) {
    return trimmed.replace(/\s*\[\+\d+\s+chars\]\s*$/i, '').trim();
  }

  if (typeof document === 'undefined') {
    return decodeHtmlEntities(trimmed.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  }

  const doc = new DOMParser().parseFromString(trimmed, 'text/html');
  return doc.body.textContent.replace(/\s*\[\+\d+\s+chars\]\s*$/i, '').trim();
}

export function formatInsightParagraphs(text) {
  const plain = stripInsightHtml(text);
  if (!plain) {
    return [];
  }

  return plain
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

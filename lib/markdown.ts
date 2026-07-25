/**
 * Minimal Markdown → HTML for blog posts (no extra deps).
 * Supports: ##/### headings, paragraphs, bold, italic, links, ul/ol lists.
 */
export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let i = 0;
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      html.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      html.push('</ol>');
      inOl = false;
    }
  };

  const inline = (text: string): string => {
    let s = escapeHtml(text);
    // links [text](url)  absolute stay new-tab; site-relative keep same tab
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, href) => {
      const safeHref = String(href).replace(/"/g, '&quot;');
      const isExternal = /^https?:\/\//i.test(href);
      if (isExternal) {
        return `<a href="${safeHref}" class="text-primary font-semibold hover:underline" target="_blank" rel="noopener noreferrer">${label}</a>`;
      }
      return `<a href="${safeHref}" class="text-primary font-semibold hover:underline">${label}</a>`;
    });
    // bold **text**
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // italic *text* (after bold)
    s = s.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
    return s;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      closeLists();
      i += 1;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      closeLists();
      html.push(`<h3 class="text-lg font-extrabold text-heading mt-8 mb-3">${inline(trimmed.slice(4))}</h3>`);
      i += 1;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      closeLists();
      html.push(`<h2 class="text-xl font-extrabold text-heading mt-10 mb-4">${inline(trimmed.slice(3))}</h2>`);
      i += 1;
      continue;
    }

    // Skip duplicate H1 if present  page already has title
    if (trimmed.startsWith('# ')) {
      closeLists();
      i += 1;
      continue;
    }

    const ulMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      if (inOl) {
        html.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        html.push('<ul class="list-disc pl-5 space-y-2 text-sm text-body mb-4">');
        inUl = true;
      }
      html.push(`<li>${inline(ulMatch[1])}</li>`);
      i += 1;
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (inUl) {
        html.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        html.push('<ol class="list-decimal pl-5 space-y-2 text-sm text-body mb-4">');
        inOl = true;
      }
      html.push(`<li>${inline(olMatch[1])}</li>`);
      i += 1;
      continue;
    }

    closeLists();
    // Collect consecutive non-empty, non-heading lines as one paragraph
    const para: string[] = [trimmed];
    i += 1;
    while (i < lines.length) {
      const next = lines[i].trim();
      if (!next || next.startsWith('#') || /^[-*]\s+/.test(next) || /^\d+\.\s+/.test(next)) break;
      para.push(next);
      i += 1;
    }
    html.push(`<p class="text-[15px] text-body leading-relaxed mb-4">${inline(para.join(' '))}</p>`);
  }

  closeLists();
  return html.join('\n');
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

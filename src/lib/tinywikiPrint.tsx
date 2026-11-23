import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { WikiData } from '@/lib/tinywiki';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const md = (text: string) =>
  renderToStaticMarkup(<ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>);

const CSS = `
@page { size: A4; margin: 18mm 16mm 20mm; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html, body { margin: 0; padding: 0; background: #fff; color: #1a2233; }
body { font-family: Georgia, 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.65; }
.brand { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #C5A059;
  padding-bottom: 6pt; margin-bottom: 18pt; font: 700 8pt/1 Arial, sans-serif; letter-spacing: .22em; text-transform: uppercase; color: #003366; }
.brand span:last-child { color: #8a7035; }
h1 { font-size: 27pt; line-height: 1.15; margin: 0 0 6pt; color: #003366; letter-spacing: -.01em; }
.meta { font: 600 8.5pt Arial, sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #6b7280; margin-bottom: 14pt; }
.summary { font-size: 12.5pt; line-height: 1.7; border-left: 4px solid #C5A059; background: #faf6ec; padding: 10pt 14pt; margin: 0 0 18pt; border-radius: 0 6pt 6pt 0; }
.toc { border: 1px solid #e5e7eb; border-radius: 6pt; padding: 10pt 14pt; margin-bottom: 18pt; font: 10pt/1.7 Arial, sans-serif; }
.toc b { display: block; font-size: 8pt; letter-spacing: .2em; text-transform: uppercase; color: #6b7280; margin-bottom: 4pt; }
.toc ol { margin: 0; padding-left: 16pt; }
section.sec { margin: 0 0 20pt; }
h2 { font-size: 17pt; color: #003366; margin: 0 0 8pt; padding-bottom: 4pt; border-bottom: 1px solid #e5e7eb; break-after: avoid; page-break-after: avoid; }
h2 .n { color: #C5A059; margin-right: 6pt; }
h3 { font: 700 8.5pt Arial, sans-serif; letter-spacing: .18em; text-transform: uppercase; color: #003366; margin: 12pt 0 4pt; break-after: avoid; }
p { margin: 0 0 8pt; orphans: 3; widows: 3; }
ul, ol { margin: 0 0 8pt; padding-left: 18pt; }
li { margin-bottom: 3pt; }
strong { color: #003366; }
table { border-collapse: collapse; width: 100%; margin: 8pt 0; font-size: 10pt; }
th, td { border: 1px solid #d1d5db; padding: 4pt 6pt; text-align: left; }
th { background: #f3f4f6; }
code { font-family: 'Courier New', monospace; background: #f3f4f6; padding: 0 3pt; border-radius: 2pt; font-size: 10pt; }
blockquote { margin: 8pt 0; padding: 2pt 12pt; border-left: 3px solid #d1d5db; color: #4b5563; }
.box { break-inside: avoid; page-break-inside: avoid; border-radius: 6pt; padding: 8pt 12pt; margin: 8pt 0; }
.kp { background: #f1f5fb; border-left: 4px solid #003366; }
.cp { border: 1px solid #e5e7eb; }
.box h3 { margin-top: 0; }
.src { font: italic 9pt Arial, sans-serif; color: #6b7280; }
.gloss { columns: 2; column-gap: 20pt; }
.gloss div { break-inside: avoid; margin-bottom: 7pt; font-size: 10.5pt; }
.foot { margin-top: 24pt; padding-top: 8pt; border-top: 1px solid #e5e7eb; font: 8pt Arial, sans-serif; color: #9ca3af; text-align: center; }
`;

export function wikiToPrintHtml(w: WikiData): string {
  const sections = w.sections
    .map((s, i) => `
<section class="sec">
  <h2><span class="n">${String(i + 1).padStart(2, '0')}</span>${esc(s.heading)}</h2>
  ${md(s.content)}
  ${s.keyPoints?.length ? `<div class="box kp"><h3>Key points</h3><ul>${s.keyPoints.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
  ${s.criticalPerspectives?.length ? `<div class="box cp"><h3>Critical perspectives</h3><ul>${s.criticalPerspectives.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
  ${s.citations?.length ? `<p class="src">Sources: ${s.citations.map(esc).join(' · ')}</p>` : ''}
</section>`)
    .join('');

  const glossary = w.glossary?.length
    ? `<section class="sec"><h2>Glossary</h2><div class="gloss">${[...w.glossary]
        .sort((a, b) => a.term.localeCompare(b.term))
        .map((g) => `<div><strong>${esc(g.term)}</strong>: ${esc(g.definition)}</div>`)
        .join('')}</div></section>`
    : '';

  const related = w.relatedTopics?.length
    ? `<p class="src">Related topics: ${w.relatedTopics.map(esc).join(' · ')}</p>`
    : '';

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(w.title)}</title><style>${CSS}</style></head><body>
<div class="brand"><span>UISU · TinyWiki</span><span>${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
<h1>${esc(w.title)}</h1>
<div class="meta">${w.difficulty ? esc(w.difficulty) + ' · ' : ''}${w.readingTimeMinutes} min read · ${w.sections.length} sections</div>
<div class="summary">${esc(w.summary)}</div>
<div class="toc"><b>Contents</b><ol>${w.sections.map((s) => `<li>${esc(s.heading)}</li>`).join('')}</ol></div>
${sections}${glossary}${related}
<div class="foot">Generated by UISU TinyWiki. AI-generated content, so verify important facts.</div>
</body></html>`;
}

/**
 * Prints the wiki from an isolated iframe so the site header, footer, sidebars
 * and dark-mode colours never leak into the printout.
 */
export function printWiki(w: WikiData): void {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
  document.body.appendChild(iframe);
  const cleanup = () => setTimeout(() => iframe.remove(), 1000);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) { iframe.remove(); return; }
  doc.open();
  doc.write(wikiToPrintHtml(w));
  doc.close();

  const go = () => {
    try {
      win.focus();
      win.addEventListener('afterprint', cleanup, { once: true });
      win.print();
    } catch {
      cleanup();
    }
    setTimeout(() => iframe.remove(), 120000); // safety net
  };
  if (doc.readyState === 'complete') setTimeout(go, 150);
  else iframe.onload = () => setTimeout(go, 150);
}

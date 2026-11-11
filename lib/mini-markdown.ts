// A tiny, safe reader for the answers Aladdin writes: "## heading", "- bullet", "1. item", paragraphs and **bold**.
// It returns plain data (never HTML), so the page renders it as React elements and nothing from the model is injected as markup.

export type Inline = { text: string; bold: boolean };
type Block =
  | { type: 'heading'; inline: Inline[] }
  | { type: 'item'; inline: Inline[]; marker: string }
  | { type: 'paragraph'; inline: Inline[] };

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  const parts = text.split('**');
  parts.forEach((part, i) => {
    if (!part) return;
    // an odd number of ** leaves the last piece unclosed: show it as normal text
    const closed = i % 2 === 1 && i < parts.length - 1;
    out.push({ text: part, bold: closed });
  });
  return out.length ? out : [{ text, bold: false }];
}

export function parseMiniMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'paragraph', inline: parseInline(paragraph.join(' ')) });
    paragraph = [];
  };
  for (const raw of source.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const heading = /^#{1,6}\s+(.+)$/.exec(line);
    if (heading) { flush(); blocks.push({ type: 'heading', inline: parseInline(heading[1].replace(/\s*#+$/, '')) }); continue; }
    const item = /^(?:([-*•])|(\d{1,2}[.)]))\s+(.+)$/.exec(line);
    if (item) { flush(); blocks.push({ type: 'item', marker: item[2] ?? '•', inline: parseInline(item[3]) }); continue; }
    paragraph.push(line);
  }
  flush();
  return blocks;
}

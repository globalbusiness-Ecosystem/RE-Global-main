import { parseMiniMarkdown, type Inline } from '@/lib/mini-markdown';

function Text({ inline }: { inline: Inline[] }) {
  return (
    <>
      {inline.map((part, i) => (part.bold ? <strong key={i} className="font-semibold text-white">{part.text}</strong> : <span key={i}>{part.text}</span>))}
    </>
  );
}

/** Shows an AI answer with headings, bullets and bold text. Nothing is rendered as HTML. */
export default function MiniMarkdown({ text }: { text: string }) {
  const blocks = parseMiniMarkdown(text);
  return (
    <div className="space-y-2 text-sm">
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return <h3 key={i} dir="auto" className="pt-2 text-sm font-bold text-[#F59E0B]"><Text inline={block.inline} /></h3>;
        }
        if (block.type === 'item') {
          return (
            <div key={i} dir="auto" className="flex gap-2">
              <span className="shrink-0 text-[#F59E0B]">{block.marker}</span>
              <p className="min-w-0 flex-1"><Text inline={block.inline} /></p>
            </div>
          );
        }
        return <p key={i} dir="auto"><Text inline={block.inline} /></p>;
      })}
    </div>
  );
}

// Aladdin's memory inside one chat: which earlier messages are sent along with a new question, and how they are cleaned.
// The server rebuilds the list itself from what the browser sends, because the browser is not trusted.

export type HistoryMessage = { role: 'user' | 'assistant'; content: string };

export const MAX_HISTORY_MESSAGES = 12;
export const MAX_HISTORY_USER_CHARS = 2000;
export const MAX_HISTORY_ASSISTANT_CHARS = 12_000; // a contract analysis is long
export const MAX_HISTORY_TOTAL_CHARS = 30_000;

const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

/** What the browser sends: the earlier turns of the chat, newest last. Anything else is dropped. */
export function sanitizeHistory(raw: unknown): HistoryMessage[] {
  if (!Array.isArray(raw)) return [];
  const cleaned: HistoryMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') continue;
    const limit = role === 'user' ? MAX_HISTORY_USER_CHARS : MAX_HISTORY_ASSISTANT_CHARS;
    const text = content.replace(CONTROL, '').trim().slice(0, limit);
    if (!text) continue;
    const last = cleaned[cleaned.length - 1];
    if (last && last.role === role) last.content = `${last.content}\n\n${text}`.slice(0, limit);
    else cleaned.push({ role, content: text });
  }
  // keep the newest turns within the size limits
  let total = 0;
  const kept: HistoryMessage[] = [];
  for (let i = cleaned.length - 1; i >= 0 && kept.length < MAX_HISTORY_MESSAGES; i--) {
    total += cleaned[i].content.length;
    if (total > MAX_HISTORY_TOTAL_CHARS) break;
    kept.unshift(cleaned[i]);
  }
  // the model needs the first turn to be the user's
  while (kept.length && kept[0].role !== 'user') kept.shift();
  return kept;
}

/** The turns sent to the model: the cleaned history, then the new question (merged if the history ends with the user). */
export function buildAdvisorMessages(history: unknown, current: string): HistoryMessage[] {
  const messages = sanitizeHistory(history);
  const last = messages[messages.length - 1];
  if (last && last.role === 'user') last.content = `${last.content}\n\n${current}`;
  else messages.push({ role: 'user', content: current });
  return messages;
}

/** True when the chat already holds a contract analysis, so follow-up questions must go to the AI with that context. */
export function hasContractContext(messages: { rich?: boolean }[]): boolean {
  return messages.some((m) => m.rich === true);
}

/** Turns the chat's own message list into the history the browser sends (greeting and empty turns left out). */
export function toHistory(messages: { role: 'user' | 'assistant'; content: string; id: string }[]): HistoryMessage[] {
  return messages
    .filter((m) => !m.id.startsWith('greeting-'))
    .map((m) => ({ role: m.role, content: m.content }));
}

/** Added to Aladdin's instructions so that it uses the earlier turns, above all a contract it has analysed. */
export const MEMORY_INSTRUCTIONS = `

CONVERSATION MEMORY: Earlier turns of this chat are included. Use them. When the user asks a follow-up about a contract you analysed earlier ("this clause", "the penalty", "is it safe to sign"), answer from that analysis and the quoted wording in it. If the question is about something the analysis did not cover, say so and ask the user to paste that part of the contract; never invent clauses, figures or dates. If an earlier turn is a contract analysis, remember that it is an AI reading and not legal advice, and remind the user to have a lawyer licensed in the contract's country review it before they sign or pay when the question is about signing, paying or a dispute.

For legal, tax, mortgage or investment questions, end with one short sentence, in the language you are answering in, saying this is general information and not professional advice.`;

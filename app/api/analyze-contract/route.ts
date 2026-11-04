import { guardApi } from '@/lib/api-guard';
import { readJsonLimited, cleanString } from '@/lib/ai-input';
import { isAdvisorLanguage } from '@/lib/advisor-i18n';
import {
  MAX_CONTRACT_BODY_BYTES,
  parseContractInput,
  contractSystemPrompt,
  contractUserContent,
  contractDisclaimer,
} from '@/lib/contract-analysis';
import { Anthropic } from '@anthropic-ai/sdk';

// Aladdin reads a contract (pasted text, PDF or photo) and explains it. The contract is sent to the model for this
// one request only: it is never stored and never written to the logs.
export async function POST(req: Request) {
  // Expensive call (a whole document), so the limit is lower than the chat's.
  const guard = await guardApi(req, { scope: 'analyze-contract', limit: 6 });
  if (guard instanceof Response) return guard;
  try {
    const body = await readJsonLimited(req, MAX_CONTRACT_BODY_BYTES);
    if (body instanceof Response) return body;

    const input = parseContractInput(body);
    if (!input.ok) return Response.json({ success: false, error: input.error }, { status: input.status });

    const language = isAdvisorLanguage(body.language) ? body.language : 'en';
    const question = cleanString(body.question, 500);
    const country = cleanString(body.country, 80);

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ success: false, error: 'Contract analysis is not configured' }, { status: 503 });
    }

    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-sonnet-5-5',
      max_tokens: 3000,
      system: contractSystemPrompt(language),
      messages: [{ role: 'user', content: contractUserContent(input, question, country) }],
    });

    const block = response.content.find((b) => b.type === 'text');
    const analysis = block && block.type === 'text' ? block.text.trim() : '';
    if (!analysis) return Response.json({ success: false, error: 'No analysis was produced' }, { status: 502 });

    return Response.json(
      { success: true, analysis, disclaimer: contractDisclaimer(language), language },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    // Only the error type is logged: the message of an API error can echo part of the request.
    console.error('[contract] analysis failed:', error instanceof Error ? error.name : 'unknown');
    return Response.json({ success: false, error: 'Failed to analyze the contract' }, { status: 500 });
  }
}

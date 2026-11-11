import type { ContractUiKey } from './contract-ui-labels';

// Browser-side rules for the contract panel: which files are accepted, how the request is built and which message a
// server answer maps to. Pure functions, no browser APIs, so they are tested. The server checks everything again.

export const CLIENT_MAX_FILE_BYTES = 3 * 1024 * 1024;
const CLIENT_MAX_TEXT_CHARS = 40_000;
const CLIENT_MAX_TXT_BYTES = 200_000;

type PickedFile =
  | { ok: true; kind: 'pdf' | 'image' | 'txt' }
  | { ok: false; error: ContractUiKey };

/** Decides from the name, type and size whether the chosen file can be used (images are shrunk before sending). */
export function checkContractFile(file: { name: string; type: string; size: number }): PickedFile {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return file.size > CLIENT_MAX_FILE_BYTES ? { ok: false, error: 'errTooBig' } : { ok: true, kind: 'pdf' };
  }
  if (/^image\/(jpeg|png|webp)$/.test(type) || /\.(jpe?g|png|webp)$/.test(name)) {
    // a camera photo can be much bigger than 3 MB: it is scaled down in the browser, so only an absurd size is refused
    return file.size > 25 * 1024 * 1024 ? { ok: false, error: 'errTooBig' } : { ok: true, kind: 'image' };
  }
  if (type === 'text/plain' || name.endsWith('.txt')) {
    return file.size > CLIENT_MAX_TXT_BYTES ? { ok: false, error: 'errTooBig' } : { ok: true, kind: 'txt' };
  }
  return { ok: false, error: 'errType' };
}

/** The message to show for an answer of the contract API. */
export function contractErrorKey(status: number): ContractUiKey {
  if (status === 401 || status === 403) return 'errAuth';
  if (status === 413) return 'errTooBig';
  if (status === 415) return 'errType';
  if (status === 429) return 'errBusy';
  if (status === 503) return 'errNotConfigured';
  if (status === 400) return 'errInvalid';
  return 'errFailed';
}

type ContractRequest = {
  language: string;
  question?: string;
  text?: string;
  file?: { mediaType: string; data: string };
};

/** The JSON body for POST /api/analyze-contract; the file wins over the text, as on the server. */
export function buildContractRequest(args: { language: string; text: string; question: string; file: { mediaType: string; data: string } | null }): ContractRequest {
  const body: ContractRequest = { language: args.language };
  const question = args.question.trim();
  if (question) body.question = question.slice(0, 500);
  if (args.file) body.file = args.file;
  else body.text = args.text.trim();
  return body;
}

/** What is wrong with the user's input before anything is sent, or null when it can be sent. */
export function contractInputError(args: { text: string; hasFile: boolean }): ContractUiKey | null {
  if (args.hasFile) return null;
  const t = args.text.trim();
  if (t.length < 40) return 'errShort';
  if (t.length > CLIENT_MAX_TEXT_CHARS) return 'errLong';
  return null;
}

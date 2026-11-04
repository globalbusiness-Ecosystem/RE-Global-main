'use client';
import { useRef, useState } from 'react';
import { FileText, Loader, Upload, X } from 'lucide-react';
import { authHeaders } from '@/lib/api-token';
import { cu, type ContractUiKey } from '@/lib/contract-ui-labels';
import {
  CLIENT_MAX_FILE_BYTES,
  buildContractRequest,
  checkContractFile,
  contractErrorKey,
  contractInputError,
} from '@/lib/contract-client';

export interface ContractResult {
  userNote: string;
  analysis: string;
  disclaimer: string;
}

interface ContractPanelProps {
  language?: string;
  onClose: () => void;
  onAnalyzed: (result: ContractResult) => void;
}

type Payload = { mediaType: string; data: string };

const readAsDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read'));
    reader.readAsDataURL(file);
  });

// A phone photo is often 4-8 MB; the server accepts 3 MB, so photos are scaled down to 2000 px and re-saved as JPEG.
async function shrinkImage(file: File): Promise<Payload> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image'));
      el.src = url;
    });
    const scale = Math.min(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    let quality = 0.85;
    let data = canvas.toDataURL('image/jpeg', quality);
    while (data.length * 0.75 > CLIENT_MAX_FILE_BYTES && quality > 0.4) {
      quality -= 0.15;
      data = canvas.toDataURL('image/jpeg', quality);
    }
    if (data.length * 0.75 > CLIENT_MAX_FILE_BYTES) throw new Error('big');
    return { mediaType: 'image/jpeg', data };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function ContractPanel({ language, onClose, onAnalyzed }: ContractPanelProps) {
  const [text, setText] = useState('');
  const [question, setQuestion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ContractUiKey | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    e.target.value = '';
    if (!chosen) return;
    const check = checkContractFile(chosen);
    if (!check.ok) {
      setFile(null);
      setError(check.error);
      return;
    }
    setError(null);
    setFile(chosen);
  };

  const submit = async () => {
    const problem = contractInputError({ text, hasFile: !!file });
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let payload: Payload | null = null;
      let pastedText = text;
      let userNote = cu('userText', language, { count: text.trim().length });
      if (file) {
        const check = checkContractFile(file);
        if (!check.ok) throw Object.assign(new Error('file'), { key: check.error });
        userNote = cu('userFile', language, { name: file.name.slice(0, 80) });
        if (check.kind === 'txt') {
          pastedText = await file.text();
          const textProblem = contractInputError({ text: pastedText, hasFile: false });
          if (textProblem) throw Object.assign(new Error('text'), { key: textProblem });
        } else if (check.kind === 'image') {
          payload = await shrinkImage(file);
        } else {
          payload = { mediaType: 'application/pdf', data: await readAsDataUrl(file) };
        }
      }
      const body = buildContractRequest({ language: language ?? 'en', text: pastedText, question, file: payload });
      const response = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success || typeof data.analysis !== 'string') {
        setError(contractErrorKey(response.status));
        return;
      }
      onAnalyzed({ userNote, analysis: data.analysis, disclaimer: typeof data.disclaimer === 'string' ? data.disclaimer : '' });
      onClose();
    } catch (err) {
      const key = (err as { key?: ContractUiKey } | null)?.key;
      setError(key ?? (err instanceof Error && err.message === 'big' ? 'errTooBig' : 'errInvalid'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label={cu('panelTitle', language)} className="rounded-lg border border-[#F59E0B]/40 bg-[#2a1f15] p-3 space-y-3 max-h-[55vh] overflow-y-auto">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#F59E0B]">
          <FileText className="w-4 h-4" aria-hidden="true" />
          {cu('panelTitle', language)}
        </h3>
        <button type="button" onClick={onClose} disabled={busy} aria-label={cu('cancel', language)} className="p-1 rounded hover:bg-[#F59E0B]/10 disabled:opacity-50">
          <X className="w-4 h-4 text-[#F59E0B]" />
        </button>
      </div>
      <p className="text-xs text-gray-300">{cu('intro', language)}</p>

      <label className="block text-xs text-gray-400">
        {cu('pasteLabel', language)}
        <textarea
          dir="auto"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy || !!file}
          rows={5}
          placeholder={cu('pastePlaceholder', language)}
          className="mt-1 w-full resize-y rounded-lg border border-[#F59E0B]/30 bg-[#1a1410] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#F59E0B] focus:outline-none disabled:opacity-50"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
        <span>{cu('or', language)}</span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-2 rounded-lg border border-[#F59E0B]/30 bg-[#1a1410] px-3 py-2 text-[#F59E0B] hover:border-[#F59E0B]/60 disabled:opacity-50"
        >
          <Upload className="w-4 h-4" aria-hidden="true" />
          {cu('chooseFile', language)}
        </button>
        <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,application/pdf,image/jpeg,image/png,image/webp,text/plain" onChange={pickFile} className="hidden" />
        <span className="text-[10px] text-gray-500">{cu('fileHint', language)}</span>
      </div>

      {file && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-[#1a1410] px-3 py-2 text-xs text-gray-200">
          <span dir="auto" className="min-w-0 truncate">{cu('chosen', language, { name: file.name.slice(0, 80) })}</span>
          <button type="button" onClick={() => setFile(null)} disabled={busy} className="shrink-0 text-[#F59E0B] hover:underline disabled:opacity-50">
            {cu('removeFile', language)}
          </button>
        </div>
      )}

      <label className="block text-xs text-gray-400">
        {cu('questionLabel', language)}
        <input
          dir="auto"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 500))}
          disabled={busy}
          placeholder={cu('questionPlaceholder', language)}
          className="mt-1 w-full rounded-lg border border-[#F59E0B]/30 bg-[#1a1410] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#F59E0B] focus:outline-none disabled:opacity-50"
        />
      </label>

      {error && <p role="alert" className="rounded-lg bg-red-600/10 border border-red-600/30 px-3 py-2 text-xs text-red-400">{cu(error, language)}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#F59E0B] to-[#d97706] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy && <Loader className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {busy ? cu('analyzing', language) : cu('analyze', language)}
        </button>
        <button type="button" onClick={onClose} disabled={busy} className="rounded-lg border border-[#F59E0B]/30 px-4 py-2 text-sm text-gray-200 hover:bg-[#F59E0B]/10 disabled:opacity-50">
          {cu('cancel', language)}
        </button>
      </div>
      <p className="text-[10px] text-gray-500">{cu('privacy', language)}</p>
    </section>
  );
}

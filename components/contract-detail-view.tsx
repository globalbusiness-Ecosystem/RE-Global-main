'use client';
import { useState } from 'react';
import { ShieldCheck, Key, Link2, FileText, Copy, Check, ChevronDown, ScanLine, X } from 'lucide-react';
import type { SmartContract } from '@/lib/firebase-database';
import { Download } from 'lucide-react';
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-white/[0.06] last:border-0">
      <span className="text-[10.5px] uppercase tracking-[0.14em] text-stone-500 pt-0.5 shrink-0 w-28">{label}</span>
      <button
        onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {} }}
        className="group flex items-center gap-2 text-right font-mono text-[11.5px] text-stone-300 hover:text-amber-300 transition-colors"
      >
        <span className="break-all">{value}</span>
        {copied ? <Check size={12} className="text-emerald-400 shrink-0" /> : <Copy size={12} className="shrink-0 opacity-0 group-hover:opacity-60" />}
      </button>
    </div>
  );
}

function Seal() {
  return (
    <div className="relative w-[76px] h-[76px] shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="47" fill="none" stroke="#c9a227" strokeWidth="1.2" opacity="0.55" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="#c9a227" strokeWidth="0.6" opacity="0.35" strokeDasharray="1.5 3" />
        <path id="sealArc" d="M 50 12 A 38 38 0 1 1 49.9 12" fill="none" />
        <text fontSize="6.2" fill="#d4af37" letterSpacing="2.3" fontFamily="ui-monospace, monospace">
          <textPath href="#sealArc" startOffset="1%">TITLE KEY · RE GLOBAL · VERIFIED ·</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Key size={22} className="text-amber-400 -rotate-45" strokeWidth={1.5} />
      </div>
    </div>
  );
}

function VerifyQR({ contractId, size = 84 }: { contractId: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const value = `${typeof window !== 'undefined' ? window.location.origin : 'https://re-global.app'}/verify/${contractId}`;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: '#0e0e11', light: '#f5f1e8' },
    }).catch((e) => console.error('[VerifyQR] generation error:', e));
  }, [contractId, size]);
  return <canvas ref={canvasRef} width={size} height={size} className="rounded-[2px]" />;
}

export function ContractDetailView({ contract, onClose }: { contract: SmartContract; onClose?: () => void }) {
  const [showFullText, setShowFullText] = useState(false);
  const isSigned = Boolean(contract.contractHash && contract.platformSignature);

  const downloadPdf = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 48;
    let y = margin;
    const lineHeight = 16;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    const fingerprint = `${contract.id}-${(contract.contractHash || '').slice(0, 12)}`;

    const drawWatermark = () => {
      doc.saveGraphicsState();
      // @ts-ignore - GState exists on jsPDF instance at runtime
      doc.setGState(new (doc as any).GState({ opacity: 0.07 }));
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(120, 90, 20);
      const stampText = `RE GLOBAL · VERIFIED · ${fingerprint}`;
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 3; col++) {
          doc.text(stampText, col * 260 - 40, row * 100 + 60, { angle: 35 });
        }
      }
      doc.restoreGraphicsState();
    };

    const drawFooter = () => {
      const pageNum = doc.internal.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(140, 140, 140);
      const footerY = pageHeight - 24;
      doc.text(`Document hash: ${contract.contractHash || 'N/A'}`, margin, footerY);
      doc.text(`Platform key: ${contract.platformPublicKey || 'N/A'}`, margin, footerY + 9);
      doc.text(`Page ${pageNum}`, pageWidth - margin - 40, footerY);
    };

    drawWatermark();

    const writeLine = (text: string, size = 11, bold = false) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(20, 20, 20);
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > pageHeight - margin - 20) {
          drawFooter();
          doc.addPage();
          y = margin;
          drawWatermark();
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
    };

    writeLine('RE GLOBAL — PROPERTY TRANSACTION CONTRACT', 14, true);
    writeLine('Status: PILOT / TESTNET — Pending UAE Legal Review', 9);
    y += 6;
    writeLine(contract.propertyTitle, 13, true);
    writeLine(`Contract No: ${contract.id}`);
    writeLine(`Type: ${contract.type}   Amount: ${contract.amount} ${contract.currency}   Status: ${contract.status}`);
    y += 10;
    writeLine('SIGNATURES', 11, true);
    writeLine(`Buyer: @${contract.buyerUsername}`);
    if (contract.paymentId) writeLine(`Payment ID: ${contract.paymentId}`);
    if (contract.txid) writeLine(`Transaction ID: ${contract.txid}`);
    y += 6;
    writeLine(`Platform: ${contract.sellerUsername}`);
    if (contract.platformPublicKey) writeLine(`Public key: ${contract.platformPublicKey}`);
    if (contract.contractHash) writeLine(`Document hash: ${contract.contractHash}`);
    if (contract.contractText) {
      y += 10;
      writeLine('FULL CONTRACT TEXT', 11, true);
      writeLine(contract.contractText, 9.5);
    }

    drawFooter();
    doc.save(`RE-Global-Contract-${contract.id}.pdf`);
  };

  return (
    <div className="w-full max-w-[560px] mx-auto">
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.14em] text-amber-500/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Pilot · Testnet
        </span>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/10 text-stone-400">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="relative rounded-[2px] border border-amber-500/15 bg-[#0e0e11] shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_60px_-25px_rgba(0,0,0,0.8)]">
        <div className="absolute -top-px -left-px w-5 h-5 border-t border-l border-amber-400/40" />
        <div className="absolute -top-px -right-px w-5 h-5 border-t border-r border-amber-400/40" />

        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-amber-400/90 mb-1.5">RE Global — Property Transaction Contract</p>
              <h1 className="text-[22px] leading-tight text-stone-50 font-semibold">{contract.propertyTitle}</h1>
              <p className="mt-1 text-[12.5px] text-stone-500">Contract № <span className="font-mono text-stone-400">{contract.id}</span></p>
            </div>
            <Seal />
          </div>

          <button
            onClick={downloadPdf}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 text-[12.5px] text-stone-950 bg-amber-400 hover:bg-amber-300 transition-colors rounded-[3px] py-2.5 font-medium"
          >
            <Download size={14} /> Download as PDF
          </button>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            <div className="rounded-[3px] bg-white/[0.03] border border-white/[0.06] px-2.5 py-2">
              <p className="text-[9.5px] uppercase tracking-wider text-stone-500 mb-0.5">Type</p>
              <p className="text-[13px] text-stone-200 capitalize">{contract.type}</p>
            </div>
            <div className="rounded-[3px] bg-white/[0.03] border border-white/[0.06] px-2.5 py-2">
              <p className="text-[9.5px] uppercase tracking-wider text-stone-500 mb-0.5">Amount</p>
              <p className="text-[13px] text-amber-300 font-medium">{contract.amount} {contract.currency}</p>
            </div>
            <div className="rounded-[3px] bg-white/[0.03] border border-white/[0.06] px-2.5 py-2">
              <p className="text-[9.5px] uppercase tracking-wider text-stone-500 mb-0.5">Status</p>
              <p className="text-[13px] text-emerald-400 capitalize">{contract.status}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-[10.5px] uppercase tracking-[0.14em] text-stone-500">Signatures</p>

          <div className="rounded-[4px] border border-white/[0.06] bg-white/[0.02] p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p className="text-[10.5px] text-stone-500">Party A · Buyer</p>
                <p className="text-[14px] text-stone-100 font-medium">@{contract.buyerUsername}</p>
              </div>
              {contract.paymentId && (
                <span className="inline-flex items-center gap-1 text-[10.5px] text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5">
                  <Check size={10} /> Verified via Pi payment
                </span>
              )}
            </div>
            {contract.paymentId && <CopyField label="Payment ID" value={contract.paymentId} />}
            {contract.txid && <CopyField label="Transaction ID" value={contract.txid} />}
          </div>

          <div className="rounded-[4px] border border-amber-500/15 bg-amber-500/[0.03] p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p className="text-[10.5px] text-stone-500">Party B · RE Global Platform</p>
                <p className="text-[14px] text-stone-100 font-medium">{contract.sellerUsername}</p>
              </div>
              {isSigned ? (
                <span className="inline-flex items-center gap-1 text-[10.5px] text-amber-300 bg-amber-400/10 rounded-full px-2 py-0.5">
                  <ShieldCheck size={10} /> Ed25519 signed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10.5px] text-stone-500 bg-white/5 rounded-full px-2 py-0.5">
                  Not yet signed
                </span>
              )}
            </div>
            {contract.platformPublicKey && <CopyField label="Public key" value={contract.platformPublicKey} />}
            {contract.contractHash && <CopyField label="Document hash" value={contract.contractHash} />}
          </div>
        </div>

        <div className="mx-6 mb-5 rounded-[4px] border border-amber-500/15 bg-amber-500/[0.03] p-3.5 flex items-center gap-3.5">
          <div className="p-1.5 bg-[#f5f1e8] rounded-[3px] shrink-0">
            <VerifyQR contractId={contract.id} size={70} />
          </div>
          <div className="min-w-0">
            <p className="text-[10.5px] uppercase tracking-[0.12em] text-amber-300 mb-1">Linked verification</p>
            <p className="text-[11.5px] text-stone-300 leading-snug">
              Scan to open the public, no-login record for <span className="text-stone-100">{contract.propertyTitle}</span> — this contract and its property.
            </p>
            {contract.inspectionCertHash && (
              <p className="mt-1 text-[10.5px] text-emerald-400">✓ Linked inspection certificate on record</p>
            )}
          </div>
        </div>

        {contract.contractText && (
          <div className="px-6 pb-5">
            <button
              onClick={() => setShowFullText(v => !v)}
              className="w-full flex items-center justify-between text-left rounded-[4px] border border-white/[0.06] px-3.5 py-2.5 hover:bg-white/[0.02] transition-colors"
            >
              <span className="inline-flex items-center gap-2 text-[12.5px] text-stone-300">
                <FileText size={13} className="text-amber-400/80" /> Full contract text
              </span>
              <ChevronDown size={14} className={`text-stone-500 transition-transform ${showFullText ? 'rotate-180' : ''}`} />
            </button>
            {showFullText && (
              <pre className="mt-2.5 rounded-[4px] bg-black/40 border border-white/[0.05] p-3.5 text-[11.5px] leading-relaxed text-stone-400 whitespace-pre-wrap max-h-64 overflow-y-auto">
                {contract.contractText}
              </pre>
            )}
          </div>
        )}

        <div className="px-6 py-4 border-t border-white/[0.06] text-[10.5px] text-stone-600 flex items-center gap-1.5">
          <ScanLine size={11} /> Pending review under UAE Federal Decree-Law No. 46/2021.
        </div>
      </div>
    </div>
  );
}

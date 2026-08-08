'use client';

// Real, per-property animated simulation of how RE Inspect physically works.
// Rebuilt with plain CSS keyframe animation on positioned divs (not SVG/SMIL)
// because SMIL (<animateMotion>, <animate>) renders unreliably inside some
// embedded webviews (e.g. Pi Browser). Div + CSS transform is universally
// supported and matches how the rest of the app already animates.

import { useEffect, useState } from 'react';
import { Plane, Bot as RobotIcon, Sparkles, Link2 } from 'lucide-react';

interface InspectionSimulationSceneProps {
  propertyTitleEn: string;
  propertyTitleAr: string;
  isArabic: boolean;
}

const STAGES = [
  { key: 'exterior', icon: Plane, labelEn: 'Drone — exterior scan', labelAr: 'الدرون — مسح خارجي' },
  { key: 'interior', icon: RobotIcon, labelEn: 'Robot — interior scan', labelAr: 'الروبوت — مسح داخلي' },
  { key: 'analysis', icon: Sparkles, labelEn: 'Aladdin AI — analyzing', labelAr: 'علاء الدين — تحليل' },
  { key: 'certify', icon: Link2, labelEn: 'Certifying on-chain', labelAr: 'توثيق على البلوكتشين' },
] as const;

const STAGE_MS = 3200;

export default function InspectionSimulationScene({
  propertyTitleEn,
  propertyTitleAr,
  isArabic,
}: InspectionSimulationSceneProps) {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStageIdx((i) => (i + 1) % STAGES.length);
    }, STAGE_MS);
    return () => clearInterval(t);
  }, []);

  const stage = STAGES[stageIdx].key;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <style jsx>{`
        @keyframes droneOrbit {
          0% { left: 95%; top: 50%; }
          12.5% { left: 81.8%; top: 81.8%; }
          25% { left: 50%; top: 95%; }
          37.5% { left: 18.2%; top: 81.8%; }
          50% { left: 5%; top: 50%; }
          62.5% { left: 18.2%; top: 18.2%; }
          75% { left: 50%; top: 5%; }
          87.5% { left: 81.8%; top: 18.2%; }
          100% { left: 95%; top: 50%; }
        }
        @keyframes robotSweep {
          0%, 8% { left: 30%; top: 72%; }
          42%, 50% { left: 68%; top: 72%; }
          58%, 66% { left: 68%; top: 34%; }
          92%, 100% { left: 30%; top: 34%; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.9; }
        }
        .drone-dot {
          animation: droneOrbit 3.4s linear infinite;
        }
        .robot-dot {
          animation: robotSweep 3.4s ease-in-out infinite;
        }
        .glow-pulse {
          animation: glowPulse 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="px-5 pt-5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">
          {isArabic ? 'محاكاة حية' : 'Live simulation'}
        </p>
        <p className="text-sm font-medium text-foreground">
          {isArabic ? propertyTitleAr : propertyTitleEn}
        </p>
      </div>

      {/* Scene */}
      <div className="relative mt-3 h-56 bg-background/60">
        {/* Building block, centered, always visible */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[70%] border border-border/70 grid grid-cols-2 grid-rows-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border border-border/30" />
          ))}
        </div>

        {/* Ground line */}
        <div className="absolute left-0 right-0 bottom-[15%] h-px bg-border/50" />

        {/* Drone orbit ring, visible during exterior stage */}
        {stage === 'exterior' && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full border border-dashed border-accent/25" />
        )}

        {/* Drone marker */}
        {stage === 'exterior' && (
          <div
            className="drone-dot absolute w-2.5 h-2.5 -ml-1.5 -mt-1.5 rounded-full bg-accent shadow-[0_0_10px_2px_rgba(201,151,77,0.6)]"
            style={{ left: '95%', top: '50%' }}
          />
        )}

        {/* Ground robot marker */}
        {stage === 'interior' && (
          <div
            className="robot-dot absolute w-2.5 h-2.5 -ml-1.5 -mt-1.5 rounded-sm bg-emerald-400 shadow-[0_0_10px_2px_rgba(61,220,151,0.6)]"
            style={{ left: '30%', top: '72%' }}
          />
        )}

        {/* AI analysis pulse over the building */}
        {stage === 'analysis' && (
          <div className="glow-pulse absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[70%] bg-accent/20 rounded-sm" />
        )}

        {/* Certification glow */}
        {stage === 'certify' && (
          <div className="glow-pulse absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[47%] h-[72%] border-2 border-emerald-400 rounded-sm" />
        )}

        {/* Stage caption */}
        <div className="absolute left-3 bottom-3 flex items-center gap-2 bg-background/80 backdrop-blur px-2.5 py-1.5 rounded-lg border border-border">
          {(() => {
            const Icon = STAGES[stageIdx].icon;
            return <Icon className="w-3.5 h-3.5 text-accent" />;
          })()}
          <span className="text-[11px] text-foreground">
            {isArabic ? STAGES[stageIdx].labelAr : STAGES[stageIdx].labelEn}
          </span>
        </div>
      </div>

      {/* Stage legend / scrubber */}
      <div className="grid grid-cols-4 border-t border-border">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const active = i === stageIdx;
          return (
            <button
              key={s.key}
              onClick={() => setStageIdx(i)}
              className={`flex flex-col items-center gap-1 py-3 transition-colors ${
                active ? 'text-accent bg-accent/5' : 'text-muted-foreground'
              } ${i !== 0 ? 'border-l border-border' : ''}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] leading-tight text-center px-1">
                {isArabic ? s.labelAr : s.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

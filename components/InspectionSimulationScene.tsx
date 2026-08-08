'use client';

// Real, per-property animated simulation of how RE Inspect physically works —
// not static icons. Takes the property's own title so it reads correctly for
// whichever listing is being inspected. Pure SVG/CSS motion, no external
// images (keeps it fast and avoids photo licensing entirely).
//
// Sequence (loops): exterior drone scan -> interior robot scan -> AI analysis
// -> on-chain certification. Each stage highlights its own icon + caption so
// it doubles as a legend, not just decoration.

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
      <div className="px-5 pt-5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">
          {isArabic ? 'محاكاة حية' : 'Live simulation'}
        </p>
        <p className="text-sm font-medium text-foreground">
          {isArabic ? propertyTitleAr : propertyTitleEn}
        </p>
      </div>

      {/* Scene */}
      <div className="relative mt-3 h-[220px] bg-background/60">
        <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Ground */}
          <line x1="0" y1="196" x2="400" y2="196" stroke="hsl(var(--border))" strokeWidth="1" />

          {/* Building */}
          <rect x="140" y="60" width="120" height="136" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
          {/* Floor lines */}
          <line x1="140" y1="94" x2="260" y2="94" stroke="hsl(var(--border))" strokeWidth="1" />
          <line x1="140" y1="128" x2="260" y2="128" stroke="hsl(var(--border))" strokeWidth="1" />
          <line x1="140" y1="162" x2="260" y2="162" stroke="hsl(var(--border))" strokeWidth="1" />
          {/* Room dividers */}
          <line x1="200" y1="60" x2="200" y2="196" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.6" />

          {/* Drone orbit path (dotted) */}
          <ellipse
            cx="200"
            cy="128"
            rx="112"
            ry="66"
            fill="none"
            stroke="hsl(var(--border))"
            strokeDasharray="2 5"
            strokeWidth="1"
            opacity={stage === 'exterior' ? 0.9 : 0.25}
          />

          {/* Drone + scan beam, active during exterior stage */}
          {stage === 'exterior' && (
            <g>
              <circle r="5" fill="#c9974d">
                <animateMotion
                  dur="3.2s"
                  repeatCount="1"
                  path="M 312,128 A 112,66 0 1,1 88,128 A 112,66 0 1,1 312,128"
                />
              </circle>
              <line x1="200" y1="10" x2="200" y2="60" stroke="#c9974d" strokeWidth="1" opacity="0.5">
                <animate attributeName="opacity" values="0.15;0.6;0.15" dur="1.4s" repeatCount="indefinite" />
              </line>
            </g>
          )}

          {/* Ground robot, active during interior stage — sweeps room by room */}
          {stage === 'interior' && (
            <g>
              <rect width="8" height="8" x="-4" y="-4" fill="#3ddc97" rx="1.5">
                <animateMotion
                  dur="3s"
                  repeatCount="1"
                  keyPoints="0;0.5;0.5;1"
                  keyTimes="0;0.45;0.55;1"
                  calcMode="linear"
                  path="M 155,178 L 245,178 L 245,110 L 155,110"
                />
              </rect>
            </g>
          )}

          {/* AI analysis pulse over the whole building */}
          {stage === 'analysis' && (
            <rect x="140" y="60" width="120" height="136" fill="#c9974d" opacity="0.06">
              <animate attributeName="opacity" values="0.02;0.14;0.02" dur="1.6s" repeatCount="indefinite" />
            </rect>
          )}

          {/* Certification glow */}
          {stage === 'certify' && (
            <rect
              x="138"
              y="58"
              width="124"
              height="140"
              fill="none"
              stroke="#3ddc97"
              strokeWidth="1.5"
              rx="2"
              opacity="0.7"
            >
              <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.2s" repeatCount="indefinite" />
            </rect>
          )}
        </svg>

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

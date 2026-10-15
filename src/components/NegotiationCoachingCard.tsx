import React, { useState, useEffect } from 'react';
import { DollarSign, VolumeX, Sparkles, Copy, Check, Clock, TrendingUp } from 'lucide-react';

export interface NegotiationCoachingCardProps {
  tacticalNote?: string;
  exactScript?: string;
  showSilenceTimer?: boolean;
  phase?: string;
  theirOffer?: number | null;
  yourTarget?: number | null;
  currency?: string;
  interfaceTheme?: string;
  isLightTheme?: boolean;
  onSilenceTimerEnd?: () => void;
  [key: string]: any;
}

export const NegotiationCoachingCard: React.FC<NegotiationCoachingCardProps> = ({
  tacticalNote,
  exactScript,
  showSilenceTimer = false,
  phase,
  theirOffer,
  yourTarget,
  currency = '$',
  interfaceTheme,
  isLightTheme = false,
  onSilenceTimerEnd,
}) => {
  const [copied, setCopied] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(8);

  useEffect(() => {
    if (!showSilenceTimer) return;
    setSecondsRemaining(8);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onSilenceTimerEnd?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showSilenceTimer, onSilenceTimerEnd]);

  const handleCopy = () => {
    if (!exactScript) return;
    void navigator.clipboard.writeText(exactScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return null;
    return `${currency}${val.toLocaleString()}`;
  };

  const isLight = isLightTheme || interfaceTheme === 'light';

  return (
    <div
      className="my-3 rounded-xl border p-4 shadow-lg transition-all"
      style={{
        background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(24, 24, 27, 0.95)',
        borderColor: isLight ? 'rgba(229, 231, 235, 1)' : 'rgba(63, 63, 70, 0.6)',
        backdropFilter: 'blur(12px)',
        color: isLight ? '#111827' : '#F9FAFB',
      }}
    >
      {/* Header bar: Phase + Numbers */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5"
           style={{ borderColor: isLight ? 'rgba(229, 231, 235, 0.8)' : 'rgba(63, 63, 70, 0.4)' }}>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <DollarSign className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Negotiation Coaching
          </span>
          {phase && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: isLight ? 'rgba(243, 244, 246, 1)' : 'rgba(39, 39, 42, 1)',
                color: isLight ? '#4B5563' : '#9CA3AF',
              }}
            >
              {phase}
            </span>
          )}
        </div>

        {/* Offer vs Target chips */}
        <div className="flex items-center gap-2 text-xs">
          {theirOffer !== null && theirOffer !== undefined && (
            <span className="rounded px-2 py-0.5 text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Offer: {formatCurrency(theirOffer)}
            </span>
          )}
          {yourTarget !== null && yourTarget !== undefined && (
            <span className="rounded px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Target: {formatCurrency(yourTarget)}
            </span>
          )}
        </div>
      </div>

      {/* Tactical Note */}
      {tacticalNote && (
        <div className="mt-3 flex items-start gap-2.5 rounded-lg p-2.5 text-xs"
             style={{
               background: isLight ? 'rgba(240, 253, 250, 0.8)' : 'rgba(13, 148, 136, 0.1)',
               border: isLight ? '1px solid rgba(204, 251, 241, 1)' : '1px solid rgba(20, 184, 166, 0.2)',
               color: isLight ? '#134E4A' : '#5EEAD4',
             }}>
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
          <div className="leading-relaxed">
            <span className="font-semibold">Strategy: </span>
            {tacticalNote}
          </div>
        </div>
      )}

      {/* Exact Script */}
      {exactScript && (
        <div className="mt-3">
          <div className="flex items-center justify-between pb-1.5 text-[11px] font-semibold text-text-secondary">
            <span>RECOMMENDED SCRIPT:</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy
                </>
              )}
            </button>
          </div>
          <div
            className="rounded-lg p-3 text-[13px] leading-relaxed font-sans border selection:bg-emerald-500/30"
            style={{
              background: isLight ? '#F9FAFB' : '#111827',
              borderColor: isLight ? '#E5E7EB' : '#374151',
              color: isLight ? '#1F2937' : '#E5E7EB',
            }}
          >
            "{exactScript}"
          </div>
        </div>
      )}

      {/* Silence Timer */}
      {showSilenceTimer && secondsRemaining > 0 && (
        <div className="mt-3 flex items-center justify-between rounded-lg p-2.5 text-xs border border-amber-500/30 bg-amber-500/10 text-amber-300">
          <div className="flex items-center gap-2">
            <VolumeX className="h-4 w-4 animate-pulse text-amber-400" />
            <span className="font-semibold">Hold Silence:</span>
            <span>Say nothing and let them respond first.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-mono font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
              <Clock className="h-3 w-3" /> {secondsRemaining}s
            </span>
            <button
              onClick={() => onSilenceTimerEnd?.()}
              className="text-[10px] underline text-amber-400/80 hover:text-amber-300 ml-1"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NegotiationCoachingCard;

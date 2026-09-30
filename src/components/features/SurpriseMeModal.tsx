import React, { useState } from 'react';
import { generateSurpriseQuest } from '../../services/questGenerator';
import { Quest } from '../../types';
import { Zap, Clock, Sparkles, X, ArrowRight } from 'lucide-react';

interface SurpriseMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestGenerated: (quest: Quest) => void;
}

export const SurpriseMeModal: React.FC<SurpriseMeModalProps> = ({
  isOpen,
  onClose,
  onQuestGenerated,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<'30m' | '1h' | '2h'>('1h');
  const [isSpinning, setIsSpinning] = useState(false);

  if (!isOpen) return null;

  const handleSurpriseRoll = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const quest = generateSurpriseQuest(selectedDuration);
      setIsSpinning(false);
      onQuestGenerated(quest);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider text-pink-400 uppercase">Spontaneous</div>
              <h2 className="text-base font-extrabold text-white">Surprise Me!</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Skip the questions! Tell us how much time you have right now, and we&apos;ll pick an authentic spontaneous Jeddah adventure using real locations.
        </p>

        {/* Time Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Available Time Window
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '30m', label: '30 Mins', sub: '1 Quick Spot' },
              { id: '1h', label: '1 Hour', sub: '2 Real Stops' },
              { id: '2h', label: '2 Hours', sub: 'Full Discovery' },
            ].map((dur) => (
              <button
                key={dur.id}
                type="button"
                onClick={() => setSelectedDuration(dur.id as any)}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                  selectedDuration === dur.id
                    ? 'bg-pink-500/20 border-pink-400 text-pink-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-sm font-black">{dur.label}</div>
                <div className="text-[10px] opacity-75 mt-0.5">{dur.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={isSpinning}
          onClick={handleSurpriseRoll}
          className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-slate-950 shadow-xl shadow-pink-500/25 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
        >
          {isSpinning ? (
            <span>Rolling Real Jeddah Locations...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Surprise Quest</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

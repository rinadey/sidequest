import React from 'react';
import { Quest } from '../../types';
import { Clock, Wallet, Users, Compass, MapPin, Trophy, Bookmark, X, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

interface QuestPreviewModalProps {
  quest: Quest | null;
  isOpen: boolean;
  onClose: () => void;
  onAcceptQuest: (quest: Quest) => void;
  onRegenerate: () => void;
  onSaveQuest?: (quest: Quest) => void;
  isSaved?: boolean;
}

export const QuestPreviewModal: React.FC<QuestPreviewModalProps> = ({
  quest,
  isOpen,
  onClose,
  onAcceptQuest,
  onRegenerate,
  onSaveQuest,
  isSaved = false,
}) => {
  if (!isOpen || !quest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🧭</span>
            <div>
              <div className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">Quest Proposal</div>
              <h2 className="text-lg font-extrabold text-white leading-tight">{quest.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSaveQuest && (
              <button
                type="button"
                onClick={() => onSaveQuest(quest)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  isSaved
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title={isSaved ? 'Saved to your quests' : 'Save quest for later'}
              >
                <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Tagline & Core Philosophy Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-4 rounded-2xl border border-amber-500/30">
            <p className="text-sm text-slate-200 font-medium leading-relaxed">{quest.description}</p>
            <div className="mt-2.5 flex items-center gap-2 text-xs text-amber-300/90 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Real-world exploration: Requires physical visit & photo proof to earn XP.</span>
            </div>
          </div>

          {/* Your Choices Summary Pills */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Your Preferences</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mood</span>
                </div>
                <div className="text-xs font-bold text-slate-200 capitalize mt-1">{quest.preferences.mood}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Est. Time</span>
                </div>
                <div className="text-xs font-bold text-slate-200 mt-1">~{quest.estimatedTotalMinutes} mins</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Budget</span>
                </div>
                <div className="text-xs font-bold text-slate-200 mt-1">
                  {quest.estimatedCostSAR === 0 ? 'Free (0 SAR)' : `~${quest.estimatedCostSAR} SAR`}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Group</span>
                </div>
                <div className="text-xs font-bold text-slate-200 capitalize mt-1">{quest.preferences.group}</div>
              </div>
            </div>
          </div>

          {/* Real Jeddah Locations & Objectives */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Real Locations & Objectives ({quest.steps.length} Steps)
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                {quest.difficulty}
              </span>
            </div>

            <div className="space-y-3">
              {quest.steps.map((step, idx) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5"
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold text-xs flex items-center justify-center border border-amber-500/30 flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-sm">{step.location.name}</div>
                      <span className="text-[11px] font-tajawal text-amber-300/80">{step.location.nameArabic}</span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{step.location.area} · {step.location.address}</span>
                    </div>
                    <div className="pt-1.5 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-amber-400 font-bold">Challenge: </span>
                      {step.challengeDescription}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reward Preview */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                {quest.badgeReward?.icon || '🏆'}
              </div>
              <div>
                <div className="text-xs font-bold text-white">Completion Rewards</div>
                <div className="text-[11px] text-slate-400">
                  Earn +{quest.totalXP} Real XP & unlock "{quest.badgeReward?.name || 'Explorer'}" badge upon photo verification.
                </div>
              </div>
            </div>
            <div className="text-sm font-extrabold text-amber-400">+{quest.totalXP} XP</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center gap-3 justify-between">
          <button
            type="button"
            onClick={onRegenerate}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Another Quest</span>
          </button>

          <button
            type="button"
            onClick={() => onAcceptQuest(quest)}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-xl shadow-amber-500/30 active:scale-95 transition cursor-pointer"
          >
            <span>Accept Quest & Start Real Adventure</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

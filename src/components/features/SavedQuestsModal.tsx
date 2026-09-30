import React from 'react';
import { Quest, UserProfile } from '../../types';
import { Bookmark, Clock, MapPin, ArrowRight, Trash2, X, Compass } from 'lucide-react';

interface SavedQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedQuests: Quest[];
  user: UserProfile;
  onSelectQuest: (quest: Quest) => void;
  onRemoveQuest: (quest: Quest) => void;
}

export const SavedQuestsModal: React.FC<SavedQuestsModalProps> = ({
  isOpen,
  onClose,
  savedQuests,
  user,
  onSelectQuest,
  onRemoveQuest,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
              🔖
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                Saved Quests
              </div>
              <h2 className="text-base font-extrabold text-white">Your Adventure Wishlist</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {savedQuests.length > 0 ? (
            savedQuests.map((quest) => (
              <div
                key={quest.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase">
                      {quest.preferences.mood}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400">~{quest.estimatedTotalMinutes} mins</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{quest.title}</h4>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{quest.steps.map((s) => s.location.name).join(' → ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onRemoveQuest(quest)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 transition"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onSelectQuest(quest);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <span>Start Quest</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
              <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-bold text-slate-300">No Saved Quests Yet</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate quests and bookmark them to your personal list to undertake when you head out into Jeddah.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

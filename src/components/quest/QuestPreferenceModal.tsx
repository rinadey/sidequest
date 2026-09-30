import React, { useState } from 'react';
import { Mood, TimeDuration, Budget, GroupType, QuestPreferences } from '../../types';
import { 
  Sparkles, Clock, Wallet, Users, Compass, ChevronRight, ChevronLeft, 
  Coffee, Palette, Landmark, Sunset, Flame, PartyPopper, User, Heart, X
} from 'lucide-react';

interface QuestPreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateQuest: (preferences: QuestPreferences) => void;
}

const MOOD_OPTIONS: { id: Mood; label: string; desc: string; icon: string; arabic: string }[] = [
  { id: 'relaxing', label: 'Relaxing', desc: 'Breezy coastlines, quiet courtyards, serene views', icon: '🌊', arabic: 'استرخاء وهدوء' },
  { id: 'social', label: 'Social', desc: 'Vibrant gatherings, open-air cafes, lively spots', icon: '🎉', arabic: 'أجواء اجتماعية' },
  { id: 'adventurous', label: 'Adventurous', desc: 'Historic alleys, coastal expeditions, bold explorations', icon: '🧗', arabic: 'مغامرة واستكشاف' },
  { id: 'creative', label: 'Creative', desc: 'Architecture, public art sculptures, local galleries', icon: '🎨', arabic: 'إبداع وفنون' },
  { id: 'foodie', label: 'Foodie', desc: 'Specialty coffee roasters, Hijazi street flavors', icon: '☕', arabic: 'نكهات ومقاهي' },
  { id: 'cultural', label: 'Cultural', desc: 'Al-Balad heritage, ancient merchant houses, museums', icon: '🏛️', arabic: 'تراث وأصالة' },
  { id: 'spontaneous', label: 'Spontaneous', desc: 'Surprise route, unexpected discoveries, Jeddah roulette', icon: '🎲', arabic: 'عفوي ومفاجئ' },
];

const TIME_OPTIONS: { id: TimeDuration; label: string; sub: string; icon: string }[] = [
  { id: '30m', label: '30 Minutes', sub: 'Quick single-stop micro quest', icon: '⚡' },
  { id: '1h', label: '1 Hour', sub: 'Standard 2-stop focused exploration', icon: '⏱️' },
  { id: '2h', label: '2 Hours', sub: 'The sweet spot for discovering a neighborhood', icon: '⏳' },
  { id: 'half_day', label: 'Half Day', sub: '3+ stops, deep discovery & refreshments', icon: '🌤️' },
  { id: 'full_day', label: 'Full Day', sub: 'Epic full Jeddah quest from Balad to Corniche', icon: '🌅' },
];

const BUDGET_OPTIONS: { id: Budget; label: string; desc: string; icon: string; range: string }[] = [
  { id: 'free', label: 'Free', desc: 'Public landmarks, Corniche, historic gates, architecture', icon: '🪙', range: '0 SAR' },
  { id: 'low', label: 'Low', desc: 'Local specialty coffee, tea, market snacks', icon: '☕', range: '< 40 SAR' },
  { id: 'medium', label: 'Medium', desc: 'Casual dining, artisanal roastery, museum tickets', icon: '🍽️', range: '40 - 100 SAR' },
  { id: 'flexible', label: 'Flexible', desc: 'Museum exhibits, immersive experiences, dinner', icon: '✨', range: 'Open' },
];

const GROUP_OPTIONS: { id: GroupType; label: string; desc: string; icon: string }[] = [
  { id: 'alone', label: 'Alone', desc: 'Solo mindful wanderer & photographer', icon: '🚶' },
  { id: 'friends', label: 'Friends', desc: 'Group challenges, banter & shared discoveries', icon: '👥' },
  { id: 'family', label: 'Family', desc: 'Accessible, comfortable & fun for all ages', icon: '👨‍👩‍👧‍👦' },
  { id: 'couple', label: 'Couple', desc: 'Scenic sunset vistas & cozy ambient corners', icon: '✨' },
];

export const QuestPreferenceModal: React.FC<QuestPreferenceModalProps> = ({
  isOpen,
  onClose,
  onGenerateQuest,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeDuration | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && selectedMood) setStep(2);
    else if (step === 2 && selectedTime) setStep(3);
    else if (step === 3 && selectedBudget) setStep(4);
    else if (step === 4 && selectedGroup) {
      // All 4 preferences selected! Generate the quest
      onGenerateQuest({
        mood: selectedMood!,
        time: selectedTime!,
        budget: selectedBudget!,
        group: selectedGroup,
      });
      // Reset state for next time
      setStep(1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed =
    (step === 1 && selectedMood !== null) ||
    (step === 2 && selectedTime !== null) ||
    (step === 3 && selectedBudget !== null) ||
    (step === 4 && selectedGroup !== null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg">
              {step}/4
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                <span>Start Your Quest</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                  Preferences First
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Crafting your real-world Jeddah adventure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Line */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-1 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: MOOD */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">Step 1 of 4</span>
                <h3 className="text-xl font-bold text-white mt-1">What kind of adventure are you looking for?</h3>
                <p className="text-xs text-slate-400">Choose the vibe of your Jeddah journey.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {MOOD_OPTIONS.map((mood) => {
                  const isSelected = selectedMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => setSelectedMood(mood.id)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-2xl">{mood.icon}</span>
                        <span className="text-[11px] font-tajawal text-slate-400">{mood.arabic}</span>
                      </div>
                      <div className="mt-2">
                        <div className="font-bold text-slate-100 text-sm">{mood.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{mood.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: TIME */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">Step 2 of 4</span>
                <h3 className="text-xl font-bold text-white mt-1">How much time do you have?</h3>
                <p className="text-xs text-slate-400">The quest route will strictly fit your available window.</p>
              </div>

              <div className="space-y-2.5 pt-2">
                {TIME_OPTIONS.map((time) => {
                  const isSelected = selectedTime === time.id;
                  return (
                    <button
                      key={time.id}
                      type="button"
                      onClick={() => setSelectedTime(time.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl">{time.icon}</span>
                        <div>
                          <div className="font-bold text-slate-100 text-sm">{time.label}</div>
                          <div className="text-xs text-slate-400">{time.sub}</div>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: BUDGET */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">Step 3 of 4</span>
                <h3 className="text-xl font-bold text-white mt-1">What's your budget?</h3>
                <p className="text-xs text-slate-400">Quests will never recommend paid spots if you choose Free.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {BUDGET_OPTIONS.map((budget) => {
                  const isSelected = selectedBudget === budget.id;
                  return (
                    <button
                      key={budget.id}
                      type="button"
                      onClick={() => setSelectedBudget(budget.id)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{budget.icon}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold">
                          {budget.range}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="font-bold text-slate-100 text-sm">{budget.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{budget.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: WHO ARE YOU WITH? */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">Step 4 of 4</span>
                <h3 className="text-xl font-bold text-white mt-1">Who's joining the adventure?</h3>
                <p className="text-xs text-slate-400">Tailoring the atmosphere and group dynamics.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {GROUP_OPTIONS.map((group) => {
                  const isSelected = selectedGroup === group.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setSelectedGroup(group.id)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="text-2xl">{group.icon}</div>
                      <div className="mt-2.5">
                        <div className="font-bold text-slate-100 text-sm">{group.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{group.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            disabled={!canProceed}
            onClick={handleNext}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
              canProceed
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>{step === 4 ? 'Generate Side Quest' : 'Continue'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

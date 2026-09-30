import React, { useState } from 'react';
import { JEDDAH_LOCATIONS } from '../../data/jeddahPlaces';
import { JeddahLocation, Quest, QuestStep, UserProfile } from '../../types';
import { saveCustomQuest } from '../../services/authService';
import { Plus, Trash2, MapPin, Sparkles, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface CustomQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onQuestCreated: (quest: Quest) => void;
}

export const CustomQuestModal: React.FC<CustomQuestModalProps> = ({
  isOpen,
  onClose,
  user,
  onQuestCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<JeddahLocation[]>([]);
  const [customObjectives, setCustomObjectives] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddLocation = (locId: string) => {
    const loc = JEDDAH_LOCATIONS.find((l) => l.id === locId);
    if (!loc) return;
    if (selectedLocations.some((l) => l.id === locId)) return;
    if (selectedLocations.length >= 4) {
      setError('Quests are limited to a maximum of 4 locations.');
      return;
    }
    setError(null);
    setSelectedLocations([...selectedLocations, loc]);
  };

  const handleRemoveLocation = (locId: string) => {
    setSelectedLocations(selectedLocations.filter((l) => l.id !== locId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a title for your quest.');
      return;
    }

    if (selectedLocations.length === 0) {
      setError('Select at least one real Jeddah location.');
      return;
    }

    const steps: QuestStep[] = selectedLocations.map((loc, idx) => ({
      stepNumber: idx + 1,
      location: loc,
      challengeTitle: `Discovery Challenge at ${loc.name}`,
      challengeDescription:
        customObjectives[loc.id] ||
        `Visit ${loc.name} in ${loc.area} and take a clear photo of the venue or architectural detail.`,
      targetVisualProof: `Recognizable storefront sign, building facade, or landmark feature of ${loc.name}.`,
      verified: false,
    }));

    const totalMinutes = selectedLocations.reduce((acc, l) => acc + l.estimatedMinutes, 0);
    const totalCost = selectedLocations.reduce((acc, l) => acc + l.typicalCostSAR, 0);

    const newQuest: Quest = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      tagline: `Community-crafted Jeddah quest by ${user.displayName}`,
      description: description.trim() || `Explore real locations curated by ${user.displayName}.`,
      preferences: {
        mood: 'creative',
        time: totalMinutes > 120 ? 'half_day' : '2h',
        budget: totalCost === 0 ? 'free' : 'medium',
        group: 'friends',
      },
      estimatedTotalMinutes: totalMinutes,
      estimatedCostSAR: totalCost,
      difficulty: selectedLocations.length > 2 ? 'Moderate' : 'Easy',
      steps,
      totalXP: steps.length * 150 + 100,
      badgeReward: {
        id: 'community-pioneer',
        name: 'Community Pioneer',
        description: 'Completed a community-crafted Jeddah Side Quest',
        icon: '🌟',
      },
      createdAt: new Date().toISOString(),
      isCustom: true,
      authorName: user.displayName,
    };

    saveCustomQuest(newQuest);
    onQuestCreated(newQuest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
              ✍️
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                Creator Studio
              </div>
              <h2 className="text-base font-extrabold text-white">Create Your Own Side Quest</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Quest Title</label>
            <input
              type="text"
              placeholder="e.g. Hidden Balad Courtyards & Rooftops"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Quest Story / Brief</label>
            <textarea
              rows={2}
              placeholder="Describe the adventure and what makes this route special..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white resize-none"
            />
          </div>

          {/* Add Real Locations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                Pick Real Jeddah Locations ({selectedLocations.length}/4)
              </label>
              <span className="text-[11px] text-amber-400/90">Real places only</span>
            </div>

            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddLocation(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
            >
              <option value="">-- Choose a real location to add --</option>
              {JEDDAH_LOCATIONS.filter((l) => !selectedLocations.some((s) => s.id === l.id)).map(
                (loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.area})
                  </option>
                )
              )}
            </select>
          </div>

          {/* Selected Locations List */}
          <div className="space-y-2.5">
            {selectedLocations.map((loc, idx) => (
              <div
                key={loc.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white">{loc.name}</span>
                    <span className="text-[10px] text-slate-400">({loc.area})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(loc.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder={`Custom challenge prompt for ${loc.name} (optional)`}
                  value={customObjectives[loc.id] || ''}
                  onChange={(e) =>
                    setCustomObjectives({ ...customObjectives, [loc.id]: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 placeholder-slate-600"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg active:scale-95 transition cursor-pointer"
          >
            Publish Custom Quest
          </button>
        </form>
      </div>
    </div>
  );
};

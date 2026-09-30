import React, { useState } from 'react';
import { GroupQuestSession, Quest, UserProfile } from '../../types';
import { getGroupQuests, saveGroupQuest } from '../../services/authService';
import { generateSideQuest } from '../../services/questGenerator';
import { Users, Plus, Share2, Copy, Check, X, ArrowRight, ShieldCheck } from 'lucide-react';

interface GroupQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onAcceptQuest: (quest: Quest) => void;
}

export const GroupQuestModal: React.FC<GroupQuestModalProps> = ({
  isOpen,
  onClose,
  user,
  onAcceptQuest,
}) => {
  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE'>('LIST');
  const [groupQuests, setGroupQuests] = useState<GroupQuestSession[]>(() => {
    const list = getGroupQuests();
    if (list.length === 0) {
      // Seed a realistic initial session
      return [
        {
          id: 'group-friday-crew',
          questId: 'quest-friday-1',
          title: 'Friday Friends Sunset & Roastery Quest',
          inviteCode: 'JED-7729',
          createdBy: 'Rina (Host)',
          participants: [
            { userId: 'u1', name: 'Rina', avatarSeed: '1', completedSteps: 2, totalSteps: 3, isHost: true },
            { userId: 'u2', name: 'Tariq', avatarSeed: '2', completedSteps: 1, totalSteps: 3, isHost: false },
            { userId: 'u3', name: 'Layla', avatarSeed: '3', completedSteps: 2, totalSteps: 3, isHost: false },
          ],
          createdAt: new Date().toISOString(),
        },
      ];
    }
    return list;
  });

  const [questTitle, setQuestTitle] = useState('Friday Friends Quest');
  const [hours, setHours] = useState('2h');
  const [budget, setBudget] = useState<'low' | 'medium' | 'flexible'>('medium');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateGroupQuest = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuest = generateSideQuest({
      mood: 'social',
      time: hours === '3h' ? 'half_day' : '2h',
      budget,
      group: 'friends',
    });

    const inviteCode = 'JED-' + Math.floor(1000 + Math.random() * 9000);
    const newSession: GroupQuestSession = {
      id: `group-${Date.now()}`,
      questId: newQuest.id,
      title: questTitle,
      inviteCode,
      createdBy: `${user.displayName} (Host)`,
      participants: [
        {
          userId: user.id,
          name: user.displayName,
          avatarSeed: 'host',
          completedSteps: 0,
          totalSteps: newQuest.steps.length,
          isHost: true,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    saveGroupQuest(newSession);
    setGroupQuests([newSession, ...groupQuests]);
    setActiveTab('LIST');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl">
              👥
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider text-purple-400 uppercase">
                Group Quests
              </div>
              <h2 className="text-base font-extrabold text-white">
                Explore Real Jeddah with Friends
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 py-2.5 border-b border-slate-800 flex items-center gap-2 bg-slate-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('LIST')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'LIST'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Group Quests ({groupQuests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CREATE')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CREATE'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create for Friends</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'LIST' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Track which friends have visited and verified each real-world checkpoint in Jeddah.
              </p>

              {groupQuests.map((gq) => (
                <div
                  key={gq.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{gq.title}</h4>
                      <div className="text-[11px] text-slate-400">Created by {gq.createdBy}</div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <button
                        onClick={() => handleCopyCode(gq.inviteCode)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-purple-300 flex items-center gap-1.5 cursor-pointer"
                        title="Copy Invite Code"
                      >
                        {copiedCode === gq.inviteCode ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3 h-3" />
                            <span>Code: {gq.inviteCode}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Participants Progress Bar */}
                  <div className="space-y-2 pt-1 border-t border-slate-800/80">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Crew Progress</div>
                    <div className="space-y-1.5">
                      {gq.participants.map((p) => {
                        const pct = Math.round((p.completedSteps / p.totalSteps) * 100);
                        return (
                          <div key={p.userId} className="flex items-center gap-3 text-xs">
                            <span className="w-20 font-medium text-slate-300 truncate">
                              {p.name} {p.isHost && '👑'}
                            </span>
                            <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-amber-500 h-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] text-amber-300 w-12 text-right">
                              {p.completedSteps}/{p.totalSteps}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleCreateGroupQuest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Quest Title
                </label>
                <input
                  type="text"
                  value={questTitle}
                  onChange={(e) => setQuestTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  placeholder="e.g. Friday Friends Jeddah Quest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Estimated Time
                  </label>
                  <select
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="1h">1 Hour (Quick)</option>
                    <option value="2h">2 Hours (Standard)</option>
                    <option value="3h">3 Hours (Extended)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Budget
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="low">Low (&lt; 40 SAR)</option>
                    <option value="medium">Medium (~100 SAR)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200">
                A custom invite code will be generated. All group members can track each other&apos;s real-world photo verifications live.
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-purple-500 to-amber-500 text-slate-950 shadow-lg active:scale-95 transition cursor-pointer"
              >
                Launch Group Quest
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

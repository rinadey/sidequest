import React from 'react';
import { UserProfile, Badge } from '../../types';
import { 
  Trophy, Flame, MapPin, Award, CheckCircle2, ShieldAlert, Sparkles, 
  Calendar, Camera, User, LogOut, ArrowRight, X, Clock
} from 'lucide-react';

interface JourneyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const JourneyProfileModal: React.FC<JourneyProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onSignOut,
}) => {
  if (!isOpen) return null;

  const hasDiscoveries = user.verifiedDiscoveries.length > 0;
  const hasBadges = user.badges.length > 0;
  const hasCompletedQuests = user.completedQuestIds.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Banner */}
        <div className="relative px-6 py-6 border-b border-slate-800 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-2xl font-black text-amber-400">
                  {user.isGuest ? '🧭' : user.displayName.charAt(0)}
                </div>
              </div>
              {!user.isGuest && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold" title="Verified Member">
                  ✓
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">
                  {user.displayName}&apos;s Jeddah Journey
                </h2>
                {user.isGuest && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                    Guest Mode
                  </span>
                )}
              </div>
              <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <span>{user.title}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 font-normal">Active in Jeddah</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!user.isGuest ? (
              <button
                onClick={onSignOut}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-md hover:from-amber-400 hover:to-orange-400 transition cursor-pointer"
              >
                Save Progress
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

        {/* Guest Warning Notice */}
        {user.isGuest && (
          <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Guest Mode:</strong> Your real XP, badges, and verified discoveries will reset if browser storage clears. Create an account to permanently sync.
              </span>
            </div>
            <button
              onClick={onOpenAuth}
              className="underline font-bold text-amber-400 hover:text-amber-300 flex-shrink-0 cursor-pointer"
            >
              Sign Up Now
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Real Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Total Real XP</span>
              </div>
              <div className="text-2xl font-black text-white mt-1.5">{user.xp}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Awarded only via photo proof</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Places</span>
              </div>
              <div className="text-2xl font-black text-white mt-1.5">{user.verifiedDiscoveries.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Physically visited</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] font-bold text-orange-400 flex items-center gap-1.5 uppercase">
                <Flame className="w-3.5 h-3.5" />
                <span>Day Streak</span>
              </div>
              <div className="text-2xl font-black text-white mt-1.5">{user.streakDays}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Consecutive active days</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                <Trophy className="w-3.5 h-3.5" />
                <span>Quests Done</span>
              </div>
              <div className="text-2xl font-black text-white mt-1.5">{user.completedQuestIds.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">All steps verified</div>
            </div>
          </div>

          {/* Earned Badges Section */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Earned Badges ({user.badges.length})
            </div>

            {hasBadges ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-2xl flex items-center justify-center">
                      {badge.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{badge.name}</div>
                      <div className="text-[11px] text-slate-400">{badge.description}</div>
                      <div className="text-[10px] text-amber-400/80 mt-1 font-mono">
                        Unlocked on {new Date(badge.unlockedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Beautiful Zero-Slop Empty State */
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <Award className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-bold text-slate-300">No Badges Unlocked Yet</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Complete real-world side quests and verify your physical visits to earn exclusive Jeddah explorer badges.
                </p>
              </div>
            )}
          </div>

          {/* Verified Real-World Discoveries Feed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Verified Discoveries Gallery ({user.verifiedDiscoveries.length})
              </div>
              <span className="text-[11px] text-slate-500">Distinguished: Visited vs Verified</span>
            </div>

            {hasDiscoveries ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {user.verifiedDiscoveries.map((discovery) => (
                  <div
                    key={discovery.id}
                    className="rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-800 flex flex-col"
                  >
                    <div className="h-40 bg-slate-950 overflow-hidden relative">
                      <img
                        src={discovery.photoUrl}
                        alt={discovery.placeName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/90 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow">
                        <CheckCircle2 className="w-3 h-3" />
                        AI Verified
                      </div>
                    </div>
                    <div className="p-3.5 space-y-1">
                      <div className="font-bold text-white text-xs">{discovery.placeName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{discovery.area}</span>
                      </div>
                      <div className="text-[10px] text-amber-400 font-semibold pt-1">
                        +{discovery.xpEarned} XP · from &quot;{discovery.questTitle}&quot;
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Beautiful Empty State for Discoveries */
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <Camera className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-bold text-slate-300">No Verified Discoveries Yet</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you visit real Jeddah landmarks, your AI-verified proof photos and XP stamps will appear here in your visual travel journal.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

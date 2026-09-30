import React, { useState } from 'react';
import { UserProfile, Quest } from '../../types';
import { 
  Compass, MapPin, Trophy, Flame, Bookmark, Users, PlusCircle, 
  Sparkles, Menu, X, ShieldAlert, User, LogIn, ChevronDown 
} from 'lucide-react';

interface AdventureNavbarProps {
  user: UserProfile;
  activeQuest: Quest | null;
  onOpenPreferences: () => void;
  onOpenMap: () => void;
  onOpenProfile: () => void;
  onOpenSurprise: () => void;
  onOpenGroup: () => void;
  onOpenCustom: () => void;
  onOpenSaved: () => void;
  onOpenAuth: () => void;
  onOpenActiveQuest: () => void;
}

export const AdventureNavbar: React.FC<AdventureNavbarProps> = ({
  user,
  activeQuest,
  onOpenPreferences,
  onOpenMap,
  onOpenProfile,
  onOpenSurprise,
  onOpenGroup,
  onOpenCustom,
  onOpenSaved,
  onOpenAuth,
  onOpenActiveQuest,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-xl">
              🧭
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Jeddah Side Quest
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                BETA
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-tajawal hidden sm:block">
              مغامرات جدة الحقيقية · The website is the starting point
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={onOpenPreferences}
            className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Start Quest</span>
          </button>

          <button
            onClick={onOpenMap}
            className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition flex items-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Adventure Map</span>
          </button>

          <button
            onClick={onOpenSurprise}
            className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Surprise Me</span>
          </button>

          <button
            onClick={onOpenGroup}
            className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Groups</span>
          </button>

          <button
            onClick={onOpenSaved}
            className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            <span>Saved</span>
          </button>

          <button
            onClick={onOpenCustom}
            className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Create</span>
          </button>
        </nav>

        {/* Right HUD: Active Quest / User XP & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Active Quest Alert Pill */}
          {activeQuest && (
            <button
              onClick={onOpenActiveQuest}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition animate-pulse cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="truncate max-w-[100px] sm:max-w-[130px]">Quest Active</span>
            </button>
          )}

          {/* User Stats Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
          >
            <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{user.xp} XP</span>
            </div>
            {user.streakDays > 0 && (
              <div className="hidden sm:flex items-center gap-0.5 text-orange-400 font-mono font-bold">
                <Flame className="w-3.5 h-3.5" />
                <span>{user.streakDays}d</span>
              </div>
            )}
            <div className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
              {user.isGuest ? '?' : user.displayName.charAt(0)}
            </div>
          </button>

          {/* Guest Sign-in prompt */}
          {user.isGuest && (
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 py-4 bg-slate-950 border-b border-slate-800 space-y-2">
          <button
            onClick={() => {
              onOpenPreferences();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Start Side Quest (Preferences First)</span>
          </button>

          <button
            onClick={() => {
              onOpenMap();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Adventure Map</span>
          </button>

          <button
            onClick={() => {
              onOpenSurprise();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Surprise Me!</span>
          </button>

          <button
            onClick={() => {
              onOpenGroup();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>Group Quests</span>
          </button>

          <button
            onClick={() => {
              onOpenSaved();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2"
          >
            <Bookmark className="w-4 h-4 text-emerald-400" />
            <span>Saved Quests</span>
          </button>

          <button
            onClick={() => {
              onOpenCustom();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Create Your Own Quest</span>
          </button>

          {user.isGuest && (
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs uppercase tracking-wider text-center mt-2 shadow"
            >
              Sign In to Save Progress
            </button>
          )}
        </div>
      )}
    </header>
  );
};

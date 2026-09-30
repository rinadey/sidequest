import React, { useState, useEffect } from 'react';
import { 
  UserProfile, Quest, QuestPreferences, VerificationResult, 
  JeddahLocation 
} from './types';
import { 
  getStoredUser, saveUser, recordVerifiedLocation, 
  recordQuestCompletion, signOutUser, getSavedQuests, 
  toggleSaveQuest 
} from './services/authService';
import { generateSideQuest } from './services/questGenerator';

// Components
import { Jeddah3DWorld } from './components/world3d/Jeddah3DWorld';
import { AdventureNavbar } from './components/navigation/AdventureNavbar';
import { QuestPreferenceModal } from './components/quest/QuestPreferenceModal';
import { QuestPreviewModal } from './components/quest/QuestPreviewModal';
import { ActiveQuestView } from './components/quest/ActiveQuestView';
import { AdventureMapModal } from './components/map/AdventureMapModal';
import { JourneyProfileModal } from './components/profile/JourneyProfileModal';
import { AuthModal } from './components/auth/AuthModal';
import { SurpriseMeModal } from './components/features/SurpriseMeModal';
import { GroupQuestModal } from './components/features/GroupQuestModal';
import { CustomQuestModal } from './components/features/CustomQuestModal';
import { SavedQuestsModal } from './components/features/SavedQuestsModal';
import { VideoPlaceholderSection } from './components/video/VideoPlaceholderSection';

import { 
  Compass, MapPin, Sparkles, Footprints, ShieldAlert, 
  ArrowRight, Eye, Film, Play, X 
} from 'lucide-react';

export default function App() {
  // User Profile state
  const [user, setUser] = useState<UserProfile>(() => getStoredUser());

  // Quest states
  const [activeQuest, setActiveQuest] = useState<Quest | null>(() => {
    try {
      const saved = localStorage.getItem('jeddah_active_quest');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [previewQuest, setPreviewQuest] = useState<Quest | null>(null);
  const [savedQuests, setSavedQuests] = useState<Quest[]>(() => getSavedQuests());

  // Modal open states
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isActiveQuestOpen, setIsActiveQuestOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isVideoSectionOpen, setIsVideoSectionOpen] = useState(false);

  // Initial welcome splash overlay
  const [showWelcomeHero, setShowWelcomeHero] = useState<boolean>(() => {
    return !localStorage.getItem('jeddah_has_explored');
  });

  // Persist active quest changes
  useEffect(() => {
    if (activeQuest) {
      localStorage.setItem('jeddah_active_quest', JSON.stringify(activeQuest));
    } else {
      localStorage.removeItem('jeddah_active_quest');
    }
  }, [activeQuest]);

  // Handlers
  const handleGenerateQuestFromPreferences = (preferences: QuestPreferences) => {
    setIsPreferencesOpen(false);
    const newQuest = generateSideQuest(preferences);
    setPreviewQuest(newQuest);
    setIsPreviewOpen(true);
  };

  const handleAcceptQuest = (quest: Quest) => {
    setActiveQuest(quest);
    setIsPreviewOpen(false);
    setIsActiveQuestOpen(true);
  };

  const handleStepVerified = (stepNumber: number, result: VerificationResult, photoUrl: string) => {
    if (!activeQuest) return;

    const stepIndex = activeQuest.steps.findIndex((s) => s.stepNumber === stepNumber);
    if (stepIndex === -1) return;

    const updatedSteps = [...activeQuest.steps];
    const targetStep = updatedSteps[stepIndex];
    targetStep.verified = true;
    targetStep.verifiedAt = new Date().toISOString();
    targetStep.proofPhotoUrl = photoUrl;
    targetStep.verificationEvidence = result.detectedEvidence;
    targetStep.verificationConfidence = result.confidence;

    const updatedQuest: Quest = {
      ...activeQuest,
      steps: updatedSteps,
    };
    setActiveQuest(updatedQuest);

    // Record verified location discovery in user profile
    const updatedUser = recordVerifiedLocation(user, {
      id: `disc-${Date.now()}`,
      placeId: targetStep.location.id,
      placeName: targetStep.location.name,
      area: targetStep.location.area,
      verifiedAt: new Date().toISOString(),
      photoUrl,
      questTitle: activeQuest.title,
      xpEarned: 150,
      evidence: result.detectedEvidence,
    });
    setUser(updatedUser);
  };

  const handleQuestCompleted = (quest: Quest) => {
    const { updatedUser } = recordQuestCompletion(user, quest);
    setUser(updatedUser);
  };

  const handleCancelQuest = () => {
    setActiveQuest(null);
    setIsActiveQuestOpen(false);
  };

  const handleToggleSave = (quest: Quest) => {
    const isNowSaved = toggleSaveQuest(quest);
    setSavedQuests(getSavedQuests());
  };

  const handleSignOut = () => {
    const newGuest = signOutUser();
    setUser(newGuest);
    setIsProfileOpen(false);
  };

  const handleStartQuestAtLocation = (loc: JeddahLocation) => {
    setIsMapOpen(false);
    // Generate a quest centered around this specific location
    const quest = generateSideQuest({
      mood: loc.suitableMoods[0] || 'adventurous',
      time: '1h',
      budget: loc.typicalCostSAR === 0 ? 'free' : 'low',
      group: 'alone',
    });
    // Replace first step with this location
    quest.steps[0].location = loc;
    quest.steps[0].challengeTitle = `Discover ${loc.name}`;
    quest.steps[0].challengeDescription = `Travel to ${loc.name} in ${loc.area} and capture proof of its distinctive features.`;
    quest.steps[0].targetVisualProof = loc.visualFeatures;

    setPreviewQuest(quest);
    setIsPreviewOpen(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Top HUD Navigation Bar */}
      <AdventureNavbar
        user={user}
        activeQuest={activeQuest}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSurprise={() => setIsSurpriseOpen(true)}
        onOpenGroup={() => setIsGroupOpen(true)}
        onOpenCustom={() => setIsCustomOpen(true)}
        onOpenSaved={() => setIsSavedOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenActiveQuest={() => setIsActiveQuestOpen(true)}
      />

      {/* Main 3D Jeddah World Canvas (The Adventure Hub) */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <Jeddah3DWorld
          onOpenPreferences={() => setIsPreferencesOpen(true)}
          onOpenMap={() => setIsMapOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenSurprise={() => setIsSurpriseOpen(true)}
          onOpenActiveQuest={() => setIsActiveQuestOpen(true)}
          hasActiveQuest={Boolean(activeQuest)}
          activeQuestTitle={activeQuest?.title}
        />

        {/* Floating Quick Action Hub Bar (Bottom Center) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-2 bg-slate-950/85 backdrop-blur-xl border border-slate-700/80 p-2 rounded-2xl shadow-2xl">
          <button
            onClick={() => setIsPreferencesOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Start Side Quest</span>
          </button>

          <button
            onClick={() => setIsMapOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Adventure Map</span>
          </button>

          <button
            onClick={() => setIsSurpriseOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Surprise Me</span>
          </button>

          <button
            onClick={() => setIsVideoSectionOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition cursor-pointer"
            title="Watch Cinematic Teaser"
          >
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span>Trailer</span>
          </button>
        </div>

        {/* Section 5: Entry / Home Experience Overlay (Dismissible Welcome Screen) */}
        {showWelcomeHero && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="relative max-w-xl w-full bg-[#0f172a]/95 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-xl shadow-amber-500/30 mx-auto">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-3xl">
                  🧭
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black tracking-widest text-amber-400 uppercase">
                  Jeddah Side Quest
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Turn an ordinary day in Jeddah into an adventure.
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  Search less. Explore more. Start your next side quest.
                </p>
                <div className="text-[11px] text-amber-300/90 pt-1 font-tajawal">
                  الموقع هو نقطة البداية، وليس الوجهة · المغامرة الحقيقية في شوارع جدة
                </div>
              </div>

              {/* Core Philosophy Card */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5" />
                  <span>The Real-World Quest Philosophy</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  The 3D world is your adventure starting hub. To earn XP and badges, you must physically visit real Jeddah locations and submit photo proof for AI verification!
                </p>
              </div>

              {/* Two Mandatory Options: START YOUR QUEST & JUST EXPLORE */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('jeddah_has_explored', 'true');
                    setShowWelcomeHero(false);
                    setIsPreferencesOpen(true);
                  }}
                  className="flex-1 py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-xl shadow-amber-500/30 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Start Your Quest</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('jeddah_has_explored', 'true');
                    setShowWelcomeHero(false);
                  }}
                  className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>Just Explore Hub</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                <span>Guest mode available · Create account anytime to save permanent progress</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- ALL PRODUCT MODALS --- */}

      {/* 1. Preferences Wizard (Mood -> Time -> Budget -> Group) */}
      <QuestPreferenceModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        onGenerateQuest={handleGenerateQuestFromPreferences}
      />

      {/* 2. Quest Proposal Preview */}
      <QuestPreviewModal
        quest={previewQuest}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onAcceptQuest={handleAcceptQuest}
        onRegenerate={() => {
          if (previewQuest) {
            const fresh = generateSideQuest(previewQuest.preferences);
            setPreviewQuest(fresh);
          }
        }}
        onSaveQuest={handleToggleSave}
        isSaved={Boolean(previewQuest && savedQuests.some((s) => s.id === previewQuest.id))}
      />

      {/* 3. Active Real-World Quest Tracker with AI Photo Proof */}
      {activeQuest && (
        <ActiveQuestView
          quest={activeQuest}
          user={user}
          isOpen={isActiveQuestOpen}
          onClose={() => setIsActiveQuestOpen(false)}
          onStepVerified={handleStepVerified}
          onQuestCompleted={handleQuestCompleted}
          onCancelQuest={handleCancelQuest}
        />
      )}

      {/* 4. Interactive Adventure Map */}
      <AdventureMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        user={user}
        onStartQuestAtLocation={handleStartQuestAtLocation}
      />

      {/* 5. My Journey Profile & Verified Badges */}
      <JourneyProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onOpenAuth={() => {
          setIsProfileOpen(false);
          setIsAuthOpen(true);
        }}
        onSignOut={handleSignOut}
      />

      {/* 6. Real Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
        }}
      />

      {/* 7. Spontaneous "Surprise Me" Quest */}
      <SurpriseMeModal
        isOpen={isSurpriseOpen}
        onClose={() => setIsSurpriseOpen(false)}
        onQuestGenerated={(quest) => {
          setPreviewQuest(quest);
          setIsPreviewOpen(true);
        }}
      />

      {/* 8. Group Quests */}
      <GroupQuestModal
        isOpen={isGroupOpen}
        onClose={() => setIsGroupOpen(false)}
        user={user}
        onAcceptQuest={handleAcceptQuest}
      />

      {/* 9. Custom Quest Builder */}
      <CustomQuestModal
        isOpen={isCustomOpen}
        onClose={() => setIsCustomOpen(false)}
        user={user}
        onQuestCreated={(customQuest) => {
          setPreviewQuest(customQuest);
          setIsPreviewOpen(true);
        }}
      />

      {/* 10. Saved Quests Drawer */}
      <SavedQuestsModal
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedQuests={savedQuests}
        user={user}
        onSelectQuest={(quest) => {
          setPreviewQuest(quest);
          setIsPreviewOpen(true);
        }}
        onRemoveQuest={handleToggleSave}
      />

      {/* 11. Cinematic Video Section Modal */}
      {isVideoSectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
            <button
              onClick={() => setIsVideoSectionOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <VideoPlaceholderSection
              onStartQuest={() => {
                setIsVideoSectionOpen(false);
                setIsPreferencesOpen(true);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { Quest, QuestStep, VerificationResult, VerificationState, UserProfile } from '../../types';
import { verifyProofPhoto } from '../../services/geminiVerification';
import { 
  Camera, Upload, CheckCircle2, AlertTriangle, ExternalLink, MapPin, 
  ChevronRight, Award, Sparkles, RefreshCw, X, ShieldCheck, Info, Loader2, Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActiveQuestViewProps {
  quest: Quest;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onStepVerified: (stepNumber: number, result: VerificationResult, photoUrl: string) => void;
  onQuestCompleted: (quest: Quest) => void;
  onCancelQuest: () => void;
}

export const ActiveQuestView: React.FC<ActiveQuestViewProps> = ({
  quest,
  user,
  isOpen,
  onClose,
  onStepVerified,
  onQuestCompleted,
  onCancelQuest,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(() => {
    const firstUnverified = quest.steps.findIndex((s) => !s.verified);
    return firstUnverified !== -1 ? firstUnverified : 0;
  });

  const [verificationState, setVerificationState] = useState<VerificationState>('NOT_STARTED');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [previewMimeType, setPreviewMimeType] = useState<string>('image/jpeg');
  const [lastResult, setLastResult] = useState<VerificationResult | null>(null);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentStep = quest.steps[activeStepIndex];
  const verifiedCount = quest.steps.filter((s) => s.verified).length;
  const totalCount = quest.steps.length;
  const isAllVerified = verifiedCount === totalCount;

  const handlePhotoSelect = (file: File) => {
    setPreviewMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewPhoto(dataUrl);
      setVerificationState('PHOTO_READY');
      setLastResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAiVerification = async () => {
    if (!previewPhoto || !currentStep) return;

    setVerificationState('VERIFYING');
    setLastResult(null);

    const result = await verifyProofPhoto(
      previewPhoto,
      previewMimeType,
      currentStep.location,
      currentStep.challengeDescription
    );

    setLastResult(result);

    if (result.verified) {
      setVerificationState('VERIFIED');
      // Fire confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#38bdf8', '#fbbf24'],
        });
      } catch (e) {}

      onStepVerified(currentStep.stepNumber, result, previewPhoto);

      // Check if all steps are now completed
      if (verifiedCount + 1 >= totalCount) {
        setIsCompletedModalOpen(true);
        onQuestCompleted(quest);
      }
    } else {
      setVerificationState('VERIFICATION_FAILED');
    }
  };

  const openGoogleMapsDirections = (step: QuestStep) => {
    const lat = step.location.lat;
    const lng = step.location.lng;
    const placeName = encodeURIComponent(`${step.location.name} Jeddah`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${placeName}&query_place_id=${step.location.googlePlaceId || ''}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Quest Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold text-sm">
              {verifiedCount}/{totalCount}
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                Active Real-World Quest
              </div>
              <h2 className="text-base font-extrabold text-white leading-tight">{quest.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Minimize
            </button>
          </div>
        </div>

        {/* Progress Stepper Line */}
        <div className="w-full bg-slate-900 px-6 py-3 border-b border-slate-800/80 flex items-center justify-between overflow-x-auto gap-2">
          {quest.steps.map((step, idx) => {
            const isSelected = activeStepIndex === idx;
            const isStepVerified = step.verified;
            return (
              <button
                key={step.stepNumber}
                type="button"
                onClick={() => {
                  setActiveStepIndex(idx);
                  setPreviewPhoto(step.proofPhotoUrl || null);
                  setVerificationState(step.verified ? 'VERIFIED' : 'NOT_STARTED');
                  setLastResult(null);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition flex-1 justify-center border cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : isStepVerified
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {isStepVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                )}
                <span className="truncate max-w-[120px]">{step.location.name}</span>
              </button>
            );
          })}
        </div>

        {/* Quest Step Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Real Location Overview */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Location {currentStep.stepNumber} of {totalCount}
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>{currentStep.location.name}</span>
                  <span className="text-xs font-tajawal text-slate-400">({currentStep.location.nameArabic})</span>
                </h3>
              </div>

              <button
                onClick={() => openGoogleMapsDirections(currentStep)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition cursor-pointer self-start sm:self-center"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open in Google Maps</span>
              </button>
            </div>

            <div className="text-xs text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentStep.location.address}</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{currentStep.location.description}</p>
          </div>

          {/* Real Challenge Objective Box */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Real-World Challenge</span>
            </div>
            <h4 className="text-base font-bold text-white">{currentStep.challengeTitle}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{currentStep.challengeDescription}</p>
            <div className="text-xs text-amber-300/90 font-medium pt-1">
              <span className="font-bold">Required Proof: </span>
              {currentStep.targetVisualProof}
            </div>
          </div>

          {/* Verification Workspace & States */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Photo Proof & AI Verification</span>
                </h4>
                <p className="text-xs text-slate-400">
                  AI checks Arabic/English signage, storefronts, and architectural features.
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {currentStep.verified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    LOCATION VERIFIED (+150 XP)
                  </span>
                ) : verificationState === 'VERIFYING' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    AI IS CHECKING YOUR DISCOVERY...
                  </span>
                ) : verificationState === 'VERIFICATION_FAILED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    VERIFICATION FAILED (0 XP)
                  </span>
                ) : previewPhoto ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold">
                    PHOTO READY
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                    VERIFICATION REQUIRED (0 XP)
                  </span>
                )}
              </div>
            </div>

            {/* Photo Capture & Upload Area */}
            {!currentStep.verified && (
              <div className="space-y-4">
                {previewPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-72 flex items-center justify-center">
                    <img
                      src={previewPhoto}
                      alt="Uploaded proof"
                      className="max-h-72 w-auto object-contain rounded-2xl"
                    />
                    {verificationState !== 'VERIFYING' && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewPhoto(null);
                          setVerificationState('NOT_STARTED');
                          setLastResult(null);
                        }}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white transition"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Device Camera input */}
                    <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-400/80 bg-slate-950/40 hover:bg-slate-900/60 transition cursor-pointer group">
                      <Camera className="w-8 h-8 text-amber-400 group-hover:scale-110 transition" />
                      <span className="mt-2 text-xs font-bold text-slate-200">Take Photo</span>
                      <span className="text-[11px] text-slate-400">Use device live camera</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handlePhotoSelect(e.target.files[0]);
                        }}
                      />
                    </label>

                    {/* File Upload input */}
                    <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-400/80 bg-slate-950/40 hover:bg-slate-900/60 transition cursor-pointer group">
                      <Upload className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition" />
                      <span className="mt-2 text-xs font-bold text-slate-200">Upload Photo</span>
                      <span className="text-[11px] text-slate-400">Select image from gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handlePhotoSelect(e.target.files[0]);
                        }}
                      />
                    </label>
                  </div>
                )}

                {/* AI Verification Trigger Button */}
                {previewPhoto && verificationState !== 'VERIFIED' && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Photos are analyzed solely to verify your real-world discovery.</span>
                    </div>

                    <button
                      type="button"
                      disabled={verificationState === 'VERIFYING'}
                      onClick={handleRunAiVerification}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer"
                    >
                      {verificationState === 'VERIFYING' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>AI Analyzing Visual Clues...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Verify with AI & Claim XP</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Structured Verification Analysis Result Feedback */}
            {lastResult && (
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                  lastResult.verified
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {lastResult.verified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{lastResult.verified ? 'Verification Confirmed!' : 'Verification Incomplete'}</span>
                  <span className="text-[10px] opacity-75 font-mono">
                    (Confidence: {Math.round(lastResult.confidence * 100)}%)
                  </span>
                </div>
                <p>{lastResult.detectedEvidence}</p>
                <p className="opacity-90">{lastResult.explanation}</p>
                {!lastResult.verified && lastResult.retryRecommendation && (
                  <div className="pt-1 text-amber-300 font-medium">
                    Recommendation: {lastResult.retryRecommendation}
                  </div>
                )}
              </div>
            )}

            {/* Already Verified Visual Display */}
            {currentStep.verified && currentStep.proofPhotoUrl && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Discovery Evidence</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-emerald-500/30 max-h-56">
                  <img
                    src={currentStep.proofPhotoUrl}
                    alt="Verified discovery"
                    className="w-full h-48 object-cover"
                  />
                </div>
                {currentStep.verificationEvidence && (
                  <p className="text-xs text-slate-300 italic">{currentStep.verificationEvidence}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancelQuest}
            className="text-xs text-rose-400 hover:text-rose-300 transition cursor-pointer"
          >
            Abandon Quest
          </button>

          <div className="flex items-center gap-2">
            {activeStepIndex > 0 && (
              <button
                type="button"
                onClick={() => setActiveStepIndex((prev) => prev - 1)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                Previous Step
              </button>
            )}

            {activeStepIndex < totalCount - 1 && (
              <button
                type="button"
                onClick={() => setActiveStepIndex((prev) => prev + 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition cursor-pointer"
              >
                Next Step →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal Celebration */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
          <div className="max-w-md w-full bg-[#0f172a] border-2 border-amber-400/80 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/30">
              🎉
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">Side Quest Complete!</span>
              <h3 className="text-xl font-black text-white mt-1">{quest.title}</h3>
              <p className="text-xs text-slate-300 mt-1">
                You went out into real Jeddah, completed challenges, and verified every location with photo proof!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-[11px] text-slate-400">Total XP Earned</div>
                <div className="text-lg font-black text-amber-400">+{quest.totalXP} XP</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Locations Verified</div>
                <div className="text-lg font-black text-emerald-400">{totalCount} / {totalCount}</div>
              </div>
            </div>

            {quest.badgeReward && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-left">
                <span className="text-2xl">{quest.badgeReward.icon}</span>
                <div>
                  <div className="text-xs font-bold text-white">Badge Unlocked: {quest.badgeReward.name}</div>
                  <div className="text-[11px] text-slate-400">{quest.badgeReward.description}</div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setIsCompletedModalOpen(false);
                onClose();
              }}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-xl shadow-amber-500/30 active:scale-95 transition cursor-pointer"
            >
              Continue Exploring Jeddah
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

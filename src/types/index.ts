export type Mood =
  | 'relaxing'
  | 'social'
  | 'adventurous'
  | 'creative'
  | 'foodie'
  | 'cultural'
  | 'spontaneous';

export type TimeDuration =
  | '30m'
  | '1h'
  | '2h'
  | 'half_day'
  | 'full_day';

export type Budget = 'free' | 'low' | 'medium' | 'flexible';

export type GroupType = 'alone' | 'friends' | 'family' | 'couple';

export interface QuestPreferences {
  mood: Mood;
  time: TimeDuration;
  budget: Budget;
  group: GroupType;
}

export interface JeddahLocation {
  id: string;
  name: string;
  nameArabic: string;
  category: 'heritage' | 'cafe' | 'art' | 'coastal' | 'culinary' | 'leisure' | 'architecture';
  area: string;
  lat: number;
  lng: number;
  address: string;
  description: string;
  visualFeatures: string;
  typicalCostSAR: number;
  estimatedMinutes: number;
  suitableGroups: GroupType[];
  suitableMoods: Mood[];
  googlePlaceId?: string;
  photoUrl?: string;
}

export interface QuestStep {
  stepNumber: number;
  location: JeddahLocation;
  challengeTitle: string;
  challengeDescription: string;
  targetVisualProof: string; // What the AI will look for
  verified: boolean;
  verifiedAt?: string;
  proofPhotoUrl?: string;
  verificationEvidence?: string;
  verificationConfidence?: number;
}

export interface Quest {
  id: string;
  title: string;
  tagline: string;
  description: string;
  preferences: QuestPreferences;
  estimatedTotalMinutes: number;
  estimatedCostSAR: number;
  difficulty: 'Easy' | 'Moderate' | 'Adventurous';
  steps: QuestStep[];
  totalXP: number;
  badgeReward?: {
    id: string;
    name: string;
    description: string;
    icon: string;
  };
  createdAt: string;
  isCustom?: boolean;
  authorName?: string;
}

export type VerificationState =
  | 'NOT_STARTED'
  | 'PHOTO_READY'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'VERIFICATION_FAILED';

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  detectedEvidence: string;
  expectedPlace: string;
  explanation: string;
  retryRecommendation?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: string;
}

export interface VerifiedDiscovery {
  id: string;
  placeId: string;
  placeName: string;
  area: string;
  verifiedAt: string;
  photoUrl: string;
  questTitle: string;
  xpEarned: number;
  evidence: string;
}

export interface UserProfile {
  id: string;
  isGuest: boolean;
  email?: string;
  displayName: string;
  title: string;
  avatarSeed: string;
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  completedQuestIds: string[];
  verifiedDiscoveries: VerifiedDiscovery[];
  badges: Badge[];
  savedQuestIds: string[];
  joinedAt: string;
}

export interface GroupQuestSession {
  id: string;
  questId: string;
  title: string;
  inviteCode: string;
  createdBy: string;
  participants: {
    userId: string;
    name: string;
    avatarSeed: string;
    completedSteps: number;
    totalSteps: number;
    isHost: boolean;
  }[];
  createdAt: string;
}

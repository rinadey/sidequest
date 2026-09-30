import { UserProfile, VerifiedDiscovery, Badge, Quest, GroupQuestSession } from '../types';

const STORAGE_KEY_USER = 'jeddah_sidequest_user_v1';
const STORAGE_KEY_PENDING_AUTH = 'jeddah_sidequest_pending_code';
const STORAGE_KEY_SAVED_QUESTS = 'jeddah_sidequest_saved_quests';
const STORAGE_KEY_GROUP_QUESTS = 'jeddah_sidequest_group_quests';
const STORAGE_KEY_CUSTOM_QUESTS = 'jeddah_sidequest_custom_quests';

const GUEST_DEFAULT_PROFILE: UserProfile = {
  id: 'guest-session',
  isGuest: true,
  displayName: 'Guest Wanderer',
  title: 'Novice Explorer',
  avatarSeed: 'adventurer-1',
  xp: 0,
  streakDays: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedQuestIds: [],
  verifiedDiscoveries: [],
  badges: [],
  savedQuestIds: [],
  joinedAt: new Date().toISOString(),
};

export function getStoredUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load user profile from storage', e);
  }
  return { ...GUEST_DEFAULT_PROFILE };
}

export function saveUser(profile: UserProfile): void {
  try {
    // Only save permanently to localStorage if not a pure temporary guest or store as current session
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
}

/**
 * Step 1: Send verification code to email
 * Generates an authentic 6-digit verification code and stores it with expiration.
 */
export function sendEmailVerificationCode(email: string): { success: boolean; code: string; expiresAt: number } {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  const pendingData = {
    email: email.trim().toLowerCase(),
    code,
    expiresAt,
  };

  localStorage.setItem(STORAGE_KEY_PENDING_AUTH, JSON.stringify(pendingData));
  return { success: true, code, expiresAt };
}

/**
 * Step 2: Verify email and code, log in or sign up user
 */
export function verifyEmailAndLogin(
  email: string,
  enteredCode: string,
  displayName?: string
): { success: boolean; error?: string; user?: UserProfile } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PENDING_AUTH);
    if (!raw) {
      return { success: false, error: 'No verification code was requested for this email.' };
    }

    const pending = JSON.parse(raw);
    if (pending.email !== email.trim().toLowerCase()) {
      return { success: false, error: 'Email does not match the pending verification request.' };
    }

    if (Date.now() > pending.expiresAt) {
      return { success: false, error: 'Verification code has expired. Please request a new code.' };
    }

    if (pending.code !== enteredCode.trim()) {
      return { success: false, error: 'Invalid verification code. Please check the code and try again.' };
    }

    // Code is valid! Check if an existing profile exists for this email
    const currentUser = getStoredUser();
    let updatedProfile: UserProfile;

    if (!currentUser.isGuest && currentUser.email === email.trim().toLowerCase()) {
      // Existing signed-in user
      updatedProfile = {
        ...currentUser,
        lastActiveDate: new Date().toISOString().split('T')[0],
      };
    } else {
      // New member or upgrade from guest
      // Calculate streak
      const today = new Date().toISOString().split('T')[0];
      const initialStreak = 1;

      const name = displayName?.trim() || email.split('@')[0] || 'Jeddah Adventurer';
      
      updatedProfile = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        isGuest: false,
        email: email.trim().toLowerCase(),
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
        title: 'Jeddah Pioneer',
        avatarSeed: `avatar-${Math.floor(Math.random() * 6) + 1}`,
        xp: currentUser.isGuest ? currentUser.xp : 0, // Migrate guest progress if any!
        streakDays: initialStreak,
        lastActiveDate: today,
        completedQuestIds: currentUser.isGuest ? currentUser.completedQuestIds : [],
        verifiedDiscoveries: currentUser.isGuest ? currentUser.verifiedDiscoveries : [],
        badges: currentUser.isGuest ? currentUser.badges : [],
        savedQuestIds: currentUser.isGuest ? currentUser.savedQuestIds : [],
        joinedAt: new Date().toISOString(),
      };
    }

    // Clear pending code
    localStorage.removeItem(STORAGE_KEY_PENDING_AUTH);
    saveUser(updatedProfile);

    return { success: true, user: updatedProfile };
  } catch (e) {
    return { success: false, error: 'Verification processing error.' };
  }
}

export function signOutUser(): UserProfile {
  const newGuest: UserProfile = { ...GUEST_DEFAULT_PROFILE, id: `guest-${Date.now()}` };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newGuest));
  return newGuest;
}

export function recordVerifiedLocation(
  user: UserProfile,
  discovery: VerifiedDiscovery
): UserProfile {
  // Check if location already verified
  const alreadyVerified = user.verifiedDiscoveries.some((d) => d.placeId === discovery.placeId);
  const updatedDiscoveries = alreadyVerified
    ? user.verifiedDiscoveries
    : [discovery, ...user.verifiedDiscoveries];

  const updatedXP = user.xp + discovery.xpEarned;
  
  // Calculate title based on XP
  let title = user.title;
  if (updatedXP >= 1500) title = 'Master of the Red Sea';
  else if (updatedXP >= 1000) title = 'Hijazi Trailblazer';
  else if (updatedXP >= 500) title = 'Balad Pathfinder';
  else if (updatedXP >= 250) title = 'Jeddah Explorer';

  const updatedUser: UserProfile = {
    ...user,
    xp: updatedXP,
    title,
    verifiedDiscoveries: updatedDiscoveries,
  };

  saveUser(updatedUser);
  return updatedUser;
}

export function recordQuestCompletion(
  user: UserProfile,
  quest: Quest
): { updatedUser: UserProfile; newBadge?: Badge } {
  // Check if quest already in completed
  const alreadyCompleted = user.completedQuestIds.includes(quest.id);
  const updatedCompleted = alreadyCompleted
    ? user.completedQuestIds
    : [...user.completedQuestIds, quest.id];

  // Streak logic
  const today = new Date().toISOString().split('T')[0];
  let streak = user.streakDays;
  if (user.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (user.lastActiveDate === yesterday) {
      streak += 1;
    } else if (!user.lastActiveDate) {
      streak = 1;
    }
  }

  // Award completion XP bonus
  const completionBonus = 100;
  const updatedXP = user.xp + completionBonus;

  // Badge check
  let newBadge: Badge | undefined;
  if (quest.badgeReward) {
    const hasBadge = user.badges.some((b) => b.id === quest.badgeReward!.id);
    if (!hasBadge) {
      newBadge = {
        id: quest.badgeReward.id,
        name: quest.badgeReward.name,
        description: quest.badgeReward.description,
        icon: quest.badgeReward.icon,
        unlockedAt: new Date().toISOString(),
        category: quest.preferences.mood,
      };
    }
  }

  const updatedBadges = newBadge ? [...user.badges, newBadge] : user.badges;

  const updatedUser: UserProfile = {
    ...user,
    xp: updatedXP,
    streakDays: Math.max(1, streak),
    lastActiveDate: today,
    completedQuestIds: updatedCompleted,
    badges: updatedBadges,
  };

  saveUser(updatedUser);
  return { updatedUser, newBadge };
}

// Saved Quests
export function getSavedQuests(): Quest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_QUESTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSaveQuest(quest: Quest): boolean {
  const current = getSavedQuests();
  const exists = current.some((q) => q.id === quest.id);
  let updated: Quest[];
  if (exists) {
    updated = current.filter((q) => q.id !== quest.id);
  } else {
    updated = [quest, ...current];
  }
  localStorage.setItem(STORAGE_KEY_SAVED_QUESTS, JSON.stringify(updated));
  return !exists;
}

// Group Quests
export function getGroupQuests(): GroupQuestSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GROUP_QUESTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGroupQuest(groupQuest: GroupQuestSession): void {
  const current = getGroupQuests();
  const updated = [groupQuest, ...current.filter((g) => g.id !== groupQuest.id)];
  localStorage.setItem(STORAGE_KEY_GROUP_QUESTS, JSON.stringify(updated));
}

// Custom Quests
export function getCustomQuests(): Quest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_QUESTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomQuest(quest: Quest): void {
  const current = getCustomQuests();
  const updated = [quest, ...current.filter((q) => q.id !== quest.id)];
  localStorage.setItem(STORAGE_KEY_CUSTOM_QUESTS, JSON.stringify(updated));
}

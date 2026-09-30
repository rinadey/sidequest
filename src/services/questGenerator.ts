import { Quest, QuestPreferences, QuestStep, JeddahLocation } from '../types';
import { matchPlacesForQuest, JEDDAH_LOCATIONS } from '../data/jeddahPlaces';

const QUEST_TITLES_BY_MOOD: Record<string, string[]> = {
  relaxing: [
    'Red Sea Whisper & Sunset Breeze',
    'Quiet Courtyards of Al-Balad',
    'Oceanfront Serenade',
    'Tranquil Tides & Golden Hour',
  ],
  social: [
    'Corniche Crew Gathering',
    'Hijazi Feast & Laughs Trail',
    'Nightfall Pulse of Al-Andalus',
    'Waterfront Wanderers',
  ],
  adventurous: [
    'The Coral Citadel Expedition',
    'Red Sea Coastline Odyssey',
    'Historic Gateway Discovery',
    'Sharm Obhur Horizon Quest',
  ],
  creative: [
    'Roshan Geometry & Sea Canvas',
    'Sculpture Walk & Modern Muse',
    'The Bohemian Balad Safari',
    'Light & Shadow Gallery Crawl',
  ],
  foodie: [
    'Cardamom, Oud & Specialty Brews',
    'Hijazi Street Food Safari',
    'Corniche Sunset Roast Tour',
    'Artisanal Flavors of Jeddah',
  ],
  cultural: [
    'Chronicles of the Old Port',
    'Palaces of Coral & Teak',
    'Pilgrim Gate Heritage Route',
    'Living Echoes of Tayebat',
  ],
  spontaneous: [
    'The Unplanned Hijazi Detour',
    'Jeddah Roulette Adventure',
    'Midnight Lantern Chase',
    'Random Acts of Jeddah Exploration',
  ],
};

function generateChallengeForPlace(place: JeddahLocation, index: number, mood: string): { title: string; desc: string; proof: string } {
  switch (place.id) {
    case 'nasseef-house':
      return {
        title: 'Decode the Royal Roshan Lattices',
        desc: 'Approach the historic stone plaza in Al-Balad. Look up at the massive dark teak Roshan bay windows carved over 140 years ago.',
        proof: 'Capture a photo showing the intricate wooden Roshan bay window against the coral limestone wall.',
      };
    case 'bab-makkah':
      return {
        title: 'Cross the Ancient Eastern Portal',
        desc: 'Reach the historic triple-arched gate where centuries of travelers set foot on the caravan trail toward Makkah.',
        proof: 'Take a photo framing the white arched battlements with the bustling street market.',
      };
    case 'souq-al-alawi':
      return {
        title: 'Follow the Frankincense & Cardamom Trail',
        desc: 'Walk into the oldest covered alleyways of Al-Balad. Find an authentic spice merchant displaying raw frankincense and golden saffron.',
        proof: 'Take a photo of the traditional spice jars or the wooden-canopied market corridor.',
      };
    case 'baeshen-house':
      return {
        title: 'Uncover the 1856 Merchant Sanctuary',
        desc: 'Step into Baeshen House. Observe the vintage teak carpentry and sample freshly poured mint-infused black tea in the stone courtyard.',
        proof: 'Photograph the courtyard architecture or the classic brass tea service with teak woodwork.',
      };
    case 'king-fahd-fountain':
      return {
        title: 'Catch the Skyward Saltwater Plume',
        desc: 'Walk along the Palestine Street granite promenade on the Al-Hamra waterfront as the saltwater column pierces the sky.',
        proof: 'Take a photo showing the towering water plume against the Red Sea coastline.',
      };
    case 'al-rahma-floating-mosque':
      return {
        title: 'Stand Between Sea and Sky',
        desc: 'Stroll along the pedestrian pier out to the white domed mosque standing on stilts over the azure Red Sea waters.',
        proof: 'Capture the white domes and sea stilts with the turquoise Red Sea waters beneath.',
      };
    case 'jeddah-art-promenade':
      return {
        title: 'Spot the Golden Falcon on the Horizon',
        desc: 'Stroll the breezy pedestrian walkway in Ash Shati and locate the monumental golden falcon sculpture.',
        proof: 'Photograph the golden falcon sculpture or public coastal art installation.',
      };
    case 'sculpture-park-middle-corniche':
      return {
        title: 'Locate the Monumental Modern Masterpiece',
        desc: 'Explore the open-air sculpture garden on the Corniche. Find the bronze or stone sculpture and read its artist plaque.',
        proof: 'Take a photo showing the public sculpture with the Red Sea or Corniche lawn in view.',
      };
    case 'medd-cafe':
      return {
        title: 'Experience Red Sea Specialty Brewing',
        desc: 'Step inside Medd on the Corniche. Spot their custom coffee roaster and order a signature single-origin brew.',
        proof: 'Take a photo of the "MEDD" cafe signage or your brew counter with the coastal view.',
      };
    case 'cup-and-couch':
      return {
        title: 'Find the Literary Sanctuary',
        desc: 'Enter Cup & Couch in Al-Andalus. Spot the floor-to-ceiling bookshelf and cozy seating nook.',
        proof: 'Photograph the book-lined wall or the artisanal pour-over coffee bar.',
      };
    case 'barns-coffee-rawdah':
      return {
        title: 'Taste Jeddah\'s 1992 Coffee Heritage',
        desc: 'Visit Barn\'s in Al-Rawdah, the legendary homegrown Saudi brand that started on these streets in 1992.',
        proof: 'Capture the iconic Barn\'s logo sign or your Saudi coffee / Karak cup.',
      };
    case 'al-nakheel-restaurant':
      return {
        title: 'Savor the Open-Air Majlis Breeze',
        desc: 'Arrive at Al-Nakheel along the North Corniche. Take a seat in the open-air palm courtyard.',
        proof: 'Take a photo of the outdoor palm majlis seating or the clay oven area.',
      };
    case 'section-b-burgers':
      return {
        title: 'Visit the Home of Jeddah\'s Gourmet Rebel',
        desc: 'Head to Section-B in Al-Andalus. Find the minimalist industrial entrance marked with the famous "B" logo.',
        proof: 'Capture the exterior "Section-B" signage or open kitchen counter.',
      };
    case 'athr-gallery':
      return {
        title: 'Witness Saudi Contemporary Vision',
        desc: 'Ascend to Athr Gallery in Al-Rawdah. Stand before the current featured Saudi or international installation.',
        proof: 'Take a photo of the exhibition space or the ATHR gallery entrance logo.',
      };
    case 'teamlab-borderless-jeddah':
      return {
        title: 'Venture into Borderless Digital Lights',
        desc: 'Enter the 10,000-sqm digital universe in Al-Balad. Stand in the cascading light projections.',
        proof: 'Photograph the illuminated light projection room or digital waterfall.',
      };
    case 'tayebat-museum':
      return {
        title: 'Enter the Palatial Maze of 300 Chambers',
        desc: 'Step into the Al Tayebat International City. Marvel at the multi-tiered coral stone towers and ornate woodcarvings.',
        proof: 'Take a photo of the dramatic palatial exterior facade with its wooden Roshan balconies.',
      };
    case 'hayy-jameel':
      return {
        title: 'Discover the Creative Oasis of Hayy Jameel',
        desc: 'Visit Hayy Jameel in Al-Mohammadiyyah. Explore the geometric central courtyard and community art hub.',
        proof: 'Photograph the "HAYY" signage or the distinctive geometric architectural facade.',
      };
    case 'obhur-beach-creek':
      return {
        title: 'Catch the Indigo Creek Twilight',
        desc: 'Head to Sharm Obhur North Creek. Walk out onto the wooden marina pier as the boats return at sunset.',
        proof: 'Capture the wooden boardwalk or the marina with boats moored in the creek.',
      };
    default:
      return {
        title: `Explore ${place.name}`,
        desc: `Navigate to ${place.name} in ${place.area}. Discover its unique architectural or cultural identity.`,
        proof: `Take a photo showing the venue storefront sign or recognizable entrance.`,
      };
  }
}

export function generateSideQuest(preferences: QuestPreferences): Quest {
  const matchedPlaces = matchPlacesForQuest(
    preferences.mood,
    preferences.time,
    preferences.budget,
    preferences.group
  );

  const titlesPool = QUEST_TITLES_BY_MOOD[preferences.mood] || QUEST_TITLES_BY_MOOD['adventurous'];
  const title = titlesPool[Math.floor(Math.random() * titlesPool.length)];

  const steps: QuestStep[] = matchedPlaces.map((place, idx) => {
    const challenge = generateChallengeForPlace(place, idx + 1, preferences.mood);
    return {
      stepNumber: idx + 1,
      location: place,
      challengeTitle: challenge.title,
      challengeDescription: challenge.desc,
      targetVisualProof: challenge.proof,
      verified: false,
    };
  });

  const totalMinutes = steps.reduce((acc, step) => acc + step.location.estimatedMinutes, 0);
  const totalCost = steps.reduce((acc, step) => acc + step.location.typicalCostSAR, 0);

  let difficulty: 'Easy' | 'Moderate' | 'Adventurous' = 'Easy';
  if (steps.length >= 3 || totalMinutes > 90) difficulty = 'Moderate';
  if (steps.length >= 4 || preferences.mood === 'adventurous') difficulty = 'Adventurous';

  // XP: 150 per verified step + 100 completion bonus
  const totalXP = steps.length * 150 + 100;

  const badgeReward =
    preferences.mood === 'cultural'
      ? { id: 'balad-historian', name: 'Al-Balad Historian', description: 'Explored historic Jeddah coral stone heritage and gates', icon: '🏛️' }
      : preferences.mood === 'creative'
      ? { id: 'creative-eye', name: 'Roshan Virtuoso', description: 'Documented public sculptures and contemporary galleries', icon: '🎨' }
      : preferences.mood === 'foodie'
      ? { id: 'roaster-connoisseur', name: 'Hijazi Connoisseur', description: 'Experienced authentic brews and local culinary landmarks', icon: '☕' }
      : preferences.mood === 'relaxing'
      ? { id: 'red-sea-wanderer', name: 'Red Sea Wanderer', description: 'Traversed the coastal promenades and ocean landmarks', icon: '🌊' }
      : { id: 'jeddah-adventurer', name: 'Jeddah Explorer', description: 'Completed a real-world Jeddah Side Quest', icon: '🧭' };

  return {
    id: `quest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    tagline: `A real-world ${preferences.mood} adventure across ${matchedPlaces.map((p) => p.area).filter((v, i, a) => a.indexOf(v) === i).join(' & ')}`,
    description: `Designed for ${preferences.group} with ${preferences.time.replace('_', ' ')} available and ${preferences.budget} budget. Leave your screen behind and experience real Jeddah.`,
    preferences,
    estimatedTotalMinutes: totalMinutes,
    estimatedCostSAR: totalCost,
    difficulty,
    steps,
    totalXP,
    badgeReward,
    createdAt: new Date().toISOString(),
  };
}

export function generateSurpriseQuest(timeDuration: '30m' | '1h' | '2h' = '1h'): Quest {
  const moods: ('relaxing' | 'social' | 'adventurous' | 'creative' | 'foodie' | 'cultural' | 'spontaneous')[] = [
    'adventurous', 'creative', 'foodie', 'cultural', 'spontaneous', 'relaxing'
  ];
  const randomMood = moods[Math.floor(Math.random() * moods.length)];
  const randomGroup = 'alone';
  const randomBudget = 'flexible';

  return generateSideQuest({
    mood: randomMood,
    time: timeDuration,
    budget: randomBudget,
    group: randomGroup,
  });
}

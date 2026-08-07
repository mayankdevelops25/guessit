// Shared content: single source of truth for client + server
// Keep this file isomorphic: no browser-only APIs

// Tag dimensions are per-category. Flat + open (PRD §12) so adding a category
// only means new rows + new chip_text, no schema change.
export type TagSet = Record<string, any>

export type Answer = {
  id: string
  label: string
  emoji: string
  tags: TagSet
  fact: string
  color: string
  category?: string
  /** ISO 3166-1 alpha-2 code for flag images */
  iso?: string
  /** Brand website domain for logo fetch */
  domain?: string
  /** Era tag for historical figures */
  era?: string
  /** Wikipedia page title for portrait images */
  wiki?: string
}

export type ChipDef = {
  id: string
  text: string
  check: (a: Answer) => boolean
}

// ── CATEGORY 1: ANIMALS (50 answers) ───────────────────────────────────
// tags: size, habitat, mammal, predator, nocturnal, domestic, canFly,
//       patterned, livesAfrica, longNeck
export const ANIMALS: Answer[] = [
  { id: 'elephant', label: 'Elephant', emoji: '🐘', tags: { size: 'huge', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: false }, fact: 'The largest land mammal. It can hear with its feet.', color: '#E8E0D6' },
  { id: 'tiger', label: 'Tiger', emoji: '🐯', tags: { size: 'large', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false }, fact: 'No two tigers have the same stripe pattern.', color: '#FFD6A8' },
  { id: 'penguin', label: 'Penguin', emoji: '🐧', tags: { size: 'medium', habitat: 'amphibious', mammal: false, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false }, fact: 'Flightless but torpedoes underwater at 22 mph.', color: '#D0E8FF' },
  { id: 'dolphin', label: 'Dolphin', emoji: '🐬', tags: { size: 'large', habitat: 'water', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Sleeps with one eye open because half its brain stays awake.', color: '#C8F0FF' },
  { id: 'eagle', label: 'Eagle', emoji: '🦅', tags: { size: 'medium', habitat: 'air', mammal: false, predator: true, nocturnal: false, domestic: false, canFly: true, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Can spot prey from 2 miles away.', color: '#E2D5C3' },
  { id: 'kangaroo', label: 'Kangaroo', emoji: '🦘', tags: { size: 'large', habitat: 'land', mammal: true, predator: false, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Can’t walk backwards — hops at 35 mph.', color: '#FFCB8A' },
  { id: 'panda', label: 'Panda', emoji: '🐼', tags: { size: 'large', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false }, fact: 'Spends 12 hours a day eating bamboo.', color: '#F0F0F0' },
  { id: 'giraffe', label: 'Giraffe', emoji: '🦒', tags: { size: 'huge', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: true, longNeck: true }, fact: 'Same number of neck vertebrae as humans: seven.', color: '#FFE9A8' },
  { id: 'zebra', label: 'Zebra', emoji: '🦓', tags: { size: 'large', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: true, longNeck: false }, fact: 'Each zebra’s stripe pattern is unique like a fingerprint.', color: '#E8E8E8' },
  { id: 'lion', label: 'Lion', emoji: '🦁', tags: { size: 'large', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: false }, fact: 'A pride’s roar is heard 5 miles away.', color: '#FFD59E' },
  { id: 'wolf', label: 'Wolf', emoji: '🐺', tags: { size: 'medium', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Howls to assemble — each voice is distinct.', color: '#D9D9D9' },
  { id: 'owl', label: 'Owl', emoji: '🦉', tags: { size: 'small', habitat: 'air', mammal: false, predator: true, nocturnal: true, domestic: false, canFly: true, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Can rotate its head 270 degrees.', color: '#D6CBB8' },
  { id: 'bat', label: 'Bat', emoji: '🦇', tags: { size: 'tiny', habitat: 'air', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: true, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Only mammal capable of sustained flight.', color: '#CFCFD6' },
  { id: 'crocodile', label: 'Crocodile', emoji: '🐊', tags: { size: 'huge', habitat: 'amphibious', mammal: false, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: false }, fact: 'Holds breath for over an hour underwater.', color: '#B8D8B8' },
  { id: 'octopus', label: 'Octopus', emoji: '🐙', tags: { size: 'medium', habitat: 'water', mammal: false, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Three hearts and blue blood.', color: '#FFB3C6' },
  { id: 'shark', label: 'Shark', emoji: '🦈', tags: { size: 'huge', habitat: 'water', mammal: false, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Existed before trees — 400M years old.', color: '#8ECAE6' },
  { id: 'whale', label: 'Whale', emoji: '🐳', tags: { size: 'huge', habitat: 'water', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Heart the size of a golf cart.', color: '#A8D8EA' },
  { id: 'bee', label: 'Bee', emoji: '🐝', tags: { size: 'tiny', habitat: 'air', mammal: false, predator: false, nocturnal: false, domestic: false, canFly: true, patterned: true, livesAfrica: false, longNeck: false }, fact: 'Visits 5,000 flowers a day.', color: '#FFEB3B' },
  { id: 'butterfly', label: 'Butterfly', emoji: '🦋', tags: { size: 'tiny', habitat: 'air', mammal: false, predator: false, nocturnal: false, domestic: false, canFly: true, patterned: true, livesAfrica: false, longNeck: false }, fact: 'Tastes with its feet.', color: '#FFB5E8' },
  { id: 'chameleon', label: 'Chameleon', emoji: '🦎', tags: { size: 'small', habitat: 'land', mammal: false, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: true, longNeck: false }, fact: 'Eyes move independently — 360° vision.', color: '#B5E48C' },
  { id: 'koala', label: 'Koala', emoji: '🐨', tags: { size: 'small', habitat: 'land', mammal: true, predator: false, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Sleeps 20 hours a day — eucalyptus diet.', color: '#D8D0C8' },
  { id: 'polarbear', label: 'Polar Bear', emoji: '🐻‍❄️', tags: { size: 'huge', habitat: 'land', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Fur is transparent — skin is black underneath.', color: '#F5F5F5' },
  { id: 'camel', label: 'Camel', emoji: '🐪', tags: { size: 'huge', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: true, canFly: false, patterned: false, livesAfrica: true, longNeck: true }, fact: 'Humps store fat, not water — for desert fuel.', color: '#E6C9A8' },
  { id: 'fox', label: 'Fox', emoji: '🦊', tags: { size: 'small', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Uses magnetic field to hunt — pounces north.', color: '#FF9E6B' },
  // ── expansion ──
  { id: 'horse', label: 'Horse', emoji: '🐴', tags: { size: 'large', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: true, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Can sleep both standing up and lying down.', color: '#E0C4A8' },
  { id: 'dog', label: 'Dog', emoji: '🐕', tags: { size: 'medium', habitat: 'land', mammal: true, predator: true, nocturnal: false, domestic: true, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Its nose print is as unique as a fingerprint.', color: '#F0D9BE' },
  { id: 'cat', label: 'Cat', emoji: '🐈', tags: { size: 'small', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: true, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Spends about 70% of its life asleep.', color: '#F5E0C8' },
  { id: 'cow', label: 'Cow', emoji: '🐄', tags: { size: 'large', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: true, canFly: false, patterned: true, livesAfrica: false, longNeck: false }, fact: 'Has best friends and gets stressed when apart.', color: '#F2F2F2' },
  { id: 'sheep', label: 'Sheep', emoji: '🐑', tags: { size: 'medium', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: true, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Recognises up to 50 other sheep faces.', color: '#EDEDE4' },
  { id: 'pig', label: 'Pig', emoji: '🐖', tags: { size: 'medium', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: true, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Smarter than a three-year-old child.', color: '#FFD6DE' },
  { id: 'chicken', label: 'Chicken', emoji: '🐔', tags: { size: 'small', habitat: 'land', mammal: false, predator: false, nocturnal: false, domestic: true, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'The closest living relative of the T. rex.', color: '#FFE7B0' },
  { id: 'deer', label: 'Deer', emoji: '🦌', tags: { size: 'medium', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Regrows its antlers from scratch every year.', color: '#E4C9A0' },
  { id: 'moose', label: 'Moose', emoji: '🫎', tags: { size: 'huge', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Can dive 20 feet underwater to reach plants.', color: '#D2BA9A' },
  { id: 'grizzly', label: 'Grizzly Bear', emoji: '🐻', tags: { size: 'huge', habitat: 'land', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Can smell food from 18 miles away.', color: '#D9B68C' },
  { id: 'rhino', label: 'Rhino', emoji: '🦏', tags: { size: 'huge', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: false }, fact: 'Its horn is made of keratin, like your fingernails.', color: '#D6D6CE' },
  { id: 'hippo', label: 'Hippo', emoji: '🦛', tags: { size: 'huge', habitat: 'amphibious', mammal: true, predator: false, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: false }, fact: 'Secretes its own natural red sunscreen.', color: '#E0C6D2' },
  { id: 'gorilla', label: 'Gorilla', emoji: '🦍', tags: { size: 'large', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: false }, fact: 'Shares about 98% of its DNA with humans.', color: '#C6C6C6' },
  { id: 'meerkat', label: 'Meerkat', emoji: '🦫', tags: { size: 'small', habitat: 'land', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: false }, fact: 'Always posts a lookout while the group forages.', color: '#E8D3AC' },
  { id: 'sloth', label: 'Sloth', emoji: '🦥', tags: { size: 'medium', habitat: 'land', mammal: true, predator: false, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Digesting one leaf can take a full month.', color: '#D8CDB4' },
  { id: 'otter', label: 'Otter', emoji: '🦦', tags: { size: 'small', habitat: 'amphibious', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Holds hands while sleeping so it doesn’t drift.', color: '#CBB9A0' },
  { id: 'seal', label: 'Seal', emoji: '🦭', tags: { size: 'large', habitat: 'amphibious', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false }, fact: 'Can slow its heart to 4 beats a minute when diving.', color: '#C4CFD8' },
  { id: 'turtle', label: 'Sea Turtle', emoji: '🐢', tags: { size: 'medium', habitat: 'water', mammal: false, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false }, fact: 'Returns to the exact beach where it hatched.', color: '#B9E3C6' },
  { id: 'frog', label: 'Frog', emoji: '🐸', tags: { size: 'tiny', habitat: 'amphibious', mammal: false, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false }, fact: 'Drinks water through its skin, never its mouth.', color: '#C6EFA0' },
  { id: 'snake', label: 'Snake', emoji: '🐍', tags: { size: 'medium', habitat: 'land', mammal: false, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false }, fact: 'Smells the air by flicking its forked tongue.', color: '#CFE8A8' },
  { id: 'parrot', label: 'Parrot', emoji: '🦜', tags: { size: 'small', habitat: 'air', mammal: false, predator: false, nocturnal: false, domestic: false, canFly: true, patterned: true, livesAfrica: false, longNeck: false }, fact: 'Some can learn vocabularies of 1,000+ words.', color: '#FFC2B4' },
  { id: 'flamingo', label: 'Flamingo', emoji: '🦩', tags: { size: 'medium', habitat: 'water', mammal: false, predator: false, nocturnal: false, domestic: false, canFly: true, patterned: false, livesAfrica: true, longNeck: true }, fact: 'Born grey — shrimp in its diet turn it pink.', color: '#FFC2D6' },
  { id: 'ostrich', label: 'Ostrich', emoji: '🪶', tags: { size: 'huge', habitat: 'land', mammal: false, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: true }, fact: 'Its eye is bigger than its brain.', color: '#E2D2BC' },
  { id: 'swan', label: 'Swan', emoji: '🦢', tags: { size: 'medium', habitat: 'water', mammal: false, predator: false, nocturnal: false, domestic: false, canFly: true, patterned: false, livesAfrica: false, longNeck: true }, fact: 'Mates for life and can live over 20 years.', color: '#F0F4F8' },
  { id: 'cheetah', label: 'Cheetah', emoji: '🐆', tags: { size: 'large', habitat: 'land', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: true, longNeck: false }, fact: '0 to 60 mph in three seconds flat.', color: '#FFDFA8' },
  { id: 'hyena', label: 'Hyena', emoji: '🐾', tags: { size: 'medium', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: true, livesAfrica: true, longNeck: false }, fact: 'Its "laugh" is actually a status signal.', color: '#DCCBA8' },
  { id: 'raccoon', label: 'Raccoon', emoji: '🦝', tags: { size: 'small', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false }, fact: 'Its paws have four times more sensors than ours.', color: '#D2D2DA' },
  { id: 'hedgehog', label: 'Hedgehog', emoji: '🦔', tags: { size: 'tiny', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Wears about 5,000 quills at any one time.', color: '#E0CFB8' },
  { id: 'squirrel', label: 'Squirrel', emoji: '🐿️', tags: { size: 'tiny', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Forgets thousands of nuts — accidentally plants forests.', color: '#E8C9A0' },
  { id: 'crab', label: 'Crab', emoji: '🦀', tags: { size: 'small', habitat: 'water', mammal: false, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Communicates by drumming and waving its claws.', color: '#FFBFA8' },
  { id: 'jellyfish', label: 'Jellyfish', emoji: '🪼', tags: { size: 'small', habitat: 'water', mammal: false, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false }, fact: 'Has survived 500 million years with no brain.', color: '#DCD0FF' },
]

export const CHIPS: ChipDef[] = [
  { id: 'bigger_than_cat', text: 'Is it bigger than a cat?', check: a => ['medium', 'large', 'huge'].includes(a.tags.size) },
  { id: 'bigger_than_human', text: 'Is it bigger than a human?', check: a => ['large', 'huge'].includes(a.tags.size) },
  { id: 'fits_in_hands', text: 'Could it fit in your hands?', check: a => a.tags.size === 'tiny' },
  { id: 'found_in_water', text: 'Is it found in water?', check: a => a.tags.habitat === 'water' || a.tags.habitat === 'amphibious' },
  { id: 'is_mammal', text: 'Is it a mammal?', check: a => a.tags.mammal },
  { id: 'is_predator', text: 'Does it eat meat?', check: a => a.tags.predator },
  { id: 'is_nocturnal', text: 'Is it nocturnal?', check: a => a.tags.nocturnal },
  { id: 'can_fly', text: 'Can it fly?', check: a => a.tags.canFly },
  { id: 'lives_wild', text: 'Does it live in the wild?', check: a => !a.tags.domestic },
  { id: 'has_pattern', text: 'Stripes or spots?', check: a => a.tags.patterned },
  { id: 'lives_africa', text: 'Is it found in Africa?', check: a => a.tags.livesAfrica },
  { id: 'long_neck', text: 'Does it have a long neck?', check: a => a.tags.longNeck },
]

// ── CATEGORY 2: COUNTRIES (50 answers) ─────────────────────────────────
// tags: continent, island, landlocked, population, hemisphere, euMember,
//       monarchy, spanishSpeaking, hostedOlympics, coldClimate
// `iso` drives the real flag image in the UI.
// Note: transcontinental states (Russia, Türkiye) excluded because
// "Is it in Europe?" would not resolve cleanly against them (chip clarity gate).
export const COUNTRIES: Answer[] = [
  { id: 'japan', label: 'Japan', emoji: '🇯🇵', iso: 'jp', tags: { continent: 'asia', island: true, landlocked: false, population: 'large', hemisphere: 'north', euMember: false, monarchy: true, spanishSpeaking: false, hostedOlympics: true, coldClimate: true }, fact: 'Made of 14,000+ islands — only 430 are inhabited.', color: '#FFD6DC' },
  { id: 'brazil', label: 'Brazil', emoji: '🇧🇷', iso: 'br', tags: { continent: 'south-america', island: false, landlocked: false, population: 'large', hemisphere: 'south', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: true, coldClimate: false }, fact: 'Home to 60% of the Amazon rainforest.', color: '#C8F0C8' },
  { id: 'egypt', label: 'Egypt', emoji: '🇪🇬', iso: 'eg', tags: { continent: 'africa', island: false, landlocked: false, population: 'large', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'The Nile runs 4,130 miles through it.', color: '#F0E0B0' },
  { id: 'canada', label: 'Canada', emoji: '🇨🇦', iso: 'ca', tags: { continent: 'north-america', island: false, landlocked: false, population: 'medium', hemisphere: 'north', euMember: false, monarchy: true, spanishSpeaking: false, hostedOlympics: true, coldClimate: true }, fact: 'Has more lakes than the rest of the world combined.', color: '#FFD0D0' },
  { id: 'france', label: 'France', emoji: '🇫🇷', iso: 'fr', tags: { continent: 'europe', island: false, landlocked: false, population: 'large', hemisphere: 'north', euMember: true, monarchy: false, spanishSpeaking: false, hostedOlympics: true, coldClimate: false }, fact: 'The most visited country on Earth.', color: '#D0DCFF' },
  { id: 'iceland', label: 'Iceland', emoji: '🇮🇸', iso: 'is', tags: { continent: 'europe', island: true, landlocked: false, population: 'small', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: true }, fact: 'Runs almost entirely on geothermal energy.', color: '#DCF0FF' },
  { id: 'australia', label: 'Australia', emoji: '🇦🇺', iso: 'au', tags: { continent: 'oceania', island: true, landlocked: false, population: 'medium', hemisphere: 'south', euMember: false, monarchy: true, spanishSpeaking: false, hostedOlympics: true, coldClimate: false }, fact: 'The only country that is also a continent.', color: '#FFE0B0' },
  { id: 'india', label: 'India', emoji: '🇮🇳', iso: 'in', tags: { continent: 'asia', island: false, landlocked: false, population: 'large', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'The most populous country in the world.', color: '#FFE4C0' },
  { id: 'mexico', label: 'Mexico', emoji: '🇲🇽', iso: 'mx', tags: { continent: 'north-america', island: false, landlocked: false, population: 'large', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: true, hostedOlympics: true, coldClimate: false }, fact: 'Introduced chocolate, corn and chillies to the world.', color: '#C8E8C8' },
  { id: 'norway', label: 'Norway', emoji: '🇳🇴', iso: 'no', tags: { continent: 'europe', island: false, landlocked: false, population: 'small', hemisphere: 'north', euMember: false, monarchy: true, spanishSpeaking: false, hostedOlympics: true, coldClimate: true }, fact: 'The midnight sun never sets for 76 days.', color: '#E0E8FF' },
  { id: 'kenya', label: 'Kenya', emoji: '🇰🇪', iso: 'ke', tags: { continent: 'africa', island: false, landlocked: false, population: 'large', hemisphere: 'south', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'The Great Rift Valley splits it in two.', color: '#D8F0C0' },
  { id: 'switzerland', label: 'Switzerland', emoji: '🇨🇭', iso: 'ch', tags: { continent: 'europe', island: false, landlocked: true, population: 'small', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: true, coldClimate: true }, fact: 'Has enough nuclear shelters for its whole population.', color: '#FFD8D8' },
  { id: 'argentina', label: 'Argentina', emoji: '🇦🇷', iso: 'ar', tags: { continent: 'south-america', island: false, landlocked: false, population: 'medium', hemisphere: 'south', euMember: false, monarchy: false, spanishSpeaking: true, hostedOlympics: false, coldClimate: false }, fact: 'Home to Aconcagua, the tallest peak outside Asia.', color: '#D0ECFF' },
  { id: 'china', label: 'China', emoji: '🇨🇳', iso: 'cn', tags: { continent: 'asia', island: false, landlocked: false, population: 'large', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: true, coldClimate: true }, fact: 'Spans five geographic time zones but uses one.', color: '#FFD0C0' },
  { id: 'spain', label: 'Spain', emoji: '🇪🇸', iso: 'es', tags: { continent: 'europe', island: false, landlocked: false, population: 'medium', hemisphere: 'north', euMember: true, monarchy: true, spanishSpeaking: true, hostedOlympics: true, coldClimate: false }, fact: 'Has the second-most UNESCO World Heritage cities.', color: '#FFE0C8' },
  { id: 'newzealand', label: 'New Zealand', emoji: '🇳🇿', iso: 'nz', tags: { continent: 'oceania', island: true, landlocked: false, population: 'small', hemisphere: 'south', euMember: false, monarchy: true, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'Has roughly five sheep for every person.', color: '#D0F0E0' },
  { id: 'nigeria', label: 'Nigeria', emoji: '🇳🇬', iso: 'ng', tags: { continent: 'africa', island: false, landlocked: false, population: 'large', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'Nollywood is the world’s second-largest film industry.', color: '#C8EAD0' },
  { id: 'italy', label: 'Italy', emoji: '🇮🇹', iso: 'it', tags: { continent: 'europe', island: false, landlocked: false, population: 'large', hemisphere: 'north', euMember: true, monarchy: false, spanishSpeaking: false, hostedOlympics: true, coldClimate: false }, fact: 'Contains two entire countries inside its borders.', color: '#D8F0D0' },
  { id: 'peru', label: 'Peru', emoji: '🇵🇪', iso: 'pe', tags: { continent: 'south-america', island: false, landlocked: false, population: 'medium', hemisphere: 'south', euMember: false, monarchy: false, spanishSpeaking: true, hostedOlympics: false, coldClimate: false }, fact: 'Machu Picchu sits 7,970 feet above sea level.', color: '#FFD8CC' },
  { id: 'mongolia', label: 'Mongolia', emoji: '🇲🇳', iso: 'mn', tags: { continent: 'asia', island: false, landlocked: true, population: 'small', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: true }, fact: 'The least densely populated country on Earth.', color: '#E8DCC0' },
  { id: 'southafrica', label: 'South Africa', emoji: '🇿🇦', iso: 'za', tags: { continent: 'africa', island: false, landlocked: false, population: 'large', hemisphere: 'south', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'Has three capital cities.', color: '#D8E8C0' },
  { id: 'germany', label: 'Germany', emoji: '🇩🇪', iso: 'de', tags: { continent: 'europe', island: false, landlocked: false, population: 'large', hemisphere: 'north', euMember: true, monarchy: false, spanishSpeaking: false, hostedOlympics: true, coldClimate: true }, fact: 'Has over 1,500 different kinds of beer.', color: '#E8E8D0' },
  { id: 'chile', label: 'Chile', emoji: '🇨🇱', iso: 'cl', tags: { continent: 'south-america', island: false, landlocked: false, population: 'medium', hemisphere: 'south', euMember: false, monarchy: false, spanishSpeaking: true, hostedOlympics: false, coldClimate: true }, fact: 'Stretches 2,653 miles but averages 110 miles wide.', color: '#FFDCDC' },
  { id: 'nepal', label: 'Nepal', emoji: '🇳🇵', iso: 'np', tags: { continent: 'asia', island: false, landlocked: true, population: 'medium', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: true }, fact: 'The only country without a rectangular flag.', color: '#E0DCFF' },
  // ── expansion ──
  { id: 'usa', label: 'United States', emoji: '🇺🇸', iso: 'us', tags: { continent: 'north-america', island: false, landlocked: false, population: 'large', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: true, coldClimate: true }, fact: 'Has no official national language at federal level.', color: '#D6DFFF' },
  { id: 'uk', label: 'United Kingdom', emoji: '🇬🇧', iso: 'gb', tags: { continent: 'europe', island: true, landlocked: false, population: 'large', hemisphere: 'north', euMember: false, monarchy: true, spanishSpeaking: false, hostedOlympics: true, coldClimate: false }, fact: 'London has hosted the Olympics three times.', color: '#DCE0F5' },
  { id: 'ireland', label: 'Ireland', emoji: '🇮🇪', iso: 'ie', tags: { continent: 'europe', island: true, landlocked: false, population: 'small', hemisphere: 'north', euMember: true, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'There are no wild snakes anywhere on the island.', color: '#CDEBCF' },
  { id: 'netherlands', label: 'Netherlands', emoji: '🇳🇱', iso: 'nl', tags: { continent: 'europe', island: false, landlocked: false, population: 'medium', hemisphere: 'north', euMember: true, monarchy: true, spanishSpeaking: false, hostedOlympics: true, coldClimate: false }, fact: 'A quarter of the country sits below sea level.', color: '#FFE2CC' },
  { id: 'sweden', label: 'Sweden', emoji: '🇸🇪', iso: 'se', tags: { continent: 'europe', island: false, landlocked: false, population: 'medium', hemisphere: 'north', euMember: true, monarchy: true, spanishSpeaking: false, hostedOlympics: true, coldClimate: true }, fact: 'Recycles so well it has imported rubbish for fuel.', color: '#DCE8FF' },
  { id: 'finland', label: 'Finland', emoji: '🇫🇮', iso: 'fi', tags: { continent: 'europe', island: false, landlocked: false, population: 'small', hemisphere: 'north', euMember: true, monarchy: false, spanishSpeaking: false, hostedOlympics: true, coldClimate: true }, fact: 'Has more saunas than cars.', color: '#E4F0FF' },
  { id: 'poland', label: 'Poland', emoji: '🇵🇱', iso: 'pl', tags: { continent: 'europe', island: false, landlocked: false, population: 'medium', hemisphere: 'north', euMember: true, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: true }, fact: 'Home to Europe’s last primeval lowland forest.', color: '#FFDEE2' },
  { id: 'austria', label: 'Austria', emoji: '🇦🇹', iso: 'at', tags: { continent: 'europe', island: false, landlocked: true, population: 'small', hemisphere: 'north', euMember: true, monarchy: false, spanishSpeaking: false, hostedOlympics: true, coldClimate: true }, fact: 'The croissant was invented in Vienna, not Paris.', color: '#FFDCDC' },
  { id: 'czechia', label: 'Czechia', emoji: '🇨🇿', iso: 'cz', tags: { continent: 'europe', island: false, landlocked: true, population: 'small', hemisphere: 'north', euMember: true, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: true }, fact: 'Drinks more beer per person than anywhere else.', color: '#E0E0F5' },
  { id: 'greece', label: 'Greece', emoji: '🇬🇷', iso: 'gr', tags: { continent: 'europe', island: false, landlocked: false, population: 'medium', hemisphere: 'north', euMember: true, monarchy: false, spanishSpeaking: false, hostedOlympics: true, coldClimate: false }, fact: 'Birthplace of the Olympics — and it hosted them twice.', color: '#D6EAFF' },
  { id: 'portugal', label: 'Portugal', emoji: '🇵🇹', iso: 'pt', tags: { continent: 'europe', island: false, landlocked: false, population: 'medium', hemisphere: 'north', euMember: true, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'The world’s oldest bookshop has traded since 1732.', color: '#D8EFD4' },
  { id: 'thailand', label: 'Thailand', emoji: '🇹🇭', iso: 'th', tags: { continent: 'asia', island: false, landlocked: false, population: 'large', hemisphere: 'north', euMember: false, monarchy: true, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'The only Southeast Asian nation never colonised.', color: '#FFE0EC' },
  { id: 'vietnam', label: 'Vietnam', emoji: '🇻🇳', iso: 'vn', tags: { continent: 'asia', island: false, landlocked: false, population: 'large', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'The world’s largest cave, Sơn Đoòng, has its own clouds.', color: '#FFE4C4' },
  { id: 'southkorea', label: 'South Korea', emoji: '🇰🇷', iso: 'kr', tags: { continent: 'asia', island: false, landlocked: false, population: 'large', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: true, coldClimate: true }, fact: 'Has the world’s fastest average internet speeds.', color: '#E8E4FF' },
  { id: 'philippines', label: 'Philippines', emoji: '🇵🇭', iso: 'ph', tags: { continent: 'asia', island: true, landlocked: false, population: 'large', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'An archipelago of over 7,600 islands.', color: '#DCF2FF' },
  { id: 'singapore', label: 'Singapore', emoji: '🇸🇬', iso: 'sg', tags: { continent: 'asia', island: true, landlocked: false, population: 'small', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'A city, an island and a country all at once.', color: '#FFDCE0' },
  { id: 'pakistan', label: 'Pakistan', emoji: '🇵🇰', iso: 'pk', tags: { continent: 'asia', island: false, landlocked: false, population: 'large', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: true }, fact: 'Has five of the world’s fourteen highest peaks.', color: '#CFE8D4' },
  { id: 'saudiarabia', label: 'Saudi Arabia', emoji: '🇸🇦', iso: 'sa', tags: { continent: 'asia', island: false, landlocked: false, population: 'medium', hemisphere: 'north', euMember: false, monarchy: true, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'Has no permanent rivers anywhere in the country.', color: '#D4E8D0' },
  { id: 'morocco', label: 'Morocco', emoji: '🇲🇦', iso: 'ma', tags: { continent: 'africa', island: false, landlocked: false, population: 'medium', hemisphere: 'north', euMember: false, monarchy: true, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'Home to the world’s oldest continually running university.', color: '#FFD8D0' },
  { id: 'ethiopia', label: 'Ethiopia', emoji: '🇪🇹', iso: 'et', tags: { continent: 'africa', island: false, landlocked: true, population: 'large', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'Follows its own calendar — and it’s seven years behind.', color: '#E0F0C8' },
  { id: 'ghana', label: 'Ghana', emoji: '🇬🇭', iso: 'gh', tags: { continent: 'africa', island: false, landlocked: false, population: 'medium', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'Sits closer to the map’s 0,0 point than any other land.', color: '#FFE8C0' },
  { id: 'tanzania', label: 'Tanzania', emoji: '🇹🇿', iso: 'tz', tags: { continent: 'africa', island: false, landlocked: false, population: 'large', hemisphere: 'south', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'Kilimanjaro is the tallest free-standing mountain on Earth.', color: '#D0EFD8' },
  { id: 'colombia', label: 'Colombia', emoji: '🇨🇴', iso: 'co', tags: { continent: 'south-america', island: false, landlocked: false, population: 'large', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: true, hostedOlympics: false, coldClimate: false }, fact: 'The only South American country on two oceans.', color: '#FFF0C4' },
  { id: 'bolivia', label: 'Bolivia', emoji: '🇧🇴', iso: 'bo', tags: { continent: 'south-america', island: false, landlocked: true, population: 'medium', hemisphere: 'south', euMember: false, monarchy: false, spanishSpeaking: true, hostedOlympics: false, coldClimate: true }, fact: 'Salar de Uyuni becomes the world’s largest mirror.', color: '#E8F0D8' },
  { id: 'cuba', label: 'Cuba', emoji: '🇨🇺', iso: 'cu', tags: { continent: 'north-america', island: true, landlocked: false, population: 'medium', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: true, hostedOlympics: false, coldClimate: false }, fact: 'The largest island in the Caribbean.', color: '#D8E4FF' },
  { id: 'jamaica', label: 'Jamaica', emoji: '🇯🇲', iso: 'jm', tags: { continent: 'north-america', island: true, landlocked: false, population: 'small', hemisphere: 'north', euMember: false, monarchy: true, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'The first country outside Europe to qualify for a Winter Olympics bobsleigh.', color: '#E8F0C0' },
  { id: 'fiji', label: 'Fiji', emoji: '🇫🇯', iso: 'fj', tags: { continent: 'oceania', island: true, landlocked: false, population: 'small', hemisphere: 'south', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'Made up of more than 330 islands.', color: '#CCEFFF' },
]

export const COUNTRY_CHIPS: ChipDef[] = [
  { id: 'in_europe', text: 'Is it in Europe?', check: a => a.tags.continent === 'europe' },
  { id: 'in_asia', text: 'Is it in Asia?', check: a => a.tags.continent === 'asia' },
  { id: 'in_africa', text: 'Is it in Africa?', check: a => a.tags.continent === 'africa' },
  { id: 'in_americas', text: 'Is it in the Americas?', check: a => a.tags.continent === 'north-america' || a.tags.continent === 'south-america' },
  { id: 'northern_hemisphere', text: 'Is it in the northern hemisphere?', check: a => a.tags.hemisphere === 'north' },
  { id: 'is_island', text: 'Is it an island nation?', check: a => a.tags.island === true },
  { id: 'is_landlocked', text: 'Is it landlocked?', check: a => a.tags.landlocked === true },
  { id: 'big_population', text: 'Does it have over 50 million people?', check: a => a.tags.population === 'large' },
  { id: 'spanish_speaking', text: 'Is Spanish the main language?', check: a => a.tags.spanishSpeaking === true },
  { id: 'has_monarch', text: 'Does it still have a monarch?', check: a => a.tags.monarchy === true },
  { id: 'hosted_olympics', text: 'Has it hosted the Olympics?', check: a => a.tags.hostedOlympics === true },
  { id: 'cold_climate', text: 'Does it get snowy winters?', check: a => a.tags.coldClimate === true },
]

// ── CATEGORY 3: COMPANIES (50 big-name brands) ─────────────────────────
// tags: industry, isTech, usaBased, centuryOld, publiclyTraded,
//       hasRetailStores, makesElectronics, makesCars, foodOrDrink,
//       fashionApparel, entertainment, bigBoxRetail, foundedAfter2000
// No iso → the UI renders the brand emoji (companies have no flag).
export const COMPANIES: Answer[] = [
  { id: 'apple', label: 'Apple', emoji: '🍎', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: true, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Started in a garage — now the world’s most valuable company.', color: '#E8E8E8' },
  { id: 'amazon', label: 'Amazon', emoji: '📦', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Began as a bookstore — now ships everything, everywhere.', color: '#FFE8B0' },
  { id: 'google', label: 'Google', emoji: '🔍', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Its name is a misspelling of “googol” — a 1 with 100 zeros.', color: '#FFD6D6' },
  { id: 'microsoft', label: 'Microsoft', emoji: '🪟', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: true, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Saved Apple from bankruptcy with a $150M investment in 1997.', color: '#D0E0FF' },
  { id: 'meta', label: 'Meta', emoji: '👥', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: true }, fact: 'Renamed from Facebook in 2021 to bet on the “metaverse.”', color: '#C8D4FF' },
  { id: 'netflix', label: 'Netflix', emoji: '🎬', tags: { industry: 'entertainment', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: true, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Once mailed DVDs — its most-watched rental was “Crash.”', color: '#FFB0B0' },
  { id: 'nvidia', label: 'Nvidia', emoji: '🎮', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: true, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Its chips now power most of the world’s AI.', color: '#C0F0B0' },
  { id: 'adobe', label: 'Adobe', emoji: '🎨', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Named after a river that ran behind its founders’ houses.', color: '#FFD8C0' },
  { id: 'intel', label: 'Intel', emoji: '💠', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: true, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Its “Intel Inside” stickers made a chip a household name.', color: '#C8E8FF' },
  { id: 'ibm', label: 'IBM', emoji: '💼', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: true, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Once made typewriters, scales and meat slicers.', color: '#D8DCFF' },
  { id: 'cisco', label: 'Cisco', emoji: '🌐', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: true, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Its logo is the Golden Gate Bridge — near where it began.', color: '#C8F0F0' },
  { id: 'spotify', label: 'Spotify', emoji: '🎵', tags: { industry: 'entertainment', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: true, bigBoxRetail: false, foundedAfter2000: true }, fact: 'Born in Sweden — now streams to over 600M people.', color: '#C8F0C8' },
  { id: 'uber', label: 'Uber', emoji: '🚕', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: true }, fact: 'Its name means “above all” in German.', color: '#E0DCFF' },
  { id: 'airbnb', label: 'Airbnb', emoji: '🏠', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: true }, fact: 'Funded its start by selling Obama-themed cereal boxes.', color: '#FFDBC8' },
  { id: 'salesforce', label: 'Salesforce', emoji: '☁️', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Pioneered selling software as a subscription in the cloud.', color: '#C8F0FF' },
  { id: 'oracle', label: 'Oracle', emoji: '🔶', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'A CIA project gave the company its code name.', color: '#FFD8B0' },
  { id: 'nike', label: 'Nike', emoji: '✔️', tags: { industry: 'fashion', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'The swoosh was designed by a student for just $35.', color: '#E8E8E8' },
  { id: 'adidas', label: 'Adidas', emoji: '👟', tags: { industry: 'fashion', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Founded by the brother of the man who started Puma.', color: '#D8D8D8' },
  { id: 'zara', label: 'Zara', emoji: '🛍️', tags: { industry: 'fashion', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Can take a design from sketch to store in two weeks.', color: '#FFE0C8' },
  { id: 'handm', label: 'H&M', emoji: '👕', tags: { industry: 'fashion', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Its name stands for Hennes & Mauritz.', color: '#FFD8D0' },
  { id: 'gucci', label: 'Gucci', emoji: '👜', tags: { industry: 'fashion', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Started as a luggage maker for Italian horsemen.', color: '#D8F0D0' },
  { id: 'louisvuitton', label: 'Louis Vuitton', emoji: '🧳', tags: { industry: 'fashion', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Began as a trunk-maker who flattened lids for stacking.', color: '#E0C8A0' },
  { id: 'chanel', label: 'Chanel', emoji: '🧴', tags: { industry: 'fashion', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: false, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'The little black dress was popularised by its founder.', color: '#E0E0E0' },
  { id: 'hermes', label: 'Hermès', emoji: '🧣', tags: { industry: 'fashion', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Began as a saddle maker — its logo still shows a horse.', color: '#F0D8A0' },
  { id: 'levis', label: "Levi's", emoji: '👖', tags: { industry: 'fashion', isTech: false, usaBased: true, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Invented the blue jean during the Gold Rush.', color: '#C8D8F0' },
  { id: 'cocacola', label: 'Coca-Cola', emoji: '🥤', tags: { industry: 'food', isTech: false, usaBased: true, centuryOld: true, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Only two executives ever knew its secret formula.', color: '#FFC8C8' },
  { id: 'pepsico', label: 'Pepsi-Cola', emoji: '🧃', tags: { industry: 'food', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Once offered to buy itself to Coca-Cola — and was refused.', color: '#C8D8FF' },
  { id: 'mcdonalds', label: "McDonald's", emoji: '🍔', tags: { industry: 'food', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Its golden arches are among the most recognised symbols on Earth.', color: '#FFE8A0' },
  { id: 'starbucks', label: 'Starbucks', emoji: '☕', tags: { industry: 'food', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Its logo is a mythical two-tailed mermaid.', color: '#C8E0C8' },
  { id: 'nestle', label: 'Nestlé', emoji: '🍫', tags: { industry: 'food', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'The world’s largest food company — over 2,000 brands.', color: '#FFE0D0' },
  { id: 'redbull', label: 'Red Bull', emoji: '⚡', tags: { industry: 'food', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: false, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Sells a billion cans a year of one core recipe.', color: '#C8D0FF' },
  { id: 'subway', label: 'Subway', emoji: '🥪', tags: { industry: 'food', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: false, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Has more locations worldwide than any other restaurant chain.', color: '#D8E0A0' },
  { id: 'kfc', label: 'KFC', emoji: '🍗', tags: { industry: 'food', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: false, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Colonel Sanders only wore his white suit once dyed, then reverted.', color: '#FFD8A0' },
  { id: 'tesla', label: 'Tesla', emoji: '🔋', tags: { industry: 'automotive', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: true, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: true }, fact: 'Named for Nikola Tesla, who never owned the company.', color: '#E0E0E0' },
  { id: 'toyota', label: 'Toyota', emoji: '🚙', tags: { industry: 'automotive', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: true, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Began as a loom-maker before it ever built a car.', color: '#FFD8D8' },
  { id: 'ford', label: 'Ford', emoji: '🚚', tags: { industry: 'automotive', isTech: false, usaBased: true, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: true, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Pioneered the moving assembly line in 1913.', color: '#C8D0FF' },
  { id: 'honda', label: 'Honda', emoji: '🏍️', tags: { industry: 'automotive', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: true, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'The world’s largest engine manufacturer.', color: '#FFD8C8' },
  { id: 'bmw', label: 'BMW', emoji: '🚘', tags: { industry: 'automotive', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: true, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Started by building aircraft engines in wartime.', color: '#D8E8FF' },
  { id: 'ferrari', label: 'Ferrari', emoji: '🏎️', tags: { industry: 'automotive', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: true, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Only makes about 13,000 cars a year — by design.', color: '#FFB0B0' },
  { id: 'mercedes', label: 'Mercedes-Benz', emoji: '🌟', tags: { industry: 'automotive', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: true, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Built the very first car, back in 1886.', color: '#E0E0E0' },
  { id: 'disney', label: 'Disney', emoji: '🏰', tags: { industry: 'entertainment', isTech: false, usaBased: true, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: true, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Mickey Mouse’s first cartoon had no spoken dialogue.', color: '#C8E0FF' },
  { id: 'nintendo', label: 'Nintendo', emoji: '🕹️', tags: { industry: 'gaming', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: true, hasRetailStores: false, makesElectronics: true, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: true, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Started in 1889 making hand-painted playing cards.', color: '#FFC8D0' },
  { id: 'sony', label: 'Sony', emoji: '📺', tags: { industry: 'electronics', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: true, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: true, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Made Japan’s first transistor radio — and the Walkman.', color: '#E0E0E0' },
  { id: 'samsung', label: 'Samsung', emoji: '📱', tags: { industry: 'electronics', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: true, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Began as a grocery trading company in 1938.', color: '#C8D8FF' },
  { id: 'lego', label: 'Lego', emoji: '🧱', tags: { industry: 'toys', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: false, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Its name means “play well” in Danish.', color: '#FFD8A0' },
  { id: 'walmart', label: 'Walmart', emoji: '🛒', tags: { industry: 'retail', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: true, foundedAfter2000: false }, fact: 'The largest company in the world by revenue.', color: '#FFD8C0' },
  { id: 'costco', label: 'Costco', emoji: '🏬', tags: { industry: 'retail', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: true, foundedAfter2000: false }, fact: 'Famous for $1.50 hot-dog-and-soda combo — unchanged since 1985.', color: '#FFD8D8' },
  { id: 'target', label: 'Target', emoji: '🎯', tags: { industry: 'retail', isTech: false, usaBased: true, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: true, foundedAfter2000: false }, fact: 'Its bull-terrier mascot “Bullseye” has its own agent.', color: '#FFC8C8' },
  { id: 'ikea', label: 'IKEA', emoji: '🛋️', tags: { industry: 'retail', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: false, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: true, foundedAfter2000: false }, fact: 'Product names follow a code — beds are Swedish places.', color: '#FFD8B0' },
  { id: 'visa', label: 'Visa', emoji: '💳', tags: { industry: 'finance', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Handles over 150 million transactions every single day.', color: '#C8D8FF' },
]

export const COMPANY_CHIPS: ChipDef[] = [
  { id: 'is_tech', text: 'Is it a tech company?', check: a => !!a.tags.isTech },
  { id: 'usa_based', text: 'Is it based in the USA?', check: a => !!a.tags.usaBased },
  { id: 'has_stores', text: 'Can you visit its physical stores?', check: a => !!a.tags.hasRetailStores },
  { id: 'century_old', text: 'Is it more than 100 years old?', check: a => !!a.tags.centuryOld },
  { id: 'fashion', text: 'Is it a clothing or fashion brand?', check: a => !!a.tags.fashionApparel },
  { id: 'food_drink', text: 'Does it sell food or drinks?', check: a => !!a.tags.foodOrDrink },
  { id: 'makes_cars', text: 'Does it make cars?', check: a => !!a.tags.makesCars },
  { id: 'electronics', text: 'Does it make electronics or gadgets?', check: a => !!a.tags.makesElectronics },
  { id: 'entertainment', text: 'Is it in entertainment or gaming?', check: a => !!a.tags.entertainment },
  { id: 'big_box', text: 'Is it a big-box or department store?', check: a => !!a.tags.bigBoxRetail },
  { id: 'public', text: 'Is it on the stock market?', check: a => !!a.tags.publiclyTraded },
  { id: 'founded_2000s', text: 'Was it founded after the year 2000?', check: a => !!a.tags.foundedAfter2000 },
]

// ── CATEGORY 4: HISTORICAL FIGURES (50 people) ─────────────────────────
// tags: era, field, region, american, female, bornBefore1500, scientist,
//       artist, leader, royalty, nobel, religion, explorer
// ── CATEGORY 4: HISTORICAL FIGURES (50 people) ─────────────────────────
// tags: era, field, region, american, female, bornBefore1500, scientist,
//       artist, leader, royalty, nobel, religion, explorer
// UI uses `wiki` to fetch real portrait photos via Wikipedia REST API.
export const FIGURES: Answer[] = [
  { id: 'einstein', label: 'Albert Einstein', wiki: 'Albert_Einstein', emoji: '🧠', era: 'modern', tags: { field: 'science', region: 'europe', american: true, female: false, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: true, religion: false, explorer: false }, fact: 'Failed his first college entrance exam — then reshaped physics.', color: '#D8E4FF' },
  { id: 'newton', label: 'Isaac Newton', wiki: 'Isaac_Newton', emoji: '🍎', era: 'modern', tags: { field: 'science', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Invented calculus during a year away from college.', color: '#E4E0FF' },
  { id: 'curie', label: 'Marie Curie', wiki: 'Marie_Curie', emoji: '☢️', era: 'modern', tags: { field: 'science', region: 'europe', american: false, female: true, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: true, religion: false, explorer: false }, fact: 'The only person to win Nobels in two different sciences.', color: '#FFE0EC' },
  { id: 'davinci', label: 'Leonardo da Vinci', wiki: 'Leonardo_da_Vinci', emoji: '🎨', era: 'modern', tags: { field: 'art', region: 'europe', american: false, female: false, bornBefore1500: true, scientist: true, artist: true, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Could write with one hand while drawing with the other.', color: '#F0E0C8' },
  { id: 'shakespeare', label: 'William Shakespeare', wiki: 'William_Shakespeare', emoji: '🎭', era: 'modern', tags: { field: 'literature', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: false, artist: true, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Invented over 1,700 words still used in English.', color: '#E8D8C0' },
  { id: 'cleopatra', label: 'Cleopatra', wiki: 'Cleopatra', emoji: '👑', era: 'ancient', tags: { field: 'politics', region: 'africa', american: false, female: true, bornBefore1500: true, scientist: false, artist: false, leader: true, royalty: true, nobel: false, religion: false, explorer: false }, fact: 'Spoke as many as nine languages.', color: '#FFE6A0' },
  { id: 'caesar', label: 'Julius Caesar', wiki: 'Julius_Caesar', emoji: '🏛️', era: 'ancient', tags: { field: 'politics', region: 'europe', american: false, female: false, bornBefore1500: true, scientist: false, artist: false, leader: true, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'The month of July is named after him.', color: '#E8DCB8' },
  { id: 'alexander', label: 'Alexander the Great', wiki: 'Alexander_the_Great', emoji: '⚔️', era: 'ancient', tags: { field: 'military', region: 'europe', american: false, female: false, bornBefore1500: true, scientist: false, artist: false, leader: true, royalty: true, nobel: false, religion: false, explorer: false }, fact: 'Never lost a single battle he commanded.', color: '#E0C8A0' },
  { id: 'napoleon', label: 'Napoleon Bonaparte', wiki: 'Napoleon', emoji: '🎖️', era: 'modern', tags: { field: 'military', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: false, artist: false, leader: true, royalty: true, nobel: false, religion: false, explorer: false }, fact: 'Was average height — the “short” myth came from French units.', color: '#D8E8FF' },
  { id: 'gandhi', label: 'Mahatma Gandhi', wiki: 'Mahatma_Gandhi', emoji: '🕊️', era: 'contemporary', tags: { field: 'politics', region: 'asia', american: false, female: false, bornBefore1500: false, scientist: false, artist: false, leader: true, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Walked 240 miles in the Salt March at age 61.', color: '#F0E8D0' },
  { id: 'mandela', label: 'Nelson Mandela', wiki: 'Nelson_Mandela', emoji: '🕊️', era: 'contemporary', tags: { field: 'politics', region: 'africa', american: false, female: false, bornBefore1500: false, scientist: false, artist: false, leader: true, royalty: false, nobel: true, religion: false, explorer: false }, fact: 'Spent 27 years in prison before becoming president.', color: '#FFD8C0' },
  { id: 'mlk', label: 'Martin Luther King Jr.', wiki: 'Martin_Luther_King_Jr.', emoji: '🗣️', era: 'contemporary', tags: { field: 'politics', region: 'americas', american: true, female: false, bornBefore1500: false, scientist: false, artist: false, leader: true, royalty: false, nobel: true, religion: false, explorer: false }, fact: 'His “I Have a Dream” speech was partly improvised.', color: '#FFD0D0' },
  { id: 'washington', label: 'George Washington', wiki: 'George_Washington', emoji: '🇺🇸', era: 'modern', tags: { field: 'politics', region: 'americas', american: true, female: false, bornBefore1500: false, scientist: false, artist: false, leader: true, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Had only one real tooth left by his inauguration.', color: '#D8E4FF' },
  { id: 'lincoln', label: 'Abraham Lincoln', wiki: 'Abraham_Lincoln', emoji: '🎩', era: 'modern', tags: { field: 'politics', region: 'americas', american: true, female: false, bornBefore1500: false, scientist: false, artist: false, leader: true, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Is enshrined in the Wrestling Hall of Fame.', color: '#E0DCC8' },
  { id: 'churchill', label: 'Winston Churchill', wiki: 'Winston_Churchill', emoji: '🚬', era: 'contemporary', tags: { field: 'politics', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: false, artist: true, leader: true, royalty: false, nobel: true, religion: false, explorer: false }, fact: 'Won a Nobel Prize — in Literature, not peace.', color: '#E0D8C8' },
  { id: 'victoria', label: 'Queen Victoria', wiki: 'Queen_Victoria', emoji: '👑', era: 'modern', tags: { field: 'politics', region: 'europe', american: false, female: true, bornBefore1500: false, scientist: false, artist: false, leader: true, royalty: true, nobel: false, religion: false, explorer: false }, fact: 'Survived at least six assassination attempts.', color: '#E8D8E8' },
  { id: 'elizabeth2', label: 'Queen Elizabeth II', wiki: 'Elizabeth_II', emoji: '👑', era: 'contemporary', tags: { field: 'politics', region: 'europe', american: false, female: true, bornBefore1500: false, scientist: false, artist: false, leader: true, royalty: true, nobel: false, religion: false, explorer: false }, fact: 'Reigned longer than any British monarch before her.', color: '#DCE4F0' },
  { id: 'joanarc', label: 'Joan of Arc', wiki: 'Joan_of_Arc', emoji: '⚔️', era: 'medieval', tags: { field: 'military', region: 'europe', american: false, female: true, bornBefore1500: true, scientist: false, artist: false, leader: true, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Led an army to victory while still a teenager.', color: '#E8E0D0' },
  { id: 'genghis', label: 'Genghis Khan', wiki: 'Genghis_Khan', emoji: '🏹', era: 'medieval', tags: { field: 'military', region: 'asia', american: false, female: false, bornBefore1500: true, scientist: false, artist: false, leader: true, royalty: true, nobel: false, religion: false, explorer: false }, fact: 'Ruled the largest contiguous empire in history.', color: '#D8E0C8' },
  { id: 'confucius', label: 'Confucius', wiki: 'Confucius', emoji: '📜', era: 'ancient', tags: { field: 'philosophy', region: 'asia', american: false, female: false, bornBefore1500: true, scientist: false, artist: false, leader: false, royalty: false, nobel: false, religion: true, explorer: false }, fact: 'Has more descendants than perhaps anyone in history.', color: '#FFE8B0' },
  { id: 'buddha', label: 'Buddha', wiki: 'The_Buddha', emoji: '🧘', era: 'ancient', tags: { field: 'religion', region: 'asia', american: false, female: false, bornBefore1500: true, scientist: false, artist: false, leader: false, royalty: true, nobel: false, religion: true, explorer: false }, fact: 'Lived as a prince before renouncing his throne.', color: '#FFE8C8' },
  { id: 'jesus', label: 'Jesus Christ', wiki: 'Jesus', emoji: '✝️', era: 'ancient', tags: { field: 'religion', region: 'middle-east', american: false, female: false, bornBefore1500: true, scientist: false, artist: false, leader: false, royalty: false, nobel: false, religion: true, explorer: false }, fact: 'The calendar year itself is counted from his birth.', color: '#F0E8D0' },
  { id: 'muhammad', label: 'Muhammad', wiki: 'Muhammad', emoji: '☪️', era: 'medieval', tags: { field: 'religion', region: 'middle-east', american: false, female: false, bornBefore1500: true, scientist: false, artist: false, leader: true, royalty: false, nobel: false, religion: true, explorer: false }, fact: 'United the Arabian Peninsula within his lifetime.', color: '#E0E8D0' },
  { id: 'galileo', label: 'Galileo Galilei', wiki: 'Galileo_Galilei', emoji: '🔭', era: 'modern', tags: { field: 'science', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Was placed under house arrest for the rest of his life.', color: '#D8E8F0' },
  { id: 'darwin', label: 'Charles Darwin', wiki: 'Charles_Darwin', emoji: '🧬', era: 'modern', tags: { field: 'science', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: true }, fact: 'Ate his way through the animal kingdom as a student.', color: '#D0E8D0' },
  { id: 'tesla', label: 'Nikola Tesla', wiki: 'Nikola_Tesla', emoji: '⚡', era: 'contemporary', tags: { field: 'science', region: 'europe', american: true, female: false, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Could do calculus in his head during college.', color: '#E0E0F0' },
  { id: 'edison', label: 'Thomas Edison', wiki: 'Thomas_Edison', emoji: '💡', era: 'contemporary', tags: { field: 'science', region: 'americas', american: true, female: false, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Held over 1,000 U.S. patents in his name.', color: '#FFE8C0' },
  { id: 'wright', label: 'Wright Brothers', wiki: 'Wright_brothers', emoji: '✈️', era: 'contemporary', tags: { field: 'science', region: 'americas', american: true, female: false, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: true }, fact: 'Their first powered flight lasted just 12 seconds.', color: '#D8E4F0' },
  { id: 'franklin', label: 'Benjamin Franklin', wiki: 'Benjamin_Franklin', emoji: '🪁', era: 'modern', tags: { field: 'science', region: 'americas', american: true, female: false, bornBefore1500: false, scientist: true, artist: false, leader: true, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Invented bifocals and the lightning rod.', color: '#F0E0C0' },
  { id: 'mozart', label: 'Wolfgang Mozart', wiki: 'Wolfgang_Amadeus_Mozart', emoji: '🎼', era: 'modern', tags: { field: 'music', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: false, artist: true, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Wrote his first symphony at age eight.', color: '#F0DCE8' },
  { id: 'beethoven', label: 'Ludwig van Beethoven', wiki: 'Ludwig_van_Beethoven', emoji: '🎹', era: 'modern', tags: { field: 'music', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: false, artist: true, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Composed masterpieces after going completely deaf.', color: '#E0DCD8' },
  { id: 'michelangelo', label: 'Michelangelo', wiki: 'Michelangelo', emoji: '🖌️', era: 'modern', tags: { field: 'art', region: 'europe', american: false, female: false, bornBefore1500: true, scientist: false, artist: true, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Painted the Sistine Chapel ceiling lying on his back.', color: '#E8DCC8' },
  { id: 'vangogh', label: 'Vincent van Gogh', wiki: 'Vincent_van_Gogh', emoji: '🌻', era: 'modern', tags: { field: 'art', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: false, artist: true, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Sold just one painting while he was alive.', color: '#FFE8A0' },
  { id: 'picasso', label: 'Pablo Picasso', wiki: 'Pablo_Picasso', emoji: '🖼️', era: 'contemporary', tags: { field: 'art', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: false, artist: true, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Produced over 50,000 works of art in his life.', color: '#FFDCE0' },
  { id: 'frida', label: 'Frida Kahlo', wiki: 'Frida_Kahlo', emoji: '🌺', era: 'contemporary', tags: { field: 'art', region: 'americas', american: false, female: true, bornBefore1500: false, scientist: false, artist: true, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Began painting while bedridden after a bus crash.', color: '#FFD8D8' },
  { id: 'earhart', label: 'Amelia Earhart', wiki: 'Amelia_Earhart', emoji: '✈️', era: 'contemporary', tags: { field: 'exploration', region: 'americas', american: true, female: true, bornBefore1500: false, scientist: false, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: true }, fact: 'First woman to fly solo across the Atlantic.', color: '#D8E8E0' },
  { id: 'columbus', label: 'Christopher Columbus', wiki: 'Christopher_Columbus', emoji: '🧭', era: 'modern', tags: { field: 'exploration', region: 'europe', american: false, female: false, bornBefore1500: true, scientist: false, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: true }, fact: 'Never set foot on the North American mainland.', color: '#E0DCC0' },
  { id: 'magellan', label: 'Ferdinand Magellan', wiki: 'Ferdinand_Magellan', emoji: '⛵', era: 'modern', tags: { field: 'exploration', region: 'europe', american: false, female: false, bornBefore1500: true, scientist: false, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: true }, fact: 'His crew first sailed all the way around the globe.', color: '#D0E4E8' },
  { id: 'nightingale', label: 'Florence Nightingale', wiki: 'Florence_Nightingale', emoji: '💡', era: 'contemporary', tags: { field: 'science', region: 'europe', american: false, female: true, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Invented modern nursing with simple statistics.', color: '#E0EAF0' },
  { id: 'motherteresa', label: 'Mother Teresa', wiki: 'Mother_Teresa', emoji: '🕊️', era: 'contemporary', tags: { field: 'religion', region: 'asia', american: false, female: true, bornBefore1500: false, scientist: false, artist: false, leader: false, royalty: false, nobel: true, religion: true, explorer: false }, fact: 'Founded missions helping the poor in 130+ countries.', color: '#F0E8DC' },
  { id: 'luther', label: 'Martin Luther', wiki: 'Martin_Luther', emoji: '📜', era: 'modern', tags: { field: 'religion', region: 'europe', american: false, female: false, bornBefore1500: true, scientist: false, artist: false, leader: false, royalty: false, nobel: false, religion: true, explorer: false }, fact: 'His protests kicked off the Protestant Reformation.', color: '#E8E0D0' },
  { id: 'hawking', label: 'Stephen Hawking', wiki: 'Stephen_Hawking', emoji: '🌌', era: 'contemporary', tags: { field: 'science', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Lost a famous bet about black holes — and conceded.', color: '#D8DCFF' },
  { id: 'armstrong', label: 'Neil Armstrong', wiki: 'Neil_Armstrong', emoji: '🌑', era: 'contemporary', tags: { field: 'exploration', region: 'americas', american: true, female: false, bornBefore1500: false, scientist: false, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: true }, fact: 'His pulse hit 150 as he stepped onto the Moon.', color: '#E0E0E8' },
  { id: 'rosa', label: 'Rosa Parks', wiki: 'Rosa_Parks', emoji: '🚌', era: 'contemporary', tags: { field: 'politics', region: 'americas', american: true, female: true, bornBefore1500: false, scientist: false, artist: false, leader: true, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Her refusal to give up her seat sparked a movement.', color: '#FFE0C8' },
  { id: 'catherine', label: 'Catherine the Great', wiki: 'Catherine_the_Great', emoji: '👑', era: 'modern', tags: { field: 'politics', region: 'europe', american: false, female: true, bornBefore1500: false, scientist: false, artist: false, leader: true, royalty: true, nobel: false, religion: false, explorer: false }, fact: 'Modernised Russia and vastly expanded its borders.', color: '#E8DCE8' },
  { id: 'henry8', label: 'Henry VIII', wiki: 'Henry_VIII', emoji: '👑', era: 'modern', tags: { field: 'politics', region: 'europe', american: false, female: false, bornBefore1500: true, scientist: false, artist: false, leader: true, royalty: true, nobel: false, religion: false, explorer: false }, fact: 'Had six wives and founded the Church of England.', color: '#E0D8C0' },
  { id: 'pythagoras', label: 'Pythagoras', wiki: 'Pythagoras', emoji: '📐', era: 'ancient', tags: { field: 'science', region: 'europe', american: false, female: false, bornBefore1500: true, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Founded a secretive cult devoted to numbers.', color: '#DCE4DC' },
  { id: 'aristotle', label: 'Aristotle', wiki: 'Aristotle', emoji: '📖', era: 'ancient', tags: { field: 'philosophy', region: 'europe', american: false, female: false, bornBefore1500: true, scientist: false, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Taught Alexander the Great when he was a boy.', color: '#E8DCC4' },
  { id: 'plato', label: 'Plato', wiki: 'Plato', emoji: '🏛️', era: 'ancient', tags: { field: 'philosophy', region: 'europe', american: false, female: false, bornBefore1500: true, scientist: false, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Founded the first university in the Western world.', color: '#E0DCC8' },
  { id: 'ali', label: 'Muhammad Ali', wiki: 'Muhammad_Ali', emoji: '🥊', era: 'contemporary', tags: { field: 'sports', region: 'americas', american: true, female: false, bornBefore1500: false, scientist: false, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: '“Float like a butterfly, sting like a bee.”', color: '#FFE8A8' },
]

export const FIGURE_CHIPS: ChipDef[] = [
  { id: 'in_europe', text: 'Were they European?', check: a => a.tags.region === 'europe' },
  { id: 'pre_1500', text: 'Did they live before the year 1500?', check: a => !!a.tags.bornBefore1500 },
  { id: 'scientist', text: 'Were they a scientist or inventor?', check: a => !!a.tags.scientist },
  { id: 'leader', text: 'Were they a political or military leader?', check: a => !!a.tags.leader },
  { id: 'female', text: 'Were they a woman?', check: a => !!a.tags.female },
  { id: 'american', text: 'Were they American?', check: a => !!a.tags.american },
  { id: 'artist', text: 'Were they an artist, musician or writer?', check: a => !!a.tags.artist },
  { id: 'royalty', text: 'Were they royalty or a monarch?', check: a => !!a.tags.royalty },
  { id: 'nobel', text: 'Did they win a Nobel Prize?', check: a => !!a.tags.nobel },
  { id: 'religion', text: 'Were they a religious or spiritual figure?', check: a => !!a.tags.religion },
  { id: 'explorer', text: 'Were they an explorer or pioneer?', check: a => !!a.tags.explorer },
  { id: 'ancient', text: 'Did they live in ancient times (before 500 AD)?', check: a => a.tags.era === 'ancient' },
]

// ── CATEGORY REGISTRY ──────────────────────────────────────────────────
export type Category = {
  id: string
  label: string
  blurb: string
  answers: Answer[]
  chips: ChipDef[]
  sampleChips: string[]
  glyph: string
}

export const CATEGORIES: Category[] = [
  {
    id: 'animals',
    label: 'ANIMALS',
    blurb: 'One hidden creature. Narrow it down.',
    answers: ANIMALS,
    chips: CHIPS,
    sampleChips: ['Is it bigger than a cat?', 'Is it a mammal?', 'Can it fly?', 'Stripes or spots?'],
    glyph: '🐾',
  },
  {
    id: 'countries',
    label: 'COUNTRIES',
    blurb: 'One hidden nation. Narrow it down.',
    answers: COUNTRIES,
    chips: COUNTRY_CHIPS,
    sampleChips: ['Is it in Europe?', 'Is it an island nation?', 'Is it landlocked?', 'Has it hosted the Olympics?'],
    glyph: '🌍',
  },
  {
    id: 'companies',
    label: 'COMPANIES',
    blurb: 'One hidden brand. Narrow it down.',
    answers: COMPANIES,
    chips: COMPANY_CHIPS,
    sampleChips: ['Is it based in the USA?', 'Does it make cars?', 'Is it a clothing brand?', 'Can you visit its stores?'],
    glyph: '🏢',
  },
  {
    id: 'figures',
    label: 'HISTORICAL FIGURES',
    blurb: 'One hidden icon. Narrow it down.',
    answers: FIGURES,
    chips: FIGURE_CHIPS,
    sampleChips: ['Were they European?', 'Did they live before 1500?', 'Were they a scientist?', 'Were they a leader?'],
    glyph: '🗿',
  },
]

export function getCategoryById(id: string): Category {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0]
}

/** CDN flag image for a country answer (empty for non-country categories) */
export function flagUrl(a: Answer, size: 'sm' | 'md' = 'md') {
  if (!a.iso) return ''
  return `https://flagcdn.com/${size === 'sm' ? 'w40' : 'w80'}/${a.iso}.png`
}

// Brand domains for logo fetch (no API key required).
// Primary source: DuckDuckGo's icon service; falls back to Google's favicon CDN.
const BRAND_DOMAIN: Record<string, string> = {
  apple: 'apple.com', amazon: 'amazon.com', google: 'google.com', microsoft: 'microsoft.com',
  meta: 'meta.com', netflix: 'netflix.com', nvidia: 'nvidia.com', adobe: 'adobe.com',
  intel: 'intel.com', ibm: 'ibm.com', cisco: 'cisco.com', spotify: 'spotify.com',
  uber: 'uber.com', airbnb: 'airbnb.com', salesforce: 'salesforce.com', oracle: 'oracle.com',
  nike: 'nike.com', adidas: 'adidas.com', zara: 'zara.com', handm: 'hm.com',
  gucci: 'gucci.com', louisvuitton: 'louisvuitton.com', chanel: 'chanel.com', hermes: 'hermes.com',
  levis: 'levi.com', cocacola: 'coca-cola.com', pepsico: 'pepsico.com', mcdonalds: 'mcdonalds.com',
  starbucks: 'starbucks.com', nestle: 'nestle.com', redbull: 'redbull.com', subway: 'subway.com',
  kfc: 'kfc.com', tesla: 'tesla.com', toyota: 'toyota.com', ford: 'ford.com',
  honda: 'honda.com', bmw: 'bmw.com', ferrari: 'ferrari.com', mercedes: 'mercedes-benz.com',
  disney: 'disney.com', nintendo: 'nintendo.com', sony: 'sony.com', samsung: 'samsung.com',
  lego: 'lego.com', walmart: 'walmart.com', costco: 'costco.com', target: 'target.com',
  ikea: 'ikea.com', visa: 'visa.com',
}

/** Real logo image for a brand (empty for non-company answers) */
export function logoUrl(a: Answer) {
  const d = a.domain || BRAND_DOMAIN[a.id]
  if (!d) return ''
  return `https://icons.duckduckgo.com/ip3/${d}.ico`
}

/** Google favicon fallback for the same brand */
export function logoFallback(a: Answer) {
  const d = a.domain || BRAND_DOMAIN[a.id]
  if (!d) return ''
  return `https://www.google.com/s2/favicons?sz=128&domain_url=https://${d}`
}

/** Monogram initials for a historical figure (e.g. "Albert Einstein" → "AE") */
export function figureInitials(a: Answer): string {
  const drop = new Set(['of', 'the', 'da', 'van', 'de', 'der', 'del', 'la', 'jr.', 'jr', 'sr.', 'sr', 'ii', 'iii', 'iv'])
  const words = a.label.split(/\s+/).filter(w => w.length > 0 && !drop.has(w.toLowerCase().replace('.', '')))
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

// deterministic helpers (must match server exactly)
export function hashStr(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

// One category per day, chosen by the system (PRD §11, no select screen)
export function getDailyCategory(dateStr: string): Category {
  const idx = hashStr('cat-' + dateStr) % CATEGORIES.length
  return CATEGORIES[idx]
}

export function getDailyAnswer(dateStr: string): Answer {
  const cat = getDailyCategory(dateStr)
  const idx = hashStr('guess-' + dateStr) % cat.answers.length
  return { ...cat.answers[idx], category: cat.id }
}

export function puzzleNumber(dateStr: string) {
  const start = new Date('2026-01-01T12:00:00').getTime()
  const cur = new Date(dateStr + 'T12:00:00').getTime()
  return Math.floor((cur - start) / 86400000) + 1
}

export function getLocalDay(d = new Date()) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function formatDay(s: string) {
  const d = new Date(s + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()
}

// ranking: pure deterministic info-gain (no AI)
export function rankChips(candidates: Answer[], askedIds: Set<string>, chips: ChipDef[] = CHIPS) {
  const remaining = chips.filter(c => !askedIds.has(c.id))
  const scored = remaining.map(chip => {
    const yes = candidates.filter(a => chip.check(a)).length
    const no = candidates.length - yes
    const total = candidates.length || 1
    const score = 1 - Math.abs(yes - no) / total
    const lowSignal = Math.min(yes, no) / total < 0.15
    return { chip, score, yes, no, lowSignal, split: `${yes}:${no}` }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 6)
}

// sanitized candidate for client (no tags leaked until reveal)
export function toPublicCandidate(a: Answer) {
  return { id: a.id, label: a.label, emoji: a.emoji, color: a.color, fact: a.fact, iso: a.iso, domain: a.domain, era: a.era, wiki: a.wiki }
}
export type PublicCandidate = ReturnType<typeof toPublicCandidate>

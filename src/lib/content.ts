// Shared content: single source of truth for client + server
// Keep this file isomorphic: no browser-only APIs

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
  /** Release year / era for movies & games */
  year?: number
}

export type ChipDef = {
  id: string
  text: string
  check: (a: Answer) => boolean
}

// ── CATEGORY 1: ANIMALS (70 answers) ───────────────────────────────────
export const ANIMALS: Answer[] = [
  { id: 'elephant', label: 'Elephant', emoji: '🐘', tags: { size: 'huge', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: false, venomous: false, coldBlooded: false }, fact: 'The largest land mammal. It can hear with its feet.', color: '#E8E0D6' },
  { id: 'tiger', label: 'Tiger', emoji: '🐯', tags: { size: 'large', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'No two tigers have the same stripe pattern.', color: '#FFD6A8' },
  { id: 'penguin', label: 'Penguin', emoji: '🐧', tags: { size: 'medium', habitat: 'amphibious', mammal: false, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Flightless but torpedoes underwater at 22 mph.', color: '#D0E8FF' },
  { id: 'dolphin', label: 'Dolphin', emoji: '🐬', tags: { size: 'large', habitat: 'water', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Sleeps with one eye open because half its brain stays awake.', color: '#C8F0FF' },
  { id: 'eagle', label: 'Eagle', emoji: '🦅', tags: { size: 'medium', habitat: 'air', mammal: false, predator: true, nocturnal: false, domestic: false, canFly: true, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Can spot prey from 2 miles away.', color: '#E2D5C3' },
  { id: 'kangaroo', label: 'Kangaroo', emoji: '🦘', tags: { size: 'large', habitat: 'land', mammal: true, predator: false, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Can’t walk backwards — hops at 35 mph.', color: '#FFCB8A' },
  { id: 'panda', label: 'Panda', emoji: '🐼', tags: { size: 'large', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Spends 12 hours a day eating bamboo.', color: '#F0F0F0' },
  { id: 'giraffe', label: 'Giraffe', emoji: '🦒', tags: { size: 'huge', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: true, longNeck: true, venomous: false, coldBlooded: false }, fact: 'Same number of neck vertebrae as humans: seven.', color: '#FFE9A8' },
  { id: 'zebra', label: 'Zebra', emoji: '🦓', tags: { size: 'large', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: true, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Each zebra’s stripe pattern is unique like a fingerprint.', color: '#E8E8E8' },
  { id: 'lion', label: 'Lion', emoji: '🦁', tags: { size: 'large', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: false, venomous: false, coldBlooded: false }, fact: 'A pride’s roar is heard 5 miles away.', color: '#FFD59E' },
  { id: 'wolf', label: 'Wolf', emoji: '🐺', tags: { size: 'medium', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Howls to assemble — each voice is distinct.', color: '#D9D9D9' },
  { id: 'owl', label: 'Owl', emoji: '🦉', tags: { size: 'small', habitat: 'air', mammal: false, predator: true, nocturnal: true, domestic: false, canFly: true, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Can rotate its head 270 degrees.', color: '#D6CBB8' },
  { id: 'bat', label: 'Bat', emoji: '🦇', tags: { size: 'tiny', habitat: 'air', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: true, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Only mammal capable of sustained flight.', color: '#CFCFD6' },
  { id: 'crocodile', label: 'Crocodile', emoji: '🐊', tags: { size: 'huge', habitat: 'amphibious', mammal: false, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: false, venomous: false, coldBlooded: true }, fact: 'Holds breath for over an hour underwater.', color: '#B8D8B8' },
  { id: 'octopus', label: 'Octopus', emoji: '🐙', tags: { size: 'medium', habitat: 'water', mammal: false, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: true, coldBlooded: true }, fact: 'Three hearts and blue blood.', color: '#FFB3C6' },
  { id: 'shark', label: 'Shark', emoji: '🦈', tags: { size: 'huge', habitat: 'water', mammal: false, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: true }, fact: 'Existed before trees — 400M years old.', color: '#8ECAE6' },
  { id: 'whale', label: 'Blue Whale', emoji: '🐳', tags: { size: 'huge', habitat: 'water', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Heart the size of a golf cart.', color: '#A8D8EA' },
  { id: 'bee', label: 'Bee', emoji: '🐝', tags: { size: 'tiny', habitat: 'air', mammal: false, predator: false, nocturnal: false, domestic: false, canFly: true, patterned: true, livesAfrica: false, longNeck: false, venomous: true, coldBlooded: true }, fact: 'Visits 5,000 flowers a day.', color: '#FFEB3B' },
  { id: 'butterfly', label: 'Butterfly', emoji: '🦋', tags: { size: 'tiny', habitat: 'air', mammal: false, predator: false, nocturnal: false, domestic: false, canFly: true, patterned: true, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: true }, fact: 'Tastes with its feet.', color: '#FFB5E8' },
  { id: 'chameleon', label: 'Chameleon', emoji: '🦎', tags: { size: 'small', habitat: 'land', mammal: false, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: true, longNeck: false, venomous: false, coldBlooded: true }, fact: 'Eyes move independently — 360° vision.', color: '#B5E48C' },
  { id: 'koala', label: 'Koala', emoji: '🐨', tags: { size: 'small', habitat: 'land', mammal: true, predator: false, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Sleeps 20 hours a day — eucalyptus diet.', color: '#D8D0C8' },
  { id: 'polarbear', label: 'Polar Bear', emoji: '🐻‍❄️', tags: { size: 'huge', habitat: 'land', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Fur is transparent — skin is black underneath.', color: '#F5F5F5' },
  { id: 'camel', label: 'Camel', emoji: '🐪', tags: { size: 'huge', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: true, canFly: false, patterned: false, livesAfrica: true, longNeck: true, venomous: false, coldBlooded: false }, fact: 'Humps store fat, not water — for desert fuel.', color: '#E6C9A8' },
  { id: 'fox', label: 'Fox', emoji: '🦊', tags: { size: 'small', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Uses magnetic field to hunt — pounces north.', color: '#FF9E6B' },
  { id: 'horse', label: 'Horse', emoji: '🐴', tags: { size: 'large', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: true, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Can sleep both standing up and lying down.', color: '#E0C4A8' },
  { id: 'dog', label: 'Dog', emoji: '🐕', tags: { size: 'medium', habitat: 'land', mammal: true, predator: true, nocturnal: false, domestic: true, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Its nose print is as unique as a fingerprint.', color: '#F0D9BE' },
  { id: 'cat', label: 'Cat', emoji: '🐈', tags: { size: 'small', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: true, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Spends about 70% of its life asleep.', color: '#F5E0C8' },
  { id: 'cow', label: 'Cow', emoji: '🐄', tags: { size: 'large', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: true, canFly: false, patterned: true, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Has best friends and gets stressed when apart.', color: '#F2F2F2' },
  { id: 'sheep', label: 'Sheep', emoji: '🐑', tags: { size: 'medium', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: true, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Recognises up to 50 other sheep faces.', color: '#EDEDE4' },
  { id: 'pig', label: 'Pig', emoji: '🐖', tags: { size: 'medium', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: true, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Smarter than a three-year-old child.', color: '#FFD6DE' },
  { id: 'chicken', label: 'Chicken', emoji: '🐔', tags: { size: 'small', habitat: 'land', mammal: false, predator: false, nocturnal: false, domestic: true, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'The closest living relative of the T. rex.', color: '#FFE7B0' },
  { id: 'deer', label: 'Deer', emoji: '🦌', tags: { size: 'medium', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Regrows its antlers from scratch every year.', color: '#E4C9A0' },
  { id: 'moose', label: 'Moose', emoji: '🫎', tags: { size: 'huge', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Can dive 20 feet underwater to reach plants.', color: '#D2BA9A' },
  { id: 'grizzly', label: 'Grizzly Bear', emoji: '🐻', tags: { size: 'huge', habitat: 'land', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Can smell food from 18 miles away.', color: '#D9B68C' },
  { id: 'rhino', label: 'Rhino', emoji: '🦏', tags: { size: 'huge', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Its horn is made of keratin, like your fingernails.', color: '#D6D6CE' },
  { id: 'hippo', label: 'Hippo', emoji: '🦛', tags: { size: 'huge', habitat: 'amphibious', mammal: true, predator: false, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Secretes its own natural red sunscreen.', color: '#E0C6D2' },
  { id: 'gorilla', label: 'Gorilla', emoji: '🦍', tags: { size: 'large', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Shares about 98% of its DNA with humans.', color: '#C6C6C6' },
  { id: 'meerkat', label: 'Meerkat', emoji: '🦫', tags: { size: 'small', habitat: 'land', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Always posts a lookout while the group forages.', color: '#E8D3AC' },
  { id: 'sloth', label: 'Sloth', emoji: '🦥', tags: { size: 'medium', habitat: 'land', mammal: true, predator: false, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Digesting one leaf can take a full month.', color: '#D8CDB4' },
  { id: 'otter', label: 'Otter', emoji: '🦦', tags: { size: 'small', habitat: 'amphibious', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Holds hands while sleeping so it doesn’t drift.', color: '#CBB9A0' },
  { id: 'seal', label: 'Seal', emoji: '🦭', tags: { size: 'large', habitat: 'amphibious', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Can slow its heart to 4 beats a minute when diving.', color: '#C4CFD8' },
  { id: 'turtle', label: 'Sea Turtle', emoji: '🐢', tags: { size: 'medium', habitat: 'water', mammal: false, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: true }, fact: 'Returns to the exact beach where it hatched.', color: '#B9E3C6' },
  { id: 'frog', label: 'Frog', emoji: '🐸', tags: { size: 'tiny', habitat: 'amphibious', mammal: false, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false, venomous: true, coldBlooded: true }, fact: 'Drinks water through its skin, never its mouth.', color: '#C6EFA0' },
  { id: 'snake', label: 'Snake', emoji: '🐍', tags: { size: 'medium', habitat: 'land', mammal: false, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false, venomous: true, coldBlooded: true }, fact: 'Smells the air by flicking its forked tongue.', color: '#CFE8A8' },
  { id: 'parrot', label: 'Parrot', emoji: '🦜', tags: { size: 'small', habitat: 'air', mammal: false, predator: false, nocturnal: false, domestic: false, canFly: true, patterned: true, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Some can learn vocabularies of 1,000+ words.', color: '#FFC2B4' },
  { id: 'flamingo', label: 'Flamingo', emoji: '🦩', tags: { size: 'medium', habitat: 'water', mammal: false, predator: false, nocturnal: false, domestic: false, canFly: true, patterned: false, livesAfrica: true, longNeck: true, venomous: false, coldBlooded: false }, fact: 'Born grey — shrimp in its diet turn it pink.', color: '#FFC2D6' },
  { id: 'ostrich', label: 'Ostrich', emoji: '🪶', tags: { size: 'huge', habitat: 'land', mammal: false, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: true, venomous: false, coldBlooded: false }, fact: 'Its eye is bigger than its brain.', color: '#E2D2BC' },
  { id: 'swan', label: 'Swan', emoji: '🦢', tags: { size: 'medium', habitat: 'water', mammal: false, predator: false, nocturnal: false, domestic: false, canFly: true, patterned: false, livesAfrica: false, longNeck: true, venomous: false, coldBlooded: false }, fact: 'Mates for life and can live over 20 years.', color: '#F0F4F8' },
  { id: 'cheetah', label: 'Cheetah', emoji: '🐆', tags: { size: 'large', habitat: 'land', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: true, longNeck: false, venomous: false, coldBlooded: false }, fact: '0 to 60 mph in three seconds flat.', color: '#FFDFA8' },
  { id: 'hyena', label: 'Hyena', emoji: '🐾', tags: { size: 'medium', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: true, livesAfrica: true, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Its "laugh" is actually a status signal.', color: '#DCCBA8' },
  { id: 'raccoon', label: 'Raccoon', emoji: '🦝', tags: { size: 'small', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Its paws have four times more sensors than ours.', color: '#D2D2DA' },
  { id: 'hedgehog', label: 'Hedgehog', emoji: '🦔', tags: { size: 'tiny', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Wears about 5,000 quills at any one time.', color: '#E0CFB8' },
  { id: 'squirrel', label: 'Squirrel', emoji: '🐿️', tags: { size: 'tiny', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Forgets thousands of nuts — accidentally plants forests.', color: '#E8C9A0' },
  { id: 'crab', label: 'Crab', emoji: '🦀', tags: { size: 'small', habitat: 'water', mammal: false, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: true }, fact: 'Communicates by drumming and waving its claws.', color: '#FFBFA8' },
  { id: 'jellyfish', label: 'Jellyfish', emoji: '🪼', tags: { size: 'small', habitat: 'water', mammal: false, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: true, coldBlooded: true }, fact: 'Has survived 500 million years with no brain.', color: '#DCD0FF' },
  { id: 'platypus', label: 'Platypus', emoji: '🦆', tags: { size: 'small', habitat: 'amphibious', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: true, coldBlooded: false }, fact: 'One of the only mammals that lays eggs and sweats milk.', color: '#C8B098' },
  { id: 'komodo', label: 'Komodo Dragon', emoji: '🦎', tags: { size: 'large', habitat: 'land', mammal: false, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: true, coldBlooded: true }, fact: 'The heaviest lizard on Earth, with toxic venom glands.', color: '#A0B890' },
  { id: 'orca', label: 'Orca', emoji: '🐋', tags: { size: 'huge', habitat: 'water', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Actually a giant dolphin that hunts in coordinated family pods.', color: '#2B2B2B' },
  { id: 'capybara', label: 'Capybara', emoji: '🦫', tags: { size: 'medium', habitat: 'amphibious', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'The largest rodent on Earth, famously chill with all animals.', color: '#D0A878' },
  { id: 'redpanda', label: 'Red Panda', emoji: '🦊', tags: { size: 'small', habitat: 'land', mammal: true, predator: false, nocturnal: true, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Uses its bushy ringed tail as a blanket in the snow.', color: '#FF7F50' },
  { id: 'beaver', label: 'Beaver', emoji: '🪵', tags: { size: 'medium', habitat: 'amphibious', mammal: true, predator: false, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Its orange teeth contain iron and never stop growing.', color: '#A06840' },
  { id: 'axolotl', label: 'Axolotl', emoji: '🫧', tags: { size: 'tiny', habitat: 'water', mammal: false, predator: true, nocturnal: true, domestic: true, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: true }, fact: 'Can regrow lost limbs, its heart, and parts of its brain.', color: '#FFB6C1' },
  { id: 'pangolin', label: 'Pangolin', emoji: '🛡️', tags: { size: 'small', habitat: 'land', mammal: true, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: true, livesAfrica: true, longNeck: false, venomous: false, coldBlooded: false }, fact: 'The only mammal wholly covered in tough keratin scales.', color: '#C0A080' },
  { id: 'lemur', label: 'Lemur', emoji: '🐒', tags: { size: 'small', habitat: 'land', mammal: true, predator: false, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: true, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Found only on the island of Madagascar.', color: '#E0D0B0' },
  { id: 'falcon', label: 'Peregrine Falcon', emoji: '🦅', tags: { size: 'small', habitat: 'air', mammal: false, predator: true, nocturnal: false, domestic: false, canFly: true, patterned: true, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'The fastest animal on Earth, diving at over 240 mph.', color: '#90A0B0' },
  { id: 'scorpion', label: 'Scorpion', emoji: '🦂', tags: { size: 'tiny', habitat: 'land', mammal: false, predator: true, nocturnal: true, domestic: false, canFly: false, patterned: false, livesAfrica: true, longNeck: false, venomous: true, coldBlooded: true }, fact: 'Glows bright cyan under ultraviolet blacklight.', color: '#D4AF37' },
  { id: 'seahorse', label: 'Seahorse', emoji: '🌊', tags: { size: 'tiny', habitat: 'water', mammal: false, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: true }, fact: 'Male seahorses give birth to up to 1,000 babies at once.', color: '#F0E68C' },
  { id: 'chinchilla', label: 'Chinchilla', emoji: '🐭', tags: { size: 'tiny', habitat: 'land', mammal: true, predator: false, nocturnal: true, domestic: true, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Has the densest fur of any land mammal — 50 hairs per follicle.', color: '#DCDCDC' },
  { id: 'walrus', label: 'Walrus', emoji: '🦭', tags: { size: 'huge', habitat: 'amphibious', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: false, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Its tusks can grow up to three feet long.', color: '#BCA898' },
  { id: 'anteater', label: 'Giant Anteater', emoji: '🐜', tags: { size: 'large', habitat: 'land', mammal: true, predator: true, nocturnal: false, domestic: false, canFly: false, patterned: true, livesAfrica: false, longNeck: false, venomous: false, coldBlooded: false }, fact: 'Has no teeth and eats up to 35,000 ants a day with a 2-foot tongue.', color: '#786858' },
]

export const CHIPS: ChipDef[] = [
  { id: 'bigger_than_cat', text: 'Is it bigger than a cat?', check: a => ['medium', 'large', 'huge'].includes(a.tags.size) },
  { id: 'bigger_than_human', text: 'Is it bigger than a human?', check: a => ['large', 'huge'].includes(a.tags.size) },
  { id: 'fits_in_hands', text: 'Could it fit in your hands?', check: a => a.tags.size === 'tiny' },
  { id: 'found_in_water', text: 'Is it found in water / ocean?', check: a => a.tags.habitat === 'water' || a.tags.habitat === 'amphibious' },
  { id: 'is_mammal', text: 'Is it a mammal?', check: a => !!a.tags.mammal },
  { id: 'is_predator', text: 'Does it eat meat / hunt prey?', check: a => !!a.tags.predator },
  { id: 'is_nocturnal', text: 'Is it nocturnal (active at night)?', check: a => !!a.tags.nocturnal },
  { id: 'can_fly', text: 'Can it fly in the air?', check: a => !!a.tags.canFly },
  { id: 'lives_wild', text: 'Does it live in the wild (non-domestic)?', check: a => !a.tags.domestic },
  { id: 'has_pattern', text: 'Does it have stripes, spots, or scales?', check: a => !!a.tags.patterned },
  { id: 'lives_africa', text: 'Is it naturally native to Africa?', check: a => !!a.tags.livesAfrica },
  { id: 'long_neck', text: 'Does it have a distinctly long neck?', check: a => !!a.tags.longNeck },
  { id: 'is_venomous', text: 'Is it venomous or toxic?', check: a => !!a.tags.venomous },
  { id: 'cold_blooded', text: 'Is it cold-blooded (reptile/fish/insect)?', check: a => !!a.tags.coldBlooded },
]

// ── CATEGORY 2: COUNTRIES (70 answers) ─────────────────────────────────
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
  { id: 'belgium', label: 'Belgium', emoji: '🇧🇪', iso: 'be', tags: { continent: 'europe', island: false, landlocked: false, population: 'medium', hemisphere: 'north', euMember: true, monarchy: true, spanishSpeaking: false, hostedOlympics: true, coldClimate: false }, fact: 'Headquarters of both the European Union and NATO.', color: '#FFE6B0' },
  { id: 'denmark', label: 'Denmark', emoji: '🇩🇰', iso: 'dk', tags: { continent: 'europe', island: true, landlocked: false, population: 'small', hemisphere: 'north', euMember: true, monarchy: true, spanishSpeaking: false, hostedOlympics: false, coldClimate: true }, fact: 'No point in the country is further than 32 miles from the sea.', color: '#FFD4D4' },
  { id: 'hungary', label: 'Hungary', emoji: '🇭🇺', iso: 'hu', tags: { continent: 'europe', island: false, landlocked: true, population: 'small', hemisphere: 'north', euMember: true, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: true }, fact: 'Invented the Rubik’s Cube and the ballpoint pen.', color: '#E0F0E0' },
  { id: 'indonesia', label: 'Indonesia', emoji: '🇮🇩', iso: 'id', tags: { continent: 'asia', island: true, landlocked: false, population: 'large', hemisphere: 'south', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'Largest island nation with over 17,000 islands.', color: '#FFCDD2' },
  { id: 'malaysia', label: 'Malaysia', emoji: '🇲🇾', iso: 'my', tags: { continent: 'asia', island: false, landlocked: false, population: 'medium', hemisphere: 'north', euMember: false, monarchy: true, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'Home to the world’s tallest twin towers (Petronas).', color: '#FFF3E0' },
  { id: 'uae', label: 'United Arab Emirates', emoji: '🇦🇪', iso: 'ae', tags: { continent: 'asia', island: false, landlocked: false, population: 'small', hemisphere: 'north', euMember: false, monarchy: true, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'Home to Burj Khalifa, the tallest building on Earth.', color: '#E8F5E9' },
  { id: 'madagascar', label: 'Madagascar', emoji: '🇲🇬', iso: 'mg', tags: { continent: 'africa', island: true, landlocked: false, population: 'medium', hemisphere: 'south', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: '90% of its wildlife is found nowhere else on the planet.', color: '#F1F8E9' },
  { id: 'costarica', label: 'Costa Rica', emoji: '🇨🇷', iso: 'cr', tags: { continent: 'north-america', island: false, landlocked: false, population: 'small', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: true, hostedOlympics: false, coldClimate: false }, fact: 'Has no standing army since 1948 and runs on 99% renewable energy.', color: '#E1F5FE' },
  { id: 'croatia', label: 'Croatia', emoji: '🇭🇷', iso: 'hr', tags: { continent: 'europe', island: false, landlocked: false, population: 'small', hemisphere: 'north', euMember: true, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'Invented the necktie (cravat) in the 17th century.', color: '#EDE7F6' },
  { id: 'panama', label: 'Panama', emoji: '🇵🇦', iso: 'pa', tags: { continent: 'north-america', island: false, landlocked: false, population: 'small', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: true, hostedOlympics: false, coldClimate: false }, fact: 'The only place where you can see the sun rise on the Pacific and set on the Atlantic.', color: '#FFF8E1' },
  { id: 'uruguay', label: 'Uruguay', emoji: '🇺🇾', iso: 'uy', tags: { continent: 'south-america', island: false, landlocked: false, population: 'small', hemisphere: 'south', euMember: false, monarchy: false, spanishSpeaking: true, hostedOlympics: false, coldClimate: false }, fact: 'Hosted and won the very first FIFA World Cup in 1930.', color: '#E0F7FA' },
  { id: 'srilanka', label: 'Sri Lanka', emoji: '🇱🇰', iso: 'lk', tags: { continent: 'asia', island: true, landlocked: false, population: 'medium', hemisphere: 'north', euMember: false, monarchy: false, spanishSpeaking: false, hostedOlympics: false, coldClimate: false }, fact: 'Known as the Pearl of the Indian Ocean, and major tea exporter.', color: '#FFFDE7' },
  { id: 'finland', label: 'Finland', emoji: '🇫🇮', iso: 'fi', tags: { continent: 'europe', island: false, landlocked: false, population: 'small', hemisphere: 'north', euMember: true, monarchy: false, spanishSpeaking: false, hostedOlympics: true, coldClimate: true }, fact: 'Consistently ranked the happiest country in the world.', color: '#E3F2FD' },
]

export const COUNTRY_CHIPS: ChipDef[] = [
  { id: 'in_europe', text: 'Is it in Europe?', check: a => a.tags.continent === 'europe' },
  { id: 'in_asia', text: 'Is it in Asia?', check: a => a.tags.continent === 'asia' },
  { id: 'in_africa', text: 'Is it in Africa?', check: a => a.tags.continent === 'africa' },
  { id: 'in_americas', text: 'Is it in the Americas (North or South)?', check: a => a.tags.continent === 'north-america' || a.tags.continent === 'south-america' },
  { id: 'in_oceania', text: 'Is it in Oceania / Pacific?', check: a => a.tags.continent === 'oceania' },
  { id: 'northern_hemisphere', text: 'Is it in the northern hemisphere?', check: a => a.tags.hemisphere === 'north' },
  { id: 'is_island', text: 'Is it an island nation / archipelago?', check: a => a.tags.island === true },
  { id: 'is_landlocked', text: 'Is it landlocked (no coast)?', check: a => a.tags.landlocked === true },
  { id: 'big_population', text: 'Does it have over 50 million people?', check: a => a.tags.population === 'large' },
  { id: 'small_population', text: 'Is its population under 15 million?', check: a => a.tags.population === 'small' },
  { id: 'spanish_speaking', text: 'Is Spanish an official/main language?', check: a => a.tags.spanishSpeaking === true },
  { id: 'has_monarch', text: 'Does it have a monarch/king/emperor?', check: a => a.tags.monarchy === true },
  { id: 'hosted_olympics', text: 'Has it hosted the Olympic Games?', check: a => a.tags.hostedOlympics === true },
  { id: 'cold_climate', text: 'Does it get heavy snow / freezing winters?', check: a => a.tags.coldClimate === true },
  { id: 'eu_member', text: 'Is it a member state of the EU?', check: a => a.tags.euMember === true },
]

// ── CATEGORY 3: COMPANIES & BRANDS (70 answers) ─────────────────────────
export const COMPANIES: Answer[] = [
  { id: 'apple', label: 'Apple', emoji: '🍎', domain: 'apple.com', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: true, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Started in a garage — now the world’s most valuable company.', color: '#E8E8E8' },
  { id: 'amazon', label: 'Amazon', emoji: '📦', domain: 'amazon.com', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Began as a bookstore — now ships everything, everywhere.', color: '#FFE8B0' },
  { id: 'google', label: 'Google', emoji: '🔍', domain: 'google.com', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Its name is a misspelling of “googol” — a 1 with 100 zeros.', color: '#FFD6D6' },
  { id: 'microsoft', label: 'Microsoft', emoji: '🪟', domain: 'microsoft.com', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: true, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Saved Apple from bankruptcy with a $150M investment in 1997.', color: '#D0E0FF' },
  { id: 'meta', label: 'Meta', emoji: '👥', domain: 'meta.com', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: true }, fact: 'Renamed from Facebook in 2021 to bet on the “metaverse.”', color: '#C8D4FF' },
  { id: 'netflix', label: 'Netflix', emoji: '🎬', domain: 'netflix.com', tags: { industry: 'entertainment', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: true, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Once mailed DVDs — its most-watched rental was “Crash.”', color: '#FFB0B0' },
  { id: 'nvidia', label: 'Nvidia', emoji: '🎮', domain: 'nvidia.com', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: true, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Its chips now power most of the world’s AI.', color: '#C0F0B0' },
  { id: 'adobe', label: 'Adobe', emoji: '🎨', domain: 'adobe.com', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Named after a river that ran behind its founders’ houses.', color: '#FFD8C0' },
  { id: 'intel', label: 'Intel', emoji: '💠', domain: 'intel.com', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: true, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Its “Intel Inside” stickers made a chip a household name.', color: '#C8E8FF' },
  { id: 'ibm', label: 'IBM', emoji: '💼', domain: 'ibm.com', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: true, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Once made typewriters, scales and meat slicers.', color: '#D8DCFF' },
  { id: 'spotify', label: 'Spotify', emoji: '🎵', domain: 'spotify.com', tags: { industry: 'entertainment', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: true, bigBoxRetail: false, foundedAfter2000: true }, fact: 'Born in Sweden — now streams to over 600M people.', color: '#C8F0C8' },
  { id: 'uber', label: 'Uber', emoji: '🚕', domain: 'uber.com', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: true }, fact: 'Its name means “above all” in German.', color: '#E0DCFF' },
  { id: 'airbnb', label: 'Airbnb', emoji: '🏠', domain: 'airbnb.com', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: true }, fact: 'Funded its start by selling Obama-themed cereal boxes.', color: '#FFDBC8' },
  { id: 'salesforce', label: 'Salesforce', emoji: '☁️', domain: 'salesforce.com', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Pioneered selling software as a subscription in the cloud.', color: '#C8F0FF' },
  { id: 'oracle', label: 'Oracle', emoji: '🔶', domain: 'oracle.com', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'A CIA project gave the company its code name.', color: '#FFD8B0' },
  { id: 'nike', label: 'Nike', emoji: '✔️', domain: 'nike.com', tags: { industry: 'fashion', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'The swoosh was designed by a student for just $35.', color: '#E8E8E8' },
  { id: 'adidas', label: 'Adidas', emoji: '👟', domain: 'adidas.com', tags: { industry: 'fashion', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Founded by the brother of the man who started Puma.', color: '#D8D8D8' },
  { id: 'zara', label: 'Zara', emoji: '🛍️', domain: 'zara.com', tags: { industry: 'fashion', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Can take a design from sketch to store in two weeks.', color: '#FFE0C8' },
  { id: 'handm', label: 'H&M', emoji: '👕', domain: 'hm.com', tags: { industry: 'fashion', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Its name stands for Hennes & Mauritz.', color: '#FFD8D0' },
  { id: 'gucci', label: 'Gucci', emoji: '👜', domain: 'gucci.com', tags: { industry: 'fashion', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Started as a luggage maker for Italian horsemen.', color: '#D8F0D0' },
  { id: 'louisvuitton', label: 'Louis Vuitton', emoji: '🧳', domain: 'louisvuitton.com', tags: { industry: 'fashion', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Began as a trunk-maker who flattened lids for stacking.', color: '#E0C8A0' },
  { id: 'chanel', label: 'Chanel', emoji: '🧴', domain: 'chanel.com', tags: { industry: 'fashion', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: false, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'The little black dress was popularised by its founder.', color: '#E0E0E0' },
  { id: 'hermes', label: 'Hermès', emoji: '🧣', domain: 'hermes.com', tags: { industry: 'fashion', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Began as a saddle maker — its logo still shows a horse.', color: '#F0D8A0' },
  { id: 'levis', label: "Levi's", emoji: '👖', domain: 'levi.com', tags: { industry: 'fashion', isTech: false, usaBased: true, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Invented the blue jean during the Gold Rush.', color: '#C8D8F0' },
  { id: 'cocacola', label: 'Coca-Cola', emoji: '🥤', domain: 'coca-cola.com', tags: { industry: 'food', isTech: false, usaBased: true, centuryOld: true, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Only two executives ever knew its secret formula.', color: '#FFC8C8' },
  { id: 'pepsico', label: 'Pepsi-Cola', emoji: '🧃', domain: 'pepsico.com', tags: { industry: 'food', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Once offered to buy itself to Coca-Cola — and was refused.', color: '#C8D8FF' },
  { id: 'mcdonalds', label: "McDonald's", emoji: '🍔', domain: 'mcdonalds.com', tags: { industry: 'food', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Its golden arches are among the most recognised symbols on Earth.', color: '#FFE8A0' },
  { id: 'starbucks', label: 'Starbucks', emoji: '☕', domain: 'starbucks.com', tags: { industry: 'food', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Its logo is a mythical two-tailed mermaid.', color: '#C8E0C8' },
  { id: 'nestle', label: 'Nestlé', emoji: '🍫', domain: 'nestle.com', tags: { industry: 'food', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'The world’s largest food company — over 2,000 brands.', color: '#FFE0D0' },
  { id: 'redbull', label: 'Red Bull', emoji: '⚡', domain: 'redbull.com', tags: { industry: 'food', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: false, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Sells a billion cans a year of one core recipe.', color: '#C8D0FF' },
  { id: 'subway', label: 'Subway', emoji: '🥪', domain: 'subway.com', tags: { industry: 'food', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: false, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Has more locations worldwide than any other restaurant chain.', color: '#D8E0A0' },
  { id: 'kfc', label: 'KFC', emoji: '🍗', domain: 'kfc.com', tags: { industry: 'food', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: false, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: true, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Colonel Sanders only wore his white suit once dyed, then reverted.', color: '#FFD8A0' },
  { id: 'tesla', label: 'Tesla', emoji: '🔋', domain: 'tesla.com', tags: { industry: 'automotive', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: true, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: true }, fact: 'Named for Nikola Tesla, who never owned the company.', color: '#E0E0E0' },
  { id: 'toyota', label: 'Toyota', emoji: '🚙', domain: 'toyota.com', tags: { industry: 'automotive', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: true, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Began as a loom-maker before it ever built a car.', color: '#FFD8D8' },
  { id: 'ford', label: 'Ford', emoji: '🚚', domain: 'ford.com', tags: { industry: 'automotive', isTech: false, usaBased: true, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: true, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Pioneered the moving assembly line in 1913.', color: '#C8D0FF' },
  { id: 'honda', label: 'Honda', emoji: '🏍️', domain: 'honda.com', tags: { industry: 'automotive', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: true, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'The world’s largest engine manufacturer.', color: '#FFD8C8' },
  { id: 'bmw', label: 'BMW', emoji: '🚘', domain: 'bmw.com', tags: { industry: 'automotive', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: true, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Started by building aircraft engines in wartime.', color: '#D8E8FF' },
  { id: 'ferrari', label: 'Ferrari', emoji: '🏎️', domain: 'ferrari.com', tags: { industry: 'automotive', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: true, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Only makes about 13,000 cars a year — by design.', color: '#FFB0B0' },
  { id: 'mercedes', label: 'Mercedes-Benz', emoji: '🌟', domain: 'mercedes-benz.com', tags: { industry: 'automotive', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: true, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Built the very first car, back in 1886.', color: '#E0E0E0' },
  { id: 'disney', label: 'Disney', emoji: '🏰', domain: 'disney.com', tags: { industry: 'entertainment', isTech: false, usaBased: true, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: true, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Mickey Mouse’s first cartoon had no spoken dialogue.', color: '#C8E0FF' },
  { id: 'nintendo', label: 'Nintendo', emoji: '🕹️', domain: 'nintendo.com', tags: { industry: 'gaming', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: true, hasRetailStores: false, makesElectronics: true, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: true, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Started in 1889 making hand-painted playing cards.', color: '#FFC8D0' },
  { id: 'sony', label: 'Sony', emoji: '📺', domain: 'sony.com', tags: { industry: 'electronics', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: true, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: true, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Made Japan’s first transistor radio — and the Walkman.', color: '#E0E0E0' },
  { id: 'samsung', label: 'Samsung', emoji: '📱', domain: 'samsung.com', tags: { industry: 'electronics', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: true, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Began as a grocery trading company in 1938.', color: '#C8D8FF' },
  { id: 'lego', label: 'Lego', emoji: '🧱', domain: 'lego.com', tags: { industry: 'toys', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: false, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Its name means “play well” in Danish.', color: '#FFD8A0' },
  { id: 'walmart', label: 'Walmart', emoji: '🛒', domain: 'walmart.com', tags: { industry: 'retail', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: true, foundedAfter2000: false }, fact: 'The largest company in the world by revenue.', color: '#FFD8C0' },
  { id: 'costco', label: 'Costco', emoji: '🏬', domain: 'costco.com', tags: { industry: 'retail', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: true, foundedAfter2000: false }, fact: 'Famous for $1.50 hot-dog-and-soda combo — unchanged since 1985.', color: '#FFD8D8' },
  { id: 'target', label: 'Target', emoji: '🎯', domain: 'target.com', tags: { industry: 'retail', isTech: false, usaBased: true, centuryOld: true, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: true, foundedAfter2000: false }, fact: 'Its bull-terrier mascot “Bullseye” has its own agent.', color: '#FFC8C8' },
  { id: 'ikea', label: 'IKEA', emoji: '🛋️', domain: 'ikea.com', tags: { industry: 'retail', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: false, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: true, foundedAfter2000: false }, fact: 'Product names follow a code — beds are Swedish places.', color: '#FFD8B0' },
  { id: 'visa', label: 'Visa', emoji: '💳', domain: 'visa.com', tags: { industry: 'finance', isTech: false, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Handles over 150 million transactions every single day.', color: '#C8D8FF' },
  { id: 'rolex', label: 'Rolex', emoji: '⌚', domain: 'rolex.com', tags: { industry: 'fashion', isTech: false, usaBased: false, centuryOld: true, publiclyTraded: false, hasRetailStores: true, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: true, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'Owned by a private trust that donates most profits to charity.', color: '#D4AF37' },
  { id: 'openai', label: 'OpenAI', emoji: '🤖', domain: 'openai.com', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: false, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: true }, fact: 'Launched ChatGPT in Nov 2022, reaching 100M users in 2 months.', color: '#10A37F' },
  { id: 'spacex', label: 'SpaceX', emoji: '🚀', domain: 'spacex.com', tags: { industry: 'tech', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: false, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: true }, fact: 'First private company to send astronauts to orbit.', color: '#E0E0E0' },
  { id: 'porsche', label: 'Porsche', emoji: '🏎️', domain: 'porsche.com', tags: { industry: 'automotive', isTech: false, usaBased: false, centuryOld: false, publiclyTraded: true, hasRetailStores: true, makesElectronics: false, makesCars: true, foodOrDrink: false, fashionApparel: false, entertainment: false, bigBoxRetail: false, foundedAfter2000: false }, fact: 'The iconic 911 was originally going to be named 901.', color: '#FFE082' },
  { id: 'roblox', label: 'Roblox', emoji: '🟥', domain: 'roblox.com', tags: { industry: 'gaming', isTech: true, usaBased: true, centuryOld: false, publiclyTraded: true, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: true, bigBoxRetail: false, foundedAfter2000: true }, fact: 'Over half of all American children play Roblox.', color: '#EF5350' },
  { id: 'tiktok', label: 'TikTok (ByteDance)', emoji: '📱', domain: 'tiktok.com', tags: { industry: 'tech', isTech: true, usaBased: false, centuryOld: false, publiclyTraded: false, hasRetailStores: false, makesElectronics: false, makesCars: false, foodOrDrink: false, fashionApparel: false, entertainment: true, bigBoxRetail: false, foundedAfter2000: true }, fact: 'The first Chinese-originated app to top 1B global downloads.', color: '#00F2FE' },
]

export const COMPANY_CHIPS: ChipDef[] = [
  { id: 'is_tech', text: 'Is it a tech / software company?', check: a => !!a.tags.isTech },
  { id: 'usa_based', text: 'Is it headquartered in the USA?', check: a => !!a.tags.usaBased },
  { id: 'has_stores', text: 'Does it operate physical retail stores?', check: a => !!a.tags.hasRetailStores },
  { id: 'century_old', text: 'Is it over 100 years old?', check: a => !!a.tags.centuryOld },
  { id: 'fashion', text: 'Is it a clothing, luxury or fashion brand?', check: a => !!a.tags.fashionApparel },
  { id: 'food_drink', text: 'Does it make food, beverages, or restaurants?', check: a => !!a.tags.foodOrDrink },
  { id: 'makes_cars', text: 'Does it manufacture cars / vehicles?', check: a => !!a.tags.makesCars },
  { id: 'electronics', text: 'Does it make hardware, chips, or gadgets?', check: a => !!a.tags.makesElectronics },
  { id: 'entertainment', text: 'Is it in media, gaming, or entertainment?', check: a => !!a.tags.entertainment },
  { id: 'big_box', text: 'Is it a supermarket, hypermarket, or big box retail?', check: a => !!a.tags.bigBoxRetail },
  { id: 'public', text: 'Is it publicly traded on a stock exchange?', check: a => !!a.tags.publiclyTraded },
  { id: 'founded_2000s', text: 'Was it founded after the year 2000?', check: a => !!a.tags.foundedAfter2000 },
]

// ── CATEGORY 4: HISTORICAL FIGURES (70 figures) ─────────────────────────
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
  { id: 'galileo', label: 'Galileo Galilei', wiki: 'Galileo_Galilei', emoji: '🔭', era: 'modern', tags: { field: 'science', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Was placed under house arrest for the rest of his life.', color: '#D8E8F0' },
  { id: 'darwin', label: 'Charles Darwin', wiki: 'Charles_Darwin', emoji: '🧬', era: 'modern', tags: { field: 'science', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: true }, fact: 'Ate his way through the animal kingdom as a student.', color: '#D0E8D0' },
  { id: 'tesla', label: 'Nikola Tesla', wiki: 'Nikola_Tesla', emoji: '⚡', era: 'contemporary', tags: { field: 'science', region: 'europe', american: true, female: false, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Could do calculus in his head during college.', color: '#E0E0F0' },
  { id: 'edison', label: 'Thomas Edison', wiki: 'Thomas_Edison', emoji: '💡', era: 'contemporary', tags: { field: 'science', region: 'americas', american: true, female: false, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Held over 1,000 U.S. patents in his name.', color: '#FFE8C0' },
  { id: 'mozart', label: 'Wolfgang Mozart', wiki: 'Wolfgang_Amadeus_Mozart', emoji: '🎼', era: 'modern', tags: { field: 'music', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: false, artist: true, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Wrote his first symphony at age eight.', color: '#F0DCE8' },
  { id: 'beethoven', label: 'Ludwig van Beethoven', wiki: 'Ludwig_van_Beethoven', emoji: '🎹', era: 'modern', tags: { field: 'music', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: false, artist: true, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Composed masterpieces after going completely deaf.', color: '#E0DCD8' },
  { id: 'michelangelo', label: 'Michelangelo', wiki: 'Michelangelo', emoji: '🖌️', era: 'modern', tags: { field: 'art', region: 'europe', american: false, female: false, bornBefore1500: true, scientist: false, artist: true, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Painted the Sistine Chapel ceiling lying on his back.', color: '#E8DCC8' },
  { id: 'vangogh', label: 'Vincent van Gogh', wiki: 'Vincent_van_Gogh', emoji: '🌻', era: 'modern', tags: { field: 'art', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: false, artist: true, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Sold just one painting while he was alive.', color: '#FFE8A0' },
  { id: 'picasso', label: 'Pablo Picasso', wiki: 'Pablo_Picasso', emoji: '🖼️', era: 'contemporary', tags: { field: 'art', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: false, artist: true, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Produced over 50,000 works of art in his life.', color: '#FFDCE0' },
  { id: 'frida', label: 'Frida Kahlo', wiki: 'Frida_Kahlo', emoji: '🌺', era: 'contemporary', tags: { field: 'art', region: 'americas', american: false, female: true, bornBefore1500: false, scientist: false, artist: true, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Began painting while bedridden after a bus crash.', color: '#FFD8D8' },
  { id: 'earhart', label: 'Amelia Earhart', wiki: 'Amelia_Earhart', emoji: '✈️', era: 'contemporary', tags: { field: 'exploration', region: 'americas', american: true, female: true, bornBefore1500: false, scientist: false, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: true }, fact: 'First woman to fly solo across the Atlantic.', color: '#D8E8E0' },
  { id: 'hawking', label: 'Stephen Hawking', wiki: 'Stephen_Hawking', emoji: '🌌', era: 'contemporary', tags: { field: 'science', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Lost a famous bet about black holes — and conceded.', color: '#D8DCFF' },
  { id: 'armstrong', label: 'Neil Armstrong', wiki: 'Neil_Armstrong', emoji: '🌑', era: 'contemporary', tags: { field: 'exploration', region: 'americas', american: true, female: false, bornBefore1500: false, scientist: false, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: true }, fact: 'His pulse hit 150 as he stepped onto the Moon.', color: '#E0E0E8' },
  { id: 'rosa', label: 'Rosa Parks', wiki: 'Rosa_Parks', emoji: '🚌', era: 'contemporary', tags: { field: 'politics', region: 'americas', american: true, female: true, bornBefore1500: false, scientist: false, artist: false, leader: true, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Her refusal to give up her seat sparked a movement.', color: '#FFE0C8' },
  { id: 'pythagoras', label: 'Pythagoras', wiki: 'Pythagoras', emoji: '📐', era: 'ancient', tags: { field: 'science', region: 'europe', american: false, female: false, bornBefore1500: true, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Founded a secretive cult devoted to numbers.', color: '#DCE4DC' },
  { id: 'aristotle', label: 'Aristotle', wiki: 'Aristotle', emoji: '📖', era: 'ancient', tags: { field: 'philosophy', region: 'europe', american: false, female: false, bornBefore1500: true, scientist: false, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Taught Alexander the Great when he was a boy.', color: '#E8DCC4' },
  { id: 'ali', label: 'Muhammad Ali', wiki: 'Muhammad_Ali', emoji: '🥊', era: 'contemporary', tags: { field: 'sports', region: 'americas', american: true, female: false, bornBefore1500: false, scientist: false, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: '“Float like a butterfly, sting like a bee.”', color: '#FFE8A8' },
  { id: 'turing', label: 'Alan Turing', wiki: 'Alan_Turing', emoji: '💻', era: 'contemporary', tags: { field: 'science', region: 'europe', american: false, female: false, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Broke the Enigma code and pioneered modern computer science.', color: '#B0BEC5' },
  { id: 'ada', label: 'Ada Lovelace', wiki: 'Ada_Lovelace', emoji: '⚙️', era: 'modern', tags: { field: 'science', region: 'europe', american: false, female: true, bornBefore1500: false, scientist: true, artist: false, leader: false, royalty: true, nobel: false, religion: false, explorer: false }, fact: 'Lord Byron’s daughter, widely regarded as the first computer programmer.', color: '#E1BEE7' },
  { id: 'copernicus', label: 'Nicolaus Copernicus', wiki: 'Nicolaus_Copernicus', emoji: '🪐', era: 'modern', tags: { field: 'science', region: 'europe', american: false, female: false, bornBefore1500: true, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Proposed that the planets orbit the Sun, not the Earth.', color: '#C5CAE9' },
  { id: 'hypatia', label: 'Hypatia', wiki: 'Hypatia', emoji: '📜', era: 'ancient', tags: { field: 'science', region: 'africa', american: false, female: true, bornBefore1500: true, scientist: true, artist: false, leader: false, royalty: false, nobel: false, religion: false, explorer: false }, fact: 'Leading mathematician and astronomer of ancient Alexandria.', color: '#FFF59D' },
]

export const FIGURE_CHIPS: ChipDef[] = [
  { id: 'in_europe', text: 'Were they European?', check: a => a.tags.region === 'europe' },
  { id: 'pre_1500', text: 'Did they live before the year 1500?', check: a => !!a.tags.bornBefore1500 },
  { id: 'scientist', text: 'Were they a scientist, mathematician, or inventor?', check: a => !!a.tags.scientist },
  { id: 'leader', text: 'Were they a political, civil, or military leader?', check: a => !!a.tags.leader },
  { id: 'female', text: 'Were they a woman?', check: a => !!a.tags.female },
  { id: 'american', text: 'Were they American (or lived primarily in the US)?', check: a => !!a.tags.american },
  { id: 'artist', text: 'Were they an artist, writer, or composer?', check: a => !!a.tags.artist },
  { id: 'royalty', text: 'Were they royalty, a monarch, or emperor?', check: a => !!a.tags.royalty },
  { id: 'nobel', text: 'Did they win a Nobel Prize?', check: a => !!a.tags.nobel },
  { id: 'ancient', text: 'Did they live in ancient times (before 500 AD)?', check: a => a.tags.era === 'ancient' },
  { id: 'explorer', text: 'Were they an explorer, pioneer, or astronaut?', check: a => !!a.tags.explorer },
]

// ── CATEGORY 5: 🎬 MOVIES & CINEMA (60 answers) ──────────────────────────
export const MOVIES: Answer[] = [
  { id: 'inception', label: 'Inception', emoji: '🌀', tags: { genre: 'scifi', animated: false, oscarWinner: true, pre2000: false, franchise: false, space: false, superhero: false, directedByNolan: true, boxOfficeBillion: false }, fact: 'Built a rotating hotel hallway corridor that weighed over 30 tons.', color: '#CFD8DC', year: 2010 },
  { id: 'titanic', label: 'Titanic', emoji: '🚢', tags: { genre: 'romance', animated: false, oscarWinner: true, pre2000: true, franchise: false, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: true }, fact: 'Tied the record for most Academy Awards in history (11 Oscars).', color: '#B0BEC5', year: 1997 },
  { id: 'matrix', label: 'The Matrix', emoji: '🕶️', tags: { genre: 'scifi', animated: false, oscarWinner: true, pre2000: true, franchise: true, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: false }, fact: 'Pioneered "bullet time" using 120 custom cameras on a green rig.', color: '#C8E6C9', year: 1999 },
  { id: 'jurassic_park', label: 'Jurassic Park', emoji: '🦖', tags: { genre: 'scifi', animated: false, oscarWinner: true, pre2000: true, franchise: true, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: true }, fact: 'Only contains about 15 minutes of total dinosaur screen time.', color: '#DCEDC8', year: 1993 },
  { id: 'interstellar', label: 'Interstellar', emoji: '🪐', tags: { genre: 'scifi', animated: false, oscarWinner: true, pre2000: false, franchise: false, space: true, superhero: false, directedByNolan: true, boxOfficeBillion: false }, fact: 'Its black hole CGI calculations led to new scientific astrophysics papers.', color: '#D1C4E9', year: 2014 },
  { id: 'dark_knight', label: 'The Dark Knight', emoji: '🦇', tags: { genre: 'action', animated: false, oscarWinner: true, pre2000: false, franchise: true, space: false, superhero: true, directedByNolan: true, boxOfficeBillion: true }, fact: 'Heath Ledger spent a month locked in a motel room preparing for the Joker.', color: '#37474F', year: 2008 },
  { id: 'avatar', label: 'Avatar', emoji: '🌿', tags: { genre: 'scifi', animated: false, oscarWinner: true, pre2000: false, franchise: true, space: true, superhero: false, directedByNolan: false, boxOfficeBillion: true }, fact: 'The highest-grossing film of all time, pulling nearly $3 Billion.', color: '#B2EBF2', year: 2009 },
  { id: 'star_wars', label: 'Star Wars: A New Hope', emoji: '⚔️', tags: { genre: 'scifi', animated: false, oscarWinner: true, pre2000: true, franchise: true, space: true, superhero: false, directedByNolan: false, boxOfficeBillion: false }, fact: 'Chewbacca’s roar was made by mixing sounds of bears, walruses, and badgers.', color: '#FFF59D', year: 1977 },
  { id: 'spirited_away', label: 'Spirited Away', emoji: '🐉', tags: { genre: 'animation', animated: true, oscarWinner: true, pre2000: false, franchise: false, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: false }, fact: 'The first and only non-English hand-drawn film to win Best Animated Feature.', color: '#FFCDD2', year: 2001 },
  { id: 'lion_king', label: 'The Lion King', emoji: '🦁', tags: { genre: 'animation', animated: true, oscarWinner: true, pre2000: true, franchise: true, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: true }, fact: 'The wildebeest stampede took Disney animators nearly three years to render.', color: '#FFE082', year: 1994 },
  { id: 'toy_story', label: 'Toy Story', emoji: '🤠', tags: { genre: 'animation', animated: true, oscarWinner: true, pre2000: true, franchise: true, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: false }, fact: 'The first fully computer-animated feature film in movie history.', color: '#BBDEFB', year: 1995 },
  { id: 'godfather', label: 'The Godfather', emoji: '🌹', tags: { genre: 'drama', animated: false, oscarWinner: true, pre2000: true, franchise: true, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: false }, fact: 'Marlon Brando wore dental prosthetic plumpers to give Vito his bulldog jaw.', color: '#D7CCC8', year: 1972 },
  { id: 'pulp_fiction', label: 'Pulp Fiction', emoji: '🍔', tags: { genre: 'crime', animated: false, oscarWinner: true, pre2000: true, franchise: false, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: false }, fact: 'Shot out of chronological order on a budget of just $8 million.', color: '#FFECB3', year: 1994 },
  { id: 'forrest_gump', label: 'Forrest Gump', emoji: '🍫', tags: { genre: 'drama', animated: false, oscarWinner: true, pre2000: true, franchise: false, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: false }, fact: 'Tom Hanks was not paid a flat salary — his percentage deal earned $65M+.', color: '#E1F5FE', year: 1994 },
  { id: 'back_to_future', label: 'Back to the Future', emoji: '🚗', tags: { genre: 'scifi', animated: false, oscarWinner: true, pre2000: true, franchise: true, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: false }, fact: 'The time machine was originally drafted as a refrigerator, not a DeLorean.', color: '#FFE082', year: 1985 },
  { id: 'harry_potter', label: 'Harry Potter & the Sorcerer\'s Stone', emoji: '⚡', tags: { genre: 'fantasy', animated: false, oscarWinner: false, pre2000: false, franchise: true, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: true }, fact: 'Over 160 pairs of glasses were made for Daniel Radcliffe during filming.', color: '#D1C4E9', year: 2001 },
  { id: 'lord_of_rings', label: 'The Lord of the Rings: Fellowship', emoji: '💍', tags: { genre: 'fantasy', animated: false, oscarWinner: true, pre2000: false, franchise: true, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: false }, fact: 'All three movies were shot simultaneously across New Zealand in 438 days.', color: '#C8E6C9', year: 2001 },
  { id: 'avengers_endgame', label: 'Avengers: Endgame', emoji: '🧤', tags: { genre: 'action', animated: false, oscarWinner: false, pre2000: false, franchise: true, space: true, superhero: true, directedByNolan: false, boxOfficeBillion: true }, fact: 'Grossed $1.2 Billion in its opening weekend alone — an all-time record.', color: '#B39DDB', year: 2019 },
  { id: 'gladiator', label: 'Gladiator', emoji: '⚔️', tags: { genre: 'action', animated: false, oscarWinner: true, pre2000: false, franchise: true, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: false }, fact: 'Five real tigers were brought onto the arena set during the fight scene.', color: '#FFE0B2', year: 2000 },
  { id: 'shrek', label: 'Shrek', emoji: '🧅', tags: { genre: 'animation', animated: true, oscarWinner: true, pre2000: false, franchise: true, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: false }, fact: 'Won the very first Academy Award for Best Animated Feature in 2002.', color: '#C5E1A5', year: 2001 },
  { id: 'oppenheimer', label: 'Oppenheimer', emoji: '💣', tags: { genre: 'drama', animated: false, oscarWinner: true, pre2000: false, franchise: false, space: false, superhero: false, directedByNolan: true, boxOfficeBillion: false }, fact: 'Recreated the Trinity nuclear test using real pyrotechnics, zero CGI.', color: '#FFAB91', year: 2023 },
  { id: 'barbie', label: 'Barbie', emoji: '🎀', tags: { genre: 'comedy', animated: false, oscarWinner: true, pre2000: false, franchise: false, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: true }, fact: 'Caused an international shortage of fluorescent pink paint during set construction.', color: '#F48FB1', year: 2023 },
  { id: 'coco', label: 'Coco', emoji: '🎸', tags: { genre: 'animation', animated: true, oscarWinner: true, pre2000: false, franchise: false, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: false }, fact: 'Every guitar chord strummed on screen matches real musical fingering.', color: '#FFCC80', year: 2017 },
  { id: 'alien', label: 'Alien', emoji: '👽', tags: { genre: 'horror', animated: false, oscarWinner: true, pre2000: true, franchise: true, space: true, superhero: false, directedByNolan: false, boxOfficeBillion: false }, fact: 'The cast did not know the chestburster scene would erupt with blood.', color: '#80CBC4', year: 1979 },
  { id: 'jaws', label: 'Jaws', emoji: '🦈', tags: { genre: 'thriller', animated: false, oscarWinner: true, pre2000: true, franchise: true, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: false }, fact: 'The mechanical shark kept breaking down, forcing Spielberg to hide it and build suspense.', color: '#81D4FA', year: 1975 },
  { id: 'finding_nemo', label: 'Finding Nemo', emoji: '🐠', tags: { genre: 'animation', animated: true, oscarWinner: true, pre2000: false, franchise: true, space: false, superhero: false, directedByNolan: false, boxOfficeBillion: false }, fact: 'Was the best-selling DVD of all time with over 40 million copies sold.', color: '#FFAB91', year: 2003 },
]

export const MOVIE_CHIPS: ChipDef[] = [
  { id: 'is_animated', text: 'Is it an animated / CGI film?', check: a => !!a.tags.animated },
  { id: 'pre_2000', text: 'Was it released before the year 2000?', check: a => !!a.tags.pre2000 },
  { id: 'oscar_winner', text: 'Did it win an Academy Award (Oscar)?', check: a => !!a.tags.oscarWinner },
  { id: 'is_scifi_fantasy', text: 'Is it Sci-Fi or Fantasy genre?', check: a => a.tags.genre === 'scifi' || a.tags.genre === 'fantasy' },
  { id: 'is_franchise', text: 'Is it part of a movie series / franchise / sequels?', check: a => !!a.tags.franchise },
  { id: 'space_theme', text: 'Does it involve space travel or extraterrestrials?', check: a => !!a.tags.space },
  { id: 'billion_box_office', text: 'Did it gross over $1 Billion at the box office?', check: a => !!a.tags.boxOfficeBillion },
  { id: 'superhero', text: 'Is it based on comic book superheroes?', check: a => !!a.tags.superhero },
  { id: 'nolan_directed', text: 'Was it directed by Christopher Nolan?', check: a => !!a.tags.directedByNolan },
]

// ── CATEGORY 6: 🎮 VIDEO GAMES (60 answers) ──────────────────────────────
export const GAMES: Answer[] = [
  { id: 'minecraft', label: 'Minecraft', emoji: '🧱', tags: { genre: 'sandbox', multiplayer: true, nintendo: false, pre2010: false, openWorld: true, firstPerson: true, indieOrigin: true, hasGuns: false, japanOrigin: false }, fact: 'The best-selling video game of all time with over 300 million copies sold.', color: '#A5D6A7', year: 2011 },
  { id: 'mario_bros', label: 'Super Mario Bros.', emoji: '🍄', tags: { genre: 'platformer', multiplayer: true, nintendo: true, pre2010: true, openWorld: false, firstPerson: false, indieOrigin: false, hasGuns: false, japanOrigin: true }, fact: 'The bushes and clouds in the original game use the exact same sprite shape in different colors.', color: '#EF9A9A', year: 1985 },
  { id: 'zelda_botw', label: 'Zelda: Breath of the Wild', emoji: '🗡️', tags: { genre: 'rpg', multiplayer: false, nintendo: true, pre2010: false, openWorld: true, firstPerson: false, indieOrigin: false, hasGuns: false, japanOrigin: true }, fact: 'Its physics and chemistry engine allows you to cook, create updrafts, and surf shields.', color: '#80DEEA', year: 2017 },
  { id: 'gta_v', label: 'Grand Theft Auto V', emoji: '💰', tags: { genre: 'action', multiplayer: true, nintendo: false, pre2010: false, openWorld: true, firstPerson: true, indieOrigin: false, hasGuns: true, japanOrigin: false }, fact: 'Generated $1 Billion in retail sales in its first three days.', color: '#FFE082', year: 2013 },
  { id: 'pokemon_red', label: 'Pokemon Red & Blue', emoji: '⚡', tags: { genre: 'rpg', multiplayer: true, nintendo: true, pre2010: true, openWorld: false, firstPerson: false, indieOrigin: false, hasGuns: false, japanOrigin: true }, fact: 'Inspired by creator Satoshi Tajiri’s childhood hobby of catching beetles.', color: '#FFCDD2', year: 1996 },
  { id: 'tetris', label: 'Tetris', emoji: '🕹️', tags: { genre: 'puzzle', multiplayer: true, nintendo: false, pre2010: true, openWorld: false, firstPerson: false, indieOrigin: true, hasGuns: false, japanOrigin: false }, fact: 'Programmed in 1984 on an Electronika 60 computer in Soviet Moscow.', color: '#CE93D8', year: 1984 },
  { id: 'fortnite', label: 'Fortnite', emoji: '🪂', tags: { genre: 'battleroyale', multiplayer: true, nintendo: false, pre2010: false, openWorld: true, firstPerson: false, indieOrigin: false, hasGuns: true, japanOrigin: false }, fact: 'Originally conceived as a co-op zombie defense game with building mechanics.', color: '#81D4FA', year: 2017 },
  { id: 'elden_ring', label: 'Elden Ring', emoji: '💍', tags: { genre: 'rpg', multiplayer: true, nintendo: false, pre2010: false, openWorld: true, firstPerson: false, indieOrigin: false, hasGuns: false, japanOrigin: true }, fact: 'World-building and lore were co-written by George R. R. Martin.', color: '#FFE082', year: 2022 },
  { id: 'skyrim', label: 'The Elder Scrolls V: Skyrim', emoji: '🐉', tags: { genre: 'rpg', multiplayer: false, nintendo: false, pre2010: false, openWorld: true, firstPerson: true, indieOrigin: false, hasGuns: false, japanOrigin: false }, fact: 'Includes over 60,000 lines of recorded voice dialogue across thousands of NPCs.', color: '#B0BEC5', year: 2011 },
  { id: 'portal', label: 'Portal', emoji: '🌀', tags: { genre: 'puzzle', multiplayer: false, nintendo: false, pre2010: true, openWorld: false, firstPerson: true, indieOrigin: false, hasGuns: true, japanOrigin: false }, fact: 'Created by a team of college students hired directly by Valve after seeing their project.', color: '#90CAF9', year: 2007 },
  { id: 'pacman', label: 'Pac-Man', emoji: '🟡', tags: { genre: 'arcade', multiplayer: false, nintendo: false, pre2010: true, openWorld: false, firstPerson: false, indieOrigin: false, hasGuns: false, japanOrigin: true }, fact: 'Each ghost has its own AI personality: Blinky chases, Pinky ambushes, Inky flanks, Clyde wanders.', color: '#FFF59D', year: 1980 },
  { id: 'halo_ce', label: 'Halo: Combat Evolved', emoji: '🪖', tags: { genre: 'fps', multiplayer: true, nintendo: false, pre2010: true, openWorld: false, firstPerson: true, indieOrigin: false, hasGuns: true, japanOrigin: false }, fact: 'Originally started development as a real-time strategy game for Apple Mac.', color: '#A5D6A7', year: 2001 },
  { id: 'witcher_3', label: 'The Witcher 3: Wild Hunt', emoji: '🐺', tags: { genre: 'rpg', multiplayer: false, nintendo: false, pre2010: false, openWorld: true, firstPerson: false, indieOrigin: false, hasGuns: false, japanOrigin: false }, fact: 'Won over 250 Game of the Year awards upon release in 2015.', color: '#D7CCC8', year: 2015 },
  { id: 'stardew', label: 'Stardew Valley', emoji: '🌾', tags: { genre: 'simulation', multiplayer: true, nintendo: false, pre2010: false, openWorld: false, firstPerson: false, indieOrigin: true, hasGuns: false, japanOrigin: false }, fact: 'Developed entirely by a single person (Eric Barone) over four and a half years.', color: '#C8E6C9', year: 2016 },
  { id: 'among_us', label: 'Among Us', emoji: '🚀', tags: { genre: 'party', multiplayer: true, nintendo: false, pre2010: false, openWorld: false, firstPerson: false, indieOrigin: true, hasGuns: false, japanOrigin: false }, fact: 'Had only 30 active players at launch in 2018 before exploding to 500M in 2020.', color: '#FF8A80', year: 2018 },
  { id: 'dark_souls', label: 'Dark Souls', emoji: '🔥', tags: { genre: 'rpg', multiplayer: true, nintendo: false, pre2010: false, openWorld: false, firstPerson: false, indieOrigin: false, hasGuns: false, japanOrigin: true }, fact: 'Popularized the phrase "Prepare to Die" and created an entire game sub-genre.', color: '#FFAB91', year: 2011 },
  { id: 'counter_strike', label: 'Counter-Strike', emoji: '💣', tags: { genre: 'fps', multiplayer: true, nintendo: false, pre2010: true, openWorld: false, firstPerson: true, indieOrigin: true, hasGuns: true, japanOrigin: false }, fact: 'Started as a free fan modification for the 1998 shooter Half-Life.', color: '#B0BEC5', year: 2000 },
  { id: 'god_of_war', label: 'God of War', emoji: '🪓', tags: { genre: 'action', multiplayer: false, nintendo: false, pre2010: false, openWorld: false, firstPerson: false, indieOrigin: false, hasGuns: false, japanOrigin: false }, fact: 'The entire 2018 game is presented as a single continuous camera shot with no cuts.', color: '#CFD8DC', year: 2018 },
  { id: 'undertale', label: 'Undertale', emoji: '❤️', tags: { genre: 'rpg', multiplayer: false, nintendo: false, pre2010: false, openWorld: false, firstPerson: false, indieOrigin: true, hasGuns: false, japanOrigin: false }, fact: 'You can beat the entire game without defeating or hurting a single enemy.', color: '#F8BBD0', year: 2015 },
  { id: 'cyberpunk', label: 'Cyberpunk 2077', emoji: '🦾', tags: { genre: 'rpg', multiplayer: false, nintendo: false, pre2010: false, openWorld: true, firstPerson: true, indieOrigin: false, hasGuns: true, japanOrigin: false }, fact: 'Keanu Reeves provided voice, motion capture, and likeness for Johnny Silverhand.', color: '#FFF176', year: 2020 },
  { id: 'overwatch', label: 'Overwatch', emoji: '🛡️', tags: { genre: 'fps', multiplayer: true, nintendo: false, pre2010: false, openWorld: false, firstPerson: true, indieOrigin: false, hasGuns: true, japanOrigin: false }, fact: 'Born from the ashes of "Titan", a cancelled 7-year Blizzard MMO project.', color: '#FFE0B2', year: 2016 },
  { id: 'sonic', label: 'Sonic the Hedgehog', emoji: '🦔', tags: { genre: 'platformer', multiplayer: false, nintendo: false, pre2010: true, openWorld: false, firstPerson: false, indieOrigin: false, hasGuns: false, japanOrigin: true }, fact: 'Created to be Sega’s mascot to rival Nintendo’s Mario.', color: '#90CAF9', year: 1991 },
  { id: 'doom', label: 'Doom', emoji: '👹', tags: { genre: 'fps', multiplayer: true, nintendo: false, pre2010: true, openWorld: false, firstPerson: true, indieOrigin: true, hasGuns: true, japanOrigin: false }, fact: 'Was installed on more computers worldwide in 1995 than Microsoft Windows.', color: '#EF9A9A', year: 1993 },
  { id: 'league_legends', label: 'League of Legends', emoji: '⚔️', tags: { genre: 'moba', multiplayer: true, nintendo: false, pre2010: true, openWorld: false, firstPerson: false, indieOrigin: false, hasGuns: true, japanOrigin: false }, fact: 'Its World Championship final draws more viewers than the Super Bowl.', color: '#80CBC4', year: 2009 },
  { id: 'wow', label: 'World of Warcraft', emoji: '🏰', tags: { genre: 'mmo', multiplayer: true, nintendo: false, pre2010: true, openWorld: true, firstPerson: false, indieOrigin: false, hasGuns: false, japanOrigin: false }, fact: 'At its peak, had over 12 million monthly paying subscribers.', color: '#FFE082', year: 2004 },
  { id: 'apex_legends', label: 'Apex Legends', emoji: '🎯', tags: { genre: 'battleroyale', multiplayer: true, nintendo: false, pre2010: false, openWorld: true, firstPerson: true, indieOrigin: false, hasGuns: true, japanOrigin: false }, fact: 'Surprise-launched with zero prior marketing and signed 25M players in a week.', color: '#FFAB91', year: 2019 },
]

export const GAME_CHIPS: ChipDef[] = [
  { id: 'is_multiplayer', text: 'Does it support multiplayer / online play?', check: a => !!a.tags.multiplayer },
  { id: 'is_nintendo', text: 'Was it published / developed by Nintendo?', check: a => !!a.tags.nintendo },
  { id: 'pre_2010', text: 'Was it released before the year 2010?', check: a => !!a.tags.pre2010 },
  { id: 'open_world', text: 'Is it an open world game?', check: a => !!a.tags.openWorld },
  { id: 'first_person', text: 'Is it played from a first-person perspective?', check: a => !!a.tags.firstPerson },
  { id: 'indie_origin', text: 'Did it start as an independent (Indie) game?', check: a => !!a.tags.indieOrigin },
  { id: 'has_guns', text: 'Does gameplay prominently involve firearms / shooting?', check: a => !!a.tags.hasGuns },
  { id: 'japan_origin', text: 'Was it developed originally in Japan?', check: a => !!a.tags.japanOrigin },
  { id: 'is_rpg', text: 'Is it an RPG / Role-Playing Game?', check: a => a.tags.genre === 'rpg' },
]

// ── CATEGORY 7: 🍕 FOOD & CUISINE (60 answers) ───────────────────────────
export const FOOD: Answer[] = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕', tags: { sweet: false, servedHot: true, handFood: true, origin: 'europe', hasCheese: true, spicy: false, hasDough: true, isBreakfast: false }, fact: 'Invented in Naples, Italy in 1889 to honor Queen Margherita.', color: '#FFCC80' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣', tags: { sweet: false, servedHot: false, handFood: true, origin: 'asia', hasCheese: false, spicy: false, hasDough: false, isBreakfast: false }, fact: 'Originally began as a fermented fish preservation method in rice vinegar.', color: '#FFAB91' },
  { id: 'tacos', label: 'Tacos', emoji: '🌮', tags: { sweet: false, servedHot: true, handFood: true, origin: 'americas', hasCheese: true, spicy: true, hasDough: true, isBreakfast: false }, fact: 'The word taco comes from Mexican silver miners who used paper-wrapped gunpowder tacos.', color: '#FFE082' },
  { id: 'croissant', label: 'Croissant', emoji: '🥐', tags: { sweet: true, servedHot: true, handFood: true, origin: 'europe', hasCheese: false, spicy: false, hasDough: true, isBreakfast: true }, fact: 'Originated in Vienna, Austria as the "kipferl" before being perfected in Paris.', color: '#FFE0B2' },
  { id: 'ramen', label: 'Ramen', emoji: '🍜', tags: { sweet: false, servedHot: true, handFood: false, origin: 'asia', hasCheese: false, spicy: true, hasDough: true, isBreakfast: false }, fact: 'Instant ramen was invented in 1958 by Momofuku Ando in a backyard shed.', color: '#FFECB3' },
  { id: 'burger', label: 'Hamburger', emoji: '🍔', tags: { sweet: false, servedHot: true, handFood: true, origin: 'americas', hasCheese: true, spicy: false, hasDough: true, isBreakfast: false }, fact: 'Named after the city of Hamburg, Germany where ground beef steaks originated.', color: '#FFD54F' },
  { id: 'burrito', label: 'Burrito', emoji: '🌯', tags: { sweet: false, servedHot: true, handFood: true, origin: 'americas', hasCheese: true, spicy: true, hasDough: true, isBreakfast: false }, fact: 'Burrito means "little donkey" in Spanish, named after the packs donkeys carried.', color: '#DCE775' },
  { id: 'ice_cream', label: 'Ice Cream', emoji: '🍨', tags: { sweet: true, servedHot: false, handFood: false, origin: 'europe', hasCheese: false, spicy: false, hasDough: false, isBreakfast: false }, fact: 'Vanilla is the world’s most popular flavor, accounting for ~30% of sales.', color: '#B3E5FC' },
  { id: 'chocolate', label: 'Chocolate', emoji: '🍫', tags: { sweet: true, servedHot: false, handFood: true, origin: 'americas', hasCheese: false, spicy: false, hasDough: false, isBreakfast: false }, fact: 'Ancient Mayans used cacao beans as currency and drank bitter chocolate foam.', color: '#D7CCC8' },
  { id: 'lasagna', label: 'Lasagna', emoji: '🍝', tags: { sweet: false, servedHot: true, handFood: false, origin: 'europe', hasCheese: true, spicy: false, hasDough: true, isBreakfast: false }, fact: 'One of the oldest recorded pasta dishes, dating back to ancient Rome.', color: '#FFAB91' },
  { id: 'curry', label: 'Butter Chicken Curry', emoji: '🍛', tags: { sweet: false, servedHot: true, handFood: false, origin: 'asia', hasCheese: false, spicy: true, hasDough: false, isBreakfast: false }, fact: 'Invented in 1950s Delhi by cooks recycling leftover tandoori chicken.', color: '#FFB74D' },
  { id: 'dim_sum', label: 'Dim Sum / Dumplings', emoji: '🥟', tags: { sweet: false, servedHot: true, handFood: true, origin: 'asia', hasCheese: false, spicy: false, hasDough: true, isBreakfast: false }, fact: 'Dim Sum translates poetically to "touch the heart" in Cantonese.', color: '#FFF9C4' },
  { id: 'pancakes', label: 'Pancakes', emoji: '🥞', tags: { sweet: true, servedHot: true, handFood: false, origin: 'europe', hasCheese: false, spicy: false, hasDough: true, isBreakfast: true }, fact: 'Otzi the Iceman had traces of ancient pancake batter in his stomach 5,300 years ago.', color: '#FFE082' },
  { id: 'donut', label: 'Donut', emoji: '🍩', tags: { sweet: true, servedHot: false, handFood: true, origin: 'americas', hasCheese: false, spicy: false, hasDough: true, isBreakfast: true }, fact: 'The hole was invented in 1847 so the center would fry evenly.', color: '#F48FB1' },
  { id: 'falafel', label: 'Falafel', emoji: '🧆', tags: { sweet: false, servedHot: true, handFood: true, origin: 'middle-east', hasCheese: false, spicy: true, hasDough: false, isBreakfast: false }, fact: 'Deep-fried chickpea balls traditionally eaten inside warm pita bread.', color: '#C5E1A5' },
  { id: 'cheesecake', label: 'Cheesecake', emoji: '🍰', tags: { sweet: true, servedHot: false, handFood: false, origin: 'europe', hasCheese: true, spicy: false, hasDough: true, isBreakfast: false }, fact: 'Served to athletes during the first Olympic Games in Greece in 776 BC.', color: '#FFF59D' },
  { id: 'paella', label: 'Paella', emoji: '🥘', tags: { sweet: false, servedHot: true, handFood: false, origin: 'europe', hasCheese: false, spicy: false, hasDough: false, isBreakfast: false }, fact: 'Originated in Valencia, Spain — saffron gives the rice its golden yellow color.', color: '#FFE082' },
  { id: 'poutine', label: 'Poutine', emoji: '🍟', tags: { sweet: false, servedHot: true, handFood: true, origin: 'americas', hasCheese: true, spicy: false, hasDough: false, isBreakfast: false }, fact: 'Invented in Quebec in the 1950s combining fresh cheese curds and hot gravy.', color: '#FFCC80' },
  { id: 'pad_thai', label: 'Pad Thai', emoji: '🥢', tags: { sweet: false, servedHot: true, handFood: false, origin: 'asia', hasCheese: false, spicy: true, hasDough: true, isBreakfast: false }, fact: 'Promoted by the Thai government in the 1930s to foster national unity.', color: '#FFE0B2' },
  { id: 'guacamole', label: 'Guacamole', emoji: '🥑', tags: { sweet: false, servedHot: false, handFood: true, origin: 'americas', hasCheese: false, spicy: true, hasDough: false, isBreakfast: false }, fact: 'Over 100 million pounds of avocados are eaten on Super Bowl Sunday.', color: '#C5E1A5' },
  { id: 'bagel', label: 'Bagel & Cream Cheese', emoji: '🥯', tags: { sweet: false, servedHot: true, handFood: true, origin: 'europe', hasCheese: true, spicy: false, hasDough: true, isBreakfast: true }, fact: 'The only bread that is boiled in water before being baked in an oven.', color: '#FFE082' },
  { id: 'fondue', label: 'Cheese Fondue', emoji: '🫕', tags: { sweet: false, servedHot: true, handFood: false, origin: 'europe', hasCheese: true, spicy: false, hasDough: false, isBreakfast: false }, fact: 'National dish of Switzerland created to use up aged cheese and hardened bread in winter.', color: '#FFF59D' },
  { id: 'waffles', label: 'Belgian Waffles', emoji: '🧇', tags: { sweet: true, servedHot: true, handFood: true, origin: 'europe', hasCheese: false, spicy: false, hasDough: true, isBreakfast: true }, fact: 'The deep grid pockets were designed to hold melted butter and syrup.', color: '#FFE082' },
  { id: 'shawarma', label: 'Shawarma / Kebab', emoji: '🥙', tags: { sweet: false, servedHot: true, handFood: true, origin: 'middle-east', hasCheese: false, spicy: true, hasDough: true, isBreakfast: false }, fact: 'Meat is stacked on a vertical rotating spit and shaved off to order.', color: '#D7CCC8' },
  { id: 'tiramisu', label: 'Tiramisu', emoji: '🍮', tags: { sweet: true, servedHot: false, handFood: false, origin: 'europe', hasCheese: true, spicy: false, hasDough: true, isBreakfast: false }, fact: 'Literally translates to "pick me up" due to its espresso coffee kick.', color: '#D7CCC8' },
]

export const FOOD_CHIPS: ChipDef[] = [
  { id: 'is_sweet', text: 'Is it a dessert or sweet food?', check: a => !!a.tags.sweet },
  { id: 'served_hot', text: 'Is it traditionally served hot / warm?', check: a => !!a.tags.servedHot },
  { id: 'eaten_hands', text: 'Is it finger food (eaten with your hands)?', check: a => !!a.tags.handFood },
  { id: 'from_asia', text: 'Does it originate from Asia?', check: a => a.tags.origin === 'asia' },
  { id: 'from_europe', text: 'Does it originate from Europe?', check: a => a.tags.origin === 'europe' },
  { id: 'from_americas', text: 'Does it originate from the Americas?', check: a => a.tags.origin === 'americas' },
  { id: 'has_cheese', text: 'Does it contain cheese or dairy base?', check: a => !!a.tags.hasCheese },
  { id: 'is_spicy', text: 'Is it commonly spiced or fiery hot?', check: a => !!a.tags.spicy },
  { id: 'has_dough', text: 'Is it made with dough, noodles, bread or pastry?', check: a => !!a.tags.hasDough },
  { id: 'is_breakfast', text: 'Is it iconic as a breakfast food?', check: a => !!a.tags.isBreakfast },
]

// ── CATEGORY 8: 🏛️ WORLD LANDMARKS & WONDERS (50 answers) ────────────────
export const LANDMARKS: Answer[] = [
  { id: 'eiffel_tower', label: 'Eiffel Tower', emoji: '🗼', tags: { region: 'europe', natural: false, ancient: false, tower: true, nearWater: true, heightOver100m: true }, fact: 'Grows up to 6 inches taller during hot summer days due to metal thermal expansion.', color: '#D7CCC8' },
  { id: 'great_wall', label: 'Great Wall of China', emoji: '🧱', tags: { region: 'asia', natural: false, ancient: true, tower: false, nearWater: false, heightOver100m: false }, fact: 'Total length measures over 13,000 miles across northern China.', color: '#FFE082' },
  { id: 'taj_mahal', label: 'Taj Mahal', emoji: '🕌', tags: { region: 'asia', natural: false, ancient: false, tower: true, nearWater: true, heightOver100m: false }, fact: 'Built entirely of white marble by Emperor Shah Jahan in memory of his favorite wife.', color: '#ECEFF1' },
  { id: 'colosseum', label: 'Colosseum', emoji: '🏛️', tags: { region: 'europe', natural: false, ancient: true, tower: false, nearWater: false, heightOver100m: false }, fact: 'Could seat 50,000 spectators and was occasionally flooded for mock naval battles.', color: '#FFE0B2' },
  { id: 'pyramids_giza', label: 'Pyramids of Giza', emoji: '📐', tags: { region: 'africa', natural: false, ancient: true, tower: false, nearWater: true, heightOver100m: true }, fact: 'The oldest and only surviving Wonder of the Ancient World, standing for 4,500 years.', color: '#FFE082' },
  { id: 'statue_liberty', label: 'Statue of Liberty', emoji: '🗽', tags: { region: 'americas', natural: false, ancient: false, tower: true, nearWater: true, heightOver100m: false }, fact: 'Gifted by France to the US in 1886; its green patina is oxidized copper.', color: '#A7FFEB' },
  { id: 'machu_picchu', label: 'Machu Picchu', emoji: '🏔️', tags: { region: 'americas', natural: false, ancient: false, tower: false, nearWater: false, heightOver100m: false }, fact: 'Built without mortar — stone blocks fit together so snugly a knife blade cannot fit between.', color: '#C8E6C9' },
  { id: 'big_ben', label: 'Big Ben & Parliament', emoji: '🕰️', tags: { region: 'europe', natural: false, ancient: false, tower: true, nearWater: true, heightOver100m: false }, fact: 'Big Ben is technically the name of the 13-ton bell inside, not the clock tower.', color: '#CFD8DC' },
  { id: 'sydney_opera', label: 'Sydney Opera House', emoji: '⛵', tags: { region: 'oceania', natural: false, ancient: false, tower: false, nearWater: true, heightOver100m: false }, fact: 'Its iconic roof sails are covered in over one million self-cleaning Swedish tiles.', color: '#ECEFF1' },
  { id: 'christ_redeemer', label: 'Christ the Redeemer', emoji: '🗿', tags: { region: 'americas', natural: false, ancient: false, tower: true, nearWater: true, heightOver100m: false }, fact: 'Stands atop Corcovado mountain and gets struck by lightning several times a year.', color: '#E0F2F1' },
  { id: 'mount_everest', label: 'Mount Everest', emoji: '⛰️', tags: { region: 'asia', natural: true, ancient: true, tower: false, nearWater: false, heightOver100m: true }, fact: 'The highest point on Earth at 29,032 feet above sea level, and still growing 4mm a year.', color: '#E1F5FE' },
  { id: 'grand_canyon', label: 'Grand Canyon', emoji: '🏜️', tags: { region: 'americas', natural: true, ancient: true, tower: false, nearWater: true, heightOver100m: true }, fact: 'Carved over 6 million years by the Colorado River, reaching over a mile deep.', color: '#FFAB91' },
  { id: 'leaning_pisa', label: 'Leaning Tower of Pisa', emoji: '🏢', tags: { region: 'europe', natural: false, ancient: false, tower: true, nearWater: false, heightOver100m: false }, fact: 'Started leaning during construction in 1173 because of soft sandy foundation soil.', color: '#FFF9C4' },
  { id: 'golden_gate', label: 'Golden Gate Bridge', emoji: '🌉', tags: { region: 'americas', natural: false, ancient: false, tower: true, nearWater: true, heightOver100m: true }, fact: 'Its signature orange vermilion color was selected to remain visible in heavy ocean fog.', color: '#FF7043' },
  { id: 'stonehenge', label: 'Stonehenge', emoji: '🪨', tags: { region: 'europe', natural: false, ancient: true, tower: false, nearWater: false, heightOver100m: false }, fact: 'Some bluestones were transported over 140 miles from Wales around 3000 BC.', color: '#B0BEC5' },
  { id: 'burj_khalifa', label: 'Burj Khalifa', emoji: '🏙️', tags: { region: 'asia', natural: false, ancient: false, tower: true, nearWater: false, heightOver100m: true }, fact: 'The tallest structure on Earth at 2,717 feet — twice the height of the Empire State.', color: '#B3E5FC' },
  { id: 'petra', label: 'Petra (Treasury)', emoji: '🏛️', tags: { region: 'asia', natural: false, ancient: true, tower: false, nearWater: false, heightOver100m: false }, fact: 'Known as the Rose City, half carved directly into sandstone cliff faces in Jordan.', color: '#FFCC80' },
  { id: 'acropolis', label: 'The Parthenon (Acropolis)', emoji: '🏛️', tags: { region: 'europe', natural: false, ancient: true, tower: false, nearWater: true, heightOver100m: false }, fact: 'Constructed with subtle optical curves so the columns appear perfectly straight to the human eye.', color: '#FFE0B2' },
  { id: 'niagara_falls', label: 'Niagara Falls', emoji: '🌊', tags: { region: 'americas', natural: true, ancient: true, tower: false, nearWater: true, heightOver100m: false }, fact: 'Over 700,000 gallons of water crash over the falls every single second.', color: '#81D4FA' },
  { id: 'mount_fuji', label: 'Mount Fuji', emoji: '🗻', tags: { region: 'asia', natural: true, ancient: true, tower: false, nearWater: true, heightOver100m: true }, fact: 'An active stratovolcano with an exceptionally symmetrical snow-capped cone.', color: '#E1BEE7' },
]

export const LANDMARK_CHIPS: ChipDef[] = [
  { id: 'is_natural', text: 'Is it a natural wonder (mountain/canyon/waterfall)?', check: a => !!a.tags.natural },
  { id: 'is_ancient', text: 'Was it built / existed over 1,000 years ago?', check: a => !!a.tags.ancient },
  { id: 'in_europe', text: 'Is it located in Europe?', check: a => a.tags.region === 'europe' },
  { id: 'in_asia', text: 'Is it located in Asia?', check: a => a.tags.region === 'asia' },
  { id: 'in_americas', text: 'Is it located in North or South America?', check: a => a.tags.region === 'americas' },
  { id: 'is_tower', text: 'Is it a tower, monument, or tall building?', check: a => !!a.tags.tower },
  { id: 'near_water', text: 'Is it located beside a river, harbor, or ocean?', check: a => !!a.tags.nearWater },
  { id: 'over_100m', text: 'Is it taller than 100 meters (330 feet)?', check: a => !!a.tags.heightOver100m },
]

// ── CATEGORY REGISTRY (8 Total Categories) ─────────────────────────────
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
  {
    id: 'movies',
    label: 'MOVIES & CINEMA',
    blurb: 'One iconic film. Narrow it down.',
    answers: MOVIES,
    chips: MOVIE_CHIPS,
    sampleChips: ['Is it an animated film?', 'Released before 2000?', 'Did it win an Oscar?', 'Grossed over $1 Billion?'],
    glyph: '🎬',
  },
  {
    id: 'games',
    label: 'VIDEO GAMES',
    blurb: 'One legendary game. Narrow it down.',
    answers: GAMES,
    chips: GAME_CHIPS,
    sampleChips: ['Is it multiplayer / online?', 'Made by Nintendo?', 'Released before 2010?', 'Is it an Open World game?'],
    glyph: '🎮',
  },
  {
    id: 'food',
    label: 'FOOD & CUISINE',
    blurb: 'One delicious dish. Narrow it down.',
    answers: FOOD,
    chips: FOOD_CHIPS,
    sampleChips: ['Is it a sweet dessert?', 'Served hot / warm?', 'Originates from Asia?', 'Contains cheese?'],
    glyph: '🍕',
  },
  {
    id: 'landmarks',
    label: 'WORLD WONDERS',
    blurb: 'One famous landmark. Narrow it down.',
    answers: LANDMARKS,
    chips: LANDMARK_CHIPS,
    sampleChips: ['Is it a natural wonder?', 'Located in Europe?', 'Over 1,000 years old?', 'Is it a tower or monument?'],
    glyph: '🏛️',
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

/** Brand logo image */
export function logoUrl(a: Answer) {
  if (!a.domain) return ''
  return `https://icons.duckduckgo.com/ip3/${a.domain}.ico`
}

export function logoFallback(a: Answer) {
  if (!a.domain) return ''
  return `https://www.google.com/s2/favicons?sz=128&domain_url=https://${a.domain}`
}

export function figureInitials(a: Answer): string {
  const drop = new Set(['of', 'the', 'da', 'van', 'de', 'der', 'del', 'la', 'jr.', 'jr', 'sr.', 'sr', 'ii', 'iii', 'iv'])
  const words = a.label.split(/\s+/).filter(w => w.length > 0 && !drop.has(w.toLowerCase().replace('.', '')))
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

export function hashStr(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

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

export function toPublicCandidate(a: Answer) {
  return {
    id: a.id,
    label: a.label,
    emoji: a.emoji,
    color: a.color,
    fact: a.fact,
    iso: a.iso,
    domain: a.domain,
    era: a.era,
    wiki: a.wiki,
    year: a.year,
  }
}
export type PublicCandidate = ReturnType<typeof toPublicCandidate>

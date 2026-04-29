import type { WordRelationship } from "@/types/english";

/**
 * Synonym, antonym, and rhyme groups for words in the word database.
 */
export const WORD_RELATIONSHIPS: WordRelationship[] = [
  // Animals
  { wordId: "w001", word: "cat", synonyms: ["kitten", "feline"], antonyms: ["dog"], rhymes: ["bat", "hat", "mat", "rat", "sat", "fat"] },
  { wordId: "w002", word: "dog", synonyms: ["puppy", "hound", "canine"], antonyms: ["cat"], rhymes: ["log", "fog", "bog", "frog", "hog"] },
  { wordId: "w026", word: "fish", synonyms: ["seafood"], antonyms: [], rhymes: ["dish", "wish", "swish"] },
  { wordId: "w027", word: "bird", synonyms: ["fowl", "feathered friend"], antonyms: [], rhymes: ["word", "heard", "herd"] },
  { wordId: "w028", word: "frog", synonyms: ["toad"], antonyms: [], rhymes: ["log", "dog", "bog", "fog"] },

  // Colors
  { wordId: "w008", word: "red", synonyms: ["crimson", "scarlet"], antonyms: ["green"], rhymes: ["bed", "fed", "led", "shed", "bread"] },
  { wordId: "w031", word: "blue", synonyms: ["azure", "navy"], antonyms: ["orange"], rhymes: ["clue", "glue", "new", "true", "flew"] },
  { wordId: "w056", word: "green", synonyms: ["emerald", "lime"], antonyms: ["red"], rhymes: ["clean", "mean", "seen", "keen"] },
  { wordId: "w057", word: "black", synonyms: ["dark", "ebony"], antonyms: ["white"], rhymes: ["back", "crack", "lack", "pack", "rack", "track"] },
  { wordId: "w058", word: "white", synonyms: ["pale", "ivory"], antonyms: ["black"], rhymes: ["bite", "kite", "light", "night", "right", "sight"] },
  { wordId: "w032", word: "pink", synonyms: ["rose", "blush"], antonyms: [], rhymes: ["think", "drink", "link", "sink", "wink"] },
  { wordId: "w083", word: "yellow", synonyms: ["gold", "sunny"], antonyms: ["purple"], rhymes: ["fellow", "jello", "mellow"] },
  { wordId: "w081", word: "orange", synonyms: ["tangerine"], antonyms: [], rhymes: [] },
  { wordId: "w082", word: "purple", synonyms: ["violet", "lilac"], antonyms: ["yellow"], rhymes: [] },

  // Actions
  { wordId: "w022", word: "run", synonyms: ["sprint", "dash", "jog"], antonyms: ["walk", "stop"], rhymes: ["bun", "fun", "gun", "sun", "one"] },
  { wordId: "w041", word: "jump", synonyms: ["leap", "hop", "bound"], antonyms: ["fall"], rhymes: ["bump", "dump", "pump", "stump", "lump"] },
  { wordId: "w274", word: "swim", synonyms: ["paddle", "dive", "float"], antonyms: ["sink"], rhymes: ["trim", "dim", "him", "brim"] },
  { wordId: "w042", word: "sing", synonyms: ["hum", "chant", "perform"], antonyms: [], rhymes: ["bring", "king", "ring", "spring", "thing", "wing"] },
  { wordId: "w275", word: "read", synonyms: ["study", "browse", "peruse"], antonyms: ["write"], rhymes: ["bead", "feed", "lead", "need", "seed", "weed"] },
  { wordId: "w276", word: "draw", synonyms: ["sketch", "illustrate", "doodle"], antonyms: [], rhymes: ["claw", "jaw", "law", "paw", "raw", "saw"] },
  { wordId: "w477", word: "laugh", synonyms: ["giggle", "chuckle", "chortle"], antonyms: ["cry", "weep"], rhymes: ["staff", "half", "calf"] },
  { wordId: "w463", word: "close", synonyms: ["shut", "seal"], antonyms: ["open"], rhymes: ["nose", "those", "pose", "rose"] },
  { wordId: "w478", word: "learn", synonyms: ["study", "discover", "understand"], antonyms: ["forget"], rhymes: ["burn", "earn", "turn", "fern"] },

  // Nouns / Nature
  { wordId: "w009", word: "sun", synonyms: ["star", "daystar"], antonyms: ["moon"], rhymes: ["bun", "fun", "gun", "run", "one", "done"] },
  { wordId: "w036", word: "tree", synonyms: ["plant", "sapling"], antonyms: [], rhymes: ["bee", "free", "key", "me", "see", "three"] },
  { wordId: "w037", word: "rain", synonyms: ["shower", "drizzle", "downpour"], antonyms: ["sunshine"], rhymes: ["brain", "chain", "drain", "gain", "lane", "main", "pain", "train"] },
  { wordId: "w038", word: "snow", synonyms: ["sleet", "blizzard"], antonyms: ["heat"], rhymes: ["blow", "flow", "glow", "go", "grow", "know", "low", "show"] },
  { wordId: "w065", word: "cloud", synonyms: ["mist", "fog"], antonyms: [], rhymes: ["loud", "crowd", "proud"] },

  // Home
  { wordId: "w013", word: "bed", synonyms: ["cot", "bunk"], antonyms: [], rhymes: ["fed", "led", "red", "shed", "wed"] },
  { wordId: "w012", word: "cup", synonyms: ["mug", "glass"], antonyms: [], rhymes: ["pup", "up", "pup", "sup"] },

  // Body
  { wordId: "w018", word: "leg", synonyms: ["limb"], antonyms: ["arm"], rhymes: ["beg", "egg", "keg", "peg", "reg"] },
  { wordId: "w019", word: "arm", synonyms: ["limb", "appendage"], antonyms: ["leg"], rhymes: ["calm", "farm", "harm", "palm"] },
  { wordId: "w046", word: "hand", synonyms: ["palm", "fist"], antonyms: ["foot"], rhymes: ["band", "grand", "land", "sand", "stand"] },

  // Family
  { wordId: "w020", word: "mum", synonyms: ["mother", "mama", "mummy"], antonyms: ["dad"], rhymes: ["bum", "come", "drum", "from", "gum", "hum", "rum", "sum"] },
  { wordId: "w021", word: "dad", synonyms: ["father", "papa", "daddy"], antonyms: ["mum"], rhymes: ["bad", "glad", "had", "lad", "mad", "sad"] },

  // School
  { wordId: "w048", word: "book", synonyms: ["novel", "text", "volume"], antonyms: [], rhymes: ["cook", "hook", "look", "took"] },
  { wordId: "w237", word: "pen", synonyms: ["biro", "marker"], antonyms: [], rhymes: ["den", "hen", "men", "ten", "when"] },
  { wordId: "w094", word: "pencil", synonyms: ["stylus"], antonyms: ["pen"], rhymes: [] },

  // Transport
  { wordId: "w014", word: "bus", synonyms: ["coach"], antonyms: [], rhymes: ["fuss", "plus", "us"] },
  { wordId: "w015", word: "car", synonyms: ["vehicle", "auto"], antonyms: [], rhymes: ["bar", "far", "jar", "star", "tar"] },
  { wordId: "w067", word: "train", synonyms: ["locomotive", "rail"], antonyms: [], rhymes: ["brain", "chain", "drain", "gain", "lane", "main", "pain", "rain"] },
  { wordId: "w068", word: "plane", synonyms: ["aircraft", "aeroplane", "jet"], antonyms: [], rhymes: ["brain", "chain", "gain", "lane", "main", "pain", "rain", "train"] },

  // Food
  { wordId: "w016", word: "egg", synonyms: ["ovum"], antonyms: [], rhymes: ["beg", "leg", "peg"] },
  { wordId: "w033", word: "milk", synonyms: ["dairy"], antonyms: [], rhymes: ["silk", "ilk"] },
  { wordId: "w034", word: "cake", synonyms: ["gateau", "bun"], antonyms: [], rhymes: ["bake", "brake", "fake", "lake", "make", "rake", "sake", "shake", "stake", "take", "wake"] },
];

/** Rhyme groups for rhyming word game — pre-built families */
export const RHYME_GROUPS: Array<{ family: string; pattern: string; words: string[] }> = [
  { family: "cat", pattern: "-at", words: ["cat", "bat", "hat", "mat", "rat", "sat", "fat", "pat", "flat"] },
  { family: "dog", pattern: "-og", words: ["dog", "log", "fog", "bog", "frog", "hog", "clog"] },
  { family: "red", pattern: "-ed", words: ["red", "bed", "fed", "led", "shed", "wed", "sled"] },
  { family: "sun", pattern: "-un", words: ["sun", "bun", "fun", "gun", "run", "one", "done", "ton"] },
  { family: "book", pattern: "-ook", words: ["book", "cook", "hook", "look", "took", "brook", "rook"] },
  { family: "rain", pattern: "-ain", words: ["rain", "brain", "chain", "drain", "gain", "lane", "main", "pain", "plain", "train"] },
  { family: "cake", pattern: "-ake", words: ["cake", "bake", "fake", "lake", "make", "rake", "take", "wake", "shake"] },
  { family: "tree", pattern: "-ee", words: ["tree", "bee", "free", "key", "me", "see", "three", "knee", "fee"] },
  { family: "jump", pattern: "-ump", words: ["jump", "bump", "dump", "pump", "stump", "lump", "hump"] },
  { family: "ring", pattern: "-ing", words: ["ring", "bring", "king", "sing", "spring", "swing", "thing", "wing", "string"] },
  { family: "snow", pattern: "-ow", words: ["snow", "blow", "flow", "glow", "go", "grow", "know", "low", "show"] },
  { family: "light", pattern: "-ight", words: ["light", "bite", "bright", "fight", "kite", "might", "night", "right", "sight", "tight"] },
  { family: "hand", pattern: "-and", words: ["hand", "band", "grand", "land", "sand", "stand", "bland", "brand"] },
  { family: "fish", pattern: "-ish", words: ["fish", "dish", "wish", "swish"] },
  { family: "car", pattern: "-ar", words: ["car", "bar", "far", "jar", "star", "tar", "scar"] },
  { family: "door", pattern: "-oor", words: ["door", "floor", "more", "sore", "bore", "core", "explore", "ignore", "store"] },
  { family: "play", pattern: "-ay", words: ["play", "bay", "clay", "day", "gay", "hay", "lay", "may", "pay", "ray", "say", "stay", "way"] },
  { family: "blue", pattern: "-ue", words: ["blue", "clue", "glue", "true", "flew", "new", "stew", "dew"] },
  { family: "black", pattern: "-ack", words: ["black", "back", "crack", "lack", "pack", "rack", "track", "snack", "stack"] },
  { family: "pink", pattern: "-ink", words: ["pink", "drink", "link", "sink", "think", "wink", "blink", "stink"] },
];

export function getSynonyms(word: string): string[] {
  const rel = WORD_RELATIONSHIPS.find((r) => r.word.toLowerCase() === word.toLowerCase());
  return rel?.synonyms ?? [];
}

export function getAntonyms(word: string): string[] {
  const rel = WORD_RELATIONSHIPS.find((r) => r.word.toLowerCase() === word.toLowerCase());
  return rel?.antonyms ?? [];
}

export function getRhymes(word: string): string[] {
  const rel = WORD_RELATIONSHIPS.find((r) => r.word.toLowerCase() === word.toLowerCase());
  if (rel && rel.rhymes.length > 0) return rel.rhymes;

  // Fall back to rhyme group lookup
  const group = RHYME_GROUPS.find((g) => g.words.includes(word.toLowerCase()));
  return group ? group.words.filter((w) => w !== word.toLowerCase()) : [];
}

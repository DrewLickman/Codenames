export type WordPackContentRating = "everyone" | "teen" | "mature";

export type WordPackDefinition = {
  id: string;
  displayName: string;
  description: string;
  contentRating: WordPackContentRating;
  /** Included in the merged pool when the host has not customized selection. */
  defaultEnabled: boolean;
  /** Always merged; host cannot disable (e.g. classic baseline). */
  required?: boolean;
};

/**
 * v1 catalog: stable ids are part of lobby URLs (`?packs=classic,nature-outdoors`).
 * Order defines merge precedence for duplicate words (first pack wins).
 */
export const WORD_PACK_DEFINITIONS: readonly WordPackDefinition[] = [
  {
    id: "classic",
    displayName: "Classic",
    description: "Original Codenames-style baseline word list.",
    contentRating: "everyone",
    defaultEnabled: true,
    required: true,
  },
  {
    id: "nature-outdoors",
    displayName: "Nature & outdoors",
    description: "Weather, landscapes, plants, and outdoor phenomena.",
    contentRating: "everyone",
    defaultEnabled: true,
  },
  {
    id: "food-drink",
    displayName: "Food & drink",
    description: "Ingredients, meals, snacks, and beverages.",
    contentRating: "everyone",
    defaultEnabled: true,
  },
  {
    id: "animals",
    displayName: "Animals",
    description: "Wildlife, pets, and sea life.",
    contentRating: "everyone",
    defaultEnabled: true,
  },
  {
    id: "sports-games",
    displayName: "Sports & games",
    description: "Sports, hobbies, and tabletop play.",
    contentRating: "everyone",
    defaultEnabled: true,
  },
  {
    id: "geography-travel",
    displayName: "Geography & travel",
    description: "Places, biomes, and getting around.",
    contentRating: "everyone",
    defaultEnabled: true,
  },
  {
    id: "stem-deep",
    displayName: "STEM",
    description: "Science, technology, engineering, and math terms.",
    contentRating: "everyone",
    defaultEnabled: true,
  },
  {
    id: "sci-fi-fantasy",
    displayName: "Sci‑fi & fantasy",
    description: "Tropes from speculative fiction and mythic adventure.",
    contentRating: "everyone",
    defaultEnabled: true,
  },
  {
    id: "pop-culture",
    displayName: "Pop culture",
    description: "Movies, fandom, and modern media vocabulary (generic terms).",
    contentRating: "teen",
    defaultEnabled: true,
  },
  {
    id: "music-media",
    displayName: "Music & audio",
    description: "Instruments, genres, and listening culture.",
    contentRating: "everyone",
    defaultEnabled: true,
  },
] as const;

export const WORD_PACK_IDS: readonly string[] = WORD_PACK_DEFINITIONS.map(
  (d) => d.id,
);

export function getRequiredPackIds(): readonly string[] {
  return WORD_PACK_DEFINITIONS.filter((d) => d.required).map((d) => d.id);
}

export function getDefaultEnabledPackIds(): string[] {
  return WORD_PACK_DEFINITIONS.filter(
    (d) => d.required || d.defaultEnabled,
  ).map((d) => d.id);
}

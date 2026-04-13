import standardWords from "./standard-words.json";

export const WORDS: readonly string[] = standardWords;

if (new Set(WORDS).size !== WORDS.length) {
  throw new Error("Duplicate words in WORDS");
}

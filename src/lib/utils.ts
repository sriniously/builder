import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncate = (text: string, maxLength = 100) => {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

export const convertToSnakeCase = (text: string) => {
  return text
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
};

export function pluralize(noun: string): string {
  const irregularPlurals: Record<string, string> = {
    man: "men",
    woman: "women",
    child: "children",
    tooth: "teeth",
    foot: "feet",
    person: "people",
    mouse: "mice",
    goose: "geese",
    louse: "lice",
    cactus: "cacti",
    focus: "foci",
    fungus: "fungi",
    nucleus: "nuclei",
    syllabus: "syllabi",
    crisis: "crises",
    analysis: "analyses",
    diagnosis: "diagnoses",
    oasis: "oases",
    thesis: "theses",
    appendix: "appendices",
    index: "indices",
    matrix: "matrices",
    bacterium: "bacteria",
    phenomenon: "phenomena",
    criterion: "criteria",
    datum: "data",
  };

  const uncountableNouns: Set<string> = new Set([
    "information",
    "equipment",
    "rice",
    "money",
    "species",
    "series",
    "fish",
    "sheep",
    "deer",
    "aircraft",
    "moose",
  ]);

  // Check for uncountable nouns (they remain the same)
  if (uncountableNouns.has(noun.toLowerCase())) {
    return noun;
  }

  // Check if the noun has an irregular plural form
  if (irregularPlurals[noun.toLowerCase()]) {
    return irregularPlurals[noun.toLowerCase()];
  }

  // Special patterns for pluralization
  const specialCases = [
    { regex: /(ch|sh|x|s|z|o)$/i, replacement: "$1es" }, // Add "es" for words ending in certain letters
    { regex: /([^aeiou])y$/i, replacement: "$1ies" }, // Change "y" to "ies" if preceded by a consonant
    { regex: /(f|fe)$/i, replacement: "ves" }, // Change "f" or "fe" to "ves"
    { regex: /us$/i, replacement: "i" }, // Latin-derived words ending in "us" to "i"
    { regex: /is$/i, replacement: "es" }, // Words ending in "is" to "es" (e.g., crisis -> crises)
    { regex: /on$/i, replacement: "a" }, // Words ending in "on" to "a" (e.g., phenomenon -> phenomena)
    { regex: /um$/i, replacement: "a" }, // Words ending in "um" to "a" (e.g., bacterium -> bacteria)
    { regex: /ix|ex$/i, replacement: "ices" }, // Words ending in "ix" or "ex" to "ices" (e.g., matrix -> matrices)
    { regex: /ae$/i, replacement: "ae" }, // Words like "alumnae" remain unchanged
  ];

  for (const { regex, replacement } of specialCases) {
    if (regex.test(noun)) {
      return noun.replace(regex, replacement);
    }
  }

  // Default rule: Add "s"
  return noun + "s";
}

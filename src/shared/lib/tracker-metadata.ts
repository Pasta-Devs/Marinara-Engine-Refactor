import { getCharacterLookupAliases, type CharacterDisplayInfo } from "./character-display";

export interface CharacterLookupDisplayRow {
  character: { id: string };
  display: CharacterDisplayInfo;
}

export function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

export function normalizeMaybeJsonStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return normalizeStringArray(value);
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    return normalizeStringArray(JSON.parse(trimmed));
  } catch {
    return [trimmed];
  }
}

export function normalizeLookupText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function addExactNameLookups(
  candidates: readonly CharacterLookupDisplayRow[],
  idByLookupText: Map<string, string>,
) {
  for (const { character, display } of candidates) {
    const nameKey = normalizeLookupText(display.name);
    if (nameKey && !idByLookupText.has(nameKey)) idByLookupText.set(nameKey, character.id);
  }
}

export function addAliasLookups(
  candidates: readonly CharacterLookupDisplayRow[],
  idByLookupText: Map<string, string>,
) {
  for (const { character, display } of candidates) {
    const nameKey = normalizeLookupText(display.name);
    for (const alias of getCharacterLookupAliases(display)) {
      const aliasKey = normalizeLookupText(alias);
      if (aliasKey && aliasKey !== nameKey && !idByLookupText.has(aliasKey)) {
        idByLookupText.set(aliasKey, character.id);
      }
    }
  }
}

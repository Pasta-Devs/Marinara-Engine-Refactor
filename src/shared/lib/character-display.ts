export interface CharacterDisplayInfo {
  name: string;
  comment?: string | null;
}

const CONNECTOR_ALIAS_PATTERN = /\s+(?:a\.?k\.?a\.?|also known as|alias(?:es)?|nickname(?:s)?)\s+/i;
const LIST_ALIAS_PATTERN = /\s*(?:[|/;]|\r?\n)\s*/;
const LEADING_TITLE_SEPARATOR_PATTERN = /^(.+?)\s+[-\u2013\u2014]\s+.+$/u;
const PARENTHETICAL_ALIAS_PATTERN = /[\[(]([^\])]+)[\])]/g;
const LOOKUP_TEXT_MAX_LENGTH = 96;
const LOOKUP_ALIAS_EDGE_PUNCTUATION = /^[\s"'([{]+|[\s"')\]}.,:;]+$/g;

function cleanDisplayText(value: string | null | undefined): string {
  return typeof value === "string"
    ? value.replace(/\s+/g, " ").replace(LOOKUP_ALIAS_EDGE_PUNCTUATION, "").trim()
    : "";
}

function addCandidate(candidates: Set<string>, value: string | null | undefined) {
  const cleaned = cleanDisplayText(value);
  if (cleaned && cleaned.length <= LOOKUP_TEXT_MAX_LENGTH) candidates.add(cleaned);
}

function addCommentAliasCandidates(candidates: Set<string>, comment: string | null | undefined) {
  const raw = typeof comment === "string" ? comment.trim() : "";
  const cleaned = cleanDisplayText(raw);
  if (!cleaned) return;

  addCandidate(candidates, cleaned);

  const leadingTitle = cleaned.match(LEADING_TITLE_SEPARATOR_PATTERN)?.[1];
  addCandidate(candidates, leadingTitle);

  for (const part of cleaned.split(CONNECTOR_ALIAS_PATTERN)) {
    addCandidate(candidates, part);
  }

  for (const part of raw.split(LIST_ALIAS_PATTERN)) {
    addCandidate(candidates, part);
  }

  const withoutParentheticals = cleanDisplayText(cleaned.replace(PARENTHETICAL_ALIAS_PATTERN, " "));
  addCandidate(candidates, withoutParentheticals);

  PARENTHETICAL_ALIAS_PATTERN.lastIndex = 0;
  for (const match of cleaned.matchAll(PARENTHETICAL_ALIAS_PATTERN)) {
    addCandidate(candidates, match[1]);
  }
}

export function getCharacterTitle(character: CharacterDisplayInfo | null | undefined): string | null {
  const title = typeof character?.comment === "string" ? character.comment.trim() : "";
  return title || null;
}

export function getCharacterLookupAliases(character: CharacterDisplayInfo | null | undefined): string[] {
  const candidates = new Set<string>();
  addCommentAliasCandidates(candidates, character?.comment);
  return Array.from(candidates);
}

export function getCharacterLookupTexts(character: CharacterDisplayInfo | null | undefined): string[] {
  const candidates = new Set<string>();
  addCandidate(candidates, character?.name);
  for (const alias of getCharacterLookupAliases(character)) addCandidate(candidates, alias);
  return Array.from(candidates);
}

export function parseCharacterDisplayData(raw: { data: unknown; comment?: string | null }): CharacterDisplayInfo {
  const comment = typeof raw.comment === "string" ? raw.comment.trim() : "";

  try {
    const parsed = typeof raw.data === "string" ? JSON.parse(raw.data) : raw.data;
    const record = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    const name = typeof record?.name === "string" && record.name.trim() ? record.name.trim() : "Unknown";
    return { name, comment };
  } catch {
    return { name: "Unknown", comment };
  }
}

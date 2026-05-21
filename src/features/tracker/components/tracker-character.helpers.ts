import type { PresentCharacter } from "../../../engine/contracts/types/game-state";
import { visibleText } from "./tracker-display.helpers";

export function getCharacterPortraitFallback(character: PresentCharacter) {
  const emoji = character.emoji?.trim();
  if (emoji && emoji !== "?") return emoji;
  const initial = visibleText(character.name, "C").slice(0, 1).toUpperCase();
  return initial === "?" ? "C" : initial;
}

export function getCharacterFeatureKey(character: PresentCharacter, index: number) {
  if (character.characterId) return character.characterId;
  if (character.name) return `${character.name}-${index}`;
  return `character-${index}`;
}

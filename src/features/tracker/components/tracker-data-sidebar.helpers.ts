import type { CSSProperties } from "react";
import type { GameState, PresentCharacter } from "../../../engine/contracts/types/game-state";
import type { Persona, TrackerCardColorConfig } from "../../../engine/contracts/types/persona";
import type { SpriteInfo } from "../../characters/hooks/use-characters";
import {
  getLocationPinColor,
  getTemperatureColor,
  getTemperatureGaugeDisplay,
  getTemperatureKeywordHint,
  getWeatherEmoji,
  getWorldDateDisplay,
  getWorldTimeDisplay,
  parseTemperatureValue,
} from "../../world-state/lib/world-state-display";
import {
  DEFAULT_TRACKER_CARD_ACCENT,
  getTrackerCardCssPaintValue,
  getTrackerCardFinish,
  getTrackerCardPaintEnabled,
  getTrackerCardPaintOpacity,
  getTrackerCardPortraitStageBackground,
  getTrackerCardSkinFinish,
  getTrackerCardSolidColor,
  getTrackerCardStylePalette,
  getTrackerCardStyleVars,
  normalizeTrackerCardColorMode,
  parseTrackerCardColorConfig,
  type TrackerCardStylePalette,
} from "../../../shared/lib/tracker-card-colors";
import {
  FEATURED_CHARACTER_PORTRAIT_STAGE_REM,
  PERSONA_ADD_STAT_DENSITY_HEIGHT_REM,
  PERSONA_STAT_DENSITY_HEIGHT_REM,
  type TrackerStatDensity,
  type TrackerStatDisplayScale,
} from "./tracker-data-sidebar.constants";

export {
  getLocationPinColor,
  getTemperatureColor,
  getTemperatureGaugeDisplay,
  getTemperatureKeywordHint,
  getWeatherEmoji,
  getWorldDateDisplay,
  getWorldTimeDisplay,
  parseTemperatureValue,
};

export function trackerStatStackHeight(statCount: number, density: TrackerStatDensity, includeAdd: boolean) {
  return (
    statCount * PERSONA_STAT_DENSITY_HEIGHT_REM[density] +
    (includeAdd ? PERSONA_ADD_STAT_DENSITY_HEIGHT_REM[density] : 0)
  );
}

export function personaStatStackHeight(statCount: number, density: TrackerStatDensity, includeAdd: boolean) {
  return trackerStatStackHeight(statCount, density, includeAdd);
}

export function getPersonaStatDensity(
  statCount: number,
  includeAdd: boolean,
  allowance = FEATURED_CHARACTER_PORTRAIT_STAGE_REM,
): TrackerStatDensity {
  if (personaStatStackHeight(statCount, "normal", includeAdd) <= allowance) return "normal";
  if (personaStatStackHeight(statCount, "compact", includeAdd) <= allowance) return "compact";
  return "tight";
}

export function getFeaturedCharacterStatDensity(
  statCount: number,
  includeAdd: boolean,
  allowance = FEATURED_CHARACTER_PORTRAIT_STAGE_REM,
): TrackerStatDensity {
  if (trackerStatStackHeight(statCount, "normal", includeAdd) <= allowance) return "normal";
  if (trackerStatStackHeight(statCount, "compact", includeAdd) <= allowance) return "compact";
  return "tight";
}

export function getTrackerStatDisplayScale(
  statCount: number,
  density: TrackerStatDensity,
  fillAvailable: boolean,
  includeAdd: boolean,
): TrackerStatDisplayScale {
  if (!fillAvailable || density !== "normal") return "standard";
  return statCount + (includeAdd ? 1 : 0) <= 4 ? "spacious" : "roomy";
}

export function visibleText(value: string | number | null | undefined, fallback = "Unknown") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
}

export const WORLD_GRID_BASE_CLASS = "grid-cols-[2.5rem_2.5rem_minmax(0,1fr)]";
export const WORLD_FREEFORM_DATE_GRID_BASE_CLASS = "grid-cols-[minmax(3.8rem,4.45rem)_2.5rem_minmax(0,1fr)]";
export const WORLD_GRID_BALANCED_CLASS =
  "@min-[380px]:grid-cols-[2.5rem_2.5rem_minmax(6.25rem,1fr)_minmax(7.5rem,1.35fr)]";
export const WORLD_GRID_FORECAST_HEAVY_CLASS =
  "@min-[380px]:grid-cols-[2.5rem_2.5rem_minmax(7rem,1.05fr)_minmax(7.25rem,1.2fr)]";
export const WORLD_GRID_LOCATION_HEAVY_CLASS =
  "@min-[380px]:grid-cols-[2.5rem_2.5rem_minmax(7rem,0.95fr)_minmax(9rem,1.45fr)]";
export const WORLD_FREEFORM_DATE_GRID_BALANCED_CLASS =
  "@min-[380px]:grid-cols-[minmax(4.1rem,4.7rem)_2.5rem_minmax(5rem,0.86fr)_minmax(7.25rem,1.35fr)]";
export const WORLD_FREEFORM_DATE_GRID_FORECAST_HEAVY_CLASS =
  "@min-[380px]:grid-cols-[minmax(4.1rem,4.7rem)_2.5rem_minmax(5.75rem,1fr)_minmax(6.75rem,1.1fr)]";
export const WORLD_FREEFORM_DATE_GRID_LOCATION_HEAVY_CLASS =
  "@min-[380px]:grid-cols-[minmax(4.1rem,4.7rem)_2.5rem_minmax(5rem,0.75fr)_minmax(8.25rem,1.45fr)]";

type WorldDashboardGridClassOptions = {
  hasFreeformDate?: boolean;
};

export function getWorldTileTextNeed(value: string | null | undefined, fallback: string) {
  const text = visibleText(value, fallback).replace(/\s+/g, " ");
  const longestWord = text.split(" ").reduce((longest, word) => Math.max(longest, word.length), 0);
  return text.length + longestWord * 0.7;
}

export function getWorldDashboardGridClass(
  weather: string | null | undefined,
  temperature: string | null | undefined,
  location: string | null | undefined,
  options: WorldDashboardGridClassOptions = {},
) {
  const { hasFreeformDate = false } = options;
  const forecastNeed =
    getWorldTileTextNeed(weather, "Set weather") + Math.min(8, getWorldTileTextNeed(temperature, "--") * 0.35);
  const locationNeed = getWorldTileTextNeed(location, "Set location");
  const hasLocation = visibleText(location, "").length > 0;
  if (hasLocation && locationNeed >= forecastNeed + 2) {
    return hasFreeformDate ? WORLD_FREEFORM_DATE_GRID_LOCATION_HEAVY_CLASS : WORLD_GRID_LOCATION_HEAVY_CLASS;
  }
  if (forecastNeed >= locationNeed + 4) {
    return hasFreeformDate ? WORLD_FREEFORM_DATE_GRID_FORECAST_HEAVY_CLASS : WORLD_GRID_FORECAST_HEAVY_CLASS;
  }
  if (locationNeed >= forecastNeed + 6) {
    return hasFreeformDate ? WORLD_FREEFORM_DATE_GRID_LOCATION_HEAVY_CLASS : WORLD_GRID_LOCATION_HEAVY_CLASS;
  }
  return hasFreeformDate ? WORLD_FREEFORM_DATE_GRID_BALANCED_CLASS : WORLD_GRID_BALANCED_CLASS;
}

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getNumberValueWidth(value: number) {
  const text = Number.isFinite(value) ? String(value) : "0";
  return `${Math.min(7, Math.max(1.15, text.length + 0.35))}ch`;
}

export function getWorldAmbienceStyle(state: GameState | null): CSSProperties {
  const weather = (state?.weather ?? "").toLowerCase();
  const location = (state?.location ?? "").toLowerCase();
  const time = (state?.time ?? "").toLowerCase();
  const temperature = (state?.temperature ?? "").toLowerCase();
  const tempValue = parseTemperatureValue(state?.temperature) ?? getTemperatureKeywordHint(state?.temperature);
  let primary = "var(--primary)";
  let secondary = "var(--accent)";
  let primaryMix = 20;
  let secondaryMix = 22;

  if (weather.includes("rain") || weather.includes("storm") || weather.includes("thunder")) {
    primary = "rgb(56 189 248)";
    secondary = "rgb(59 130 246)";
    primaryMix = 24;
    secondaryMix = 30;
  } else if (
    weather.includes("snow") ||
    weather.includes("frost") ||
    weather.includes("blizzard") ||
    (tempValue !== null && tempValue < 4)
  ) {
    primary = "rgb(186 230 253)";
    secondary = "rgb(96 165 250)";
    primaryMix = 18;
    secondaryMix = 24;
  } else if (
    weather.includes("fire") ||
    weather.includes("ash") ||
    weather.includes("sunny") ||
    temperature.includes("hot") ||
    (tempValue !== null && tempValue > 32) ||
    /\b(desert|waste|volcano|forge|lava|dune)\b/.test(location)
  ) {
    primary = "rgb(245 158 11)";
    secondary = "rgb(244 63 94)";
    primaryMix = 24;
    secondaryMix = 26;
  } else if (/\b(night|midnight|dusk|moon|evening)\b/.test(time)) {
    primary = "rgb(129 140 248)";
    secondary = "rgb(168 85 247)";
    primaryMix = 22;
    secondaryMix = 26;
  } else if (/\b(forest|grove|garden|field|meadow|wild|trail|river|lake|sea|shore)\b/.test(location)) {
    primary = "rgb(52 211 153)";
    secondary = "rgb(132 204 22)";
    primaryMix = 18;
    secondaryMix = 20;
  } else if (/\b(city|market|inn|tavern|castle|room|hall|tower|street|shop|temple)\b/.test(location)) {
    primary = "var(--primary)";
    secondary = "rgb(168 85 247)";
    primaryMix = 22;
    secondaryMix = 20;
  }

  return {
    background:
      `linear-gradient(135deg, color-mix(in srgb, color-mix(in srgb, var(--card) ${100 - primaryMix}%, ${primary} ${primaryMix}%) 58%, transparent), ` +
      `color-mix(in srgb, color-mix(in srgb, var(--background) ${100 - secondaryMix}%, ${secondary} ${secondaryMix}%) 52%, transparent))`,
  };
}

export function getSolidCssColor(value: string | null | undefined) {
  return getTrackerCardSolidColor(value);
}

const TRACKER_CARD_NEUTRAL_SURFACE_TOP =
  "var(--tracker-card-neutral-surface-top, color-mix(in srgb, color-mix(in srgb, var(--secondary) 66%, var(--accent) 34%) 91%, var(--primary) 9%))";
const TRACKER_CARD_NEUTRAL_SURFACE_BOTTOM =
  "var(--tracker-card-neutral-surface-bottom, color-mix(in srgb, color-mix(in srgb, var(--secondary) 78%, var(--accent) 22%) 94%, var(--muted-foreground) 6%))";
const TRACKER_CARD_NEUTRAL_MATERIAL =
  "var(--tracker-card-neutral-material, color-mix(in srgb, color-mix(in srgb, var(--secondary) 68%, var(--accent) 32%) 89%, var(--primary) 11%))";
const TRACKER_CARD_NEUTRAL_LIFT =
  "var(--tracker-card-neutral-lift, color-mix(in srgb, var(--muted-foreground) 72%, var(--primary) 28%))";

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function opacityWeight(value: number) {
  return clampPercent(value) / 100;
}

function scalePercent(value: number, opacity: number) {
  return Math.round(value * opacityWeight(opacity));
}

function getStrengthAdjustedProfileColor(color: string, opacity: number, neutral: string) {
  const clampedOpacity = clampPercent(opacity);
  if (clampedOpacity >= 100) return color;
  if (clampedOpacity <= 0) return neutral;
  return `color-mix(in srgb, ${neutral} ${100 - clampedOpacity}%, ${color} ${clampedOpacity}%)`;
}

export interface TrackerProfileColors {
  dialogueColor?: string | null;
  nameColor?: string | null;
  boxColor?: string | null;
  trackerCardColors?: TrackerCardColorConfig | null;
}

type TrackerProfilePalette = TrackerCardStylePalette;

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function getTrackerProfilePalette(
  profileColors: TrackerProfileColors | null | undefined,
  fallbackAccent = DEFAULT_TRACKER_CARD_ACCENT,
): TrackerProfilePalette {
  const trackerCardColors = profileColors?.trackerCardColors ?? null;
  const mode = normalizeTrackerCardColorMode(trackerCardColors?.mode);
  const finish = getTrackerCardFinish(trackerCardColors, mode);
  const enabled = getTrackerCardPaintEnabled(trackerCardColors);
  const opacity = getTrackerCardPaintOpacity(trackerCardColors);
  const effectiveColors = mode === "default" ? null : mode === "custom" ? trackerCardColors : profileColors;
  const effectiveFallback = mode === "chat" ? fallbackAccent : DEFAULT_TRACKER_CARD_ACCENT;

  return getTrackerCardStylePalette({
    colors: effectiveColors,
    enabled,
    finish,
    opacity,
    portraitStageBackground: getTrackerCardPortraitStageBackground(trackerCardColors),
    fallbackAccent: effectiveFallback,
  });
}

function withTrackerProfileStyle(palette: TrackerProfilePalette, background?: string): CSSProperties {
  const vars = getTrackerCardStyleVars({ palette, background });
  const style: CSSProperties & {
    "--tracker-profile-accent": string;
    "--tracker-profile-accent-highlight-opacity": string;
    "--tracker-profile-accent-layer": string;
    "--tracker-profile-accent-solid": string;
    "--tracker-profile-accent-wash-opacity": string;
    "--tracker-profile-body-rule-opacity": string;
    "--tracker-profile-body-wash-opacity": string;
    "--tracker-profile-dialogue": string;
    "--tracker-profile-dialogue-border": string;
    "--tracker-profile-dialogue-glow": string;
    "--tracker-profile-display-layer": string;
    "--tracker-profile-display-solid": string;
    "--tracker-profile-display-rail-opacity": string;
    "--tracker-profile-field-material": string;
    "--tracker-profile-field-material-blend": string;
    "--tracker-profile-glow-opacity": string;
    "--tracker-profile-icon": string;
    "--tracker-profile-label-icon": string;
    "--tracker-profile-label-muted-text": string;
    "--tracker-profile-label-text": string;
    "--tracker-profile-box": string;
    "--tracker-profile-box-layer": string;
    "--tracker-profile-frame": string;
    "--tracker-profile-frame-blend": string;
    "--tracker-profile-material": string;
    "--tracker-profile-material-blend": string;
    "--tracker-profile-panel": string;
    "--tracker-profile-panel-blend": string;
    "--tracker-profile-panel-material": string;
    "--tracker-profile-panel-material-blend": string;
    "--tracker-profile-panel-strong": string;
    "--tracker-profile-panel-strong-blend": string;
    "--tracker-profile-portrait-base": string;
    "--tracker-profile-portrait-bottom-glow-opacity": string;
    "--tracker-profile-portrait-bottom-rule-opacity": string;
    "--tracker-profile-portrait-media-blur": string;
    "--tracker-profile-portrait-media-opacity": string;
    "--tracker-profile-portrait-media-saturate": string;
    "--tracker-profile-portrait-light": string;
    "--tracker-profile-portrait-light-opacity": string;
    "--tracker-profile-portrait-rim": string;
    "--tracker-profile-portrait-rim-opacity": string;
    "--tracker-profile-portrait-side-mask-opacity": string;
    "--tracker-profile-portrait-veil": string;
    "--tracker-profile-muted-panel": string;
    "--tracker-profile-muted-panel-blend": string;
    "--tracker-profile-nameplate": string;
    "--tracker-profile-nameplate-glow": string;
    "--tracker-profile-nameplate-rule": string;
    "--tracker-profile-nameplate-text": string;
    "--tracker-profile-rule": string;
    "--tracker-profile-surface": string;
    "--tracker-profile-surface-blend": string;
    "--tracker-profile-surface-layer": string;
    "--tracker-profile-surface-solid": string;
    "--tracker-profile-slot-rule": string;
    "--tracker-profile-slot-shadow": string;
    "--tracker-profile-slot-surface": string;
    "--tracker-profile-slot-surface-blend": string;
    "--tracker-profile-tint-opacity": string;
    "--tracker-profile-display-opacity": string;
    "--tracker-profile-contrast-soft-top": string;
    "--tracker-profile-contrast-soft-mid": string;
    "--tracker-profile-contrast-soft-bottom": string;
    "--tracker-profile-contrast-strong-top": string;
    "--tracker-profile-contrast-strong-mid": string;
    "--tracker-profile-contrast-strong-bottom": string;
    "--tracker-profile-muted-text": string;
    "--tracker-profile-number-text": string;
    "--tracker-profile-row-rule": string;
    "--tracker-profile-stat-fill-glow": string;
    "--tracker-profile-stat-fill-highlight": string;
    "--tracker-profile-stat-track": string;
    "--tracker-profile-stat-track-blend": string;
    "--tracker-profile-stat-track-ring": string;
    "--tracker-profile-stat-track-shadow": string;
    "--tracker-profile-text": string;
    "--tracker-inline-foreground": string;
    "--tracker-inline-muted": string;
    "--tracker-inline-number": string;
    "--tracker-inline-rule": string;
    "--primary"?: string;
  } = {
    "--tracker-profile-accent": vars.accent,
    "--tracker-profile-accent-highlight-opacity": vars.accentHighlightOpacity,
    "--tracker-profile-accent-layer": vars.accentLayer,
    "--tracker-profile-accent-solid": vars.accentSolid,
    "--tracker-profile-accent-wash-opacity": vars.accentWashOpacity,
    "--tracker-profile-body-rule-opacity": vars.bodyRuleOpacity,
    "--tracker-profile-body-wash-opacity": vars.bodyWashOpacity,
    "--tracker-profile-dialogue": vars.accent,
    "--tracker-profile-dialogue-border": vars.dialogueBorder,
    "--tracker-profile-dialogue-glow": vars.dialogueGlow,
    "--tracker-profile-display-layer": vars.displayLayer,
    "--tracker-profile-display-solid": vars.displaySolid,
    "--tracker-profile-display-rail-opacity": vars.displayRailOpacity,
    "--tracker-profile-field-material": vars.fieldMaterial,
    "--tracker-profile-field-material-blend": vars.fieldMaterialBlend,
    "--tracker-profile-glow-opacity": vars.glowOpacity,
    "--tracker-profile-icon": vars.icon,
    "--tracker-profile-label-icon": vars.labelIcon,
    "--tracker-profile-label-muted-text": vars.labelMutedText,
    "--tracker-profile-label-text": vars.labelText,
    "--tracker-profile-box": vars.box,
    "--tracker-profile-box-layer": vars.boxLayer,
    "--tracker-profile-frame": vars.frame,
    "--tracker-profile-frame-blend": vars.frameBlend,
    "--tracker-profile-material": vars.material,
    "--tracker-profile-material-blend": vars.materialBlend,
    "--tracker-profile-panel": vars.panel,
    "--tracker-profile-panel-blend": vars.panelBlend,
    "--tracker-profile-panel-material": vars.panelMaterial,
    "--tracker-profile-panel-material-blend": vars.panelMaterialBlend,
    "--tracker-profile-panel-strong": vars.panelStrong,
    "--tracker-profile-panel-strong-blend": vars.panelStrongBlend,
    "--tracker-profile-portrait-base": vars.portraitBase,
    "--tracker-profile-portrait-bottom-glow-opacity": vars.portraitBottomGlowOpacity,
    "--tracker-profile-portrait-bottom-rule-opacity": vars.portraitBottomRuleOpacity,
    "--tracker-profile-portrait-media-blur": vars.portraitMediaBlur,
    "--tracker-profile-portrait-media-opacity": vars.portraitMediaOpacity,
    "--tracker-profile-portrait-media-saturate": vars.portraitMediaSaturate,
    "--tracker-profile-portrait-light": vars.portraitLight,
    "--tracker-profile-portrait-light-opacity": vars.portraitLightOpacity,
    "--tracker-profile-portrait-rim": vars.portraitRim,
    "--tracker-profile-portrait-rim-opacity": vars.portraitRimOpacity,
    "--tracker-profile-portrait-side-mask-opacity": vars.portraitSideMaskOpacity,
    "--tracker-profile-portrait-veil": vars.portraitVeil,
    "--tracker-profile-muted-panel": vars.mutedPanel,
    "--tracker-profile-muted-panel-blend": vars.mutedPanelBlend,
    "--tracker-profile-nameplate": vars.nameplate,
    "--tracker-profile-nameplate-glow": vars.nameplateGlow,
    "--tracker-profile-nameplate-rule": vars.nameplateRule,
    "--tracker-profile-nameplate-text": vars.nameplateText,
    "--tracker-profile-rule": vars.rule,
    "--tracker-profile-surface": vars.surface,
    "--tracker-profile-surface-blend": vars.surfaceBlend,
    "--tracker-profile-surface-layer": vars.surfaceLayer,
    "--tracker-profile-surface-solid": vars.surfaceSolid,
    "--tracker-profile-slot-rule": vars.slotRule,
    "--tracker-profile-slot-shadow": vars.slotShadow,
    "--tracker-profile-slot-surface": vars.slotSurface,
    "--tracker-profile-slot-surface-blend": vars.slotSurfaceBlend,
    "--tracker-profile-tint-opacity": vars.tintOpacity,
    "--tracker-profile-display-opacity": vars.displayOpacity,
    "--tracker-profile-contrast-soft-top": vars.contrastSoftTop,
    "--tracker-profile-contrast-soft-mid": vars.contrastSoftMid,
    "--tracker-profile-contrast-soft-bottom": vars.contrastSoftBottom,
    "--tracker-profile-contrast-strong-top": vars.contrastStrongTop,
    "--tracker-profile-contrast-strong-mid": vars.contrastStrongMid,
    "--tracker-profile-contrast-strong-bottom": vars.contrastStrongBottom,
    "--tracker-profile-muted-text": vars.mutedText,
    "--tracker-profile-number-text": vars.numberText,
    "--tracker-profile-row-rule": vars.rowRule,
    "--tracker-profile-stat-fill-glow": vars.statFillGlow,
    "--tracker-profile-stat-fill-highlight": vars.statFillHighlight,
    "--tracker-profile-stat-track": vars.statTrack,
    "--tracker-profile-stat-track-blend": vars.statTrackBlend,
    "--tracker-profile-stat-track-ring": vars.statTrackRing,
    "--tracker-profile-stat-track-shadow": vars.statTrackShadow,
    "--tracker-profile-text": vars.text,
    "--tracker-inline-foreground": "var(--tracker-profile-text)",
    "--tracker-inline-muted": "var(--tracker-profile-muted-text)",
    "--tracker-inline-number": "var(--tracker-profile-number-text)",
    "--tracker-inline-rule": "var(--tracker-profile-row-rule)",
    background: vars.background,
    backgroundBlendMode: vars.backgroundBlendMode,
  };

  if (palette.accent !== DEFAULT_TRACKER_CARD_ACCENT) {
    style["--primary"] = vars.accent;
  }

  return style;
}

export function getPersonaProfileColors(persona: Persona | null): TrackerProfileColors {
  return {
    dialogueColor: persona?.dialogueColor,
    nameColor: persona?.nameColor,
    boxColor: persona?.boxColor,
    trackerCardColors: parseTrackerCardColorConfig(persona?.trackerCardColors),
  };
}

export function getPersonaAmbienceStyle(
  persona: Persona | null,
  options: { paintBackground?: boolean } = {},
): CSSProperties {
  const palette = getTrackerProfilePalette(getPersonaProfileColors(persona));
  const style = withTrackerProfileStyle(palette);

  if (options.paintBackground === false) {
    delete style.background;
    delete style.backgroundBlendMode;
  }

  return style;
}

export function getPersonaInitial(persona: Persona | null) {
  return visibleText(persona?.name, "P").slice(0, 1).toUpperCase();
}

export function getCharacterProfileColors(rawData: unknown): TrackerProfileColors | null {
  try {
    const parsed = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
    const record = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    const data = record?.data && typeof record.data === "object" ? (record.data as Record<string, unknown>) : record;
    const extensions =
      data?.extensions && typeof data.extensions === "object" && !Array.isArray(data.extensions)
        ? (data.extensions as Record<string, unknown>)
        : null;

    const trackerCardColorsRaw = extensions?.trackerCardColors;
    const profileColors: TrackerProfileColors = {
      dialogueColor: getTrackerCardCssPaintValue(getStringValue(extensions?.dialogueColor)),
      nameColor: getTrackerCardCssPaintValue(getStringValue(extensions?.nameColor)),
      boxColor: getTrackerCardCssPaintValue(getStringValue(extensions?.boxColor)),
      ...(trackerCardColorsRaw !== undefined && {
        trackerCardColors: parseTrackerCardColorConfig(trackerCardColorsRaw),
      }),
    };

    return profileColors.dialogueColor ||
      profileColors.nameColor ||
      profileColors.boxColor ||
      profileColors.trackerCardColors
      ? profileColors
      : null;
  } catch {
    return null;
  }
}

export function getCharacterAmbienceStyle(
  character: PresentCharacter,
  profileColors?: TrackerProfileColors | null,
): CSSProperties {
  const palette = getTrackerProfilePalette(
    profileColors,
    getSolidCssColor(character.stats?.find((stat) => stat.color)?.color) ?? DEFAULT_TRACKER_CARD_ACCENT,
  );
  const finish = getTrackerCardSkinFinish(palette.finish);
  const surfaceOpacity = palette.hasSurfacePaint ? palette.opacity.boxColorOpacity : 0;
  const hasActiveSurface = surfaceOpacity > 0;
  const boxMix = scalePercent(Math.min(32, Math.round(finish.surfaceBoxMix * 0.9)), surfaceOpacity);
  const backMix = Math.round(boxMix * 0.68);
  const effectiveBox = getStrengthAdjustedProfileColor(palette.box, surfaceOpacity, TRACKER_CARD_NEUTRAL_MATERIAL);
  const surfaceMaterialPaint = hasActiveSurface
    ? `color-mix(in srgb, ${effectiveBox} 88%, ${TRACKER_CARD_NEUTRAL_LIFT} 12%)`
    : effectiveBox;
  const materialTopBase = TRACKER_CARD_NEUTRAL_SURFACE_TOP;
  const materialDepthBase = TRACKER_CARD_NEUTRAL_SURFACE_BOTTOM;
  return withTrackerProfileStyle(
    palette,
    `linear-gradient(135deg, color-mix(in srgb, ${materialTopBase} ${100 - boxMix}%, ${surfaceMaterialPaint} ${boxMix}%), ` +
      `color-mix(in srgb, ${materialDepthBase} ${100 - backMix}%, ${surfaceMaterialPaint} ${backMix}%))`,
  );
}

export function getCharacterPortraitFallback(character: PresentCharacter) {
  const emoji = character.emoji?.trim();
  if (emoji && emoji !== "?") return emoji;
  const initial = visibleText(character.name, "C").slice(0, 1).toUpperCase();
  return initial === "?" ? "C" : initial;
}

export function getCharacterFeatureKey(character: PresentCharacter, index: number) {
  const stableId = character.characterId || character.name || `character-${index}`;
  return stableId;
}

export function parseMetadataRecord(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return typeof raw === "object" ? (raw as Record<string, unknown>) : {};
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

export function normalizeSpriteExpressionMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const expressions: Record<string, string> = {};
  for (const [key, expression] of Object.entries(value as Record<string, unknown>)) {
    if (typeof expression !== "string") continue;
    const trimmed = expression.trim();
    if (key && trimmed) expressions[key] = trimmed;
  }
  return expressions;
}

export function getLatestSpriteExpressionsFromMessages(
  messages: Array<{ role?: string; extra?: unknown }> | undefined,
) {
  if (!messages?.length) return null;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== "assistant") continue;
    const extra = parseMetadataRecord(message.extra);
    const expressions = normalizeSpriteExpressionMap(extra.spriteExpressions);
    if (Object.keys(expressions).length > 0) return expressions;
  }
  return null;
}

export function isSpriteLookupCharacterId(characterId: string | null | undefined) {
  const id = characterId?.trim();
  return !!id && !id.startsWith("manual-") && !id.startsWith("party-npc:");
}

export function getSpriteExpressionForCharacter(
  expressions: Record<string, string>,
  character: PresentCharacter,
  spriteCharacterId: string | null,
) {
  if (spriteCharacterId && expressions[spriteCharacterId]) return expressions[spriteCharacterId];
  if (character.characterId && expressions[character.characterId]) return expressions[character.characterId];
  if (character.name && expressions[character.name]) return expressions[character.name];
  return undefined;
}

export function getCharacterExpressionHint(character: PresentCharacter, spriteExpression?: string | null) {
  if (spriteExpression?.trim()) return spriteExpression.trim();
  const text = [character.mood, character.thoughts].filter(Boolean).join(" ").toLowerCase();
  if (/\b(angry|furious|rage|snarl|seeth)\b/.test(text)) return "angry";
  if (/\b(sad|sorrow|cry|tears|weep|grief)\b/.test(text)) return "sad";
  if (/\b(happy|joy|laugh|smile|cheer|delight|giggl)\b/.test(text)) return "happy";
  if (/\b(surpris|shock|gasp|startle)\b/.test(text)) return "surprised";
  if (/\b(scared|afraid|fear|panic|trembl)\b/.test(text)) return "scared";
  if (/\b(blush|embarrass|fluster|shy)\b/.test(text)) return "embarrassed";
  if (/\b(think|ponder|wonder|consider|hmm)\b/.test(text)) return "thinking";
  if (/\b(worr|anxious|nervous|concern|dread)\b/.test(text)) return "worried";
  if (/\b(smirk|sly|teas|mischiev)\b/.test(text)) return "smirk";
  if (/\b(determin|resolv|steadfast)\b/.test(text)) return "determined";
  return "neutral";
}

export function resolveSpriteUrl(sprites: SpriteInfo[] | undefined, expression: string) {
  const spriteList = (sprites ?? []).filter((sprite) => !sprite.expression.toLowerCase().startsWith("full_"));
  if (spriteList.length === 0) return null;
  const exprLower = expression.toLowerCase();
  const exact = spriteList.find((sprite) => sprite.expression.toLowerCase() === exprLower);
  if (exact) return exact.url;
  const partial = spriteList.find((sprite) => {
    const stored = sprite.expression.toLowerCase();
    return stored.includes(exprLower) || exprLower.includes(stored);
  });
  if (partial) return partial.url;
  const neutral = spriteList.find((sprite) => {
    const stored = sprite.expression.toLowerCase();
    return stored === "neutral" || stored === "default" || stored === "idle";
  });
  return neutral?.url ?? spriteList[0]?.url ?? null;
}

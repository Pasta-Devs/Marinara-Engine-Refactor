import { useState, type CSSProperties } from "react";
import {
  Check,
  ChevronDown,
  Circle,
  Image,
  Layers,
  MessageSquareText,
  Package,
  Palette,
  Sparkles,
  Square,
} from "lucide-react";
import type { TrackerCardColorConfig, TrackerCardColorMode, TrackerCardPortraitStageBackground } from "../../../engine/contracts/types/persona";
import { cn } from "../../lib/utils";
import {
  cleanTrackerCardColorConfig,
  getTrackerCardFinish,
  getTrackerCardPaintEnabled,
  getTrackerCardPaintOpacity,
  getTrackerCardPortraitStageBackground,
  getTrackerCardStylePalette,
  getTrackerCardStyleVars,
  normalizeTrackerCardColorMode,
  parseTrackerCardColorConfig,
  type TrackerCardFinish,
  type TrackerCardPaintColors,
  type TrackerCardPaintEnabled,
  type TrackerCardPaintOpacity,
} from "../../lib/tracker-card-colors";
import { ColorPicker } from "./ColorPicker";

export type TrackerCardColorEntityLabel = "Character" | "Persona";

interface TrackerCardColorControlsProps {
  value: TrackerCardColorConfig | string | null | undefined;
  onChange: (value: TrackerCardColorConfig) => void;
  chatColors: TrackerCardPaintColors;
  entityLabel: TrackerCardColorEntityLabel;
  previewName: string;
  variant?: "full" | "compact";
  disabled?: boolean;
}

const MODE_OPTIONS: Array<{
  mode: TrackerCardColorMode;
  label: string;
  icon: typeof Palette;
}> = [
  { mode: "default", label: "Default", icon: Palette },
  { mode: "chat", label: "Chat colors", icon: MessageSquareText },
  { mode: "custom", label: "Custom", icon: Sparkles },
];

const FINISH_OPTIONS: Array<{
  key: "materialBrightness" | "glowIntensity" | "contrastIntensity";
  label: string;
  title: string;
}> = [
  {
    key: "materialBrightness",
    label: "Material",
    title: "Brightness of neutral and Surface card material",
  },
  { key: "glowIntensity", label: "Glow", title: "Light from edges, portrait, stats, and nameplate" },
  { key: "contrastIntensity", label: "Contrast", title: "Text readability and neutral panel separation" },
];

const FINISH_PRESETS: Array<{
  label: string;
  title: string;
  finish: TrackerCardFinish;
}> = [
  {
    label: "Soft",
    title: "Brighter material with gentle glow and mild separation",
    finish: { tintIntensity: 100, materialBrightness: 54, glowIntensity: 24, contrastIntensity: 58 },
  },
  {
    label: "Crisp",
    title: "Neutral material with clearer edges and medium glow",
    finish: { tintIntensity: 100, materialBrightness: 50, glowIntensity: 46, contrastIntensity: 64 },
  },
  {
    label: "Vivid",
    title: "Darker material with strong glow and high contrast",
    finish: { tintIntensity: 100, materialBrightness: 44, glowIntensity: 82, contrastIntensity: 86 },
  },
];

const PAINT_OPACITY_OPTIONS: Array<{
  key: keyof TrackerCardPaintOpacity;
  enabledKey: keyof TrackerCardPaintEnabled;
  colorKey: "nameColor" | "dialogueColor" | "boxColor";
  emptyText: string;
  label: string;
  title: string;
}> = [
  {
    key: "nameColorOpacity",
    enabledKey: "displayEnabled",
    colorKey: "nameColor",
    emptyText: "No display color set",
    label: "Display",
    title: "Names, readable field tint, and identity emphasis",
  },
  {
    key: "dialogueColorOpacity",
    enabledKey: "accentEnabled",
    colorKey: "dialogueColor",
    emptyText: "No accent color set",
    label: "Accent",
    title: "Borders, icons, highlights, buttons, and glow",
  },
  {
    key: "boxColorOpacity",
    enabledKey: "surfaceEnabled",
    colorKey: "boxColor",
    emptyText: "No surface color - neutral card",
    label: "Surface",
    title: "Card body, panels, shelves, and field material",
  },
];

const PORTRAIT_STAGE_BACKGROUND_OPTIONS: Array<{
  value: TrackerCardPortraitStageBackground;
  label: string;
  icon: typeof Palette;
  title: string;
}> = [
  { value: "ambient", label: "Ambient", icon: Layers, title: "Balanced color wash" },
  { value: "spotlight", label: "Spotlight", icon: Circle, title: "Focused center glow" },
  { value: "soft", label: "Haze", icon: Image, title: "Diffused portrait glow" },
  { value: "plain", label: "Plain", icon: Square, title: "Quiet neutral stage" },
];

const TRACKER_CARD_PREVIEW_STATS = [
  { label: "Satiety", value: "58", width: "58%", color: "#55c860" },
  { label: "Energy", value: "67", width: "67%", color: "#ffb01f" },
  { label: "Hygiene", value: "70", width: "70%", color: "#2ea7f7" },
  { label: "Morale", value: "83", width: "83%", color: "#ff5555" },
];

function getDisplayStyle(value: string | null | undefined) {
  if (!value) {
    return {
      backgroundImage: "repeating-conic-gradient(var(--border) 0% 25%, transparent 0% 50%)",
      backgroundSize: "0.5rem 0.5rem",
    };
  }

  return value.includes("gradient(") ? { background: value } : { backgroundColor: value };
}

type TrackerPreviewStyle = CSSProperties & {
  "--tracker-preview-accent": string;
  "--tracker-preview-accent-layer": string;
  "--tracker-preview-box": string;
  "--tracker-preview-box-layer": string;
  "--tracker-preview-dialogue-glow": string;
  "--tracker-preview-display-layer": string;
  "--tracker-preview-display-opacity": string;
  "--tracker-preview-display-solid": string;
  "--tracker-preview-frame": string;
  "--tracker-preview-frame-blend": string;
  "--tracker-preview-muted-panel": string;
  "--tracker-preview-muted-panel-blend": string;
  "--tracker-preview-panel": string;
  "--tracker-preview-panel-blend": string;
  "--tracker-preview-panel-strong": string;
  "--tracker-preview-panel-strong-blend": string;
  "--tracker-preview-portrait-base": string;
  "--tracker-preview-portrait-bottom-glow-opacity": string;
  "--tracker-preview-portrait-bottom-rule-opacity": string;
  "--tracker-preview-portrait-media-blur": string;
  "--tracker-preview-portrait-media-opacity": string;
  "--tracker-preview-portrait-media-saturate": string;
  "--tracker-preview-portrait-light": string;
  "--tracker-preview-portrait-light-opacity": string;
  "--tracker-preview-portrait-rim": string;
  "--tracker-preview-portrait-rim-opacity": string;
  "--tracker-preview-portrait-side-mask-opacity": string;
  "--tracker-preview-portrait-veil": string;
  "--tracker-preview-rule": string;
  "--tracker-preview-surface": string;
  "--tracker-preview-surface-blend": string;
  "--tracker-preview-slot-rule": string;
  "--tracker-preview-slot-shadow": string;
  "--tracker-preview-slot-surface": string;
  "--tracker-preview-slot-surface-blend": string;
  "--tracker-preview-tint-opacity": string;
  "--tracker-preview-glow-opacity": string;
  "--tracker-preview-contrast-top": string;
  "--tracker-preview-contrast-mid": string;
  "--tracker-preview-contrast-bottom": string;
  "--tracker-preview-muted-text": string;
  "--tracker-preview-number-text": string;
  "--tracker-preview-row-rule": string;
  "--tracker-preview-stat-fill-glow": string;
  "--tracker-preview-stat-fill-highlight": string;
  "--tracker-preview-stat-track": string;
  "--tracker-preview-stat-track-blend": string;
  "--tracker-preview-stat-track-ring": string;
  "--tracker-preview-stat-track-shadow": string;
  "--tracker-preview-text": string;
};

function getTrackerPreviewStyle(
  colors: TrackerCardColorControlsProps["chatColors"],
  finish: ReturnType<typeof getTrackerCardFinish>,
  paintEnabled: TrackerCardPaintEnabled,
  paintOpacity: TrackerCardPaintOpacity,
  portraitStageBackground: TrackerCardPortraitStageBackground,
): TrackerPreviewStyle {
  const vars = getTrackerCardStyleVars({
    palette: getTrackerCardStylePalette({
      colors,
      enabled: paintEnabled,
      finish,
      opacity: paintOpacity,
      portraitStageBackground,
    }),
  });

  return {
    "--tracker-preview-accent": vars.accent,
    "--tracker-preview-accent-layer": vars.accentLayer,
    "--tracker-preview-box": vars.box,
    "--tracker-preview-box-layer": vars.boxLayer,
    "--tracker-preview-dialogue-glow": vars.dialogueGlow,
    "--tracker-preview-display-layer": vars.displayLayer,
    "--tracker-preview-display-opacity": vars.displayOpacity,
    "--tracker-preview-display-solid": vars.displaySolid,
    "--tracker-preview-frame": vars.frame,
    "--tracker-preview-frame-blend": vars.frameBlend,
    "--tracker-preview-muted-panel": vars.mutedPanel,
    "--tracker-preview-muted-panel-blend": vars.mutedPanelBlend,
    "--tracker-preview-panel": vars.panel,
    "--tracker-preview-panel-blend": vars.panelBlend,
    "--tracker-preview-panel-strong": vars.panelStrong,
    "--tracker-preview-panel-strong-blend": vars.panelStrongBlend,
    "--tracker-preview-portrait-base": vars.portraitBase,
    "--tracker-preview-portrait-bottom-glow-opacity": vars.portraitBottomGlowOpacity,
    "--tracker-preview-portrait-bottom-rule-opacity": vars.portraitBottomRuleOpacity,
    "--tracker-preview-portrait-media-blur": vars.portraitMediaBlur,
    "--tracker-preview-portrait-media-opacity": vars.portraitMediaOpacity,
    "--tracker-preview-portrait-media-saturate": vars.portraitMediaSaturate,
    "--tracker-preview-portrait-light": vars.portraitLight,
    "--tracker-preview-portrait-light-opacity": vars.portraitLightOpacity,
    "--tracker-preview-portrait-rim": vars.portraitRim,
    "--tracker-preview-portrait-rim-opacity": vars.portraitRimOpacity,
    "--tracker-preview-portrait-side-mask-opacity": vars.portraitSideMaskOpacity,
    "--tracker-preview-portrait-veil": vars.portraitVeil,
    "--tracker-preview-rule": vars.rule,
    "--tracker-preview-surface": vars.surface,
    "--tracker-preview-surface-blend": vars.surfaceBlend,
    "--tracker-preview-slot-rule": vars.slotRule,
    "--tracker-preview-slot-shadow": vars.slotShadow,
    "--tracker-preview-slot-surface": vars.slotSurface,
    "--tracker-preview-slot-surface-blend": vars.slotSurfaceBlend,
    "--tracker-preview-tint-opacity": vars.tintOpacity,
    "--tracker-preview-glow-opacity": vars.displayOpacity,
    "--tracker-preview-contrast-top": vars.contrastStrongTop,
    "--tracker-preview-contrast-mid": vars.contrastStrongMid,
    "--tracker-preview-contrast-bottom": vars.contrastStrongBottom,
    "--tracker-preview-muted-text": vars.mutedText,
    "--tracker-preview-number-text": vars.numberText,
    "--tracker-preview-row-rule": vars.rowRule,
    "--tracker-preview-stat-fill-glow": vars.statFillGlow,
    "--tracker-preview-stat-fill-highlight": vars.statFillHighlight,
    "--tracker-preview-stat-track": vars.statTrack,
    "--tracker-preview-stat-track-blend": vars.statTrackBlend,
    "--tracker-preview-stat-track-ring": vars.statTrackRing,
    "--tracker-preview-stat-track-shadow": vars.statTrackShadow,
    "--tracker-preview-text": vars.text,
    background: vars.background,
    backgroundBlendMode: vars.backgroundBlendMode,
  };
}

function getPreviewInitial(name: string, fallback: string) {
  return (name.trim() || fallback).slice(0, 1).toUpperCase();
}

function getEffectiveColors(
  mode: TrackerCardColorMode,
  config: TrackerCardColorConfig,
  chatColors: TrackerCardColorControlsProps["chatColors"],
): TrackerCardPaintColors {
  if (mode === "custom") return config;
  if (mode === "chat") return chatColors;
  return {};
}

function hasPaintForChannel(colors: TrackerCardPaintColors, colorKey: "nameColor" | "dialogueColor" | "boxColor") {
  const hasDisplayPaint = !!colors.nameColor?.trim();
  const hasAccentPaint = !!colors.dialogueColor?.trim();
  const hasSurfacePaint = !!colors.boxColor?.trim();

  if (colorKey === "boxColor") return hasSurfacePaint;
  if (colorKey === "nameColor") return hasDisplayPaint || hasAccentPaint;
  return hasAccentPaint || hasDisplayPaint;
}

function getPaintOpacitySummary(opacity: TrackerCardPaintOpacity, enabled: TrackerCardPaintEnabled) {
  return [
    enabled.displayEnabled ? opacity.nameColorOpacity : "off",
    enabled.accentEnabled ? opacity.dialogueColorOpacity : "off",
    enabled.surfaceEnabled ? opacity.boxColorOpacity : "off",
  ].join("/");
}

function getChannelValueLabel(enabled: boolean, hasPaint: boolean, value: number) {
  if (!enabled) return "off";
  return hasPaint ? `${value}%` : "none";
}

function ChannelToggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full bg-[var(--background)] p-0.5 ring-1 ring-[var(--border)] transition-colors",
        checked && "bg-[var(--primary)]/22 ring-[var(--primary)]/40",
        disabled && "cursor-not-allowed opacity-55",
      )}
      title={`${checked ? "Disable" : "Enable"} ${label}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={`${label} channel`}
        className="peer sr-only"
      />
      <span className="h-3 w-3 rounded-full bg-[var(--muted-foreground)] transition-transform peer-checked:translate-x-3 peer-checked:bg-[var(--primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary)]/60 peer-disabled:cursor-not-allowed" />
    </label>
  );
}

export function TrackerCardColorControls({
  value,
  onChange,
  chatColors,
  entityLabel,
  previewName,
  variant = "full",
  disabled = false,
}: TrackerCardColorControlsProps) {
  const config = typeof value === "string" ? parseTrackerCardColorConfig(value) : cleanTrackerCardColorConfig(value);
  const mode = normalizeTrackerCardColorMode(config.mode);
  const finish = getTrackerCardFinish(config, mode);
  const paintEnabled = getTrackerCardPaintEnabled(config);
  const paintOpacity = getTrackerCardPaintOpacity(config);
  const portraitStageBackground = getTrackerCardPortraitStageBackground(config);
  const effectiveColors = getEffectiveColors(mode, config, chatColors);
  const previewStyle = getTrackerPreviewStyle(effectiveColors, finish, paintEnabled, paintOpacity, portraitStageBackground);
  const [collapsed, setCollapsed] = useState(false);
  const modeLabel = MODE_OPTIONS.find((option) => option.mode === mode)?.label ?? "Chat colors";
  const portraitStageBackgroundLabel =
    PORTRAIT_STAGE_BACKGROUND_OPTIONS.find((option) => option.value === portraitStageBackground)?.label ?? "Ambient";
  const finishSummary = `${finish.materialBrightness}/${finish.glowIntensity}/${finish.contrastIntensity}`;
  const paintOpacitySummary = getPaintOpacitySummary(paintOpacity, paintEnabled);
  const previewInitial = getPreviewInitial(previewName, entityLabel === "Persona" ? "Y" : "C");
  const previewContrastStyle = {
    background:
      "linear-gradient(180deg,color-mix(in srgb,var(--background) var(--tracker-preview-contrast-top),transparent) 0%,color-mix(in srgb,var(--card) var(--tracker-preview-contrast-mid),transparent) 58%,color-mix(in srgb,var(--background) var(--tracker-preview-contrast-bottom),transparent) 100%)",
  };

  const updateMode = (nextMode: TrackerCardColorMode) => {
    onChange(
      cleanTrackerCardColorConfig({
        ...config,
        mode: nextMode,
        ...(nextMode === "custom" && {
          nameColor: config.nameColor || chatColors.nameColor || "",
          dialogueColor: config.dialogueColor || chatColors.dialogueColor || "",
          boxColor: config.boxColor || chatColors.boxColor || "",
        }),
      }),
    );
  };

  const updateCustomColor = (key: "nameColor" | "dialogueColor" | "boxColor", color: string) => {
    onChange(cleanTrackerCardColorConfig({ ...config, mode: "custom", [key]: color }));
  };

  const updateFinish = (key: "materialBrightness" | "glowIntensity" | "contrastIntensity", nextValue: number) => {
    onChange(cleanTrackerCardColorConfig({ ...config, [key]: nextValue }));
  };

  const updateFinishPreset = (nextFinish: TrackerCardFinish) => {
    onChange(cleanTrackerCardColorConfig({ ...config, ...nextFinish }));
  };

  const updatePaintOpacity = (key: keyof TrackerCardPaintOpacity, nextValue: number) => {
    onChange(cleanTrackerCardColorConfig({ ...config, [key]: nextValue }));
  };

  const updatePaintEnabled = (key: keyof TrackerCardPaintEnabled, enabled: boolean) => {
    onChange(cleanTrackerCardColorConfig({ ...config, [key]: enabled }));
  };

  const updatePortraitStageBackground = (nextBackground: TrackerCardPortraitStageBackground) => {
    onChange(cleanTrackerCardColorConfig({ ...config, portraitStageBackground: nextBackground }));
  };

  if (variant === "compact") {
    return (
      <div className={cn("rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5", disabled && "opacity-75")}>
        <button
          type="button"
          onClick={() => setCollapsed((open) => !open)}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand tracker card colors" : "Collapse tracker card colors"}
          className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-1 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-[var(--accent)]/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)]/60"
        >
          <h4 className="min-w-0 truncate text-xs font-semibold text-[var(--foreground)]">{entityLabel} card</h4>
          <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
            <span
              className={cn("h-4 w-4 rounded ring-1 ring-[var(--border)]", !paintEnabled.displayEnabled && "opacity-35")}
              style={getDisplayStyle(effectiveColors.nameColor)}
            />
            <span
              className={cn("h-4 w-4 rounded ring-1 ring-[var(--border)]", !paintEnabled.accentEnabled && "opacity-35")}
              style={getDisplayStyle(effectiveColors.dialogueColor)}
            />
            <span
              className={cn("h-4 w-4 rounded ring-1 ring-[var(--border)]", !paintEnabled.surfaceEnabled && "opacity-35")}
              style={getDisplayStyle(effectiveColors.boxColor)}
            />
            <ChevronDown
              size="0.875rem"
              className={cn(
                "ml-0.5 text-[var(--muted-foreground)] transition-transform duration-150",
                collapsed && "-rotate-90",
              )}
            />
          </div>
          <p className="col-span-2 text-[0.625rem] text-[var(--muted-foreground)]">
            {modeLabel}, {portraitStageBackgroundLabel.toLowerCase()} stage, finish M/G/C {finishSummary}.
          </p>
        </button>

        {!collapsed && (
          <div className="mt-2 space-y-2">
            <div className="grid gap-1.5 rounded-lg bg-[var(--secondary)]/65 p-1.5 ring-1 ring-[var(--border)]/40">
              <div className="grid min-w-0 gap-1">
                <span className="px-0.5 text-[0.5625rem] font-semibold uppercase text-[var(--muted-foreground)]">
                  Source
                </span>
                <div className="grid grid-cols-3 gap-0.5 rounded-md bg-[var(--background)]/35 p-0.5">
                  {MODE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const selected = option.mode === mode;
                    return (
                      <button
                        key={option.mode}
                        type="button"
                        onClick={() => updateMode(option.mode)}
                        disabled={disabled}
                        className={cn(
                          "flex min-h-6 min-w-0 items-center justify-center gap-1 rounded-sm px-1 text-[0.5625rem] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55",
                          selected
                            ? "bg-[var(--primary)]/12 text-[var(--primary)] ring-1 ring-[var(--primary)]/24"
                            : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]/45 hover:text-[var(--foreground)]",
                        )}
                      >
                        {selected ? <Check size="0.625rem" /> : <Icon size="0.625rem" />}
                        <span className="truncate">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid min-w-0 gap-1">
                <span className="px-0.5 text-[0.5625rem] font-semibold uppercase text-[var(--muted-foreground)]">
                  Stage
                </span>
                <div className="grid grid-cols-4 gap-0.5 rounded-md bg-[var(--background)]/35 p-0.5">
                  {PORTRAIT_STAGE_BACKGROUND_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const selected = option.value === portraitStageBackground;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        title={option.title}
                        onClick={() => updatePortraitStageBackground(option.value)}
                        disabled={disabled}
                        className={cn(
                          "flex min-h-6 min-w-0 items-center justify-center gap-1 rounded-sm px-1 text-[0.5625rem] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55",
                          selected
                            ? "bg-[var(--primary)]/12 text-[var(--primary)] ring-1 ring-[var(--primary)]/24"
                            : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]/45 hover:text-[var(--foreground)]",
                        )}
                      >
                        {selected ? <Check size="0.625rem" /> : <Icon size="0.625rem" />}
                        <span className="truncate">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-1.5 rounded-lg bg-[var(--secondary)]/65 p-1.5 ring-1 ring-[var(--border)]/40">
              <div className="grid min-w-0 gap-1">
                <span className="px-0.5 text-[0.5625rem] font-semibold uppercase text-[var(--muted-foreground)]">
                  Finish
                </span>
                <div className="grid grid-cols-3 gap-0.5 rounded-md bg-[var(--background)]/35 p-0.5">
                  {FINISH_PRESETS.map((preset) => {
                    const selected =
                      finish.materialBrightness === preset.finish.materialBrightness &&
                      finish.glowIntensity === preset.finish.glowIntensity &&
                      finish.contrastIntensity === preset.finish.contrastIntensity;

                    return (
                      <button
                        key={preset.label}
                        type="button"
                        title={preset.title}
                        onClick={() => updateFinishPreset(preset.finish)}
                        disabled={disabled}
                        className={cn(
                          "min-h-6 rounded-sm px-1 text-[0.5625rem] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55",
                          selected
                            ? "bg-[var(--primary)]/12 text-[var(--primary)] ring-1 ring-[var(--primary)]/24"
                            : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]/45 hover:text-[var(--foreground)]",
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid min-w-0 gap-1">
                {FINISH_OPTIONS.map((option) => {
                  const value = finish[option.key];
                  return (
                    <label
                      key={option.key}
                      className="grid min-w-0 grid-cols-[3.45rem_minmax(0,1fr)_2rem] items-center gap-1.5 rounded-md bg-[var(--background)]/24 px-1.5 py-1 ring-1 ring-[var(--border)]/25"
                      title={option.title}
                    >
                      <span className="truncate text-[0.5625rem] font-semibold text-[var(--foreground)]/80">
                        {option.label}
                      </span>
                      <input
                        type="range"
                        aria-label={`${option.label}: ${option.title}`}
                        title={option.title}
                        min={0}
                        max={100}
                        value={value}
                        onChange={(event) => updateFinish(option.key, Number(event.target.value))}
                        disabled={disabled}
                        className="h-1.5 w-full min-w-0 cursor-pointer accent-[var(--primary)]"
                      />
                      <span className="justify-self-end font-mono text-[0.5625rem] tabular-nums text-[var(--muted-foreground)]">
                        {value}%
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {mode === "chat" && (
              <div className="grid gap-1.5 rounded-lg bg-[var(--secondary)]/55 p-1.5 ring-1 ring-[var(--border)]/35">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[0.5625rem] font-semibold uppercase text-[var(--muted-foreground)]">
                    Source strength
                  </span>
                  <span className="font-mono text-[0.5625rem] tabular-nums text-[var(--muted-foreground)]">
                    {paintOpacitySummary}
                  </span>
                </div>
                <div className="grid gap-1">
                  {PAINT_OPACITY_OPTIONS.map((option) => {
                    const value = paintOpacity[option.key];
                    const channelEnabled = paintEnabled[option.enabledKey];
                    const hasSourcePaint = hasPaintForChannel(effectiveColors, option.colorKey);
                    const sliderEnabled = channelEnabled && hasSourcePaint;
                    return (
                      <div
                        key={option.key}
                        className="grid min-w-0 grid-cols-[minmax(5rem,auto)_minmax(0,1fr)_2.1rem] items-center gap-1 rounded-md bg-[var(--background)]/18 px-1 py-0.5"
                        title={channelEnabled ? option.title : `${option.label} channel is off.`}
                      >
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="min-w-0 truncate text-[0.5625rem] text-[var(--muted-foreground)]">
                            {option.label}
                          </span>
                          <ChannelToggle
                            checked={channelEnabled}
                            disabled={disabled}
                            label={option.label}
                            onChange={(checked) => updatePaintEnabled(option.enabledKey, checked)}
                          />
                        </span>
                        <input
                          type="range"
                          aria-label={`${option.label}: ${option.title}`}
                          title={option.title}
                          min={0}
                          max={100}
                          value={sliderEnabled ? value : 0}
                          onChange={(event) => updatePaintOpacity(option.key, Number(event.target.value))}
                          disabled={disabled || !sliderEnabled}
                          className="h-1.5 w-full min-w-0 cursor-pointer accent-[var(--primary)]"
                        />
                        <span className="justify-self-end font-mono text-[0.5625rem] tabular-nums text-[var(--muted-foreground)]">
                          {getChannelValueLabel(channelEnabled, hasSourcePaint, value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {mode === "custom" && (
              <div className="rounded-lg bg-[var(--secondary)]/55 p-1.5 ring-1 ring-[var(--border)]/35">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[0.5625rem] font-semibold uppercase text-[var(--muted-foreground)]">
                    Custom paint
                  </span>
                  <span className="font-mono text-[0.5625rem] tabular-nums text-[var(--muted-foreground)]">
                    {paintOpacitySummary}
                  </span>
                </div>
                <div className="grid gap-1.5">
                  {PAINT_OPACITY_OPTIONS.map((option) => {
                    const value = paintOpacity[option.key];
                    const channelEnabled = paintEnabled[option.enabledKey];
                    const hasCustomPaint = hasPaintForChannel(config, option.colorKey);
                    const sliderEnabled = channelEnabled && hasCustomPaint;
                    return (
                      <div
                        key={option.key}
                        className={cn(
                          "min-w-0 space-y-1.5 rounded-lg bg-[var(--background)]/25 p-1.5 ring-1 ring-[var(--border)]/30",
                          !channelEnabled && "bg-[var(--background)]/12 ring-[var(--border)]/18",
                          disabled && "pointer-events-none",
                        )}
                      >
                        <ColorPicker
                          value={config[option.colorKey] ?? ""}
                          onChange={(color) => updateCustomColor(option.colorKey, color)}
                          gradient
                          compact
                          label={option.label}
                          emptyText={option.emptyText}
                          helpText={option.title}
                          headerAction={
                            <ChannelToggle
                              checked={channelEnabled}
                              disabled={disabled}
                              label={option.label}
                              onChange={(checked) => updatePaintEnabled(option.enabledKey, checked)}
                            />
                          }
                        />
                        <label className="grid min-w-0 gap-1">
                          <span className="flex min-w-0 items-center justify-between gap-2 text-[0.5625rem] text-[var(--muted-foreground)]">
                            <span className="min-w-0 truncate">{option.label} strength</span>
                            <span className="shrink-0 font-mono tabular-nums">
                              {getChannelValueLabel(channelEnabled, hasCustomPaint, value)}
                            </span>
                          </span>
                          <input
                            type="range"
                            aria-label={`${option.label}: ${option.title}`}
                            title={option.title}
                            min={0}
                            max={100}
                            value={sliderEnabled ? value : 0}
                            onChange={(event) => updatePaintOpacity(option.key, Number(event.target.value))}
                            disabled={disabled || !sliderEnabled}
                            className="h-1.5 w-full min-w-0 cursor-pointer accent-[var(--primary)]"
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5", disabled && "opacity-75")}>
      <button
        type="button"
        onClick={() => setCollapsed((open) => !open)}
        aria-expanded={!collapsed}
        title={collapsed ? "Expand tracker card colors" : "Collapse tracker card colors"}
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-[var(--accent)]/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)]/60"
      >
        <div className="min-w-0">
          <h4 className="text-xs font-semibold text-[var(--foreground)]">{entityLabel} Tracker Card</h4>
          <p className="mt-0.5 text-[0.625rem] text-[var(--muted-foreground)]">
            {modeLabel}, {portraitStageBackgroundLabel.toLowerCase()} stage, finish M/G/C {finishSummary}.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
          <span
            className={cn("h-5 w-5 rounded-md ring-1 ring-[var(--border)]", !paintEnabled.displayEnabled && "opacity-35")}
            style={getDisplayStyle(effectiveColors.nameColor)}
          />
          <span
            className={cn("h-5 w-5 rounded-md ring-1 ring-[var(--border)]", !paintEnabled.accentEnabled && "opacity-35")}
            style={getDisplayStyle(effectiveColors.dialogueColor)}
          />
          <span
            className={cn("h-5 w-5 rounded-md ring-1 ring-[var(--border)]", !paintEnabled.surfaceEnabled && "opacity-35")}
            style={getDisplayStyle(effectiveColors.boxColor)}
          />
          <ChevronDown
            size="0.875rem"
            className={cn(
              "ml-0.5 text-[var(--muted-foreground)] transition-transform duration-150",
              collapsed && "-rotate-90",
            )}
          />
        </div>
      </button>

      {!collapsed && (
        <div className="mt-2.5 space-y-2.5">
          <div className="grid gap-2 rounded-lg bg-[var(--secondary)]/65 p-2 ring-1 ring-[var(--border)]/40 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)]">
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Source
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 rounded-md bg-[var(--background)]/35 p-0.5">
                {MODE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const selected = option.mode === mode;
                  return (
                    <button
                      key={option.mode}
                      type="button"
                      onClick={() => updateMode(option.mode)}
                      disabled={disabled}
                      className={cn(
                        "flex min-h-7 min-w-0 items-center justify-center gap-1 rounded-sm px-1 text-[0.5625rem] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55",
                        selected
                          ? "bg-[var(--primary)]/12 text-[var(--primary)] ring-1 ring-[var(--primary)]/24"
                          : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]/45 hover:text-[var(--foreground)]",
                      )}
                    >
                      {selected ? <Check size="0.625rem" /> : <Icon size="0.625rem" />}
                      <span className="truncate">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Stage
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-md bg-[var(--background)]/35 p-0.5 sm:grid-cols-4">
                {PORTRAIT_STAGE_BACKGROUND_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const selected = option.value === portraitStageBackground;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      title={option.title}
                      onClick={() => updatePortraitStageBackground(option.value)}
                      disabled={disabled}
                      className={cn(
                        "flex min-h-7 min-w-0 items-center justify-center gap-1 rounded-sm px-1 text-[0.5625rem] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55",
                        selected
                          ? "bg-[var(--primary)]/12 text-[var(--primary)] ring-1 ring-[var(--primary)]/24"
                          : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]/45 hover:text-[var(--foreground)]",
                      )}
                    >
                      {selected ? <Check size="0.625rem" /> : <Icon size="0.625rem" />}
                      <span className="truncate">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="@container mx-auto w-full max-w-[32rem]">
            <div
              className="relative min-w-0 overflow-hidden rounded-md border border-[var(--tracker-preview-rule)] bg-[image:var(--tracker-preview-frame)] p-0 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--foreground)_8%,transparent)] [background-blend-mode:var(--tracker-preview-frame-blend)]"
              style={previewStyle}
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--foreground)_4%,transparent),transparent_46%,color-mix(in_srgb,var(--tracker-preview-accent)_6%,transparent))]" />
              <div
                className="pointer-events-none absolute inset-0 bg-[image:var(--tracker-preview-display-layer)]"
                style={{ opacity: "var(--tracker-preview-display-opacity)" }}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[image:var(--tracker-preview-display-layer)] opacity-45" />

              <div className="relative z-[1] overflow-hidden rounded-md border border-[var(--tracker-preview-rule)] bg-[image:var(--tracker-preview-surface)] [background-blend-mode:var(--tracker-preview-surface-blend)]">
                <div className="pointer-events-none absolute inset-0" style={previewContrastStyle} />
                <div className="relative z-[1] grid grid-cols-[minmax(0,1fr)_clamp(5.75rem,42cqw,7.35rem)] @min-[380px]:grid-cols-[minmax(0,1fr)_9rem]">
                  <div className="min-w-0 border-r border-[var(--tracker-preview-rule)]">
                    <div className="relative flex min-h-5 items-center justify-center overflow-hidden border-b border-[var(--tracker-preview-rule)] bg-[image:var(--tracker-preview-panel-strong)] px-1.5 py-0 [background-blend-mode:var(--tracker-preview-panel-strong-blend)]">
                      <span
                        className="pointer-events-none absolute inset-0 bg-[image:var(--tracker-preview-display-layer)]"
                        style={{ opacity: "var(--tracker-preview-display-opacity)" }}
                      />
                      <span className="relative z-[1] block truncate text-[0.75rem] font-semibold leading-5 text-[color:var(--tracker-preview-text)]">
                        {previewName || entityLabel}
                      </span>
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[image:var(--tracker-preview-accent-layer)] opacity-80" />
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[image:var(--tracker-preview-accent-layer)] opacity-35" />
                    </div>
                    <div className="space-y-1 px-1 py-1">
                      {TRACKER_CARD_PREVIEW_STATS.map((stat) => (
                        <div
                          key={stat.label}
                          className="grid gap-0.5 border-b border-[var(--tracker-preview-row-rule)] pb-0.5 last:border-b-0 last:pb-0"
                        >
                          <div className="flex items-center justify-between gap-2 text-[0.625rem] leading-none">
                            <span className="truncate text-[color:var(--tracker-preview-text)]">{stat.label}</span>
                            <span className="font-mono text-[color:var(--tracker-preview-number-text)]">
                              {stat.value} / 100
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-[image:var(--tracker-preview-stat-track)] shadow-[inset_0_1px_2px_var(--tracker-preview-stat-track-shadow)] ring-1 ring-[var(--tracker-preview-stat-track-ring)] [background-blend-mode:var(--tracker-preview-stat-track-blend)]">
                            <div
                              className="h-full rounded-full shadow-[inset_0_1px_0_var(--tracker-preview-stat-fill-highlight),0_0_6px_var(--tracker-preview-stat-fill-glow)]"
                              style={{ width: stat.width, backgroundColor: stat.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative flex min-w-0 flex-col overflow-hidden rounded-b-md bg-[image:var(--tracker-preview-surface)] ring-1 ring-[var(--tracker-preview-rule)] shadow-[0_0_10px_var(--tracker-preview-dialogue-glow),inset_0_-16px_24px_color-mix(in_srgb,var(--background)_58%,transparent)] [background-blend-mode:var(--tracker-preview-surface-blend)]">
                    <div className="relative flex h-5 shrink-0 items-center gap-1 overflow-hidden border-b border-[var(--tracker-preview-rule)] bg-[image:var(--tracker-preview-panel)] px-1 [background-blend-mode:var(--tracker-preview-panel-blend)]">
                      <span
                        className="pointer-events-none absolute inset-0 bg-[image:var(--tracker-preview-display-layer)]"
                        style={{ opacity: "var(--tracker-preview-display-opacity)" }}
                      />
                      <span
                        className="relative z-[1] h-1.5 w-1.5 rounded-full bg-[image:var(--tracker-preview-accent-layer)]"
                        style={{
                          boxShadow: "0 0 6px color-mix(in srgb,var(--tracker-preview-accent) 42%,transparent)",
                        }}
                      />
                      <span className="relative z-[1] min-w-0 truncate text-[0.5625rem] font-semibold leading-5 text-[color-mix(in_srgb,var(--foreground)_82%,var(--tracker-preview-accent)_18%)]">
                        Tracking
                      </span>
                    </div>
                    <div className="relative flex min-h-[8.75rem] flex-1 items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-[image:var(--tracker-preview-portrait-base)]" />
                      <div
                        className="absolute inset-0 bg-[image:var(--tracker-preview-box-layer)]"
                        style={{ opacity: "var(--tracker-preview-tint-opacity)" }}
                      />
                      <div
                        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[image:var(--tracker-preview-display-layer)]"
                        style={{
                          filter:
                            "blur(var(--tracker-preview-portrait-media-blur)) saturate(var(--tracker-preview-portrait-media-saturate))",
                          opacity: "var(--tracker-preview-portrait-media-opacity)",
                        }}
                      />
                      <div
                        className="absolute inset-0 bg-[image:var(--tracker-preview-portrait-light)]"
                        style={{ opacity: "var(--tracker-preview-portrait-light-opacity)" }}
                      />
                      <div className="absolute inset-0 bg-[image:var(--tracker-preview-portrait-veil)]" />
                      <div
                        className="absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--background)_60%,transparent),transparent)]"
                        style={{ opacity: "var(--tracker-preview-portrait-side-mask-opacity)" }}
                      />
                      <div
                        className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(270deg,color-mix(in_srgb,var(--background)_60%,transparent),transparent)]"
                        style={{ opacity: "var(--tracker-preview-portrait-side-mask-opacity)" }}
                      />
                      <div
                        className="absolute inset-x-2 bottom-0 h-1/2 bg-[linear-gradient(0deg,color-mix(in_srgb,var(--tracker-preview-accent)_16%,transparent),transparent_72%)]"
                        style={{ opacity: "var(--tracker-preview-portrait-bottom-glow-opacity)" }}
                      />
                      <div
                        className="absolute inset-0 bg-[image:var(--tracker-preview-portrait-rim)]"
                        style={{ opacity: "var(--tracker-preview-portrait-rim-opacity)" }}
                      />
                      <div
                        className="absolute inset-x-3 bottom-2 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--tracker-preview-accent)_48%,transparent),transparent)]"
                        style={{ opacity: "var(--tracker-preview-portrait-bottom-rule-opacity)" }}
                      />
                      <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--tracker-preview-rule)] bg-[color-mix(in_srgb,var(--background)_72%,transparent)] text-lg font-semibold leading-none text-[var(--tracker-preview-display-solid)] shadow-[0_0_10px_var(--tracker-preview-dialogue-glow)]">
                        {previewInitial}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 border-t border-[var(--tracker-preview-rule)] px-1 pb-1 pt-0.5">
                    <div className="relative flex h-5 items-center gap-1 overflow-hidden bg-[image:var(--tracker-preview-panel)] px-0.5 text-[0.6875rem] leading-[0.875rem] [background-blend-mode:var(--tracker-preview-panel-blend)]">
                      <span
                        className="pointer-events-none absolute inset-0 bg-[image:var(--tracker-preview-display-layer)] [mask-image:linear-gradient(90deg,transparent_0%,black_13%,black_87%,transparent_100%)]"
                        style={{ opacity: "var(--tracker-preview-display-opacity)" }}
                      />
                      <Package
                        size="0.75rem"
                        className="relative z-[1] shrink-0 text-[var(--tracker-preview-accent)]/78"
                      />
                      <span className="relative z-[1] min-w-0 flex-1 truncate font-medium text-[color-mix(in_srgb,var(--tracker-preview-text)_78%,var(--tracker-preview-accent)_22%)]">
                        Inventory
                      </span>
                    </div>
                    <div className="relative mt-px grid min-h-4 grid-cols-[minmax(0,1fr)_max-content] items-center gap-0.5 rounded-[2px] border border-[var(--tracker-preview-slot-rule)] bg-[image:var(--tracker-preview-slot-surface)] px-1 py-px text-[0.625rem] leading-4 shadow-[inset_0_1px_2px_var(--tracker-preview-slot-shadow)] [background-blend-mode:var(--tracker-preview-slot-surface-blend)]">
                      <span className="truncate text-[color:var(--tracker-preview-text)]">None</span>
                      <span className="font-mono text-[color:var(--tracker-preview-number-text)]">1</span>
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-[var(--tracker-preview-rule)] shadow-[0_0_10px_var(--tracker-preview-dialogue-glow)]" />
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg bg-[var(--secondary)]/65 p-2 ring-1 ring-[var(--border)]/40 md:grid-cols-[minmax(10rem,0.55fr)_minmax(0,1.45fr)]">
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Finish
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 rounded-md bg-[var(--background)]/35 p-0.5">
                {FINISH_PRESETS.map((preset) => {
                  const selected =
                    finish.materialBrightness === preset.finish.materialBrightness &&
                    finish.glowIntensity === preset.finish.glowIntensity &&
                    finish.contrastIntensity === preset.finish.contrastIntensity;

                  return (
                    <button
                      key={preset.label}
                      type="button"
                      title={preset.title}
                      onClick={() => updateFinishPreset(preset.finish)}
                      disabled={disabled}
                      className={cn(
                        "min-h-7 rounded-sm px-1 text-[0.5625rem] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55",
                        selected
                          ? "bg-[var(--primary)]/12 text-[var(--primary)] ring-1 ring-[var(--primary)]/24"
                          : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]/45 hover:text-[var(--foreground)]",
                      )}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid min-w-0 gap-1.5 sm:grid-cols-3">
              {FINISH_OPTIONS.map((option) => {
                const value = finish[option.key];
                return (
                  <label
                    key={option.key}
                    className="min-w-0 space-y-1.5 rounded-md bg-[var(--background)]/24 px-2 py-1.5 ring-1 ring-[var(--border)]/25"
                    title={option.title}
                  >
                    <span className="flex items-center justify-between gap-2 text-[0.625rem] text-[var(--muted-foreground)]">
                      <span className="font-semibold text-[var(--foreground)]/80">{option.label}</span>
                      <span className="rounded-full bg-[var(--secondary)] px-1.5 py-0.5 font-mono text-[0.5625rem] tabular-nums text-[var(--muted-foreground)]">
                        {value}%
                      </span>
                    </span>
                    <input
                      type="range"
                      aria-label={`${option.label}: ${option.title}`}
                      title={option.title}
                      min={0}
                      max={100}
                      value={value}
                      onChange={(event) => updateFinish(option.key, Number(event.target.value))}
                      disabled={disabled}
                      className="h-1.5 w-full cursor-pointer accent-[var(--primary)]"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {mode === "chat" && (
            <div className="grid gap-2 rounded-lg bg-[var(--secondary)]/55 p-2 ring-1 ring-[var(--border)]/35">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Source strength
                </span>
                <span className="font-mono text-[0.625rem] tabular-nums text-[var(--muted-foreground)]">
                  {paintOpacitySummary}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {PAINT_OPACITY_OPTIONS.map((option) => {
                  const value = paintOpacity[option.key];
                  const channelEnabled = paintEnabled[option.enabledKey];
                  const hasSourcePaint = hasPaintForChannel(effectiveColors, option.colorKey);
                  const sliderEnabled = channelEnabled && hasSourcePaint;
                  return (
                    <div
                      key={option.key}
                      className="grid min-w-0 gap-1 rounded-md bg-[var(--background)]/18 px-1.5 py-1"
                      title={channelEnabled ? option.title : `${option.label} channel is off.`}
                    >
                      <span className="flex items-center justify-between gap-2 text-[0.625rem] text-[var(--muted-foreground)]">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="min-w-0 truncate">{option.label}</span>
                          <ChannelToggle
                            checked={channelEnabled}
                            disabled={disabled}
                            label={option.label}
                            onChange={(checked) => updatePaintEnabled(option.enabledKey, checked)}
                          />
                        </span>
                        <span className="font-mono tabular-nums">
                          {getChannelValueLabel(channelEnabled, hasSourcePaint, value)}
                        </span>
                      </span>
                      <input
                        type="range"
                        aria-label={`${option.label}: ${option.title}`}
                        title={option.title}
                        min={0}
                        max={100}
                        value={sliderEnabled ? value : 0}
                        onChange={(event) => updatePaintOpacity(option.key, Number(event.target.value))}
                        disabled={disabled || !sliderEnabled}
                        className="h-1.5 w-full cursor-pointer accent-[var(--primary)]"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {mode === "custom" && (
            <div className="rounded-lg bg-[var(--secondary)]/55 p-2 ring-1 ring-[var(--border)]/35">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Custom paint
                </span>
                <span className="font-mono text-[0.625rem] tabular-nums text-[var(--muted-foreground)]">
                  {paintOpacitySummary}
                </span>
              </div>
              <div className="grid gap-2 lg:grid-cols-3">
                {PAINT_OPACITY_OPTIONS.map((option) => {
                  const value = paintOpacity[option.key];
                  const channelEnabled = paintEnabled[option.enabledKey];
                  const hasCustomPaint = hasPaintForChannel(config, option.colorKey);
                  const sliderEnabled = channelEnabled && hasCustomPaint;

                  return (
                    <div
                      key={option.key}
                      className={cn(
                        "min-w-0 space-y-2 rounded-lg bg-[var(--background)]/25 p-2 ring-1 ring-[var(--border)]/30",
                        !channelEnabled && "bg-[var(--background)]/12 ring-[var(--border)]/18",
                        disabled && "pointer-events-none",
                      )}
                    >
                      <ColorPicker
                        value={config[option.colorKey] ?? ""}
                        onChange={(color) => updateCustomColor(option.colorKey, color)}
                        gradient
                        compact
                        label={option.label}
                        emptyText={option.emptyText}
                        helpText={option.title}
                        headerAction={
                          <ChannelToggle
                            checked={channelEnabled}
                            disabled={disabled}
                            label={option.label}
                            onChange={(checked) => updatePaintEnabled(option.enabledKey, checked)}
                          />
                        }
                      />
                      <label className="block min-w-0 space-y-1">
                        <span className="flex items-center justify-between gap-2 text-[0.625rem] text-[var(--muted-foreground)]">
                          <span>{option.label} strength</span>
                          <span className="font-mono tabular-nums">
                            {getChannelValueLabel(channelEnabled, hasCustomPaint, value)}
                          </span>
                        </span>
                        <input
                          type="range"
                          aria-label={`${option.label}: ${option.title}`}
                          title={option.title}
                          min={0}
                          max={100}
                          value={sliderEnabled ? value : 0}
                          onChange={(event) => updatePaintOpacity(option.key, Number(event.target.value))}
                          disabled={disabled || !sliderEnabled}
                          className="h-1.5 w-full cursor-pointer accent-[var(--primary)]"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

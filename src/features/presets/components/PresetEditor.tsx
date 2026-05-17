import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, Layers, Save, Sparkles, Trash2 } from "lucide-react";
import { HelpTooltip } from "../../../shared/components/ui/HelpTooltip";
import { showConfirmDialog } from "../../../shared/lib/app-dialogs";
import { cn } from "../../../shared/lib/utils";
import { useUIStore } from "../../../shared/stores/ui.store";
import { useDeletePreset, usePresetFull, useUpdatePreset } from "../hooks/use-presets";
import type { WrapFormat } from "../types";

const TABS = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "sections", label: "Sections", icon: Layers },
  { id: "review", label: "AI Review", icon: Sparkles },
] as const;

export function PresetEditor() {
  const presetDetailId = useUIStore((s) => s.presetDetailId);
  const closePresetDetail = useUIStore((s) => s.closePresetDetail);
  const setEditorDirty = useUIStore((s) => s.setEditorDirty);
  const { data, isLoading, error } = usePresetFull(presetDetailId);
  const updatePreset = useUpdatePreset();
  const deletePreset = useDeletePreset();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [dirty, setDirty] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [wrapFormat, setWrapFormat] = useState<WrapFormat>("xml");
  const [author, setAuthor] = useState("");

  useEffect(() => setEditorDirty(dirty), [dirty, setEditorDirty]);

  useEffect(() => {
    if (!data) return;
    setName(data.preset.name ?? "");
    setDescription(data.preset.description ?? "");
    setWrapFormat(data.preset.wrapFormat ?? "xml");
    setAuthor(data.preset.author ?? "");
    setDirty(false);
  }, [data]);

  const sectionStats = useMemo(
    () => ({
      sections: data?.sections.length ?? 0,
      groups: data?.groups.length ?? 0,
      choices: data?.choiceBlocks?.length ?? 0,
    }),
    [data],
  );

  if (!presetDetailId) return null;

  const markDirty = () => setDirty(true);
  const save = () => {
    updatePreset.mutate(
      { id: presetDetailId, name, description, wrapFormat, author },
      { onSuccess: () => setDirty(false) },
    );
  };

  const close = () => {
    if (dirty) return;
    closePresetDetail();
  };

  const remove = async () => {
    if (
      await showConfirmDialog({
        title: "Delete Preset",
        message: "Delete this preset?",
        confirmLabel: "Delete",
        tone: "destructive",
      })
    ) {
      deletePreset.mutate(presetDetailId, { onSuccess: closePresetDetail });
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] bg-[var(--card)] px-4 py-3 max-md:px-3">
        <button onClick={close} className="rounded-xl p-2 transition-all hover:bg-[var(--accent)] active:scale-95">
          <ArrowLeft size="1.125rem" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 text-white shadow-sm">
          <FileText size="1.125rem" />
        </div>
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            markDirty();
          }}
          className="h-10 min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none placeholder:text-[var(--muted-foreground)]"
          placeholder="Preset name..."
        />
        <div className="flex items-center gap-1.5">
          <button
            onClick={save}
            disabled={updatePreset.isPending || !!error}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-400 to-violet-500 px-4 py-2 text-xs font-medium text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
          >
            <Save size="0.8125rem" /> Save
          </button>
          <button
            onClick={remove}
            disabled={!!error}
            className="rounded-xl p-2 transition-all hover:bg-[var(--destructive)]/15 active:scale-95 disabled:opacity-50"
          >
            <Trash2 size="0.9375rem" className="text-[var(--destructive)]" />
          </button>
        </div>
      </div>

      {dirty && (
        <div className="flex items-center justify-between bg-amber-500/10 px-4 py-2 text-xs text-amber-400">
          <span>You have unsaved changes.</span>
          <button onClick={save} className="rounded-lg bg-amber-500/20 px-3 py-1 hover:bg-amber-500/30">
            Save
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden @max-5xl:flex-col">
        <nav className="flex w-44 shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-[var(--border)] bg-[var(--card)] p-2 @max-5xl:w-full @max-5xl:flex-row @max-5xl:overflow-x-auto @max-5xl:border-r-0 @max-5xl:border-b">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium transition-all @max-5xl:whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-400/15 to-violet-500/15 text-purple-400 ring-1 ring-purple-400/20"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]",
                )}
              >
                <Icon size="0.875rem" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="flex-1 overflow-y-auto p-6 @max-5xl:p-4">
          <div className="mx-auto max-w-2xl space-y-6">
            {isLoading && <div className="shimmer h-40 rounded-xl" />}
            {error && (
              <div className="rounded-xl border border-purple-400/25 bg-purple-400/10 p-4 text-sm leading-relaxed text-purple-200">
                This preset editor is wired to the final UI path, but preset reads and writes are waiting for the Rust
                prompts/presets backend slice. No fallback data is generated.
              </div>
            )}
            {!isLoading && !error && activeTab === "overview" && (
              <>
                <FieldGroup label="Description">
                  <textarea
                    value={description}
                    onChange={(event) => {
                      setDescription(event.target.value);
                      markDirty();
                    }}
                    className="min-h-24 w-full rounded-xl bg-[var(--secondary)] p-3 text-sm text-[var(--foreground)] ring-1 ring-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    placeholder="What does this preset do?"
                  />
                </FieldGroup>
                <FieldGroup label="Wrap format" help="How prompt sections are wrapped before generation.">
                  <select
                    value={wrapFormat}
                    onChange={(event) => {
                      setWrapFormat(event.target.value as WrapFormat);
                      markDirty();
                    }}
                    className="w-full rounded-xl bg-[var(--secondary)] p-3 text-sm text-[var(--foreground)] ring-1 ring-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    <option value="xml">XML</option>
                    <option value="markdown">Markdown</option>
                    <option value="plain">Plain</option>
                  </select>
                </FieldGroup>
                <FieldGroup label="Author">
                  <input
                    value={author}
                    onChange={(event) => {
                      setAuthor(event.target.value);
                      markDirty();
                    }}
                    className="w-full rounded-xl bg-[var(--secondary)] p-3 text-sm text-[var(--foreground)] ring-1 ring-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    placeholder="Optional author"
                  />
                </FieldGroup>
              </>
            )}
            {!isLoading && !error && activeTab === "sections" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Sections" value={sectionStats.sections} />
                  <StatCard label="Groups" value={sectionStats.groups} />
                  <StatCard label="Choices" value={sectionStats.choices} />
                </div>
                <div className="rounded-xl border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--muted-foreground)]">
                  Section create, edit, reorder, group, variable, and choice-block actions are waiting for the Rust
                  prompts/presets backend slice.
                </div>
              </div>
            )}
            {!isLoading && !error && activeTab === "review" && (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--muted-foreground)]">
                AI prompt review requires Rust-owned provider calls and streaming events, so it is deferred until the
                providers/generation backend slice.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
        {label}
        {help && <HelpTooltip text={help} />}
      </label>
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-[var(--secondary)] p-3 ring-1 ring-[var(--border)]">
      <span className="text-xl font-bold text-[var(--foreground)]">{value}</span>
      <span className="text-[0.625rem] text-[var(--muted-foreground)]">{label}</span>
    </div>
  );
}

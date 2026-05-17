import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Code2, Copy, Download, FileText, Hash, Plus, Search, Star, Trash2 } from "lucide-react";
import { showConfirmDialog } from "../../../shared/lib/app-dialogs";
import { cn } from "../../../shared/lib/utils";
import { useChatStore } from "../../../shared/stores/chat.store";
import { useUIStore } from "../../../shared/stores/ui.store";
import { useDeletePreset, useDuplicatePreset, usePresets, useSetDefaultPreset } from "../hooks/use-presets";
import type { PromptPreset as Preset } from "@marinara-engine/shared";

function deferredToast(action: string) {
  toast.error(`${action} is waiting for the Rust prompts/presets backend slice.`);
}

function sectionCount(preset: Preset) {
  try {
    if (Array.isArray(preset.sectionOrder)) return preset.sectionOrder.length;
    if (typeof preset.sectionOrder === "string") return JSON.parse(preset.sectionOrder).length;
  } catch {
    return 0;
  }
  return 0;
}

function isDefaultPreset(preset: Preset) {
  return preset.isDefault === true || String(preset.isDefault) === "true";
}

export function PresetsPanel() {
  const { data: presets, isLoading, error } = usePresets();
  const deletePreset = useDeletePreset();
  const duplicatePreset = useDuplicatePreset();
  const setDefaultPreset = useSetDefaultPreset();
  const openPresetDetail = useUIStore((s) => s.openPresetDetail);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const [search, setSearch] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPresetIds, setSelectedPresetIds] = useState<Set<string>>(new Set());

  const filteredPresets = useMemo(() => {
    const list = presets ?? [];
    if (!search.trim()) return list;
    const query = search.toLowerCase();
    return list.filter(
      (preset) =>
        preset.name.toLowerCase().includes(query) ||
        (preset.description ?? "").toLowerCase().includes(query) ||
        (preset.author ?? "").toLowerCase().includes(query),
    );
  }, [presets, search]);

  const toggleSelection = (id: string) => {
    setSelectedPresetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedPresetIds(new Set());
  };

  const handleDelete = async (preset: Preset) => {
    if (
      await showConfirmDialog({
        title: "Delete Preset",
        message: `Delete "${preset.name}"?`,
        confirmLabel: "Delete",
        tone: "destructive",
      })
    ) {
      deletePreset.mutate(preset.id);
    }
  };

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto p-3">
      <div className="flex gap-2">
        <button
          onClick={() => deferredToast("Create preset")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-400 to-violet-500 px-3 py-2.5 text-xs font-medium text-white shadow-md shadow-purple-400/15 transition-all hover:shadow-lg active:scale-[0.98]"
          title="New"
        >
          <Plus size="0.8125rem" /> <span className="md:hidden">New</span>
        </button>
        <button
          onClick={() => deferredToast("Import preset")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--secondary)] px-3 py-2.5 text-xs font-medium text-[var(--secondary-foreground)] ring-1 ring-[var(--border)] transition-all hover:bg-[var(--accent)] active:scale-[0.98]"
          title="Import"
        >
          <Download size="0.8125rem" /> <span className="md:hidden">Import</span>
        </button>
        <button
          onClick={() => (selectionMode ? exitSelectionMode() : setSelectionMode(true))}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all",
            selectionMode
              ? "bg-purple-400/15 text-purple-400 ring-1 ring-purple-400/30"
              : "bg-[var(--secondary)] text-[var(--secondary-foreground)] ring-1 ring-[var(--border)] hover:bg-[var(--accent)]",
          )}
          title="Select"
        >
          <Check size="0.8125rem" /> <span className="md:hidden">Select</span>
        </button>
      </div>

      {selectionMode && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/60 px-3 py-2">
          <span className="text-[0.6875rem] font-medium text-[var(--muted-foreground)]">
            {selectedPresetIds.size} selected
          </span>
          <button
            onClick={() => setSelectedPresetIds(new Set(filteredPresets.map((preset) => preset.id)))}
            disabled={filteredPresets.length === 0}
            className="rounded-lg px-2.5 py-1 text-[0.625rem] font-medium text-purple-400 transition-colors hover:bg-[var(--accent)] disabled:opacity-40"
          >
            Select visible
          </button>
          <button
            onClick={() => deferredToast("Bulk preset export")}
            disabled={selectedPresetIds.size === 0}
            className="inline-flex items-center gap-1 rounded-lg bg-purple-500 px-2.5 py-1 text-[0.625rem] font-medium text-white transition-all hover:opacity-90 disabled:opacity-40"
          >
            <Download size="0.6875rem" />
            Export ZIP
          </button>
          <button
            onClick={exitSelectionMode}
            className="rounded-lg px-2.5 py-1 text-[0.625rem] font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
          >
            Done
          </button>
        </div>
      )}

      <div className="relative">
        <Search
          size="0.8125rem"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
        />
        <input
          type="text"
          placeholder="Search presets..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-xl bg-[var(--secondary)] py-2 pl-8 pr-3 text-xs text-[var(--foreground)] ring-1 ring-[var(--border)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2 py-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="shimmer h-16 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-purple-400/25 bg-purple-400/10 p-3 text-xs leading-relaxed text-purple-200">
          Preset storage and listing are waiting for the Rust prompts/presets backend slice. The panel controls and
          editor navigation are wired, but no fake presets are shown.
        </div>
      )}

      {!isLoading && !error && filteredPresets.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400/20 to-violet-500/20">
            <FileText size="1.25rem" className="text-purple-400" />
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">{search ? "No matching presets" : "No presets yet"}</p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {!isLoading &&
          !error &&
          filteredPresets.map((preset) => {
            const wrapFormat = preset.wrapFormat ?? "xml";
            const isDefault = isDefaultPreset(preset);
            const isBulkSelected = selectedPresetIds.has(preset.id);

            return (
              <div
                key={preset.id}
                className={cn(
                  "group relative flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-[var(--sidebar-accent)]",
                  selectionMode && isBulkSelected && "bg-purple-400/10 ring-1 ring-purple-400/40",
                )}
              >
                <div
                  className="flex min-w-0 flex-1 items-center gap-3"
                  onClick={() => (selectionMode ? toggleSelection(preset.id) : openPresetDetail(preset.id))}
                >
                  {selectionMode && (
                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                        isBulkSelected
                          ? "border-purple-400 bg-purple-400 text-white"
                          : "border-[var(--muted-foreground)]/40 bg-[var(--secondary)] text-transparent",
                      )}
                    >
                      <Check size="0.75rem" />
                    </div>
                  )}
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 text-white shadow-sm">
                    <FileText size="1rem" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">{preset.name}</span>
                      {isDefault && (
                        <span className="shrink-0 rounded bg-purple-400/15 px-1 py-0.5 text-[0.5625rem] font-medium text-purple-400">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[0.6875rem] text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-0.5">
                        {wrapFormat === "xml" ? <Code2 size="0.5625rem" /> : <Hash size="0.5625rem" />}
                        {wrapFormat.toUpperCase()}
                      </span>
                      <span>{sectionCount(preset)} sections</span>
                      {preset.author && <span className="truncate">by {preset.author}</span>}
                    </div>
                  </div>
                </div>

                {!selectionMode && (
                  <div className="absolute right-2 top-1/2 flex shrink-0 -translate-y-1/2 items-center gap-0.5 rounded-lg bg-[var(--sidebar)] px-1 py-0.5 opacity-0 shadow-sm ring-1 ring-[var(--border)] transition-opacity group-hover:opacity-100 max-md:opacity-100">
                    {activeChatId && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          deferredToast("Assign preset to chat");
                        }}
                        className="rounded-lg p-1.5 text-[var(--muted-foreground)] transition-all hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] active:scale-90"
                        title="Assign to chat"
                      >
                        <Check size="0.75rem" />
                      </button>
                    )}
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setDefaultPreset.mutate(preset.id);
                      }}
                      className={cn(
                        "rounded-lg p-1.5 transition-all active:scale-90",
                        isDefault
                          ? "text-yellow-500"
                          : "text-[var(--muted-foreground)] hover:bg-yellow-500/10 hover:text-yellow-500",
                      )}
                      title={isDefault ? "Default preset" : "Set as default"}
                    >
                      <Star size="0.75rem" className={isDefault ? "fill-yellow-500" : ""} />
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        duplicatePreset.mutate(preset.id);
                      }}
                      className="rounded-lg p-1.5 text-[var(--muted-foreground)] transition-all hover:bg-sky-400/10 hover:text-sky-400 active:scale-90"
                      title="Duplicate"
                    >
                      <Copy size="0.75rem" />
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(preset);
                      }}
                      className="rounded-lg p-1.5 transition-all hover:bg-[var(--destructive)]/15 active:scale-90"
                      title="Delete"
                    >
                      <Trash2 size="0.75rem" className="text-[var(--destructive)]" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

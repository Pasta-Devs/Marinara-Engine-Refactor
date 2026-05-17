import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, FileText, Globe, Save, Settings2, Trash2 } from "lucide-react";
import { useUIStore } from "../../../shared/stores/ui.store";
import { HelpTooltip } from "../../../shared/components/ui/HelpTooltip";
import { showConfirmDialog } from "../../../shared/lib/app-dialogs";
import { cn } from "../../../shared/lib/utils";
import { useDeleteLorebook, useLorebook, useLorebookEntries, useUpdateLorebook } from "../hooks/use-lorebooks";
import type { LorebookCategory } from "../types";

const TABS = [
  { id: "overview", label: "Overview", icon: Settings2 },
  { id: "entries", label: "Entries", icon: FileText },
] as const;

const CATEGORY_OPTIONS: Array<{ value: LorebookCategory; label: string }> = [
  { value: "world", label: "World" },
  { value: "character", label: "Character" },
  { value: "npc", label: "NPC" },
  { value: "spellbook", label: "Spellbook" },
  { value: "uncategorized", label: "Uncategorized" },
];

export function LorebookEditor() {
  const lorebookId = useUIStore((s) => s.lorebookDetailId);
  const closeLorebookDetail = useUIStore((s) => s.closeLorebookDetail);
  const setEditorDirty = useUIStore((s) => s.setEditorDirty);
  const { data: lorebook, isLoading, error } = useLorebook(lorebookId);
  const { data: entries } = useLorebookEntries(lorebookId);
  const updateLorebook = useUpdateLorebook();
  const deleteLorebook = useDeleteLorebook();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [dirty, setDirty] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<LorebookCategory>("uncategorized");
  const [enabled, setEnabled] = useState(true);
  const [isGlobal, setIsGlobal] = useState(false);
  const [scanDepth, setScanDepth] = useState(2);
  const [tokenBudget, setTokenBudget] = useState(2048);

  useEffect(() => setEditorDirty(dirty), [dirty, setEditorDirty]);

  useEffect(() => {
    if (!lorebook) return;
    setName(lorebook.name);
    setDescription(lorebook.description);
    setCategory(lorebook.category);
    setEnabled(lorebook.enabled);
    setIsGlobal(lorebook.isGlobal ?? false);
    setScanDepth(lorebook.scanDepth);
    setTokenBudget(lorebook.tokenBudget);
    setDirty(false);
  }, [lorebook]);

  const entryStats = useMemo(() => {
    const list = entries ?? [];
    return {
      count: list.length,
      tokens: list.reduce((sum, entry) => sum + (entry.tokenCount ?? 0), 0),
    };
  }, [entries]);

  if (!lorebookId) return null;

  const markDirty = () => setDirty(true);
  const save = () => {
    updateLorebook.mutate(
      { id: lorebookId, name, description, category, enabled, isGlobal, scanDepth, tokenBudget },
      { onSuccess: () => setDirty(false) },
    );
  };

  const close = () => {
    if (dirty) return;
    closeLorebookDetail();
  };

  const remove = async () => {
    if (
      await showConfirmDialog({
        title: "Delete Lorebook",
        message: "Delete this lorebook? All entries will be lost.",
        confirmLabel: "Delete",
        tone: "destructive",
      })
    ) {
      deleteLorebook.mutate(lorebookId, { onSuccess: closeLorebookDetail });
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] bg-[var(--card)] px-4 py-3 max-md:px-3">
        <button onClick={close} className="rounded-xl p-2 transition-all hover:bg-[var(--accent)] active:scale-95">
          <ArrowLeft size="1.125rem" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
          <BookOpen size="1.125rem" />
        </div>
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            markDirty();
          }}
          className="h-10 min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none placeholder:text-[var(--muted-foreground)]"
          placeholder="Lorebook name..."
        />
        <div className="flex items-center gap-1.5">
          <button
            onClick={save}
            disabled={updateLorebook.isPending || !!error}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-xs font-medium text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
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
          <div className="flex gap-2">
            <button onClick={() => setDirty(false)} className="rounded-lg px-3 py-1 hover:bg-[var(--accent)]">
              Discard flag
            </button>
            <button onClick={save} className="rounded-lg bg-amber-500/20 px-3 py-1 hover:bg-amber-500/30">
              Save
            </button>
          </div>
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
                    ? "bg-gradient-to-r from-amber-400/15 to-orange-500/15 text-amber-400 ring-1 ring-amber-400/20"
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
              <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-300">
                This lorebook editor is wired to the final UI path, but lorebook reads and writes are waiting for the
                Rust lorebooks backend slice. No fallback data is generated.
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
                    placeholder="What should this lorebook cover?"
                  />
                </FieldGroup>
                <FieldGroup label="Category">
                  <select
                    value={category}
                    onChange={(event) => {
                      setCategory(event.target.value as LorebookCategory);
                      markDirty();
                    }}
                    className="w-full rounded-xl bg-[var(--secondary)] p-3 text-sm text-[var(--foreground)] ring-1 ring-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FieldGroup>
                <div className="grid grid-cols-2 gap-3">
                  <FieldGroup label="Scan depth" help="How many previous messages are scanned for matching keys.">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={scanDepth}
                      onChange={(event) => {
                        setScanDepth(Number(event.target.value));
                        markDirty();
                      }}
                      className="w-full rounded-xl bg-[var(--secondary)] p-3 text-sm ring-1 ring-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                  </FieldGroup>
                  <FieldGroup label="Token budget" help="Maximum lorebook tokens to inject.">
                    <input
                      type="number"
                      min={0}
                      value={tokenBudget}
                      onChange={(event) => {
                        setTokenBudget(Number(event.target.value));
                        markDirty();
                      }}
                      className="w-full rounded-xl bg-[var(--secondary)] p-3 text-sm ring-1 ring-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                  </FieldGroup>
                </div>
                <label className="flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3 ring-1 ring-[var(--border)]">
                  <span className="text-sm">Enabled</span>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(event) => {
                      setEnabled(event.target.checked);
                      markDirty();
                    }}
                  />
                </label>
                <label className="flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3 ring-1 ring-[var(--border)]">
                  <span className="flex items-center gap-2 text-sm">
                    <Globe size="0.875rem" /> Global lorebook
                  </span>
                  <input
                    type="checkbox"
                    checked={isGlobal}
                    onChange={(event) => {
                      setIsGlobal(event.target.checked);
                      markDirty();
                    }}
                  />
                </label>
              </>
            )}
            {!isLoading && !error && activeTab === "entries" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Entries" value={entryStats.count} />
                  <StatCard label="Known Tokens" value={entryStats.tokens} />
                </div>
                <div className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--border)] px-3 py-3 text-center text-xs text-[var(--muted-foreground)]">
                  Entry create/reorder/edit actions are waiting for the Rust lorebooks backend slice.
                </div>
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

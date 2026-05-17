import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  BookOpen,
  Check,
  Download,
  FileText,
  Globe,
  Layers,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import { useUIStore } from "../../../shared/stores/ui.store";
import { showConfirmDialog } from "../../../shared/lib/app-dialogs";
import { cn } from "../../../shared/lib/utils";
import { useDeleteLorebook, useLorebooks } from "../hooks/use-lorebooks";
import type { Lorebook, LorebookCategory } from "../types";

const CATEGORIES: Array<{ id: LorebookCategory | "all" | "active"; label: string; icon: typeof Globe }> = [
  { id: "all", label: "All", icon: Layers },
  { id: "active", label: "Active", icon: Zap },
  { id: "world", label: "World", icon: Globe },
  { id: "character", label: "Character", icon: Users },
  { id: "npc", label: "NPC", icon: UserRound },
  { id: "spellbook", label: "Spellbook", icon: Wand2 },
  { id: "uncategorized", label: "Other", icon: BookOpen },
];

const CATEGORY_COLORS: Record<string, string> = {
  world: "from-emerald-400 to-teal-500",
  character: "from-violet-400 to-purple-500",
  npc: "from-rose-400 to-pink-500",
  spellbook: "from-blue-400 to-indigo-500",
  uncategorized: "from-amber-400 to-orange-500",
  all: "from-amber-400 to-orange-500",
};

function parseTags(lorebook: Lorebook): string[] {
  if (Array.isArray(lorebook.tags)) return lorebook.tags;
  if (typeof lorebook.tags !== "string") return [];
  try {
    const parsed = JSON.parse(lorebook.tags);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function deferredToast(action: string) {
  toast.error(`${action} is waiting for the Rust lorebooks backend slice.`);
}

export function LorebooksPanel() {
  const [activeCategory, setActiveCategory] = useState<LorebookCategory | "all" | "active">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<"name-asc" | "name-desc" | "newest" | "oldest" | "tokens">("name-asc");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedLorebookIds, setSelectedLorebookIds] = useState<Set<string>>(new Set());
  const openLorebookDetail = useUIStore((s) => s.openLorebookDetail);
  const { data: lorebooks, isLoading, error } = useLorebooks(
    activeCategory === "all" || activeCategory === "active" ? undefined : activeCategory,
  );
  const deleteLorebook = useDeleteLorebook();

  const filtered = useMemo(() => {
    let list = lorebooks ?? [];
    if (activeCategory === "active") {
      list = list.filter((lorebook) => lorebook.enabled && lorebook.isGlobal);
    }
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(
      (lorebook) =>
        lorebook.name.toLowerCase().includes(query) ||
        lorebook.description.toLowerCase().includes(query) ||
        parseTags(lorebook).some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [activeCategory, lorebooks, searchQuery]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "name-desc":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case "newest":
        return list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
      case "oldest":
        return list.sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
      case "tokens":
        return list.sort((a, b) => (b.tokenBudget ?? 0) - (a.tokenBudget ?? 0));
      case "name-asc":
      default:
        return list.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [filtered, sort]);

  const grouped = useMemo(() => {
    if (activeCategory !== "all") return null;
    const map = new Map<string, Lorebook[]>();
    for (const lorebook of sorted) {
      const group = lorebook.category || "uncategorized";
      map.set(group, [...(map.get(group) ?? []), lorebook]);
    }
    return map;
  }, [activeCategory, sorted]);

  const toggleSelection = (id: string) => {
    setSelectedLorebookIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedLorebookIds(new Set());
  };

  const handleDelete = async (lorebook: Lorebook) => {
    if (
      await showConfirmDialog({
        title: "Delete Lorebook",
        message: `Delete "${lorebook.name}"? All entries will be lost.`,
        confirmLabel: "Delete",
        tone: "destructive",
      })
    ) {
      deleteLorebook.mutate(lorebook.id);
    }
  };

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto p-3">
      <div className="flex gap-2">
        <button
          onClick={() => deferredToast("Create lorebook")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2.5 text-xs font-medium text-white shadow-md shadow-amber-400/15 transition-all hover:shadow-lg active:scale-[0.98]"
          title="New"
        >
          <Plus size="0.8125rem" /> <span className="md:hidden">New</span>
        </button>
        <button
          onClick={() => deferredToast("Import lorebook")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--secondary)] px-3 py-2.5 text-xs font-medium text-[var(--secondary-foreground)] ring-1 ring-[var(--border)] transition-all hover:bg-[var(--accent)] active:scale-[0.98]"
          title="Import"
        >
          <Download size="0.8125rem" /> <span className="md:hidden">Import</span>
        </button>
        <button
          onClick={() => deferredToast("AI lorebook maker")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--secondary)] px-3 py-2.5 text-xs font-medium text-[var(--secondary-foreground)] ring-1 ring-[var(--border)] transition-all hover:bg-[var(--accent)] active:scale-[0.98]"
          title="AI Maker"
        >
          <Sparkles size="0.8125rem" /> <span className="md:hidden">Maker</span>
        </button>
        <button
          onClick={() => (selectionMode ? exitSelectionMode() : setSelectionMode(true))}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-all",
            selectionMode
              ? "bg-amber-400/15 text-amber-400 ring-1 ring-amber-400/30"
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
            {selectedLorebookIds.size} selected
          </span>
          <button
            onClick={() => setSelectedLorebookIds(new Set(sorted.map((lorebook) => lorebook.id)))}
            disabled={sorted.length === 0}
            className="rounded-lg px-2.5 py-1 text-[0.625rem] font-medium text-amber-400 transition-colors hover:bg-[var(--accent)] disabled:opacity-40"
          >
            Select visible
          </button>
          <button
            onClick={() => deferredToast("Bulk lorebook export")}
            disabled={selectedLorebookIds.size === 0}
            className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[0.625rem] font-medium text-white transition-all hover:opacity-90 disabled:opacity-40"
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

      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <Search
            size="0.8125rem"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          />
          <input
            type="text"
            placeholder="Search lorebooks"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-xl bg-[var(--secondary)] py-2 pl-8 pr-3 text-xs text-[var(--foreground)] ring-1 ring-[var(--border)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <div className="relative">
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="h-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--secondary)] py-2 pl-2.5 pr-7 text-[0.6875rem] outline-none transition-colors focus:border-[var(--primary)]/40 focus:ring-1 focus:ring-[var(--primary)]/20"
            title="Sort order"
          >
            <option value="name-asc">A-Z</option>
            <option value="name-desc">Z-A</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="tokens">Token Budget</option>
          </select>
          <ArrowUpDown
            size="0.625rem"
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[0.6875rem] font-medium transition-all",
                isActive
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
              )}
            >
              <Icon size="0.75rem" />
              {category.label}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2 py-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="shimmer h-14 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-xs leading-relaxed text-amber-300">
          Lorebook storage and listing are waiting for the Rust lorebooks backend slice. The panel controls and editor
          navigation are wired, but no fake lorebooks are shown.
        </div>
      )}

      {!isLoading && !error && sorted.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20">
            <BookOpen size="1.25rem" className="text-amber-400" />
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            {searchQuery ? "No lorebooks match your search" : "No lorebooks yet"}
          </p>
        </div>
      )}

      {!isLoading && !error && sorted.length > 0 && (
        <div className="flex flex-col gap-1">
          {activeCategory === "all" && grouped
            ? Array.from(grouped.entries()).map(([category, books]) => {
                const meta = CATEGORIES.find((item) => item.id === category) ?? CATEGORIES[6];
                const Icon = meta.icon;
                return (
                  <div key={category} className="mb-2">
                    <div className="mb-1 flex items-center gap-1.5 px-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                      <Icon size="0.6875rem" />
                      {meta.label}
                      <span className="ml-auto text-[0.625rem] font-normal">{books.length}</span>
                    </div>
                    {books.map((lorebook) => (
                      <LorebookRow
                        key={lorebook.id}
                        lorebook={lorebook}
                        selectionMode={selectionMode}
                        isSelected={selectedLorebookIds.has(lorebook.id)}
                        onClick={() => (selectionMode ? toggleSelection(lorebook.id) : openLorebookDetail(lorebook.id))}
                        onToggleSelect={() => toggleSelection(lorebook.id)}
                        onDelete={() => handleDelete(lorebook)}
                      />
                    ))}
                  </div>
                );
              })
            : sorted.map((lorebook) => (
                <LorebookRow
                  key={lorebook.id}
                  lorebook={lorebook}
                  selectionMode={selectionMode}
                  isSelected={selectedLorebookIds.has(lorebook.id)}
                  onClick={() => (selectionMode ? toggleSelection(lorebook.id) : openLorebookDetail(lorebook.id))}
                  onToggleSelect={() => toggleSelection(lorebook.id)}
                  onDelete={() => handleDelete(lorebook)}
                />
              ))}
        </div>
      )}
    </div>
  );
}

function LorebookRow({
  lorebook,
  selectionMode,
  isSelected,
  onClick,
  onToggleSelect,
  onDelete,
}: {
  lorebook: Lorebook;
  selectionMode: boolean;
  isSelected: boolean;
  onClick: () => void;
  onToggleSelect: () => void;
  onDelete: () => void;
}) {
  const gradient = CATEGORY_COLORS[lorebook.category] ?? CATEGORY_COLORS.uncategorized;
  const CategoryIcon = CATEGORIES.find((category) => category.id === lorebook.category)?.icon ?? FileText;

  return (
    <div
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-[var(--sidebar-accent)]",
        selectionMode && isSelected && "bg-amber-400/10 ring-1 ring-amber-400/40",
      )}
      onClick={onClick}
    >
      {selectionMode && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleSelect();
          }}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
            isSelected
              ? "border-amber-400 bg-amber-400 text-white"
              : "border-[var(--muted-foreground)]/40 bg-[var(--secondary)] text-transparent",
          )}
          aria-label={isSelected ? "Deselect lorebook" : "Select lorebook"}
        >
          <Check size="0.75rem" />
        </button>
      )}
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white", gradient)}>
        <CategoryIcon size="1rem" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{lorebook.name}</span>
          {!lorebook.enabled && (
            <span className="rounded bg-[var(--muted)]/50 px-1 py-0.5 text-[0.5625rem] text-[var(--muted-foreground)]">
              OFF
            </span>
          )}
        </div>
        <div className="truncate text-[0.6875rem] text-[var(--muted-foreground)]">
          {lorebook.description || "No description"}
        </div>
      </div>
      {!selectionMode && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[var(--sidebar)] p-1.5 opacity-0 shadow-sm ring-1 ring-[var(--border)] transition-all hover:bg-[var(--destructive)]/15 group-hover:opacity-100 max-md:opacity-100"
          title="Delete"
        >
          <Trash2 size="0.75rem" className="text-[var(--destructive)]" />
        </button>
      )}
    </div>
  );
}

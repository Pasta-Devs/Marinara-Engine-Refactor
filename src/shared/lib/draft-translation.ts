import { toast } from "sonner";

export async function translateDraftText(text: string): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    throw new Error("Draft translation is deferred until the Rust translation backend slice.");
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Failed to translate draft");
    return null;
  }
}

export type ChatMode = "conversation" | "roleplay" | "visual_novel" | "game";

export interface ChatMetadata {
  tags?: string[];
  gameId?: string;
  [key: string]: unknown;
}

export interface Chat {
  id: string;
  name: string;
  mode: ChatMode;
  characterIds?: string[] | string | null;
  groupId: string | null;
  folderId: string | null;
  updatedAt: string;
  metadata: ChatMetadata | null;
}

export interface ChatFolder {
  id: string;
  name: string;
  mode: ChatMode;
  color: string;
  sortOrder: number;
  collapsed: boolean;
}

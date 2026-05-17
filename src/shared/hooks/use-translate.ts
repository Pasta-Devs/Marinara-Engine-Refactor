export function useTranslate() {
  return {
    translations: {} as Record<string, string>,
    translating: {} as Record<string, boolean>,
    translateMessage: async (_messageId?: string, _content?: string, _chatId?: string) => {
      throw new Error("Translation is deferred until the Rust translation backend slice.");
    },
    translate: async (_messageId?: string, _content?: string, _chatId?: string) => {
      throw new Error("Translation is deferred until the Rust translation backend slice.");
    },
  };
}

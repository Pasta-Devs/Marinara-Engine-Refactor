// Backward-compatible chat feature exports.
// Shared chat/message persistence lives in the neutral conversation-data layer
// so conversation, roleplay, and game mode do not depend on chat feature hooks.
export * from "../../conversation/hooks/use-conversation-data";

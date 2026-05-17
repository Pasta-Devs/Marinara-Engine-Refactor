import { ChatArea } from "./ChatArea";

interface ChatConversationViewProps {
  activeChatId: string | null;
}

export function ChatConversationView({ activeChatId: _activeChatId }: ChatConversationViewProps) {
  return <ChatArea />;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// CHAT INTERFACE COMPONENT
// ============================================
// Displays chat messages in bubbles

import MessageBubble from "./MessageBubble";

interface ChatInterfaceProps {
  messages: any[];
}

export default function ChatInterface({ messages }: ChatInterfaceProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
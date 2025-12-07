/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// MESSAGE BUBBLE COMPONENT
// ============================================
// Individual message bubble (user or AI)

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface MessageBubbleProps {
  message: {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    context?: any;
  };
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex space-x-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar - left side for AI, right side for user */}
      {!isUser && (
        <Avatar className="h-8 w-8 bg-blue-600">
          <AvatarFallback className="bg-blue-600 text-white">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Message bubble */}
        <div
          className={cn(
            "px-4 py-3 rounded-lg",
            isUser
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-500 mt-1">
          {formatDate(message.timestamp)}
        </span>

        {/* Context info (for AI messages with customer references) */}
        {message.context && message.context.customersReferenced > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Referenced {message.context.customersReferenced} customer
            {message.context.customersReferenced > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Avatar - right side for user */}
      {isUser && (
        <Avatar className="h-8 w-8 bg-gray-600">
          <AvatarFallback className="bg-gray-600 text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
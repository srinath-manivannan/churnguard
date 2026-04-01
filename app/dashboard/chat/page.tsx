/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ChatInterface from "@/components/chat/ChatInterface";
import SuggestedQuestions from "@/components/chat/SuggestedQuestions";
import { Send, Loader2, Brain, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, {
      id: Date.now(),
      role: "user",
      content: message,
      timestamp: new Date(),
    }]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: messages.slice(-10) }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get response");

      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        context: data.context,
      }]);
    } catch (error: any) {
      toast.error("Chat error", { description: error.message });
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  return (
    <div className="flex flex-col space-y-4 h-[calc(100vh-8rem)]">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-foreground">AI Chat Assistant</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ask questions about your customers and get AI-powered insights
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        <Card className="lg:col-span-3 flex flex-col min-h-0 border border-border">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Welcome to ChurnGuard AI
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Ask me anything about your customers, churn patterns, or retention strategies.
                  I'll analyze your data and provide actionable insights.
                </p>
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  Powered by RAG + Multi-model AI Pipeline
                </div>
              </div>
            ) : (
              <ChatInterface messages={messages} />
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-3 md:p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                placeholder="Ask about your customers..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                className="flex-1 min-h-[60px] max-h-[120px] resize-none text-sm"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="self-end"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        <div className="lg:col-span-1">
          <SuggestedQuestions onQuestionClick={(q) => sendMessage(q)} />
        </div>
      </div>
    </div>
  );
}

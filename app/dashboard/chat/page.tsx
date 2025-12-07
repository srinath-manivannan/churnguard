/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// AI CHAT PAGE
// ============================================
// Interactive AI chatbot for customer insights

"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ChatInterface from "@/components/chat/ChatInterface";
import SuggestedQuestions from "@/components/chat/SuggestedQuestions";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ChatPage() {
  const { toast } = useToast();

  // State
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message to AI
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Call chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history: messages.slice(-10), // Last 10 messages for context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        context: data.context,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Chat error",
        description: error.message,
      });

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  // Handle suggested question click
  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Chat Assistant</h1>
        <p className="text-gray-500 mt-1">
          Ask questions about your customers and get AI-powered insights
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat Area */}
        <Card className="lg:col-span-3 flex flex-col h-[calc(100vh-250px)]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              // Welcome message
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to ChurnGuard AI
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Ask me anything about your customers, churn patterns, or retention strategies.
                  I'll help you understand your data and provide actionable recommendations.
                </p>
              </div>
            ) : (
              // Messages
              <ChatInterface messages={messages} />
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">ChurnGuard AI is thinking...</span>
              </div>
            )}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Textarea
                placeholder="Ask about your customers... (e.g., 'Who are my highest risk customers?')"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                className="flex-1 min-h-[80px] resize-none"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Sidebar - Suggested Questions */}
        <div className="lg:col-span-1">
          <SuggestedQuestions onQuestionClick={handleSuggestedQuestion} />
        </div>
      </div>
    </div>
  );
}


// ============================================
// SUGGESTED QUESTIONS COMPONENT
// ============================================
// Shows clickable suggested questions for the AI

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void;
}

// Predefined suggested questions
const suggestedQuestions = [
  "Who are my highest risk customers?",
  "What are the main reasons for customer churn?",
  "Show me enterprise customers with high churn scores",
  "What retention strategies should I focus on?",
  "How many customers are at critical risk?",
  "Which customers haven't been active in 30+ days?",
  "What's the average revenue of high-risk customers?",
  "Summarize my customer churn patterns",
];

export default function SuggestedQuestions({
  onQuestionClick,
}: SuggestedQuestionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Suggested Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestedQuestions.map((question, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start text-left h-auto py-2 px-3 whitespace-normal"
            onClick={() => onQuestionClick(question)}
          >
            <span className="text-sm text-gray-700">{question}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
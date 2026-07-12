"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import QuizResult from "./quiz-result";
import { showToast } from "@/lib/showToast";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface AssessmentResult {
  id: string;
  userId: string;
  quizScore: number;
  questions: {
    question: string;
    answer: string;
    userAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  category: string;
  improvementTip?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface QuizProps {
  onStartNew?: () => void;
}

export default function Quiz({ onStartNew }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<(string)[]>([]);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [quizData, setQuizData] = useState<Question[] | null>(null);
  const [resultData, setResultData] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    generateQuiz();
  }, []);

  const generateQuiz = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to generate quiz');
      }

      setQuizData(result.data);
      setAnswers(new Array(result.data.length).fill(""));
      setShowResult(false);
      setCurrentQuestion(0);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < (quizData?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const calculateScore = (): number => {
    if (!quizData) return 0;
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / quizData.length) * 100;
  };

  const finishQuiz = async () => {
    if (!quizData) return;
    
    const score = calculateScore();

    try {
      setSaving(true);
      const response = await fetch('/api/interview/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: quizData,
          answers,
          score,
          category: "Technical",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save quiz results');
      }

      setResultData(result.data);
      setShowResult(true);
      showToast('success', 'Quiz completed!');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to save quiz results');
    } finally {
      setSaving(false);
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setShowResult(false);
    setResultData(null);
    generateQuiz();
    if (onStartNew) onStartNew();
  };

  if (loading) {
    return (
      <Card className="mx-2">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Generating your quiz...</span>
        </CardContent>
      </Card>
    );
  }

  if (showResult && resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

  if (!quizData) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Ready to test your knowledge?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This quiz contains questions specific to your industry and
            skills. Take your time and choose the best answer for each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={generateQuiz} className="w-full cursor-pointer">
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData[currentQuestion];

  return (
    <Card className="mx-2">
      <CardHeader>
        <CardTitle>
          Question {currentQuestion + 1} of {quizData.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium">{question.question}</p>
        <RadioGroup
          className="space-y-2"
          onValueChange={handleAnswer}
          value={answers[currentQuestion] || ""}
        >
          {question.options.map((option: string, index: number) => (
            <div className="flex items-center space-x-2" key={index}>
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="font-medium">Explanation:</p>
            <p className="text-muted-foreground">{question.explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!showExplanation && (
          <Button
            onClick={() => setShowExplanation(true)}
            variant="outline"
            disabled={!answers[currentQuestion]}
            className="cursor-pointer"
          >
            Show Explanation
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion] || saving}
          className="ml-auto cursor-pointer"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {currentQuestion < quizData.length - 1
            ? "Next Question"
            : saving ? "Saving..." : "Finish Quiz"}
        </Button>
      </CardFooter>
    </Card>
  );
}
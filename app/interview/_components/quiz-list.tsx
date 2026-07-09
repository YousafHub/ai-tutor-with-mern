// app/interview/_components/quiz-list.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import QuizResult from "./quiz-result";

interface Assessment {
  id: string;
  userId: string;
  quizScore: number;
  questions: any[];
  category: string;
  improvementTip?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface QuizListProps {
  assessments: Assessment[];
}

export default function QuizList({ assessments }: QuizListProps) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState<Assessment | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="gradient gradient-title text-3xl md:text-4xl">
              Recent Quizzes
            </CardTitle>
            <CardDescription>Review your past quiz performances</CardDescription>
          </div>
          <Button className="cursor-pointer" onClick={() => router.push("/interview/mock")}>
            Start New Quiz
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments && assessments.length > 0 ? (
              assessments.map((assessment, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedQuiz(assessment)}
                >
                  <CardHeader>
                    <CardTitle>Quiz {index + 1}</CardTitle>
                    <CardDescription className="flex justify-between w-full">
                      <div>Score: {assessment.quizScore.toFixed(1)}%</div>
                      <div>
                        {format(new Date(assessment.createdAt), "MMMM dd, yyyy HH:mm")}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {assessment.improvementTip || "No improvement tip available"}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No quizzes taken yet.</p>
                <p className="text-sm">Start your first quiz to track your progress!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <QuizResult result={selectedQuiz} onStartNew={() => router.push("/interview/mock")} hideStartNew />
        </DialogContent>
      </Dialog>
    </>
  );
}
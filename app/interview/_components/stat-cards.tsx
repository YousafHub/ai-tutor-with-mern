import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Trophy } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  answer: string;
  userAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

interface Assessment {
  id: string;
  userId: string;
  quizScore: number;
  questions: Question[];
  category: string;
  improvementTip?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface StatsCardsProps {
  assessments: Assessment[];
}

export default function StatsCards({ assessments }: StatsCardsProps) {
  const getAverageScore = (): string => {
    if (!assessments?.length) return "0";
    const total = assessments.reduce(
      (sum, assessment) => sum + assessment.quizScore,
      0
    );
    return (total / assessments.length).toFixed(1);
  };

  const getLatestAssessment = (): Assessment | null => {
    if (!assessments?.length) return null;
    return assessments[0];
  };

  const getTotalQuestions = (): number => {
    if (!assessments?.length) return 0;
    return assessments.reduce(
      (sum, assessment) => sum + assessment.questions.length,
      0
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 mt-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="-mt-2">
          <div className="text-2xl font-bold">{getAverageScore()}%</div>
          <p className="text-xs text-muted-foreground">
            Across all assessments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Questions Practiced</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="-mt-2">
          <div className="text-2xl font-bold">{getTotalQuestions()}</div>
          <p className="text-xs text-muted-foreground">
            Total questions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="-mt-2">
          <div className="text-2xl font-bold">
            {getLatestAssessment()?.quizScore.toFixed(1) || "0"}%
          </div>
          <p className="text-xs text-muted-foreground">
            Most recent quiz
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/databaseConnection";
import { getAuthUser } from "@/lib/auth";
import { UserModel } from "@/models/User.model";
import { generateImprovementTip } from "@/lib/gemini.service";
import { response, catchError } from "@/lib/helperfunction";
import { Assessment } from "@/models/Assessment";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuestionResult {
  question: string;
  answer: string;
  userAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser();
    if (!authUser) {
      return response(false, 401, "Unauthorized");
    }

    const user = await UserModel.findById(authUser._id);
    if (!user) {
      return response(false, 404, "User not found");
    }

    const body = await request.json();
    const { questions, answers, score, category } = body;

    if (!questions || !answers || score === undefined) {
      return response(false, 400, "Questions, answers, and score are required");
    }

    const questionResults: QuestionResult[] = questions.map((q: Question, index: number) => ({
      question: q.question,
      answer: q.correctAnswer,
      userAnswer: answers[index] || "",
      isCorrect: q.correctAnswer === answers[index],
      explanation: q.explanation,
    }));

    const wrongAnswers = questionResults.filter((q: QuestionResult) => !q.isCorrect);
    let improvementTip: string | undefined = undefined;

    if (wrongAnswers.length > 0) {
      improvementTip = await generateImprovementTip(
        wrongAnswers.map((q: QuestionResult) => ({
          question: q.question,
          answer: q.answer,
          userAnswer: q.userAnswer,
        })),
        user.industry || "General"
      );
    }

    const assessmentCategory = category || "Technical";

    const assessment = await Assessment.create({
      userId: user._id.toString(),
      quizScore: score,
      questions: questionResults,
      category: assessmentCategory,
      improvementTip,
    });

    return response(true, 201, "Quiz result saved successfully", assessment);
  } catch (error) {
    return catchError(error);
  }
}
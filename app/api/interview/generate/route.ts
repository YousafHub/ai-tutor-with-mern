// app/api/interview/generate/route.ts
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/databaseConnection";
import { getAuthUser } from "@/lib/auth";
import { UserModel } from "@/models/User.model";
import { generateQuizQuestions } from "@/lib/gemini.service";
import { response, catchError } from "@/lib/helperfunction";

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

    const questions = await generateQuizQuestions(
      user.industry || "Technical",
      user.skills || []
    );

    return response(true, 200, "Quiz generated successfully", questions);
  } catch (error) {
    return catchError(error);
  }
}
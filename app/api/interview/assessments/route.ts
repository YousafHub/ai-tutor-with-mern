// app/api/interview/assessments/route.ts
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/databaseConnection";
import { getAuthUser } from "@/lib/auth";
import { Assessment } from "@/models/Assessment";
import { response, catchError } from "@/lib/helperfunction";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authUser = await getAuthUser();

    if (!authUser) {
      return response(false, 401, "Unauthorized");
    }


    const assessments = await Assessment.find({ userId: authUser._id })
      .sort({ createdAt: -1 })
      .lean();


    return response(true, 200, "Assessments fetched successfully", assessments);
  } catch (error) {
    return catchError(error);
  }
}
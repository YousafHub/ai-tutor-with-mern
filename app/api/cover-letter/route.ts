// app/api/cover-letter/route.ts
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/databaseConnection";
import { getAuthUser } from "@/lib/auth";
import { response, catchError } from "@/lib/helperfunction";
import { CoverLetter } from "@/models/CoverLetter";

export async function GET(request: NextRequest) {
  try {
    
    await connectDB();

    const authUser = await getAuthUser();

    if (!authUser) {
      return response(false, 401, "Unauthorized");
    }

    const coverLetters = await CoverLetter.find({ userId: authUser._id.toString() })
      .sort({ createdAt: -1 })
      .lean();


    return response(true, 200, "Cover letters fetched successfully", coverLetters);
  } catch (error) {
    return catchError(error);
  }
}
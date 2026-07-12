// app/api/cover-letter/generate/route.ts
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/databaseConnection";
import { getAuthUser } from "@/lib/auth";
import { UserModel } from "@/models/User.model";
import { generateCoverLetter as generateCoverLetterAI } from "@/lib/gemini.service";
import { response, catchError } from "@/lib/helperfunction";
import { CoverLetter } from "@/models/CoverLetter";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return response(false, 401, "Unauthorized");
    }

    // Get user
    const user = await UserModel.findById(authUser._id);
    if (!user) {
      return response(false, 404, "User not found");
    }

    // Get request body
    const body = await request.json();
    const { jobTitle, companyName, jobDescription } = body;

    if (!jobTitle || !companyName || !jobDescription) {
      return response(false, 400, "Job title, company name, and job description are required");
    }

    // Generate cover letter using Gemini
    const content = await generateCoverLetterAI({
      jobTitle,
      companyName,
      jobDescription,
      userIndustry: user.industry || "General",
      userExperience: user.experience || 0,
      userSkills: user.skills || [],
      userBio: user.bio || "",
    });

    // Save to database
    const coverLetter = await CoverLetter.create({
      userId: user._id.toString(),
      content,
      jobDescription,
      companyName,
      jobTitle,
      status: "completed",
    });

    return response(true, 201, "Cover letter generated successfully", coverLetter);
  } catch (error) {
    return catchError(error);
  }
}
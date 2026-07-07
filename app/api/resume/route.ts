// app/api/resume/route.ts
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/databaseConnection";
import { getAuthUser } from "@/lib/auth";
import { response, catchError } from "@/lib/helperfunction";
import { Resume } from "@/models/Resume";

// GET - Fetch user's resume
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authUser = await getAuthUser();
        if (!authUser) {
            return response(false, 401, "Unauthorized");
        }

        const resume = await Resume.findOne({ userId: authUser._id });

        return response(true, 200, "Resume fetched successfully", {
            content: resume?.content || "",
        });

    } catch (error) {
        return catchError(error);
    }
}

// POST - Save/Update resume
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const authUser = await getAuthUser();
        if (!authUser) {
            return response(false, 401, "Unauthorized");
        }

        const body = await request.json();
        const { content } = body;

        if (!content) {
            return response(false, 400, "Resume content is required");
        }

        const resume = await Resume.findOneAndUpdate(
            { userId: authUser._id },
            { content },
            { 
                new: true, 
                upsert: true, // Creates if doesn't exist
            }
        );

        return response(true, 200, "Resume saved successfully", {
            content: resume.content,
        });

    } catch (error) {
        return catchError(error);
    }
}
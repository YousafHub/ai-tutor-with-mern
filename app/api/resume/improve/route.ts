import { NextRequest } from "next/server";
import { connectDB } from "@/lib/databaseConnection";
import { getAuthUser } from "@/lib/auth";
import { UserModel } from "@/models/User.model";
import { improveWithAI } from "@/lib/gemini.service";
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

        const body = await request.json();
        const { current, type } = body;

        if (!current || !type) {
            return response(false, 400, "Current content and type are required");
        }

        const improved = await improveWithAI(
            current,
            type,
            user.industry || "General"
        );

        return response(true, 200, "Description improved successfully", improved);

    } catch (error) {
        return catchError(error);
    }
}
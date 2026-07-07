// app/api/industry/insights/route.ts
import { connectDB } from "@/lib/databaseConnection";
import { UserModel } from "@/models/User.model";
import { getAuthUser } from "@/lib/auth";
import { generateAIInsights } from "@/lib/gemini.service";
import { response, catchError } from "@/lib/helperfunction";
import { NextRequest } from "next/server";
import { IndustryInsight } from "@/models/IndustryInsight";

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // 1. Get authenticated user from token
        const authUser = await getAuthUser();
        if (!authUser) {
            return response(false, 401, "Unauthorized");
        }

        // 2. Find user in database
        const user = await UserModel.findById(authUser._id);
        if (!user) {
            return response(false, 404, "User not found");
        }

        // 3. Check if user has an industry
        if (!user.industry) {
            return response(false, 400, "No industry selected. Please complete onboarding.");
        }

        // 4. Check if insights already exist
        let insight = await IndustryInsight.findOne({ 
            industry: user.industry 
        });

        // 5. If not, generate them using AI
        if (!insight) {
            const aiData = await generateAIInsights(user.industry);

            insight = await IndustryInsight.create({
                industry: user.industry,
                salaryRanges: aiData.salaryRanges,
                growthRate: aiData.growthRate,
                demandLevel: aiData.demandLevel,
                topSkills: aiData.topSkills,
                marketOutlook: aiData.marketOutlook,
                keyTrends: aiData.keyTrends,
                recommendedSkills: aiData.recommendedSkills,
                lastUpdated: new Date(),
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
        }

        // 6. Return insights
        const insightData = insight.toObject();
        
        return response(true, 200, "Industry insights fetched successfully", {
            ...insightData,
        });

    } catch (error) {
        return catchError(error);
    }
}
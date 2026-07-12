// app/api/industry/insights/route.ts
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/databaseConnection";
import { getAuthUser } from "@/lib/auth";
import { UserModel } from "@/models/User.model";
import { IndustryInsight } from "@/models/IndustryInsight";
import { generateAIInsights } from "@/lib/gemini.service";
import { response, catchError } from "@/lib/helperfunction";

const DAYS_TO_REFRESH = 7;

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

    if (!user.industry) {
      return response(false, 400, "No industry selected. Please complete onboarding.");
    }

    let insight = await IndustryInsight.findOne({ 
      industry: user.industry 
    });

    let needsUpdate = false;
    let isNew = false;

    if (!insight) {
      isNew = true;
      needsUpdate = true;
    } else {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(insight.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceUpdate >= DAYS_TO_REFRESH) {
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      const aiData = await generateAIInsights(user.industry);

      if (isNew) {
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
          nextUpdate: new Date(Date.now() + DAYS_TO_REFRESH * 24 * 60 * 60 * 1000),
        });
      } else {
        insight = await IndustryInsight.findOneAndUpdate(
          { industry: user.industry },
          {
            salaryRanges: aiData.salaryRanges,
            growthRate: aiData.growthRate,
            demandLevel: aiData.demandLevel,
            topSkills: aiData.topSkills,
            marketOutlook: aiData.marketOutlook,
            keyTrends: aiData.keyTrends,
            recommendedSkills: aiData.recommendedSkills,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + DAYS_TO_REFRESH * 24 * 60 * 60 * 1000),
          },
          { returnDocument: "after" }
        );
      }
    }

    // ✅ TypeScript now knows insight exists here
    // If insight is null, return an error
    if (!insight) {
      return response(false, 500, "Failed to fetch or create industry insights");
    }

    const insightData = insight.toObject();

    return response(true, 200, "Industry insights fetched successfully", {
      ...insightData,
      isNew,
      needsUpdate,
      daysSinceUpdate: Math.floor(
        (Date.now() - new Date(insightData.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
      ),
    });

  } catch (error) {
    return catchError(error);
  }
}
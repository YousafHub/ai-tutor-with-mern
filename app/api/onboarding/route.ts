// app/api/user/onboarding/route.ts
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { UserModel } from "@/models/User.model";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Get authenticated user
        const authUser = await getAuthUser();
        if (!authUser) {
            return response(false, 401, "Unauthorized");
        }

        const body = await request.json();
        const { industry, subIndustry, experience, skills, bio } = body;

        // Validate required fields
        if (!industry || !subIndustry) {
            return response(false, 400, "Industry and Specialization are required");
        }

        // Update user using authUser._id
        const updatedUser = await UserModel.findByIdAndUpdate(
            authUser._id,
            {
                industry,
                subIndustry,
                experience: experience || 0,
                skills: skills || [],
                bio: bio || "",
                isOnboarded: true
            },
            { new: true }
        );

        if (!updatedUser) {
            return response(false, 404, "User not found");
        }

        // ✅ After updating user, generate new token with isOnboarded = true
        const secret = new TextEncoder().encode(process.env.SECRET_KEY);
        const newToken = await new SignJWT({
            _id: updatedUser._id.toString(),
            email: updatedUser.email,
            name: updatedUser.name,
            isOnboarded: true, // ✅ Now onboarded!
        })
            .setIssuedAt()
            .setExpirationTime('7d')
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret);

        // ✅ Update the cookie with new token
        const cookieStore = await cookies();
        cookieStore.set({
            name: 'access_token',
            value: newToken,
            httpOnly: process.env.NODE_ENV === 'production',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
        });

        // ✅ RETURN response here
        return response(true, 200, "Profile updated successfully");

    } catch (error) {
        return catchError(error);
    }
}
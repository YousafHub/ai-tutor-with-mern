import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { loginSchema } from "@/lib/zodSchema";
import { UserModel } from "@/models/User.model";

export async function POST(request: Request) {
    try {
        await connectDB();
        const payload = await request.json();

        const validatedData = loginSchema.safeParse(payload);
        if (!validatedData.success) {
            return response(false, 401, 'Invalid or missing input', validatedData.error);
        }

        const { email, password } = validatedData.data;

        const user = await UserModel.findOne({ email }).select('+password');
        if (!user) {
            return response(false, 400, 'Invalid Login credentials');
        }

        const isOnboarded = user.isOnboarded || false;


        const isPasswordVerified = await user.comparePassword(password);
        if (!isPasswordVerified) {
            return response(false, 400, 'Invalid Login credentials');
        }

        const loggedInUserData = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            isOnboarded,
        };

        const secret = new TextEncoder().encode(process.env.SECRET_KEY);
        const token = await new SignJWT(loggedInUserData)
            .setIssuedAt()
            .setExpirationTime('7d')
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret);

        const cookieStore = await cookies();
        cookieStore.set({
            name: 'access_token',
            value: token,
            httpOnly: process.env.NODE_ENV === 'production',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
        });

        return response(true, 200, 'You are logged in');

    } catch (error) {
        return catchError(error);
    }
}
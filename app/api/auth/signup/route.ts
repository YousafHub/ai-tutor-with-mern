import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { signupSchema } from "@/lib/zodSchema";
import { UserModel } from "@/models/User.model";

export async function POST(request: Request) {
    try {
        
        await connectDB();

        const payload = await request.json();

        const validatedData = signupSchema.safeParse(payload);
        if (!validatedData.success) {
            return response(false, 400, 'Invalid or missing input', validatedData.error);
        }

        const { name, email, password } = validatedData.data;

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return response(false, 409, 'User already registered');
        }

        const newUser = await UserModel.create({
            name,
            email,
            password,
        });

        const secret = new TextEncoder().encode(process.env.SECRET_KEY);
        const token = await new SignJWT({
            _id: newUser._id.toString(),
            email: newUser.email,
            name: newUser.name,
            isOnboarded: false,
        })
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

        return response(true, 201, 'Registration successful! Please verify your email.');

    } catch (error) {
        return catchError(error);
    }
}
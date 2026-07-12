import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export interface AuthUser {
    _id: string;
    email: string;
    name: string;
    isOnboarded: boolean
}

export async function getAuthUser(): Promise<AuthUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token")?.value;

        if (!token) return null;

        const secret = new TextEncoder().encode(process.env.SECRET_KEY);
        const { payload } = await jwtVerify(token, secret);

        return {
            _id: payload._id as string,
            email: payload.email as string,
            name: payload.name as string,
            isOnboarded: payload.isOnboarded as boolean
        };
    } catch (error) {
        return null;
    }
}
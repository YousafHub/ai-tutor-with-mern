import { catchError, response } from "@/lib/helperfunction";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        cookieStore.delete('access_token')
        return response(true, 200, 'User logged out successfully.')
    } catch (error) {
        catchError(error)
    }
}
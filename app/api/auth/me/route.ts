// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { response } from "@/lib/helperfunction";

export async function GET() {
    const user = await getAuthUser();
    
    if (!user) {
        return response(false, 401, "Unauthorized");
    }
    
    return response(true, 200, "User found", { user });
}
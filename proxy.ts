// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ['/', '/login', '/signup'];
const PROTECTED_ROUTES = ['/dashboard', '/resume', '/interview', '/ai-cover-letter', '/onboarding'];

export async function proxy(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname;
        const hasToken = request.cookies.has('access_token');

        // ✅ If no token
        if (!hasToken) {
            // Allow access to public routes
            if (PUBLIC_ROUTES.includes(pathname)) {
                return NextResponse.next();
            }

            // Protect all other routes - redirect to login
            if (pathname !== '/login' && pathname !== '/signup') {
                return NextResponse.redirect(new URL('/login', request.nextUrl));
            }

            return NextResponse.next();
        }

        // ✅ Verify token
        const access_token = request.cookies.get('access_token')?.value;
        const secret = new TextEncoder().encode(process.env.SECRET_KEY);
        const { payload } = await jwtVerify(access_token!, secret);

        const isOnboarded = payload.isOnboarded as boolean;

        // ✅ Prevent logged-in users from accessing auth routes
        if (pathname === '/login' || pathname === '/signup') {
            // If onboarded, go to dashboard; otherwise go to onboarding
            const redirectPath = isOnboarded ? '/dashboard' : '/onboarding';
            return NextResponse.redirect(new URL(redirectPath, request.nextUrl));
        }

        // ✅ Redirect to onboarding if not onboarded
        if (!isOnboarded && pathname !== '/onboarding') {
            return NextResponse.redirect(new URL('/onboarding', request.nextUrl));
        }

        // ✅ Redirect to dashboard if onboarded and trying to access onboarding
        if (isOnboarded && pathname === '/onboarding') {
            return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
        }

        // ✅ All good - proceed
        return NextResponse.next();

    } catch (error) {
        // Invalid token - clear cookie and redirect to login
        const response = NextResponse.redirect(new URL('/login', request.nextUrl));
        response.cookies.delete('access_token');
        return response;
    }
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/signup',
        '/onboarding',
        '/dashboard/:path*',
        '/resume/:path*',
        '/interview/:path*',
        '/ai-cover-letter/:path*',
    ],
};
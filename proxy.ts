import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ['/', '/login', '/signup'];
const PROTECTED_ROUTES = ['/dashboard', '/resume', '/interview', '/ai-cover-letter', '/onboarding'];

export async function proxy(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname;
        const hasToken = request.cookies.has('access_token');

        if (!hasToken) {
            if (PUBLIC_ROUTES.includes(pathname)) {
                return NextResponse.next();
            }

            if (pathname !== '/login' && pathname !== '/signup') {
                return NextResponse.redirect(new URL('/login', request.nextUrl));
            }

            return NextResponse.next();
        }

        const access_token = request.cookies.get('access_token')?.value;
        const secret = new TextEncoder().encode(process.env.SECRET_KEY);
        const { payload } = await jwtVerify(access_token!, secret);

        const isOnboarded = payload.isOnboarded as boolean;

        if (pathname === '/login' || pathname === '/signup') {
            const redirectPath = isOnboarded ? '/dashboard' : '/onboarding';
            return NextResponse.redirect(new URL(redirectPath, request.nextUrl));
        }

        if (!isOnboarded && pathname !== '/onboarding') {
            return NextResponse.redirect(new URL('/onboarding', request.nextUrl));
        }

        if (isOnboarded && pathname === '/onboarding') {
            return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
        }

        return NextResponse.next();

    } catch (error) {
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
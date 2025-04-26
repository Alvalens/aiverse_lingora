import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// --- Route matchers ---
const PUBLIC_ROUTES = [
	"/",
	"/auth/login",
	"/auth/register",
	"/auth/*",
	"/api/transactions/callback",
	"/api/landing-page",
	"/api/auth/*",
];
const AGREEMENT_NOT_REQUIRED_ROUTES = [...PUBLIC_ROUTES, "/app/onboarding"];

function matchRoute(pathname: string, routePattern: string) {
	if (routePattern.endsWith("/*")) {
		const base = routePattern.replace(/\*$/, "");
		return pathname.startsWith(base);
	}
	return pathname === routePattern;
}

function isPublicRoute(pathname: string) {
	return PUBLIC_ROUTES.some((route) => matchRoute(pathname, route));
}

function isAgreementNotRequiredRoute(pathname: string) {
	return AGREEMENT_NOT_REQUIRED_ROUTES.some((route) =>
		matchRoute(pathname, route)
	);
}

function hasUserAgreed(agreementValue: unknown): boolean {
	if (typeof agreementValue === "boolean") return agreementValue;
	if (typeof agreementValue === "number") return agreementValue === 1;
	if (typeof agreementValue === "string")
		return agreementValue === "1" || agreementValue === "true";
	return false;
}

export async function middleware(req: NextRequest) {
	const pathname = req.nextUrl.pathname;

	// 1. Public routes: always accessible
	if (isPublicRoute(pathname)) {
		const token = await getToken({
			req,
			secret: process.env.NEXTAUTH_SECRET,
		});
		// Guest-only: prevent logged-in users from accessing login/register
		if (
			token &&
			(pathname === "/auth/login" || pathname === "/auth/register")
		) {
			return NextResponse.redirect(new URL("/app/dashboard", req.url));
		}
		return NextResponse.next();
	}

	// 2. All other routes: require authentication
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
	if (!token) {
		return NextResponse.redirect(new URL("/auth/login", req.url));
	}

	// 3. Special: onboarding route, but user already agreed
	if (pathname === "/app/onboarding") {
		const hasAgreed = hasUserAgreed(token.agreement);
		if (hasAgreed) {
			return NextResponse.redirect(new URL("/app/dashboard", req.url));
		}
		return NextResponse.next();
	}

	// 4. If route requires agreement (not in AGREEMENT_NOT_REQUIRED_ROUTES)
	if (!isAgreementNotRequiredRoute(pathname) && pathname.startsWith("/app")) {
		const hasAgreed = hasUserAgreed(token.agreement);
		if (!hasAgreed) {
			return NextResponse.redirect(new URL("/app/onboarding", req.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!_next|static|favicon.ico|images|landing-page).*)"], // Protect all routes except Next.js internals
};

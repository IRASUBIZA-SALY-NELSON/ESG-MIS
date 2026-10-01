import jwtDecode from 'jwt-decode';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { roles, whitelist } from './middlewares/constants';
import { Role } from './types/base.type';
import { getRolePath } from './utils/funcs';

const getRoleInRoute = (role: string) => {
  if (role === 'STAFF') return 'TEACHER'; // STAFF can access TEACHER routes cause they are the same
  return role;
};

// Middleware to check if the user's role matches the role in the route
export function checkRoleRoute(request: NextRequest, role: string, nextUrl: string) {
  const roleInRoute = request.nextUrl.pathname.split('/')[1].toUpperCase();

  if (roles.includes(roleInRoute as Role) && role !== getRoleInRoute(roleInRoute)) {
    return NextResponse.redirect(new URL(nextUrl, request.url));
  }

  return NextResponse.next();
}

export const checkToken = (token: string) => {
  let decoded: any;
  try {
    decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) return false;
    return true;
  } catch (error) {
    return false;
  }
};

export function handleOauth(request: NextRequest) {
  const token = request.cookies.get('token');
  const redirectUrl = request.nextUrl.searchParams.get('redirect');
  // If there is no token or redirect url, just go to the next middleware to login
  if (!token || !redirectUrl) return NextResponse.next();
  if (!checkToken(token.value)) return NextResponse.next();
  const hasQuery = redirectUrl?.includes('?');
  const separator = hasQuery ? '&' : '?';
  const nextUrl = `${redirectUrl}${separator}token=${token.value}`;

  return NextResponse.redirect(nextUrl);
}

const decodeValid = (token?: string): { role?: string } | null => {
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded?.exp || decoded.exp * 1000 < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
};

// The cookie must be cleared on the response, otherwise login and / keep bouncing forever.
const clearToken = (response: NextResponse) => {
  response.cookies.delete('token');
  return response;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawToken = request.cookies.get('token')?.value;
  const isAuthRoute = pathname.includes('auth');
  const isPublic = whitelist.includes(pathname) || isAuthRoute;

  const isOauth = request.nextUrl.searchParams.get('oauth');
  if (Boolean(isOauth) && isAuthRoute) return handleOauth(request);

  const decoded = decodeValid(rawToken);
  const home = decoded ? getRolePath((decoded.role ?? '') as Role) : null;
  const signedIn = Boolean(decoded && home && home !== '/auth/login');

  if (!signedIn) {
    if (isPublic) return rawToken ? clearToken(NextResponse.next()) : NextResponse.next();
    const login = NextResponse.redirect(new URL('/auth/login', request.url));
    return rawToken ? clearToken(login) : login;
  }

  if (isPublic || pathname === '/') {
    return NextResponse.redirect(new URL(home as string, request.url));
  }
  return checkRoleRoute(request, decoded?.role as string, home as string);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|auth/reset-password|_next/static|public|_next/image|favicon.ico|icon.png|apple-icon.png|images|logo.svg|logo.png|favicon.svg|favicon.png|pdf\\.worker\\.min\\.mjs).*)',
  ],
};

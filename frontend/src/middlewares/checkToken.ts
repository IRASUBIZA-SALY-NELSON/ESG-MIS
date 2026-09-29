import jwtDecode from 'jwt-decode';
import { NextRequest, NextResponse } from 'next/server';
import { checkRole } from './checkRoles';
import { whitelist } from './constants';

// Middleware to check if the token exists
export function checkToken(request: NextRequest) {
  const token = request.cookies.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  } else {
    return decodeToken(request, token);
  }
}

// Middleware to decode the token
export function decodeToken(request: NextRequest, token: any) {
  let decoded: any;
  try {
    decoded = jwtDecode(token.value);
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired && !whitelist.includes(request.nextUrl.pathname)) {
      request.cookies.delete('token');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  return checkRole(request, decoded?.role);
}

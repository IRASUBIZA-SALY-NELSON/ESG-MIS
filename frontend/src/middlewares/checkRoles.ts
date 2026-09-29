import { getRolePath } from '@/utils/funcs';
import { NextRequest, NextResponse } from 'next/server';
import { staffRoles, whitelist } from './constants';
import { Role } from '@/types/base.type';

// Middleware to check the role
export function checkRole(request: NextRequest, role: Role) {
  const nextUrl = getRolePath(role);
  if (whitelist.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL(nextUrl, request.url));
  }
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL(nextUrl, request.url));
  }
  if (request.nextUrl.pathname.startsWith('/staff') && !staffRoles.includes(role ?? '')) {
    return NextResponse.redirect(new URL(nextUrl, request.url));
  } else if (request.nextUrl.pathname.startsWith('/student') && role !== 'STUDENT') {
    return NextResponse.redirect(new URL(nextUrl, request.url));
  } else if (request.nextUrl.pathname.startsWith('/parent') && role !== 'PARENT') {
    return NextResponse.redirect(new URL(nextUrl, request.url));
  } else if (request.nextUrl.pathname.startsWith('/librarian') && role !== 'LIBRARIAN') {
    return NextResponse.redirect(new URL(nextUrl, request.url));
  }
  return NextResponse.next();
}

// Middleware to check if the user's role matches the role in the route
export function checkRoleRoute(request: NextRequest, role: string) {
  const roles: Role[] = [
    'ADMIN',
    'STAFF',
    'STUDENT',
    'TEACHER',
    'DS',
    'PM',
    'DOS',
    'ACCOUNTANT',
    'PARENT',
    'LIBRARIAN',
  ];
  const roleInRoute = request.nextUrl.pathname.split('/')[1].toUpperCase();

  if (roles.includes(roleInRoute as Role) && role !== roleInRoute) {
    const nextUrl = getRolePath(role as Role);
    return NextResponse.redirect(new URL(nextUrl, request.url));
  }
  return NextResponse.next();
}

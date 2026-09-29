import { Role } from '@/types/base.type';

export const whitelist = [
  '/auth/login',
  '/auth/oauth',
  '/register',
  '/api/login',
  '/api/register',
  '/redirect',
  '/auth/reset-password',
  '/auth/verify-email',
  '/public',
];

export const staffRoles = ['STAFF', 'TEACHER'];

export const roles: Role[] = [
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

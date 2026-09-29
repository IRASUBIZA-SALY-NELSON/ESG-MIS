export interface IModel {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ApiResponse<T = any> {
  content: T;
  data: T;
  success: boolean;
  message: string;
  error: any;
}

export interface IPagination<T = any[]> {
  content: T;
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: Pageable;
  size: number;
  sort: Sort;
  totalElements: number;
  totalPages: number;
}

export interface Pageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: Sort;
  unpaged: boolean;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface IPaginatedQuery {
  limit?: number;
  page?: number;
  sort?: string;
  filter?: string;
}

export enum ERole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  DS = 'DS',
  PM = 'PM',
  DOS = 'DOS',
  ACCOUNTANT = 'ACCOUNTANT',
  PARENT = 'PARENT',
  LIBRARIAN = 'LIBRARIAN',
}

export type Role =
  | 'ADMIN'
  | 'STAFF'
  | 'STUDENT'
  | 'TEACHER'
  | 'DS'
  | 'PM'
  | 'DOS'
  | 'ACCOUNTANT'
  | 'PARENT'
  | 'LIBRARIAN';

export interface PageProps {
  params?: { [key: string]: string };
  searchParams?: { [key: string]: string };
}

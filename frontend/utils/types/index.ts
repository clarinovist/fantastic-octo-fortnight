export * from './account';
export * from './auth';
export * from './booking';
export * from './course';
export * from './file';
export * from './location';

export type BaseResponse<T> = {
  data: T;
  statusCode: number;
  success: boolean
  message?: string;
  error?: string
  code?: number
}
export type Metadata = {
  page: number,
  pageSize: number,
  total: number
}
export type Lookup = {
  type: string;
  code: string;
  description: string;
}

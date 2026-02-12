export * from './auth';
export * from './booking';
export * from './course';
export * from './file';
export * from './profile';
export * from './statistic';
export * from './student';
export * from './subscription';
export * from './tutor';

export type BaseResponse<T> = {
  data: T;
  statusCode: number;
  success: boolean
  message?: string;
  error?: string
  code?: number
  metadata?: Metadata
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

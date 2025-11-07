export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  current?: string;
  daysOfWeek?: string;
  featured?: string;
}

export interface PaginatedParams<T = unknown> {
  data?: T[];
  page: number;
  totalPages: number;
  total?: number;
}

export interface BulkActionResponse {
  success: boolean;
  modifiedCount?: number;
  deletedCount?: number;
}

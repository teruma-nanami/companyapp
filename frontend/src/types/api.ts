// src/types/api.ts
export type Paginator<T> = {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
};

export type ApiEnvelope<T> = {
  data: T;
  message: string;
};

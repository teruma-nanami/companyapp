// src/types/user.ts
export type UserRole = "admin" | "staff" | string;

export type User = {
  id: number;
  auth0_user_id: string;
  email: string;
  display_name: string | null;
  role: UserRole;

  created_at: string;
  updated_at: string;
};

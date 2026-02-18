// src/types/contact.ts
export type Contact = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  assigned_user_id: number | null;
  internal_note: string | null;
  created_at: string;
  updated_at: string;
};

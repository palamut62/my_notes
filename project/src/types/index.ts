export interface Password {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category?: string;
  created_at: string;
  user_id: string;
}

export interface SecureFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  notes?: string;
  category?: string;
  created_at: string;
  user_id: string;
}

export interface Note {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  category?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  deleted_at?: string | null;
  user_id: string;
  backgroundColor?: string;
  fontFamily?: string;
  fontSize?: string;
}
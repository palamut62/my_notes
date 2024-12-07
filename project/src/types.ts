export interface Note {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  category?: string;
  tags?: string[];
  backgroundColor?: string;
  fontFamily?: string;
  fontSize?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  user_id: string;
}

export interface SecureFile {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  url: string;
  category?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Password {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  website?: string;
  category?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

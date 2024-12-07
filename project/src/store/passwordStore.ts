import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Password } from '../types';
import { encrypt, decrypt } from '../lib/encryption';

interface PasswordState {
  passwords: Password[];
  loading: boolean;
  error: string | null;
  fetchPasswords: () => Promise<void>;
  addPassword: (password: Omit<Password, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  updatePassword: (id: string, password: Partial<Password>) => Promise<void>;
  deletePassword: (id: string) => Promise<void>;
}

export const usePasswordStore = create<PasswordState>((set, get) => ({
  passwords: [],
  loading: false,
  error: null,

  fetchPasswords: async () => {
    set({ loading: true });
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('passwords')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Decrypt passwords
      const decryptedPasswords = data.map(pass => ({
        ...pass,
        password: decrypt(pass.password, user.user.id)
      }));

      set({ passwords: decryptedPasswords, error: null });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  addPassword: async (password) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated. Please sign in.');
      }

      // Validate required fields
      if (!password.title || !password.username || !password.password) {
        throw new Error('Title, username, and password are required');
      }

      const encryptedPassword = encrypt(password.password, user.id);

      const { data, error } = await supabase
        .from('passwords')
        .insert([
          {
            ...password,
            password: encryptedPassword,
            user_id: user.id,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === '42P01') {
          throw new Error('Database table not found. Please ensure the database is properly set up.');
        }
        throw new Error(`Failed to save password: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from insert operation');
      }

      // Update local state with decrypted password
      const passwords = get().passwords;
      set({ 
        passwords: [{ ...data, password: password.password }, ...passwords],
        error: null 
      });
    } catch (error: any) {
      console.error('Error in addPassword:', error);
      set({ error: error.message });
      throw error; // Re-throw to handle in the component
    } finally {
      set({ loading: false });
    }
  },

  updatePassword: async (id, password) => {
    set({ loading: true });
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const updateData = { ...password };
      if (password.password) {
        updateData.password = encrypt(password.password, user.user.id);
      }

      const { error } = await supabase
        .from('passwords')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      const passwords = get().passwords.map(p => 
        p.id === id 
          ? { ...p, ...password }
          : p
      );

      set({ passwords, error: null });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  deletePassword: async (id) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('passwords')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const passwords = get().passwords.filter(p => p.id !== id);
      set({ passwords, error: null });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
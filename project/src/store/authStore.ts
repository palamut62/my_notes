import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { encrypt, decrypt } from '../lib/encryption';
import { createClient } from '@supabase/supabase-js';

interface AuthState {
  user: any;
  session: any;
  loading: boolean;
  initialized: boolean;
  oneTimeCode: string | null;
  oneTimeCodeShown: boolean;
  error?: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  initializeSession: () => Promise<void>;
  generateOneTimeCode: () => Promise<void>;
  markOneTimeCodeAsShown: () => void;
  deleteAccount: (oneTimeCode: string) => Promise<void>;
  refreshSession: () => Promise<any>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  oneTimeCode: null,
  oneTimeCodeShown: false,
  error: null,

  generateOneTimeCode: async () => {
    try {
      set({ loading: true, error: null });
      // Generate a random 6-digit number
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      set({ oneTimeCode: code, oneTimeCodeShown: false });
    } catch (error: any) {
      console.error('Generate one-time code error:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  markOneTimeCodeAsShown: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ code_shown: true })
        .eq('user_id', user.id);

      if (error) throw error;
      set({ oneTimeCodeShown: true });
    } catch (error) {
      console.error('Error marking code as shown:', error);
    }
  },

  initializeSession: async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if user has a one-time code
      if (session?.user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('one_time_code, code_shown')
          .eq('user_id', session.user.id)
          .single();

        if (!error && data?.one_time_code) {
          const decryptedCode = decrypt(data.one_time_code, session.user.id);
          set({ 
            oneTimeCode: decryptedCode,
            oneTimeCodeShown: data.code_shown || false
          });
        }
      }

      set({ 
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ 
          session,
          user: session?.user ?? null
        });
      });
    } catch (error) {
      console.error('Error initializing session:', error);
      set({ 
        loading: false,
        initialized: true
      });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Create user profile if it doesn't exist
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: data.user.id,
          })
          .select()
          .single();

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }

      set({ user: data.user, session: data.session });
    } catch (error: any) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      // Generate initial one-time code
      const initialCode = Math.floor(100000 + Math.random() * 900000).toString();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            initial_code: initialCode
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        set({ user: data.user, session: data.session });
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (email: string) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  refreshSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (!session) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) throw refreshError;
        if (refreshData.session) {
          set({ session: refreshData.session, user: refreshData.session.user });
          return refreshData.session;
        }
      } else {
        set({ session, user: session.user });
        return session;
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      set({ user: null, session: null });
      throw error;
    }
  },

  deleteAccount: async (code: string) => {
    set({ loading: true, error: null });
    try {
      const { user, oneTimeCode } = get();
      if (!user) throw new Error('Not authenticated');
      if (!oneTimeCode) throw new Error('No one-time code generated');
      if (code !== oneTimeCode) throw new Error('Invalid one-time code');

      // Delete user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }

      // Delete files
      const { error: filesError } = await supabase
        .from('files')
        .delete()
        .eq('user_id', user.id);

      if (filesError) {
        console.error('Error deleting files:', filesError);
      }

      // Delete notes
      const { error: notesError } = await supabase
        .from('notes')
        .delete()
        .eq('user_id', user.id);

      if (notesError) {
        console.error('Error deleting notes:', notesError);
      }

      // Delete passwords
      const { error: passwordsError } = await supabase
        .from('passwords')
        .delete()
        .eq('user_id', user.id);

      if (passwordsError) {
        console.error('Error deleting passwords:', passwordsError);
      }

      // Delete storage files
      const { data: storageFiles } = await supabase.storage
        .from('secure-files')
        .list(user.id);

      if (storageFiles && storageFiles.length > 0) {
        const filePaths = storageFiles.map(file => `${user.id}/${file.name}`);
        const { error: storageError } = await supabase.storage
          .from('secure-files')
          .remove(filePaths);

        if (storageError) {
          console.error('Error deleting storage files:', storageError);
        }
      }

      // Get service role key from environment
      const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceRoleKey) {
        throw new Error('Service role key is not configured');
      }

      // Create admin client
      const supabaseAdmin = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // Delete auth user using admin API
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        user.id
      );

      if (authError) {
        console.error('Error deleting auth user:', authError);
        throw new Error('Failed to delete account completely');
      }

      // Clear local state
      set({ user: null, session: null, oneTimeCode: null });

      // Sign out from all devices
      await supabase.auth.signOut({ scope: 'global' });

    } catch (error: any) {
      console.error('Delete account error:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
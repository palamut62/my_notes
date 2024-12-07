import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Note } from '../types';
import { encrypt, decrypt } from '../lib/encryption';

interface NoteStore {
  notes: Note[];
  archivedNotes: Note[];
  trashedNotes: Note[];
  loading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  fetchArchivedNotes: () => Promise<void>;
  fetchTrashedNotes: () => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  archiveNote: (id: string) => Promise<void>;
  unarchiveNote: (id: string) => Promise<void>;
  moveToTrash: (id: string) => Promise<void>;
  restoreFromTrash: (id: string) => Promise<void>;
  permanentlyDelete: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  archivedNotes: [],
  trashedNotes: [],
  loading: false,
  error: null,

  fetchNotes: async () => {
    set({ loading: true, error: null });
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .is('archived_at', null)
        .is('deleted_at', null)
        .eq('user_id', user.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Decrypt note content
      const decryptedNotes = data.map(note => ({
        ...note,
        content: decrypt(note.content, user.user.id)
      }));

      set({ notes: decryptedNotes });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchArchivedNotes: async () => {
    set({ loading: true, error: null });
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .not('archived_at', 'is', null)
        .is('deleted_at', null)
        .eq('user_id', user.user.id)
        .order('archived_at', { ascending: false });

      if (error) throw error;

      // Decrypt note content
      const decryptedNotes = data.map(note => ({
        ...note,
        content: decrypt(note.content, user.user.id)
      }));

      set({ archivedNotes: decryptedNotes });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchTrashedNotes: async () => {
    set({ loading: true, error: null });
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .not('deleted_at', 'is', null)
        .eq('user_id', user.user.id)
        .order('deleted_at', { ascending: false });

      if (error) throw error;

      // Decrypt note content
      const decryptedNotes = data.map(note => ({
        ...note,
        content: decrypt(note.content, user.user.id)
      }));

      set({ trashedNotes: decryptedNotes });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addNote: async (note) => {
    set({ loading: true, error: null });
    try {
      const { data: user, error: authError } = await supabase.auth.getUser();
      console.log('Auth response:', { user, authError }); // Debug auth response

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }

      if (!user?.user) {
        console.error('No user found in auth response');
        throw new Error('Not authenticated');
      }

      console.log('Authenticated user:', {
        id: user.user.id,
        email: user.user.email,
        role: user.user.role
      });

      const timestamp = new Date().toISOString();
      const newNote = {
        title: note.title || '',
        subtitle: note.subtitle || '',
        content: encrypt(note.content || '', user.user.id),
        category: note.category || '',
        tags: note.tags || [],
        background_color: note.backgroundColor || '#ffffff',
        font_family: note.fontFamily || 'JetBrains Mono',
        font_size: note.fontSize || '16px',
        user_id: user.user.id,
        created_at: timestamp,
        updated_at: timestamp
      };

      console.log('Attempting to insert note:', {
        ...newNote,
        content: '[ENCRYPTED]'
      });

      // First, check if we can query the notes table
      const { data: testQuery, error: testError } = await supabase
        .from('notes')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('Test query error:', testError);
        throw new Error(`Database access error: ${testError.message}`);
      }

      console.log('Test query successful:', testQuery);

      // Now try to insert the note
      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Failed to add note: ${error.message}`);
      }

      if (!data) {
        console.error('No data returned from insert operation');
        throw new Error('No data returned from insert operation');
      }

      console.log('Successfully added note:', {
        ...data,
        content: '[ENCRYPTED]'
      });

      const notes = get().notes;
      set({
        notes: [{ ...data, content: decrypt(data.content, user.user.id) }, ...notes],
        error: null
      });
    } catch (error: any) {
      console.error('Error in addNote:', error);
      console.error('Full error object:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        details: error.details
      });
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateNote: async (id, note) => {
    set({ loading: true, error: null });
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const updateData = { 
        ...note,
        updated_at: new Date().toISOString()
      };

      if (note.content) {
        updateData.content = encrypt(note.content, user.user.id);
      }

      const { data, error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        notes: state.notes.map(n => 
          n.id === id 
            ? { ...n, ...note, updated_at: updateData.updated_at }
            : n
        ),
        archivedNotes: state.archivedNotes.map(n => 
          n.id === id 
            ? { ...n, ...note, updated_at: updateData.updated_at }
            : n
        ),
        trashedNotes: state.trashedNotes.map(n => 
          n.id === id 
            ? { ...n, ...note, updated_at: updateData.updated_at }
            : n
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  archiveNote: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        notes: state.notes.filter(n => n.id !== id),
        archivedNotes: [data, ...state.archivedNotes]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  unarchiveNote: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ archived_at: null })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        archivedNotes: state.archivedNotes.filter(n => n.id !== id),
        notes: [data, ...state.notes]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  moveToTrash: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        notes: state.notes.filter(n => n.id !== id),
        archivedNotes: state.archivedNotes.filter(n => n.id !== id),
        trashedNotes: [data, ...state.trashedNotes]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  restoreFromTrash: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ deleted_at: null })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        trashedNotes: state.trashedNotes.filter(n => n.id !== id),
        notes: [data, ...state.notes]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deleteNote: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        notes: state.notes.filter(n => n.id !== id),
        archivedNotes: state.archivedNotes.filter(n => n.id !== id),
        trashedNotes: state.trashedNotes.filter(n => n.id !== id)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  permanentlyDelete: async (id) => {
    return get().deleteNote(id);
  }
}));
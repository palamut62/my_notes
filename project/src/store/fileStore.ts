import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { SecureFile } from '../types';

interface FileState {
  files: SecureFile[];
  loading: boolean;
  error: string | null;
  fetchFiles: () => Promise<void>;
  addFile: (file: File, metadata: Partial<SecureFile>) => Promise<void>;
  updateFile: (id: string, metadata: Partial<SecureFile>) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  loading: false,
  error: null,

  fetchFiles: async () => {
    set({ loading: true });
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ files: data, error: null });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  addFile: async (file, metadata) => {
    set({ loading: true, error: null });
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const filePath = `${user.user.id}/${file.name}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('secure-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Insert file metadata into database
      const { data: fileData, error: insertError } = await supabase
        .from('files')
        .insert([
          {
            name: file.name,
            type: file.type,
            size: file.size,
            user_id: user.user.id,
            path: filePath,
            ...metadata
          }
        ])
        .select()
        .single();

      if (insertError) {
        // If metadata insert fails, try to delete the uploaded file
        await supabase.storage
          .from('secure-files')
          .remove([filePath]);
        throw insertError;
      }

      // Update store state
      const { files } = get();
      set({ 
        files: [fileData, ...files],
        error: null 
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateFile: async (id, metadata) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('files')
        .update(metadata)
        .eq('id', id);

      if (error) throw error;

      const files = get().files.map(f => 
        f.id === id 
          ? { ...f, ...metadata }
          : f
      );

      set({ files, error: null });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  deleteFile: async (id) => {
    set({ loading: true });
    try {
      const file = get().files.find(f => f.id === id);
      if (!file) throw new Error('File not found');

      // Delete from storage
      const filePath = new URL(file.url).pathname.split('/').pop();
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('secure-files')
          .remove([filePath]);

        if (storageError) throw storageError;
      }

      // Delete from database
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const files = get().files.filter(f => f.id !== id);
      set({ files, error: null });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
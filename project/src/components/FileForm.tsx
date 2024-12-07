import React, { useState } from 'react';
import { SecureFile } from '../types';

interface FileFormProps {
  onSubmit: (file: File, metadata: Partial<SecureFile>) => void;
  initialData?: SecureFile;
  onCancel: () => void;
}

export default function FileForm({ onSubmit, initialData, onCancel }: FileFormProps) {
  const [formData, setFormData] = useState({
    notes: initialData?.notes || '',
    category: initialData?.category || '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData && !file) return;
    
    if (initialData) {
      onSubmit(file!, formData);
    } else if (file) {
      onSubmit(file, formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!initialData && (
        <div>
          <label className="block text-sm font-medium text-gray-300">File</label>
          <input
            type="file"
            required
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-accent-600 file:text-white
              hover:file:bg-accent-700"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300">Category</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="glass-input mt-1 block w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="glass-input mt-1 block w-full"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          {initialData ? 'Update' : 'Upload'} File
        </button>
      </div>
    </form>
  );
}
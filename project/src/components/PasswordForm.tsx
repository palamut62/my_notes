import React, { useState } from 'react';
import { Password } from '../types';

interface PasswordFormProps {
  onSubmit: (data: Partial<Password>) => void;
  initialData?: Password;
  onCancel: () => void;
}

export default function PasswordForm({ onSubmit, initialData, onCancel }: PasswordFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    username: initialData?.username || '',
    password: initialData?.password || '',
    url: initialData?.url || '',
    notes: initialData?.notes || '',
    category: initialData?.category || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300">Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="glass-input mt-1 block w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="block w-full px-3 py-2 bg-[#1e2330] border border-[#2a3241] rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter your username"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="block w-full px-3 py-2 bg-[#1e2330] border border-[#2a3241] rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter your password"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">URL</label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          className="glass-input mt-1 block w-full"
        />
      </div>

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
          {initialData ? 'Update' : 'Create'} Password
        </button>
      </div>
    </form>
  );
}
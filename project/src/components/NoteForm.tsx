import React, { useState } from 'react';
import { Note } from '../types';
import { Bold, Italic, Underline, List, CheckSquare, Image, Mic, Link, Smile } from 'lucide-react';

interface NoteFormProps {
  onSubmit: (data: Partial<Note>) => void;
  initialData?: Note | null;
  onCancel: () => void;
}

export default function NoteForm({ onSubmit, initialData, onCancel }: NoteFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    content: initialData?.content || '',
    category: initialData?.category || '',
    tags: initialData?.tags || [],
    backgroundColor: initialData?.backgroundColor || '#ffffff',
    fontFamily: initialData?.fontFamily || 'JetBrains Mono',
    fontSize: initialData?.fontSize || '16px',
  });

  const [tagInput, setTagInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleFormatText = (format: string) => {
    // Format seçili metni (bu fonksiyon daha sonra implement edilecek)
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300">Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="glass-input mt-1 block w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300">Subtitle</label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="glass-input mt-1 block w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 bg-dark-900 border border-dark-700 rounded-md">
        <button
          type="button"
          onClick={() => handleFormatText('bold')}
          className="p-2 hover:bg-dark-800 rounded text-gray-300 hover:text-gray-100"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormatText('italic')}
          className="p-2 hover:bg-dark-800 rounded text-gray-300 hover:text-gray-100"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormatText('underline')}
          className="p-2 hover:bg-dark-800 rounded text-gray-300 hover:text-gray-100"
        >
          <Underline className="h-4 w-4" />
        </button>
        <div className="h-6 w-px bg-dark-700" />
        <button
          type="button"
          onClick={() => handleFormatText('list')}
          className="p-2 hover:bg-dark-800 rounded text-gray-300 hover:text-gray-100"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleFormatText('checklist')}
          className="p-2 hover:bg-dark-800 rounded text-gray-300 hover:text-gray-100"
        >
          <CheckSquare className="h-4 w-4" />
        </button>
        <div className="h-6 w-px bg-dark-700" />
        <button
          type="button"
          className="p-2 hover:bg-dark-800 rounded text-gray-300 hover:text-gray-100"
        >
          <Image className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-dark-800 rounded text-gray-300 hover:text-gray-100"
        >
          <Mic className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-dark-800 rounded text-gray-300 hover:text-gray-100"
        >
          <Link className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-dark-800 rounded text-gray-300 hover:text-gray-100"
        >
          <Smile className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Content</label>
        <div className="mt-1 relative">
          <textarea
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="block w-full h-32 px-3 py-2 bg-gray-900 border border-gray-800 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 resize-none"
            placeholder="Write your note here..."
            style={{
              fontFamily: formData.fontFamily,
              fontSize: formData.fontSize,
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium text-gray-300">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="glass-input mt-1 block w-full"
                placeholder="Press Enter to add"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-dark-700 text-gray-300"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-gray-400 hover:text-gray-200"
              >
                &times;
              </button>
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Background Color</label>
            <input
              type="color"
              value={formData.backgroundColor}
              onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
              className="glass-input mt-1 block w-full h-8"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Font Family</label>
            <select
              value={formData.fontFamily}
              onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
              className="glass-input mt-1 block w-full"
            >
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Font Size</label>
            <select
              value={formData.fontSize}
              onChange={(e) => setFormData({ ...formData, fontSize: e.target.value })}
              className="glass-input mt-1 block w-full"
            >
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          {initialData ? 'Update' : 'Create'} Note
        </button>
      </div>
    </form>
  );
}
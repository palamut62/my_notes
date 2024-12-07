import React, { useEffect, useState } from 'react';
import { Archive as ArchiveIcon, Search, Grid, List, Columns, RotateCcw, Trash2 } from 'lucide-react';
import { useNoteStore } from '../store/noteStore';
import { Note } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Archive() {
  const { archivedNotes, loading, fetchArchivedNotes, unarchiveNote, moveToTrash } = useNoteStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'columns'>('grid');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    action: () => Promise<void>;
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchArchivedNotes();
  }, [fetchArchivedNotes]);

  const categories = Array.from(new Set(archivedNotes.map(note => note.category).filter(Boolean)));
  const tags = Array.from(new Set(archivedNotes.flatMap(note => note.tags || [])));

  const filteredNotes = archivedNotes
    .filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || note.category === selectedCategory;
      const matchesTag = !selectedTag || (note.tags || []).includes(selectedTag);
      return matchesSearch && matchesCategory && matchesTag;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUnarchive = (id: string) => {
    setConfirmAction({
      action: () => unarchiveNote(id),
      title: 'Unarchive Note',
      message: 'Are you sure you want to unarchive this note? It will be moved back to your main notes.'
    });
    setIsConfirmDialogOpen(true);
  };

  const handleMoveToTrash = (id: string) => {
    setConfirmAction({
      action: () => moveToTrash(id),
      title: 'Move to Trash',
      message: 'Are you sure you want to move this note to trash?'
    });
    setIsConfirmDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2">
          <ArchiveIcon className="h-6 w-6 text-primary-400" />
          Archive
        </h1>
      </div>

      {/* Search and Filters */}
      <div className="card space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-dark-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search archived notes..."
              className="input pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full lg:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div className="w-full lg:w-48">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="input"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode */}
          <div className="flex gap-1 p-1 bg-dark-800/50 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-dark-700 text-dark-50'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-dark-700 text-dark-50'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('columns')}
              className={`p-2 rounded ${
                viewMode === 'columns'
                  ? 'bg-dark-700 text-dark-50'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              <Columns className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="text-center py-8 text-dark-400">Loading...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-12 h-12 rounded-full bg-primary-900/20 flex items-center justify-center mx-auto">
            <ArchiveIcon className="h-6 w-6 text-primary-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-dark-200">No archived notes</h3>
          <p className="mt-1 text-dark-400">
            {searchTerm || selectedCategory || selectedTag
              ? 'Try adjusting your filters'
              : 'Your archived notes will appear here'}
          </p>
        </div>
      ) : (
        <div className={`
          grid gap-6
          ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}
          ${viewMode === 'list' ? 'grid-cols-1' : ''}
          ${viewMode === 'columns' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : ''}
        `}>
          {filteredNotes.map((note) => (
            <div key={note.id} className="card group hover:border-primary-800/50 transition-colors">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-dark-50 line-clamp-2">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleUnarchive(note.id)}
                        className="toolbar-button"
                        title="Unarchive"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMoveToTrash(note.id)}
                        className="toolbar-button text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        title="Move to Trash"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {note.subtitle && (
                    <p className="mt-1 text-dark-400 text-sm line-clamp-1">{note.subtitle}</p>
                  )}
                  <p className="mt-2 text-dark-200 line-clamp-3">{note.content}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-dark-800/50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      {note.category && (
                        <span className="badge badge-primary">{note.category}</span>
                      )}
                      {note.tags?.map((tag) => (
                        <span key={tag} className="badge badge-accent">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <time className="text-sm text-dark-400">
                      {formatDate(note.updated_at)}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Confirm Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={confirmAction.action}
          title={confirmAction.title}
          message={confirmAction.message}
          type={confirmAction.title.includes('Trash') ? 'danger' : 'info'}
        />
      )}
    </div>
  );
}

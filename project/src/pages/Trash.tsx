import { Trash2, Search, Grid, List, Columns, RotateCcw } from 'lucide-react';
import { useNoteStore } from '../store/noteStore';
import { useState, useEffect } from 'react';
import { Note } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Trash() {
  const { trashedNotes, loading, fetchTrashedNotes, restoreFromTrash, permanentlyDelete } = useNoteStore();
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
    fetchTrashedNotes();
  }, [fetchTrashedNotes]);

  const handleRestore = (id: string) => {
    setConfirmAction({
      action: () => restoreFromTrash(id),
      title: 'Restore Note',
      message: 'Are you sure you want to restore this note? It will be moved back to your main notes.'
    });
    setIsConfirmDialogOpen(true);
  };

  const handlePermanentDelete = (id: string) => {
    setConfirmAction({
      action: () => permanentlyDelete(id),
      title: 'Permanently Delete Note',
      message: 'Are you sure you want to permanently delete this note? This action cannot be undone.'
    });
    setIsConfirmDialogOpen(true);
  };

  const handleEmptyTrash = () => {
    setConfirmAction({
      action: async () => {
        for (const note of trashedNotes) {
          await permanentlyDelete(note.id);
        }
      },
      title: 'Empty Trash',
      message: 'Are you sure you want to permanently delete all notes in the trash? This action cannot be undone.'
    });
    setIsConfirmDialogOpen(true);
  };

  const categories = Array.from(new Set(trashedNotes.map(note => note.category).filter(Boolean)));
  const tags = Array.from(new Set(trashedNotes.flatMap(note => note.tags || [])));

  const filteredNotes = trashedNotes
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2">
          <Trash2 className="h-6 w-6 text-red-400" />
          Trash
        </h1>
        {trashedNotes.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="btn-error"
          >
            Empty Trash
          </button>
        )}
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
              placeholder="Search deleted notes..."
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
          <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center mx-auto">
            <Trash2 className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-dark-200">No notes in trash</h3>
          <p className="mt-1 text-dark-400">
            Deleted notes will appear here
          </p>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : viewMode === 'columns'
            ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="group relative card hover:border-red-500/50 transition-colors"
              style={{
                backgroundColor: note.backgroundColor || undefined
              }}
            >
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-dark-50 line-clamp-2">
                      {note.title}
                    </h3>
                    {note.subtitle && (
                      <p className="mt-1 text-dark-400 line-clamp-1">
                        {note.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="text-dark-300 line-clamp-3" style={{ 
                    fontFamily: note.fontFamily || 'inherit',
                    fontSize: note.fontSize || 'inherit'
                  }}>
                    {note.content}
                  </div>

                  <div className="flex items-center justify-between text-sm text-dark-400">
                    <div className="flex items-center gap-2">
                      {note.category && (
                        <span className="px-2 py-1 rounded-full bg-dark-800">
                          {note.category}
                        </span>
                      )}
                      <span>
                        {formatDate(note.deleted_at || note.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Note Actions */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRestore(note.id)}
                    className="p-2 text-dark-400 hover:text-dark-50 hover:bg-dark-800/50 rounded-lg"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(note.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
          type="danger"
          confirmText={confirmAction.title === 'Empty Trash' ? 'Empty Trash' : 'Delete'}
        />
      )}
    </div>
  );
}

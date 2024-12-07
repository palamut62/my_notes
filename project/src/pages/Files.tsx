import { useEffect, useState } from 'react';
import { FolderOpen, Edit, Trash2, Plus, Search, Grid, List, Download } from 'lucide-react';
import { useFileStore } from '../store/fileStore';
import Modal from '../components/Modal';
import FileForm from '../components/FileForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { SecureFile } from '../types';
import { useLocation } from 'react-router-dom';
import { getFileExtension, getFileTypeColor, getFileTypeIcon } from '../lib/utils';
import { supabase } from '../lib/supabase';

export default function Files() {
  const location = useLocation();
  const { files, loading, fetchFiles, addFile, updateFile, deleteFile } = useFileStore();
  const [isModalOpen, setIsModalOpen] = useState(location.state?.openForm || false);
  const [selectedFile, setSelectedFile] = useState<SecureFile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    action: () => Promise<void>;
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleSubmit = async (file: File, metadata: Partial<SecureFile>) => {
    if (selectedFile) {
      await updateFile(selectedFile.id, metadata);
    } else {
      await addFile(file, metadata);
    }
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const handleDelete = (id: string) => {
    setConfirmAction({
      action: () => deleteFile(id),
      title: 'Delete File',
      message: 'Are you sure you want to delete this file? This action cannot be undone.'
    });
    setIsConfirmDialogOpen(true);
  };

  const handleDownload = async (file: SecureFile) => {
    try {
      console.log('Attempting to download file:', {
        name: file.name,
        path: file.path,
        type: file.type,
        size: file.size
      });

      if (!file.path) {
        throw new Error('File path not found');
      }

      // Download the file using Supabase storage download
      const { data, error } = await supabase.storage
        .from('secure-files')
        .download(file.path);

      if (error) {
        console.error('Download error:', {
          message: error.message,
          name: error.name,
          status: error.status,
          statusText: error.statusText,
          details: error.details
        });
        throw error;
      }

      console.log('File downloaded successfully');

      // Create a blob URL and trigger download
      const blob = new Blob([data], { type: file.type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading file:', {
        error: error,
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      alert(error.message || 'Failed to download file. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const categories = Array.from(new Set(files.map(file => file.category).filter(Boolean)));

  const filteredFiles = files
    .filter(file => {
      const matchesSearch = 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.type?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesCategory = !selectedCategory || file.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2">
          <FolderOpen className="h-6 w-6 text-primary-400" />
          Files
        </h1>
        <button
          onClick={() => {
            setSelectedFile(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add File
        </button>
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
              placeholder="Search files..."
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
          </div>
        </div>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="text-center py-8 text-dark-400">Loading...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-12 h-12 rounded-full bg-primary-900/20 flex items-center justify-center mx-auto">
            <FolderOpen className="h-6 w-6 text-primary-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-dark-200">No files found</h3>
          <p className="mt-1 text-dark-400">
            {searchTerm || selectedCategory
              ? 'Try adjusting your filters'
              : 'Upload your first file to get started'}
          </p>
        </div>
      ) : (
        <div className={`
          grid gap-6
          ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}
          ${viewMode === 'list' ? 'grid-cols-1' : ''}
        `}>
          {filteredFiles.map((file) => {
            const fileExt = getFileExtension(file.name);
            const fileColor = getFileTypeColor(fileExt);
            return (
              <div key={file.id} className="card group hover:border-primary-800/50 transition-colors">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div 
                          className={`w-10 h-10 rounded-lg ${fileColor} flex items-center justify-center`}
                          dangerouslySetInnerHTML={{ __html: getFileTypeIcon(fileExt) }}
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-dark-50 line-clamp-2">
                            {file.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-dark-400">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span className="px-2 py-0.5 bg-dark-700 rounded-md uppercase text-xs font-medium">
                              {fileExt}
                            </span>
                            {file.category && (
                              <>
                                <span>•</span>
                                <span>{file.category}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDownload(file)}
                          className="toolbar-button"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFile(file);
                            setIsModalOpen(true);
                          }}
                          className="toolbar-button"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="toolbar-button text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* File Form Modal */}
      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFile(null);
          }}
          title={selectedFile ? "Edit File" : "Upload File"}
          maxWidth="sm:max-w-2xl"
        >
          <FileForm
            onSubmit={handleSubmit}
            initialData={selectedFile || undefined}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedFile(null);
            }}
          />
        </Modal>
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
          confirmText="Delete"
        />
      )}
    </div>
  );
}
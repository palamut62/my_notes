import React, { useEffect, useState } from 'react';
import { KeyRound, Edit, Trash2, Plus, Search, Eye, EyeOff, Grid, List } from 'lucide-react';
import { usePasswordStore } from '../store/passwordStore';
import { useAuthStore } from '../store/authStore';
import Modal from '../components/Modal';
import PasswordForm from '../components/PasswordForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { Password } from '../types';
import { useLocation } from 'react-router-dom';

export default function Passwords() {
  const location = useLocation();
  const { passwords, loading, fetchPasswords, addPassword, updatePassword, deletePassword } = usePasswordStore();
  const { oneTimeCode } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(location.state?.openForm || false);
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [passwordToShow, setPasswordToShow] = useState<string | null>(null);
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
    fetchPasswords();
  }, [fetchPasswords]);

  const handleSubmit = async (data: Partial<Password>) => {
    if (selectedPassword) {
      await updatePassword(selectedPassword.id, data);
    } else {
      await addPassword(data as Omit<Password, 'id' | 'created_at' | 'user_id'>);
    }
    setIsModalOpen(false);
    setSelectedPassword(null);
  };

  const handleDelete = (id: string) => {
    setConfirmAction({
      action: () => deletePassword(id),
      title: 'Delete Password',
      message: 'Are you sure you want to delete this password? This action cannot be undone.'
    });
    setIsConfirmDialogOpen(true);
  };

  const togglePasswordVisibility = (id: string) => {
    if (showPasswords[id]) {
      setShowPasswords(prev => ({ ...prev, [id]: false }));
    } else {
      setPasswordToShow(id);
      setShowVerificationModal(true);
      setVerificationCode('');
      setVerificationError('');
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode === oneTimeCode && passwordToShow) {
      setShowPasswords(prev => ({ ...prev, [passwordToShow]: true }));
      setShowVerificationModal(false);
      setVerificationCode('');
      setVerificationError('');
      setPasswordToShow(null);
    } else {
      setVerificationError('Invalid verification code');
    }
  };

  const categories = Array.from(new Set(passwords.map(password => password.category).filter(Boolean)));

  const filteredPasswords = passwords
    .filter(password => {
      const matchesSearch = 
        password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (password.url?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesCategory = !selectedCategory || password.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2">
          <KeyRound className="h-6 w-6 text-primary-400" />
          Passwords
        </h1>
        <button
          onClick={() => {
            setSelectedPassword(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add Password
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
              placeholder="Search passwords..."
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

      {/* Passwords Grid */}
      {loading ? (
        <div className="text-center py-8 text-dark-400">Loading...</div>
      ) : filteredPasswords.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-12 h-12 rounded-full bg-primary-900/20 flex items-center justify-center mx-auto">
            <KeyRound className="h-6 w-6 text-primary-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-dark-200">No passwords found</h3>
          <p className="mt-1 text-dark-400">
            {searchTerm || selectedCategory
              ? 'Try adjusting your filters'
              : 'Add your first password to get started'}
          </p>
        </div>
      ) : (
        <div className={`
          grid gap-6
          ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}
          ${viewMode === 'list' ? 'grid-cols-1' : ''}
        `}>
          {filteredPasswords.map((password) => (
            <div key={password.id} className="card group hover:border-primary-800/50 transition-colors">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-dark-50 line-clamp-2">
                      {password.title}
                    </h3>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSelectedPassword(password);
                          setIsModalOpen(true);
                        }}
                        className="toolbar-button"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(password.id)}
                        className="toolbar-button text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-dark-400">{password.username}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <p className="font-mono text-dark-200">
                      {showPasswords[password.id] ? password.password : '••••••••'}
                    </p>
                    <button
                      onClick={() => togglePasswordVisibility(password.id)}
                      className="toolbar-button"
                    >
                      {showPasswords[password.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {password.url && (
                    <a
                      href={password.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block text-primary-400 hover:text-primary-300 truncate"
                    >
                      {password.url}
                    </a>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-dark-800/50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {password.category && (
                      <span className="badge badge-primary">{password.category}</span>
                    )}
                    {password.notes && (
                      <p className="text-sm text-dark-400">{password.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Password Form Modal */}
      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPassword(null);
          }}
          title={selectedPassword ? "Edit Password" : "Add Password"}
          maxWidth="sm:max-w-2xl"
        >
          <PasswordForm
            onSubmit={handleSubmit}
            initialData={selectedPassword || undefined}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedPassword(null);
            }}
          />
        </Modal>
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <Modal
          isOpen={showVerificationModal}
          onClose={() => {
            setShowVerificationModal(false);
            setVerificationCode('');
            setVerificationError('');
            setPasswordToShow(null);
          }}
          title="Verify One-Time Code"
          maxWidth="sm:max-w-md"
        >
          <div className="space-y-4">
            <p className="text-dark-200">
              Please enter your one-time security code to view this password.
            </p>
            <div className="space-y-2">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter your code"
                className="w-full px-4 py-2 bg-dark-900/50 border border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {verificationError && (
                <p className="text-sm text-red-500">{verificationError}</p>
              )}
            </div>
            <button
              onClick={handleVerifyCode}
              className="btn-primary w-full"
            >
              Verify
            </button>
          </div>
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
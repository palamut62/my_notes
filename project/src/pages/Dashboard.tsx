import { useNavigate } from 'react-router-dom';
import { Key, FileText, Shield, Plus, Lock, File, Copy, Download } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePasswordStore } from '../store/passwordStore';
import { useFileStore } from '../store/fileStore';
import { useNoteStore } from '../store/noteStore';
import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { getFileTypeColor, getFileExtension, getFileTypeIcon } from '../lib/utils';

export default function Dashboard() {
  const { user, oneTimeCode, oneTimeCodeShown, generateOneTimeCode, markOneTimeCodeAsShown } = useAuthStore();
  const navigate = useNavigate();
  const { passwords, fetchPasswords } = usePasswordStore();
  const { files, fetchFiles } = useFileStore();
  const { notes, fetchNotes } = useNoteStore();
  const [showOneTimeCodeModal, setShowOneTimeCodeModal] = useState(false);

  useEffect(() => {
    fetchPasswords();
    fetchFiles();
    fetchNotes();
  }, [fetchPasswords, fetchFiles, fetchNotes]);

  useEffect(() => {
    const checkOneTimeCode = async () => {
      if (!oneTimeCode && !oneTimeCodeShown) {
        try {
          await generateOneTimeCode();
          setShowOneTimeCodeModal(true);
        } catch (error) {
          console.error('Error generating one-time code:', error);
        }
      }
    };

    checkOneTimeCode();
  }, [oneTimeCode, oneTimeCodeShown, generateOneTimeCode]);

  const handleCopyCode = () => {
    if (oneTimeCode) {
      navigator.clipboard.writeText(oneTimeCode);
    }
  };

  const handleDownloadCode = () => {
    if (oneTimeCode) {
      const element = document.createElement('a');
      const file = new Blob([`Your one-time code: ${oneTimeCode}\nGenerated on: ${new Date().toLocaleString()}`], 
        { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = 'one-time-code.txt';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleCloseOneTimeCodeModal = () => {
    markOneTimeCodeAsShown();
    setShowOneTimeCodeModal(false);
  };

  // Calculate security score based on password strength and 2FA
  const calculateSecurityScore = () => {
    if (!passwords.length) return 0;

    let score = 0;
    passwords.forEach(password => {
      // Add points for password length
      if (password.password.length >= 12) score += 2;
      else if (password.password.length >= 8) score += 1;

      // Add points for password complexity
      if (/[A-Z]/.test(password.password)) score += 1;
      if (/[a-z]/.test(password.password)) score += 1;
      if (/[0-9]/.test(password.password)) score += 1;
      if (/[^A-Za-z0-9]/.test(password.password)) score += 1;
    });

    // Calculate percentage
    const maxScore = passwords.length * 6; // 6 is max points per password
    return Math.min(Math.round((score / maxScore) * 100), 100);
  };

  const stats = [
    { name: 'Stored Passwords', value: passwords.length.toString(), icon: Lock, color: 'primary' },
    { name: 'Secure Files', value: files.length.toString(), icon: File, color: 'success' },
    { name: 'Security Score', value: `${calculateSecurityScore()}%`, icon: Shield, color: 'warning' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* One Time Code Modal */}
      {showOneTimeCodeModal && oneTimeCode && (
        <Modal
          isOpen={showOneTimeCodeModal}
          onClose={handleCloseOneTimeCodeModal}
          title="Your One-Time Code"
          maxWidth="sm:max-w-md"
        >
          <div className="space-y-4">
            <p className="text-dark-200">
              This is your one-time security code. Please save it in a secure location as it will only be shown once.
            </p>
            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
              <span className="text-2xl font-mono font-bold text-primary-400">
                {oneTimeCode}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="p-2 text-dark-400 hover:text-dark-50 hover:bg-dark-700/50 rounded-lg"
                  title="Copy to clipboard"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="p-2 text-dark-400 hover:text-dark-50 hover:bg-dark-700/50 rounded-lg"
                  title="Download as text file"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="bg-warning-900/20 text-warning-200 border border-warning-800/50 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Important:</strong> This code will not be shown again. Make sure to save it before closing this window.
              </p>
            </div>
            <button
              onClick={handleCloseOneTimeCodeModal}
              className="btn-primary w-full"
            >
              I've Saved My Code
            </button>
          </div>
        </Modal>
      )}

      {/* Welcome Section */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-dark-50">Welcome back!</h1>
            <p className="text-dark-400 mt-1">{user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => navigate('/passwords', { state: { openForm: true } })}
              className="btn-primary flex-1 md:flex-none"
            >
              <Lock className="w-4 h-4" />
              Add Password
            </button>
            <button
              onClick={() => navigate('/files', { state: { openForm: true } })}
              className="btn-primary flex-1 md:flex-none"
            >
              <File className="w-4 h-4" />
              Upload File
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-400">{stat.name}</p>
                  <p className="text-2xl font-semibold text-dark-50 mt-1">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-900/20 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Passwords */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-dark-50">Recent Passwords</h3>
              <p className="text-sm text-dark-400 mt-1">Your recently added passwords</p>
            </div>
            <button
              onClick={() => navigate('/passwords', { state: { openForm: true } })}
              className="btn-primary"
            >
              <Plus className="h-4 w-4" />
              Add New
            </button>
          </div>
          <div className="mt-6">
            {passwords.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-primary-900/20 flex items-center justify-center mx-auto">
                  <Lock className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-dark-200">No passwords yet</h3>
                <p className="mt-1 text-sm text-dark-400">
                  Add your first password to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {passwords.slice(0, 5).map((password) => (
                  <div key={password.id} className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50">
                    <div>
                      <h4 className="font-medium text-dark-50">{password.title}</h4>
                      <p className="text-sm text-dark-400">{password.username}</p>
                    </div>
                    <time className="text-sm text-dark-400">
                      {formatDate(password.created_at)}
                    </time>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Files */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-dark-50">Recent Files</h3>
              <p className="text-sm text-dark-400">Your recently uploaded files</p>
            </div>
            <button
              onClick={() => navigate('/files')}
              className="btn-outline w-full sm:w-auto"
            >
              View All
            </button>
          </div>
          <div className="mt-6 space-y-4">
            {files.slice(0, 5).map((file) => {
              const fileExt = getFileExtension(file.name);
              const fileColor = getFileTypeColor(fileExt);
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 hover:bg-dark-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${fileColor} flex items-center justify-center`}
                         dangerouslySetInnerHTML={{ __html: getFileTypeIcon(fileExt) }}
                    />
                    <div>
                      <p className="font-medium text-dark-50">{file.name}</p>
                      <div className="flex items-center gap-2 text-sm text-dark-400">
                        <span className="px-2 py-0.5 bg-dark-700 rounded-md uppercase text-xs font-medium">
                          {fileExt}
                        </span>
                        <span>•</span>
                        <span>{formatDate(file.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/files/${file.id}`)}
                    className="btn-ghost"
                  >
                    View
                  </button>
                </div>
              );
            })}
            {files.length === 0 && (
              <div className="text-center py-4">
                <p className="text-dark-400">No files uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Eye, EyeOff, Copy, Trash, Edit } from 'lucide-react';
import { Password } from '../types';
import { useAuthStore } from '../store/authStore';
import Modal from './Modal';

interface PasswordItemProps {
  password: Password;
  onEdit: (password: Password) => void;
  onDelete: (id: string) => void;
}

export default function PasswordItem({ password, onEdit, onDelete }: PasswordItemProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const { oneTimeCode } = useAuthStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(password.password);
  };

  const handleShowPassword = () => {
    setShowVerificationModal(true);
  };

  const verifyAndShowPassword = () => {
    if (verificationCode === oneTimeCode) {
      setShowPassword(true);
      setShowVerificationModal(false);
      setVerificationCode('');
      setError('');
    } else {
      setError('Invalid verification code');
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
      <div className="space-y-1">
        <h3 className="font-medium text-dark-50">{password.title}</h3>
        <p className="text-sm text-dark-300">{password.username}</p>
        <div className="flex items-center gap-2">
          <div className="font-mono bg-dark-900/50 px-2 py-1 rounded">
            {showPassword ? password.password : '••••••••'}
          </div>
          <button
            onClick={handleShowPassword}
            className="p-1.5 text-dark-400 hover:text-dark-50 hover:bg-dark-700/50 rounded"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 text-dark-400 hover:text-dark-50 hover:bg-dark-700/50 rounded"
            title="Copy password"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(password)}
          className="p-2 text-dark-400 hover:text-dark-50 hover:bg-dark-700/50 rounded"
          title="Edit password"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(password.id)}
          className="p-2 text-dark-400 hover:text-dark-50 hover:bg-dark-700/50 rounded"
          title="Delete password"
        >
          <Trash className="w-5 h-5" />
        </button>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <Modal
          isOpen={showVerificationModal}
          onClose={() => {
            setShowVerificationModal(false);
            setVerificationCode('');
            setError('');
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
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
            <button
              onClick={verifyAndShowPassword}
              className="btn-primary w-full"
            >
              Verify
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

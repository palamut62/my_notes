import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-900/20',
          iconColor: 'text-red-400',
          buttonBg: 'bg-red-500 hover:bg-red-600'
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-900/20',
          iconColor: 'text-yellow-400',
          buttonBg: 'bg-yellow-500 hover:bg-yellow-600'
        };
      case 'info':
      default:
        return {
          iconBg: 'bg-primary-900/20',
          iconColor: 'text-primary-400',
          buttonBg: 'bg-primary-500 hover:bg-primary-600'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-dark-900 rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}>
            <AlertTriangle className={`h-6 w-6 ${styles.iconColor}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-dark-50">{title}</h3>
            <p className="mt-1 text-dark-400">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-dark-400 hover:text-dark-50 hover:bg-dark-800/50 rounded"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded ${styles.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

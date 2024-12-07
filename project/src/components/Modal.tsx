import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'sm:max-w-md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-dark-950 opacity-75"></div>
        </div>

        <div className={`inline-block w-full transform overflow-hidden rounded-lg bg-dark-800 align-bottom shadow-xl transition-all sm:my-4 ${maxWidth}`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-100">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
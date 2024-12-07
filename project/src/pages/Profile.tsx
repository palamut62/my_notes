import React, { useState, useEffect } from 'react';
import { User, Settings, Lock, Save, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, refreshSession } = useAuthStore();
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    fullName: user?.user_metadata?.full_name || '',
    phone: user?.phone || user?.user_metadata?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [tempPhone, setTempPhone] = useState('');
  const { oneTimeCode, generateOneTimeCode, deleteAccount } = useAuthStore();

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Refresh session before update
      await refreshSession();

      // First update basic info
      const { error: basicUpdateError } = await supabase.auth.updateUser({
        email: profileData.email,
        data: { 
          full_name: profileData.fullName,
        },
      });

      if (basicUpdateError) throw basicUpdateError;

      // Then update phone number separately
      if (profileData.phone !== user?.phone) {
        const { error: phoneUpdateError } = await supabase.auth.updateUser({
          phone: profileData.phone,
        });

        if (phoneUpdateError) {
          if (phoneUpdateError.message.includes('SMS provider')) {
            // If SMS provider not configured, store in user metadata
            const { error: metadataError } = await supabase.auth.updateUser({
              data: { phone: profileData.phone }
            });
            if (metadataError) throw metadataError;
          } else {
            throw phoneUpdateError;
          }
        }
      }

      // Refresh session to get updated user data
      await refreshSession();
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditingProfile(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      if (error.message.includes('expired')) {
        setMessage({ type: 'error', text: 'Session expired. Please sign in again.' });
        navigate('/login');
      } else {
        setMessage({ type: 'error', text: error.message });
      }
    }
  };

  const handleVerifyPhone = async () => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: tempPhone,
        token: verificationCode,
        type: 'sms'
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Phone number verified and updated successfully!' });
      setShowPhoneVerification(false);
      setVerificationCode('');
      setIsEditingProfile(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setError(null);
      setShowConfirmModal(true);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handlePasswordVerification = async () => {
    try {
      setError(null);
      
      // Verify password using signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: password,
      });

      if (error) {
        setError('Incorrect password. Please try again.');
        return;
      }

      setShowConfirmModal(false);
      setPassword('');
      
      // Generate new random code for final verification
      await generateOneTimeCode();
      setShowDeleteModal(true);
    } catch (error: any) {
      console.error('Password verification error:', error);
      setError(error.message);
    }
  };

  const handleVerifyAndDelete = async () => {
    try {
      setError(null);
      
      if (!oneTimeCode) {
        setError('No verification code generated');
        return;
      }

      if (verificationCode !== oneTimeCode) {
        setError('Invalid verification code');
        return;
      }

      await deleteAccount(verificationCode);
      setShowDeleteModal(false);
      setVerificationCode('');
      navigate('/login');
    } catch (error: any) {
      console.error('Delete account error:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        email: user.email || '',
        fullName: user.user_metadata?.full_name || '',
        phone: user.phone || user.user_metadata?.phone || '',
      });
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
        <Settings className="h-6 w-6 text-accent-500" />
        Profile Settings
      </h1>

      {message.text && (
        <div
          className={`p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-900/20 text-green-200 border border-green-800/50'
              : 'bg-red-900/20 text-red-200 border border-red-800/50'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="card space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
            <User className="h-5 w-5 text-accent-500" />
            Profile Information
          </h2>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-accent-400 hover:text-accent-300 font-medium"
          >
            {isEditingProfile ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                className="glass-input mt-1 block w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) =>
                  setProfileData({ ...profileData, fullName: e.target.value })
                }
                className="glass-input mt-1 block w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                placeholder="+90 5XX XXX XX XX"
                className="glass-input mt-1 block w-full"
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Email Address
              </label>
              <p className="mt-1 text-sm text-gray-200">{profileData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Full Name
              </label>
              <p className="mt-1 text-sm text-gray-200">
                {profileData.fullName || 'Not set'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Phone Number
              </label>
              <p className="mt-1 text-sm text-gray-200">
                {profileData.phone || 'Not set'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="card space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
            <Lock className="h-5 w-5 text-accent-500" />
            Change Password
          </h2>
          <button
            onClick={() => setIsChangingPassword(!isChangingPassword)}
            className="text-accent-400 hover:text-accent-300 font-medium"
          >
            {isChangingPassword ? 'Cancel' : 'Change'}
          </button>
        </div>

        {isChangingPassword && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className="glass-input mt-1 block w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="glass-input mt-1 block w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="glass-input mt-1 block w-full"
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
            >
              <Save className="h-4 w-4" />
              Update Password
            </button>
          </form>
        )}
      </div>

      <div className="card border-red-800/20">
        <h2 className="text-lg font-semibold text-dark-50 mb-4">Danger Zone</h2>
        <div className="space-y-4">
          <div className="p-4 bg-red-900/10 rounded-lg border border-red-800/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-400">Delete Account</h3>
                <p className="text-sm text-dark-400 mt-1">
                  Once you delete your account, there is no going back. This action cannot be undone.
                  All your data including passwords, files, and notes will be permanently deleted.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="mt-4 px-4 py-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPassword('');
          setError(null);
        }}
        title="Password Verification"
      >
        <div className="space-y-4">
          <p className="text-dark-200">
            Please enter your account password to continue with account deletion:
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="glass-input mt-1 block w-full"
          />
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowConfirmModal(false);
                setPassword('');
                setError(null);
              }}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordVerification}
              className="btn-primary"
              disabled={!password}
            >
              Verify & Continue
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setVerificationCode('');
          setError(null);
        }}
        title="Final Verification"
      >
        <div className="space-y-4">
          <p className="text-dark-200">
            To complete account deletion, please enter the following verification code:
          </p>
          <div className="p-4 bg-dark-800/50 rounded-lg">
            <p className="text-lg font-mono text-primary-400 text-center">
              {oneTimeCode}
            </p>
          </div>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
            className="glass-input mt-1 block w-full"
          />
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setVerificationCode('');
                setError(null);
              }}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyAndDelete}
              className="btn-primary"
              disabled={!verificationCode}
            >
              Delete Account
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        title="Verify Phone Number"
      >
        <div className="space-y-4">
          <p className="text-dark-200">
            Please enter the verification code sent to your phone number:
          </p>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
            className="glass-input mt-1 block w-full"
          />
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowPhoneVerification(false);
                setVerificationCode('');
              }}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyPhone}
              className="btn-primary"
              disabled={!verificationCode}
            >
              Verify Phone Number
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
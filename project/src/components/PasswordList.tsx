import { useEffect } from 'react';
import { usePasswordStore } from '../store/passwordStore';
import PasswordItem from './PasswordItem';
import { Password } from '../types';

export default function PasswordList() {
  const { passwords, fetchPasswords, updatePassword, deletePassword } = usePasswordStore();

  useEffect(() => {
    fetchPasswords();
  }, [fetchPasswords]);

  const handleEdit = (password: Password) => {
    // TODO: Implement edit functionality
    console.log('Edit password:', password);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePassword(id);
    } catch (error) {
      console.error('Error deleting password:', error);
    }
  };

  if (!passwords.length) {
    return (
      <div className="text-center py-8 text-dark-300">
        <p>No passwords saved yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {passwords.map((password) => (
        <PasswordItem
          key={password.id}
          password={password}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

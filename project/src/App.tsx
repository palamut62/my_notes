import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Passwords from './pages/Passwords';
import Files from './pages/Files';
import Notes from './pages/Notes';
import Profile from './pages/Profile';
import Archive from './pages/Archive';
import Trash from './pages/Trash';
import AuthCallback from './pages/AuthCallback';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  
  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
    </div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { initializeSession } = useAuthStore();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="passwords" element={<Passwords />} />
          <Route path="files" element={<Files />} />
          <Route path="notes" element={<Notes />} />
          <Route path="archive" element={<Archive />} />
          <Route path="trash" element={<Trash />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
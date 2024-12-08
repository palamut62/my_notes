import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '../lib/supabase';

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      if (user) {
        navigate('/login');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Description */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0e2936] text-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-4">Start your note-taking journey.</h1>
          <p className="text-xl">
            Join AppNotes and experience <span className="text-cyan-400">seamless note organization</span> with our powerful features.
          </p>
        </div>
        <div className="text-sm">Made with love in Turkey.</div>
      </div>

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 bg-black text-white p-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold text-center mb-8">Create Account</h2>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-2 p-3 border border-gray-600 rounded-lg hover:bg-gray-900 transition"
            >
              <FcGoogle className="text-xl" />
              <span>Sign up with Google</span>
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="text-gray-400">OR</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full p-3 bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-400"
              />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-400"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-400"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-400"
              />
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black p-3 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center mt-6">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-400 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
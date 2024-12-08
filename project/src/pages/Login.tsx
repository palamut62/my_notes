'use client';

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First, sign in the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user has a profile with one-time code
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // No profile found, this is first login
          const oneTimeCode = Math.floor(100000 + Math.random() * 900000).toString();
          
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: data.user.id,
              one_time_code: oneTimeCode,
              code_shown: false,
              code_generated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw insertError;
          }
        }

        navigate('/');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
          <h1 className="text-4xl font-bold mb-4">Your fullstack note taking app.</h1>
          <p className="text-xl">
            You ask, AppNotes delivers <span className="text-cyan-400">your perfect note-taking experience</span>.
          </p>
        </div>
        <div className="text-sm">Made with love in Turkey.</div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 bg-black text-white p-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 p-3 border border-gray-600 rounded-lg hover:bg-gray-900 transition"
            >
              <FcGoogle className="text-xl" />
              <span>Sign in with Google</span>
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
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black p-3 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center space-y-2 mt-6">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="text-cyan-400 hover:underline">
                  Sign up
                </Link>
              </p>
              <Link to="/forgot-password" className="text-cyan-400 hover:underline block">
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
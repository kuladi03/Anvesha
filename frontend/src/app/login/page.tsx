'use client';

import { useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password || (isRegistering && !name)) {
      setError('Please fill all fields.');
      return;
    }
  
    setLoading(true);
  
    try {
        if (isRegistering) {
          const res = await axios.post<{ studentId: string }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register`, {
            name,
            email,
            password,
          });
          localStorage.setItem('studentId', res.data.studentId); // ✅ Safe here
        } else {
          const res = await axios.post<{ studentId: string }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`, {
            email,
            password,
          });
          localStorage.setItem('studentId', res.data.studentId); // ✅ Safe here
        }
      
        // 🔁 Smart redirect
        const redirect = localStorage.getItem('redirectAfterLogin') || '/atudent-dashboard';
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirect;
  
      // 🔁 Redirect smartly based on intent
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/student-dashboard';
      localStorage.removeItem('redirectAfterLogin');
      window.location.href = redirectPath;
  
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-purple-100 to-pink-100">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
        {isRegistering ? "Sign Up" : "Sign In"}
        </h2>
        <p className="text-gray-500 mt-1">
        {isRegistering
          ? "Create your account to get started"
          : "Welcome back! Please login"}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded mb-4 text-xs text-center">
        {error}
        </div>
      )}

      <form
        onSubmit={e => {
        e.preventDefault();
        handleSubmit();
        }}
      >
        {isRegistering && (
        <div className="mb-4">
          <Input
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          autoComplete="name"
          disabled={loading}
          className="text-gray-700"
          />
        </div>
        )}

        <div className="mb-4">
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
          className="text-gray-700"
        />
        </div>

        <div className="mb-6">
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={isRegistering ? "new-password" : "current-password"}
          disabled={loading}
          className="text-gray-700"
        />
        </div>

        <Button
        type="submit"
        disabled={loading}
        className="w-full font-semibold py-2"
        >
        {loading
          ? "Please wait..."
          : isRegistering
          ? "Create Account"
          : "Login"}
        </Button>
      </form>

      <div className="mt-5 text-center">
        <span className="text-gray-500 text-sm">
        {isRegistering
          ? "Already have an account?"
          : "Don't have an account?"}
        </span>
        <button
        type="button"
        onClick={() => {
          setIsRegistering(!isRegistering);
          setError('');
        }}
        className="ml-2 text-blue-600 hover:underline text-sm font-medium"
        disabled={loading}
        >
        {isRegistering ? "Login" : "Register"}
        </button>
      </div>
      </div>
      <div className="absolute bottom-4 w-full text-center text-xs text-gray-400">
      &copy; {new Date().getFullYear()} Anvesha. All rights reserved.
      </div>
    </div>
  );
}

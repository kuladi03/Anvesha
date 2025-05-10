'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-300 to-blue-200">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-600">
          {isRegistering ? 'Create an Account' : 'Welcome Back'}
        </h1>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        {isRegistering && (
          <div className="mb-4">
            <label className="block mb-1 text-sm text-gray-600">Name</label>
            <Input className="text-gray-600"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-1 text-sm text-gray-600">Email</label>
          <Input className="text-gray-600"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm text-gray-600">Password</label>
          <Input className="text-gray-600"
            placeholder="********"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? 'Please wait...' : isRegistering ? 'Register' : 'Login'}
        </Button>

        <p className="mt-4 text-sm text-center text-gray-600">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 hover:underline ml-1"
          >
            {isRegistering ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}

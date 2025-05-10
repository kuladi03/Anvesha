'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface StudentProfile {
    gender: string;
    age: number;
    caste: string;
    area: string;
    standard: string;
    state: string;
    school: string;
  }

export default function ProfilePage() {
  const [form, setForm] = useState({
    gender: '',
    age: '',
    caste: '',
    area: '',
    standard: '',
    state: '',
    school: ''
  });

  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchProfile = async (id: string) => {
    const res = await axios.get<StudentProfile>(`http://localhost:5000/api/profile/${id}`);
    return res.data;
  };
  

  useEffect(() => {
    const id = localStorage.getItem('studentId');
    if (!id) {
      router.push('/login');
    } else {
      setStudentId(id);

      // ✅ Moved axios call inside the useEffect block where `id` is accessible
      axios.get<StudentProfile>(`http://localhost:5000/api/profile/${id}`)
        .then(res => {
          const data = res.data;
          setForm({
            gender: data.gender || '',
            age: data.age?.toString() || '',
            caste: data.caste || '',
            area: data.area || '',
            standard: data.standard || '',
            state: data.state || '',
            school: data.school || ''
          });
        })
        .catch(() => {
          setError('Failed to load profile data.');
        });
    }
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!studentId) return;
    setLoading(true);
    setError('');

    try {
      await axios.put(`http://localhost:5000/api/profile/${studentId}`, {
        ...form,
        age: parseInt(form.age, 10)
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-xl p-6">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Your Profile</CardTitle>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            {Object.entries(form).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium capitalize mb-1" htmlFor={key}>
                  {key}
                </label>
                <Input
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  placeholder={`Enter your ${key}`}
                  disabled={loading}
                />
              </div>
            ))}

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

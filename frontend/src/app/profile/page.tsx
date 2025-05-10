'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, MapPin, GraduationCap, User } from 'lucide-react';
import Header from '@/components/ui/header';
import Link from 'next/link';

interface Student {
  name: string;
  email: string;
}

interface Profile {
  gender: string;
  age: number;
  caste: string;
  area: string;
  standard: string;
  state: string;
  school: string;
  maritalStatus: string;
  course: string;
  previousQualification: string;
  motherQualification: string;
  fatherQualification: string;
  motherOccupation: string;
  fatherOccupation: string;
  specialNeeds: string;
  debtor: string;
  tuitionUpToDate: string;
  scholarshipHolder: string;
}


interface CombinedResponse {
  student: Student;
  profile: Profile;
}

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    gender: '',
    age: '',
    caste: '',
    area: '',
    standard: '',
    state: '',
    school: '',
    maritalStatus: '',
    course: '',
    previousQualification: '',
    motherQualification: '',
    fatherQualification: '',
    motherOccupation: '',
    fatherOccupation: '',
    specialNeeds: '',
    debtor: '',
    tuitionUpToDate: '',
    scholarshipHolder: '',
  });

  const [studentId, setStudentId] = useState('');
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  const ProfileField = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-center gap-2">
      {icon}
      <span><strong>{label}:</strong> {value}</span>
    </div>
  );
  

  useEffect(() => {
    const id = localStorage.getItem('studentId');
    if (!id) {
      localStorage.setItem('redirectAfterLogin', '/profile');
      router.push('/login');
      return;
    }

    setStudentId(id);

    axios
      .get<CombinedResponse>(`http://localhost:5000/api/profile/${id}`)
      .then(res => {
        const { student, profile } = res.data;
        setForm({
          name: student?.name || '',
          email: student?.email || '',
          gender: profile?.gender || '',
          age: profile?.age?.toString() || '',
          caste: profile?.caste || '',
          area: profile?.area || '',
          standard: profile?.standard || '',
          state: profile?.state || '',
          school: profile?.school || '',
          maritalStatus: profile?.maritalStatus || '',
          course: profile?.course || '',
          previousQualification: profile?.previousQualification || '',
          motherQualification: profile?.motherQualification || '',
          fatherQualification: profile?.fatherQualification|| '',
          motherOccupation: profile?.motherOccupation || '',
          fatherOccupation: profile?.fatherOccupation || '',
          specialNeeds: profile?.specialNeeds || '',
          debtor: profile?.debtor || '',
          tuitionUpToDate: profile?.tuitionUpToDate || '',
          scholarshipHolder: profile?.scholarshipHolder || ''
        });
        
      })
      .catch(() => {
        setError('Failed to load profile data.');
      })
      .finally(() => {
        setLoadingAuth(false);
      });
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
        name: form.name,
        email: form.email,
        gender: form.gender,
        age: parseInt(form.age, 10),
        caste: form.caste,
        area: form.area,
        standard: form.standard,
        state: form.state,
        school: form.school,
        maritalStatus: form.maritalStatus,
        course: form.course,
        previousQualification: form.previousQualification,
        motherQualification: form.motherQualification,
        fatherQualification: form.fatherQualification,
        motherOccupation: form.motherOccupation,
        fatherOccupation: form.fatherOccupation,
        specialNeeds: form.specialNeeds,
        debtor: form.debtor,
        tuitionUpToDate: form.tuitionUpToDate,
        scholarshipHolder: form.scholarshipHolder,
      });

      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Checking authentication...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
  
      <div className="max-w-5xl mx-auto px-4 py-30">
  
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
            <div className="w-32 h-32 rounded-full border-4 border-blue-100 overflow-hidden flex items-center justify-center bg-blue-50">
                <span className="text-4xl font-bold text-blue-600">
                  {form.name ? form.name[0].toUpperCase() : 'S'}
                </span>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">{form.name || 'Student Name'}</h2>
              <p className="text-lg text-gray-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                {form.standard} | {form.school}
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {form.caste || 'Caste'}
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  {form.age || 'Age'} years
                </span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                  {form.state || 'State'}
                </span>
              </div>
            </div>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Email */}
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{form.email || '-'}</p>
              </div>
            </div>
  
            {/* Location */}
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-800">
                  {form.area ? `${form.area}, ${form.state}` : '-'}
                </p>
              </div>
            </div>
  
            {/* Gender */}
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mt-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium text-gray-800">{form.gender || '-'}</p>
              </div>
            </div>
          </div>
  
          <div className="border-t pt-6 flex justify-end">
            <button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>
  
        {/* Additional Information */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Academic Details</h3>
            <button
              onClick={() => setShowFullProfile(prev => !prev)}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {showFullProfile ? 'Collapse' : 'Expand'} Details
            </button>
          </div>
  
          {showFullProfile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Family Background */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 border-b pb-2">Family Background</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Mother's Education</p>
                    <p className="font-medium text-gray-800">{form.motherQualification || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Father's Education</p>
                    <p className="font-medium text-gray-800">{form.fatherQualification || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mother's Occupation</p>
                    <p className="font-medium text-gray-800">{form.motherOccupation || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Father's Occupation</p>
                    <p className="font-medium text-gray-800">{form.fatherOccupation || '-'}</p>
                  </div>
                </div>
              </div>
  
              {/* Academic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 border-b pb-2">Academic Information</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Course</p>
                    <p className="font-medium text-gray-800">{form.course || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Previous Qualification</p>
                    <p className="font-medium text-gray-800">{form.previousQualification || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Scholarship</p>
                    <p className="font-medium text-gray-800">{form.scholarshipHolder}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tuition Status</p>
                    <p className="font-medium text-gray-800">{form.tuitionUpToDate}</p>
                  </div>
                </div>
              </div>
  
              {/* Additional Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 border-b pb-2">Additional Info</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Special Needs</p>
                    <p className="font-medium text-gray-800">{form.specialNeeds || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Marital Status</p>
                    <p className="font-medium text-gray-800">{form.maritalStatus || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Financial Status</p>
                    <p className="font-medium text-gray-800">{form.debtor ? 'Debtor' : 'Clear'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-8">
        <Button variant='outline'
            onClick={() => {
              localStorage.removeItem('studentId');
              router.push('/landing');
            }}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-600"
          >
            Logout
          </Button>
        </div>
  
        {/* Edit Form Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Edit Profile</h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && <p className="text-red-500 mb-4">{error}</p>}

              <form className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                {(Object.keys(form) as Array<keyof typeof form>).map((field) => (
                  <div key={field}>
                    <label htmlFor={field} className="block text-sm font-medium text-gray-900 capitalize">
                      {field.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      id={field}
                      name={field}
                      value={form[field] || ''}
                      onChange={handleChange}
                      placeholder={`Enter ${field}`}
                      disabled={loading}
                      className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                ))}
              </form>

              <div className="flex justify-end gap-4 mt-6">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
  
      <footer className="bg-white border-t mt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">
              © 2024 Anvesha. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                Terms
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
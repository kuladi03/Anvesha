"use client"

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Progress from '@/components/ui/progress'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import Header from '@/components/ui/header'

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      const studentId = localStorage.getItem('studentId')
      if (!studentId) return
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student-dashboard/${studentId}`)
        setDashboardData(res.data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    }
    fetchData()
  }, [])

  if (!dashboardData) return <div className="p-6 text-center text-gray-500">Loading dashboard...</div>

  const attendancePercent = Math.round((dashboardData.attendance.present / dashboardData.attendance.total) * 100)

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="px-4 md:px-10 py-30 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-1 tracking-tight">
              Welcome, <span className="text-blue-700">{dashboardData.studentName}</span>
            </h1>
            <p className="text-gray-700 text-lg">
              Class : <span className="font-semibold">{dashboardData.studentInfo.standard}</span> · {dashboardData.studentInfo.school}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white shadow rounded-lg px-4 py-2 flex flex-col items-center">
              <span className="text-xs text-gray-500">Attendance</span>
              <span className="text-2xl font-bold text-blue-700">{attendancePercent}%</span>
            </div>
            <div className="bg-white shadow rounded-lg px-4 py-2 flex flex-col items-center">
              <span className="text-xs text-gray-500">Risk</span>
              <span className={`text-2xl font-bold ${
                dashboardData.riskLabel === "high"
                  ? "text-red-600"
                  : dashboardData.riskLabel === "medium"
                  ? "text-yellow-600"
                  : "text-green-700"
              }`}>
                {(dashboardData.riskScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {(dashboardData.ongoingCourses || []).map((course: any) => (
            <Card key={`${course.title}-${course.lastAccessed}`} className="hover:shadow-lg transition-shadow border bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">{course.title}</CardTitle>
                <CardDescription className="text-gray-600">Platform: {course.origin}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mb-2">
                  Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                </p>
                <button
                  onClick={async () => {
                    const studentId = localStorage.getItem('studentId');
                    const now = Date.now();
                    localStorage.setItem(`startTime-${course.course_id}`, now.toString());
                    localStorage.setItem('activeCourse', course.course_id);
                    const durationMinutes = 1;
                    try {
                      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activity/${studentId}/${course.courseId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ durationMinutes }),
                      });
                    } catch (error) {
                      console.error('Failed to log initial activity:', error);
                    }
                    window.open(course.joinLink, '_blank');
                  }}
                  className="bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-semibold shadow hover:bg-blue-800 transition"
                >
                  Go to Course
                </button>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-white border">
            <CardHeader>
              <CardTitle className="text-gray-900">Attendance</CardTitle>
              <CardDescription>Total: {dashboardData.attendance.total} days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-blue-700">{attendancePercent}%</span>
                <Progress value={attendancePercent} className="flex-1 h-3 rounded-full bg-gray-200" />
              </div>
              <p className="text-xs text-gray-500 mt-1">{dashboardData.attendance.present} days present</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Daily Learning Progress</CardTitle>
              <CardDescription>Engagement over recent days</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={dashboardData.dailyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="progress" stroke="#2563eb" fill="#dbeafe" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Time Spent by Subject</CardTitle>
              <CardDescription>Minutes studied per subject</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={dashboardData.timeSpent}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="minutes" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Subject Performance</CardTitle>
              <CardDescription>Latest test scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dashboardData.subjectScores.map((s: any) => (
                  <li key={s.subjectId} className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{s.subject}</span>
                    <span className="font-bold text-blue-700">{s.score}%</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Risk Indicator</CardTitle>
              <CardDescription>Dropout Risk Assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">
                  Risk Score: {(dashboardData.riskScore * 100).toFixed(0)}%
                </p>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                    dashboardData.riskLabel === "high"
                      ? "bg-red-100 text-red-600"
                      : dashboardData.riskLabel === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {dashboardData.riskLabel.charAt(0).toUpperCase() + dashboardData.riskLabel.slice(1)}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    dashboardData.riskLabel === "high"
                      ? "bg-red-500"
                      : dashboardData.riskLabel === "medium"
                      ? "bg-yellow-400"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${dashboardData.riskScore * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Student Info Snapshot</CardTitle>
            <CardDescription>From profile and demographic details</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <li><strong>Gender:</strong> {dashboardData.studentInfo.gender}</li>
              <li><strong>Age:</strong> {dashboardData.studentInfo.age}</li>
              {/* <li><strong>Caste:</strong> {dashboardData.studentInfo.caste}</li> */}
              <li><strong>Area:</strong> {dashboardData.studentInfo.area}</li>
              <li><strong>State:</strong> {dashboardData.studentInfo.state}</li>
              <li><strong>Email:</strong> {dashboardData.email}</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

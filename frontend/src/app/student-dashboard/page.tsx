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
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <main className="px-10 py-30">
        <h1 className="text-3xl text-black font-bold mb-2">Welcome, {dashboardData.studentName} 👋</h1>
        <p className="text-black mb-6">Class {dashboardData.studentInfo.standard} · {dashboardData.studentInfo.school}</p>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {(dashboardData.ongoingCourses || []).map((course: any) => (
            <Card key={`${course.title}-${course.lastAccessed}`}>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>Platform: {course.origin}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
              </p>
              <button
                onClick={async () => {
                  const studentId = localStorage.getItem('studentId');
                  const now = Date.now();

                  // Track which course is currently being opened
                  localStorage.setItem(`startTime-${course.course_id}`, now.toString());
                  localStorage.setItem('activeCourse', course.course_id);

                  // Optional: log a minimum starting duration (can skip if not needed)
                  const durationMinutes = 1;
                  try {
                    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activity/${studentId}/${course.courseId}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ durationMinutes }),
                    });
                  } catch (error) {
                    console.error('Failed to log initial activity:', error);
                  }

                  window.open(course.joinLink, '_blank');
                }}
                className="bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700"
              >
                Go to Course
              </button>

            </CardContent>
          </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
              <CardDescription>Total: {dashboardData.attendance.total} days</CardDescription>
            </CardHeader>
            <CardContent>
            <p className="text-xl font-bold">{attendancePercent}% Present</p>
              <Progress value={attendancePercent} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Learning Progress</CardTitle>
              <CardDescription>Engagement over recent Days</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={dashboardData.dailyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="progress" stroke="#6366F1" fill="#A5B4FC" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time Spent by Subject</CardTitle>
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
                  <Bar dataKey="minutes" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Latest test scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dashboardData.subjectScores.map((s: any) => (
                  <li key={s.subjectId} className="flex justify-between">
                    <span>{s.subject}</span>
                    <span className="font-medium">{s.score}%</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Indicator</CardTitle>
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
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {dashboardData.riskLabel.charAt(0).toUpperCase() + dashboardData.riskLabel.slice(1)}
                  </span>
                </div>

                {/* Custom styled progress bar */}
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

        <Card>
          <CardHeader>
            <CardTitle>Student Info Snapshot</CardTitle>
            <CardDescription>From profile and demographic details</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <li><strong>Gender:</strong> {dashboardData.studentInfo.gender}</li>
            <li><strong>Age:</strong> {dashboardData.studentInfo.age}</li>
            <li><strong>Caste:</strong> {dashboardData.studentInfo.caste}</li>
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

'use client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Progress from "@/components/ui/progress";
import {
  BarChart, LineChart, PieChart,
  Bar, Line, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import Header from "@/components/ui/header";
import Link from "next/link";

interface CourseProgress {
  courseTitle: string;
  totalMinutes: number;
}

interface DailyProgress {
  date: string;
  duration: number;
}

interface Risk {
  value: number;
  label: string;
}

interface EngagementMetric {
  metric: string;
  value: number;
  goal: number;
}

export default function PerformanceAnalytics() {
  const [courseProgressData, setCourseProgressData] = useState<CourseProgress[]>([]);
  const [timeSpentData, setTimeSpentData] = useState<CourseProgress[]>([]);
  const [dailyProgressData, setDailyProgressData] = useState<DailyProgress[]>([]);
  const [overallRisk, setOverallRisk] = useState<Risk>({ value: 0, label: "Loading..." });
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetric[]>([]);

useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) return;

    // Fetch risk data from API
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/model_predict/${studentId}`)
      .then((response) => response.json())
      .then((data) => {
        // Update state with risk label and score
        const riskValue = data.riskScore * 100; // Assuming the score is between 0 and 1, you can multiply by 100 for percentage
        setOverallRisk({
          label: data.dropoutRiskPrediction, // Risk label, e.g., "high", "medium", "low"
          value: riskValue, // Risk score converted to percentage
        });
      })
      .catch((error) => {
        console.error("Error fetching risk data:", error);
      });
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      const studentId = localStorage.getItem("studentId");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/performance/${studentId}`);
      const data = await response.json();

      if (data.error) return;

      // Process course time spent
      const courseMap: Record<string, number> = {};
      const dateMap: Record<string, number> = {};

      data.courseActivityLogs?.forEach((log: any) => {
        const courseTitle = log.courseTitle;
        let totalDuration = 0;

        log.activityLogs.forEach((entry: any) => {
          totalDuration += entry.durationMinutes;

          // Daily time aggregation
          const date = entry.date;
          dateMap[date] = (dateMap[date] || 0) + entry.durationMinutes;
        });

        courseMap[courseTitle] = (courseMap[courseTitle] || 0) + totalDuration;
      });

      const courseProgressArr = Object.entries(courseMap).map(([courseTitle, totalMinutes]) => ({
        courseTitle,
        totalMinutes,
      }));

      const dailyProgressArr = Object.entries(dateMap).map(([date, duration]) => ({
        date: new Date(date).toLocaleDateString("en-IN"), // Format date to a more readable format
        duration,
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setCourseProgressData(courseProgressArr);
      setTimeSpentData(courseProgressArr);
      setDailyProgressData(dailyProgressArr);

      // // Set Risk
      // setOverallRisk({
      //   value: data.riskScore,
      //   label: data.riskLabel,
      // });

      // Attendance estimation from active days
      if (dailyProgressArr.length) {
        const uniqueDays = new Set(dailyProgressArr.map(d => d.date));
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate(); // Dynamically calculate total days in the current month
        setEngagementMetrics([
          {
            metric: "Active Study Days",
            value: uniqueDays.size,
            goal: totalDays,
          }
        ]);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Header />
      <div className="container mx-auto px-10 py-30 min-h-screen bg-gray-100 text-black">
        <h1 className="text-3xl font-bold mb-6">Performance Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Time Spent</CardTitle>
              <CardDescription>Total minutes spent on each course</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                  dataKey="courseTitle" 
                  tick={{ fontSize: 10 }} 
                  interval={0} 
                  angle={-45} 
                  textAnchor="end" 
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalMinutes" fill="#3B82F6" name="Minutes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time Distribution</CardTitle>
              <CardDescription>Proportional time spent per course</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                  dataKey="totalMinutes" 
                  data={timeSpentData} 
                  fill="#3B82F6" 
                  nameKey="courseTitle" 
                  label={({ name }) => name} // Simple label rendering
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Daily Study Trends</CardTitle>
            <CardDescription>Study activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="duration" stroke="#3B82F6" name="Minutes" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Dropout Risk Assessment</CardTitle>
            <CardDescription>Calculated from performance and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Overall Risk</span>
                  <span className="text-sm font-medium">{overallRisk.label}</span>
                </div>
                <Progress value={overallRisk.value} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance (Based on Activity)</CardTitle>
            <CardDescription>Presence tracked from daily logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {engagementMetrics.map((metric, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{metric.metric}</span>
                    <span className="text-sm font-medium">{metric.value} / {metric.goal}</span>
                  </div>
                  <Progress value={(metric.value / metric.goal) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-gray-500">© 2024 Anvesha.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs text-blue-600 hover:underline" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs text-blue-600 hover:underline" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

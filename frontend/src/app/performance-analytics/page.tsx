'use client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Progress from "@/components/ui/progress";
import {
  BarChart, LineChart,
  Bar, Line, 
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
  const [timeSpentData,setTimeSpentData] = useState<CourseProgress[]>([]);
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
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container px-10 py-30 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="shadow-xl border-0 bg-white">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Course Time Spent</CardTitle>
          <CardDescription className="text-gray-500">Total minutes spent on each course</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
          <BarChart data={courseProgressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
            dataKey="courseTitle"
            tick={{ fontSize: 12, fill: "#374151" }}
            interval={0}
            angle={-30}
            textAnchor="end"
            />
            <YAxis tick={{ fill: "#374151" }} />
            <Tooltip contentStyle={{ background: "#f3f4f6", borderRadius: 8, color: "#374151" }} />
            <Legend />
            <Bar dataKey="totalMinutes" fill="#6366f1" name="Minutes" radius={[8, 8, 0, 0]} />
          </BarChart>
          </ResponsiveContainer>
        </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-white">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Daily Study Trends</CardTitle>
          <CardDescription className="text-gray-500">Study activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
          <LineChart data={dailyProgressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fill: "#374151" }} />
            <YAxis tick={{ fill: "#374151" }} />
            <Tooltip contentStyle={{ background: "#f3f4f6", borderRadius: 8, color: "#374151" }} />
            <Legend />
            <Line
            type="monotone"
            dataKey="duration"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 5, fill: "#818cf8" }}
            activeDot={{ r: 8, fill: "#6366f1" }}
            name="Minutes"
            />
          </LineChart>
          </ResponsiveContainer>
        </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="shadow-xl border-0 bg-white">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Dropout Risk Assessment</CardTitle>
          <CardDescription className="text-gray-500">Calculated from performance and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Risk</span>
            <span
              className={`text-sm font-bold px-2 py-1 rounded ${
              overallRisk.label === "high"
                ? "bg-red-100 text-red-700"
                : overallRisk.label === "medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
              }`}
            >
              {overallRisk.label}
            </span>
            </div>
            <Progress
            value={overallRisk.value}
            className={`h-3 rounded-full ${
              overallRisk.label === "high"
              ? "bg-red-200"
              : overallRisk.label === "medium"
              ? "bg-yellow-200"
              : "bg-green-200"
            }`}
            />
            <div className="text-xs text-gray-400 mt-1 text-right">
            {overallRisk.value.toFixed(1)}%
            </div>
          </div>
          </div>
        </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-white">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Attendance (Based on Activity)</CardTitle>
          <CardDescription className="text-gray-500">Presence tracked from daily logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
          {engagementMetrics.map((metric, index) => (
            <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">{metric.metric}</span>
              <span className="text-sm font-semibold text-gray-800">
              {metric.value} / {metric.goal}
              </span>
            </div>
            <Progress
              value={(metric.value / metric.goal) * 100}
              className="h-3 rounded-full bg-indigo-200"
            />
            <div className="text-xs text-gray-400 mt-1 text-right">
              {((metric.value / metric.goal) * 100).toFixed(1)}%
            </div>
            </div>
          ))}
          </div>
        </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}

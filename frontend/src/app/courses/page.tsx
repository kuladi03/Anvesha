'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CourseSearch } from "@/components/courses/CourseSearch";

interface Course {
    course_id: string;
    title: string;
    instructor: string;
    discipline: string;
    institute: string;
    duration: string;
    course_type: string;
    exam_date: string;
    level: string;
    category: string;
    fdp: string;
    nptel_domain: string;
    join_link: string;
    nptel_url: string;
    origin: string;
    coordinating_institute?: string; // <- added
  }
  

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/courses');
        const rawData = res.data;
  
        if (Array.isArray(rawData)) {
          const cleanedCourses = rawData.map((item) => ({
            ...item,
            coordinating_institute: item["\nCo-ordinating Institute"] || item["coordinating_institute"] || '',
          }));
  
          console.log("✅ Courses received:", cleanedCourses); // ✅ Keep this for sanity check
          setCourses(cleanedCourses as Course[]);
        } else {
          console.error("❌ Unexpected response format (not array):", rawData);
        }
      } catch (err) {
        console.error("❌ Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCourses();
  }, []);
  
  
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && course.course_type === "New") ||
      (filterStatus === "completed" && course.course_type === "Rerun") ||
      (filterStatus === "upcoming" && new Date(course.exam_date) > new Date());
  
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-700">
        Explore NPTEL Courses
      </h1>
  
      <div className="max-w-4xl mx-auto mb-10 text-gray-700">
        <CourseSearch
          onSearch={setSearchTerm}
          onFilterChange={setFilterStatus}
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading courses...</p>
      ) : filteredCourses.length === 0 ? (
        <p className="text-center text-gray-500">No courses found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <Card
              key={course.course_id}
              className="relative bg-white shadow-lg rounded-lg transition duration-200 hover:shadow-xl"
            >
              {/* Origin badge */}
              {course.origin && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-md shadow-md">
                  {course.origin}
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-purple-800 leading-snug">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500 mt-1">
                  {course.discipline}
                </CardDescription>
              </CardHeader>
  
              <CardContent className="space-y-2 text-sm text-gray-700">
                <div>
                  <span className="font-medium text-gray-800">Instructor:</span>{" "}
                  {course.instructor}
                </div>
                <div>
                  <span className="font-medium text-gray-800">Institute:</span>{" "}
                  {course.institute}
                </div>
                <div>
                  <span className="font-medium text-gray-800">Duration:</span>{" "}
                  {course.duration}
                </div>
                <div>
                  <span className="font-medium text-gray-800">Level:</span>{" "}
                  {course.level} | {course.category}
                </div>
                <div>
                  <span className="font-medium text-gray-800">Type:</span>{" "}
                  {course.course_type}
                </div>
                    {course.exam_date && (
                      <div>
                        <span className="font-medium text-gray-800">Exam Date:</span>{" "}
                        {new Date(course.exam_date).toLocaleDateString()}
                      </div>
                    )}
                    {course.nptel_domain && (
      <div>
        <span className="font-medium text-gray-800">Domain:</span>{" "}
        {course.nptel_domain}
      </div>
    )}

    <div className="pt-3 flex gap-2 justify-end">
      <a
        href={course.nptel_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" className="text-purple-700 border-purple-500 hover:bg-purple-100">
          Go to Course
        </Button>
      </a>

      <a
        href={course.join_link}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="primary" className="bg-purple-600 hover:bg-purple-700">
          Join Now
        </Button>
      </a>
    </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}  
// Updated AdaptiveLearningPaths.tsx (client component)

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Users } from 'lucide-react';
import Header from '@/components/ui/header';
import { CourseSearch } from '@/components/courses/CourseSearch';

interface Course {
  _id?: string;
  course_id: string;
  title: string;
  instructor?: string;
  discipline?: string;
  institute?: string;
  duration?: string;
  course_type?: string;
  exam_date?: string;
  level?: string;
  category?: string;
  fdp?: string;
  nptel_domain?: string;
  join_link: string;
  nptel_url?: string;
  origin: string;
  lastAccessed?: string;
  timeSpent?: number;
}

export default function AdaptiveLearningPaths() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('current-path');
  const [learningPaths, setLearningPaths] = useState<Course[]>([]);
  const [recommendedPaths, setRecommendedPaths] = useState<Course[]>([]);
  // const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const filteredPaths = learningPaths.filter((course) =>
    course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleActivityLog = async () => {
      const studentId = localStorage.getItem('studentId');
      const courseId = localStorage.getItem('activeCourse');
      if (!studentId || !courseId) return;
  
      const key = `startTime-${courseId}`;
      const storedStart = localStorage.getItem(key);
      if (!storedStart) return;
  
      const startTime = parseInt(storedStart);
      const endTime = Date.now();
      const durationMinutes = Math.floor((endTime - startTime) / 60000);
  
      if (durationMinutes > 0) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activity/${studentId}/${courseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ durationMinutes }),
          });
        } catch (error) {
          console.error('Failed to log return activity:', error);
        }
  
        // Clean up
        localStorage.removeItem(key);
        localStorage.removeItem('activeCourse');
      }
    };
  
    window.addEventListener('focus', handleActivityLog);
    return () => window.removeEventListener('focus', handleActivityLog);
  }, []);  

   useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    
    const fetchLearningPaths = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activity/${studentId}`);
        const rawData = await res.json();
  
        // Normalize field names
        const normalizedData = rawData.map((item: any) => ({
          _id: item._id,
          course_id: item.courseId,
          title: item.courseTitle,
          origin: item.origin,
          join_link: item.joinLink,
          lastAccessed: item.lastAccessed,
          timeSpent: item.activityLogs?.reduce((acc: number, log: any) => acc + (log.durationMinutes || 0
          ), 0) || 0,
        }));
  
        setLearningPaths(normalizedData);
      } catch (error) {
        console.error('Failed to fetch learning paths:', error);
      } finally {
        setLoading(false);
      }
    };
  
    // ✅ Call the function here
    fetchLearningPaths();
  }, []);
  

  useEffect(() => {
    const fetchRecommendedPaths = async () => {
      try {
        const studentId = localStorage.getItem('studentId');
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recommendations/${studentId}`);
        const data = await res.json();
        setRecommendedPaths(data);
      } catch (error) {
        console.error('Failed to fetch recommended paths:', error);
      }
    };
  
    fetchRecommendedPaths();
  }, []);
  
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/courses`);
        const data = await res.json();
        setAllCourses(data);
      } catch (error) {
        console.error('Failed to fetch all courses:', error);
      }
    };
  
    fetchAllCourses();
  }, []);

  useEffect(() => {
    const handleBlur = () => {
      const activeCourseId = localStorage.getItem('activeCourse');
      if (activeCourseId) {
        localStorage.setItem(`startTime-${activeCourseId}`, Date.now().toString());
      }
    };
  
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);
  

  const handleAddToPath = async (course: Course) => {
    const studentId = localStorage.getItem('studentId');
    const payload = {
      studentId,
      courseId: course.course_id,
      courseTitle: course.title,
      origin: course.origin,
      joinLink: course.join_link,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setLearningPaths((prev) => [...prev, course]);
        alert('Course added to your path.');
      } else {
        const error = await res.json();
        alert(error.error || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Failed to add course:', err);
    }
  };

  const renderCourseCard = (course: Course, isLearningPath = false) => (
    <Card
      key={course.course_id || course.title}
      className="relative bg-white shadow-md rounded-xl transition-transform duration-200 hover:scale-[1.02] hover:shadow-2xl border border-gray-100"
    >
      {course.origin && (
        <div className="absolute top-3 right-3 bg-blue-700 text-white text-xs px-3 py-1 rounded-full shadow z-10 font-semibold tracking-wide">
          {course.origin}
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900 mb-1 truncate">
          {course.title}
        </CardTitle>
        {course.discipline && (
          <CardDescription className="text-xs text-gray-500 mt-0.5">
            {course.discipline}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-1.5 text-sm text-gray-700">
        {course.instructor && (
          <div>
            <span className="font-semibold text-gray-800">Instructor:</span> {course.instructor}
          </div>
        )}
        {course.institute && (
          <div>
            <span className="font-semibold text-gray-800">Institute:</span> {course.institute}
          </div>
        )}
        {course.duration && (
          <div>
            <span className="font-semibold text-gray-800">Duration:</span> {course.duration}
          </div>
        )}
        {course.level && (
          <div>
            <span className="font-semibold text-gray-800">Level:</span> {course.level}
          </div>
        )}
        {course.nptel_domain && (
          <div>
            <span className="font-semibold text-gray-800">Domain:</span> {course.nptel_domain}
          </div>
        )}
        {isLearningPath && (
          <div className="flex flex-col gap-0.5">
            <div>
              <span className="font-semibold text-gray-800">Time Spent:</span>{' '}
              <span className="text-gray-600">{course.timeSpent || 0} mins</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">Last Accessed:</span>{' '}
              <span className="text-gray-600">
                {course.lastAccessed
                  ? new Date(course.lastAccessed).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        )}

        <div className="pt-4 flex flex-wrap gap-2 justify-end">
          {course.nptel_url && (
            <a href={course.nptel_url} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="text-blue-700 border-blue-500 hover:bg-blue-50 font-medium"
              >
                View Details
              </Button>
            </a>
          )}
          <Button
            variant="default"
            className="bg-blue-700 hover:bg-blue-800 font-semibold shadow"
            onClick={async (e) => {
              e.preventDefault();
              const studentId = localStorage.getItem('studentId');
              const now = Date.now();

              localStorage.setItem(`startTime-${course.course_id}`, now.toString());
              localStorage.setItem('activeCourse', course.course_id);

              const durationMinutes = 1;
              try {
                await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activity/${studentId}/${course.course_id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ durationMinutes }),
                });
              } catch (error) {
                console.error('Failed to log initial activity:', error);
              }

              window.open(course.join_link, '_blank');
            }}
          >
            {isLearningPath ? 'Continue Learning' : 'Join Course'}
          </Button>

          {!isLearningPath && (
            <Button
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
              onClick={(e) => {
                e.preventDefault();
                handleAddToPath(course);
              }}
            >
              Add to My Path
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="px-4 md:px-10 py-30 max-w-7xl mx-auto text-black">
        <h1 className="text-3xl font-bold mb-6">Adaptive Learning Paths</h1>
  
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
  <TabsList>
    <TabsTrigger
      value="current-path"
      isSelected={currentTab === "current-path"}
      onClick={setCurrentTab}
    >
      Current Path
    </TabsTrigger>
    <TabsTrigger
      value="recommended-paths"
      isSelected={currentTab === "recommended-paths"}
      onClick={setCurrentTab}
    >
      Recommended Paths
    </TabsTrigger>
        <TabsTrigger
      value="all-courses"
      isSelected={currentTab === "all-courses"}
      onClick={setCurrentTab}
    >
      All Courses
    </TabsTrigger>
  </TabsList>

  <TabsContent isActive={currentTab === "current-path"}>
  <CourseSearch onSearch={setSearchTerm} onFilterChange={() => {}} />
    
  {loading ? (
    <p>Loading...</p>
  ) : (
    <>
      {learningPaths.length === 0 ? (
        <p>No current learning paths found.</p>
      ) : (
        <>
          {filteredPaths.length === 0 ? (
            <p>No matching courses found.</p>
          ) : (
            <div className="space-y-4 my-4">
              <h3 className="text-lg font-semibold">Filtered Results</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPaths.map((course) => (
                  <div key={course._id || course.course_id}>
                    {renderCourseCard(course, true)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )}
</TabsContent>


<TabsContent isActive={currentTab === "recommended-paths"}>
  <CourseSearch onSearch={setSearchTerm} onFilterChange={() => {}} />

  {searchTerm.trim() !== '' ? (
    <>
      <h3 className="text-lg font-semibold mt-4 mb-2">Search Results</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedPaths
          .filter((course) => {
            const title = course?.title?.toLowerCase?.() || '';
            return title.includes(searchTerm.toLowerCase());
          })
          .map((course) => (
            <div key={course._id || course.course_id}>
              {renderCourseCard(course)}
            </div>
          ))}
      </div>
    </>
  ) : (
    <>
      <h3 className="text-lg font-semibold mt-6 mb-2">Recommended For You</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedPaths.map((course) => (
          <div key={course._id || course.course_id}>
            {renderCourseCard(course)}
          </div>
        ))}
      </div>
    </>
  )}
</TabsContent>

    <TabsContent isActive={currentTab === "all-courses"}>
      <CourseSearch onSearch={setSearchTerm} onFilterChange={() => {}} />

      {searchTerm.trim() !== '' ? (
        <>
          <h3 className="text-lg font-semibold mt-4 mb-2">Search Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourses
              .filter((course) => {
                const title = course?.title?.toLowerCase?.() || '';
                return title.includes(searchTerm.toLowerCase());
              })
              .map((course) => (
                <div key={course._id || course.course_id}>
                  {renderCourseCard(course)}
                </div>
              ))}
          </div>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold mt-6 mb-2">All Courses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourses.map((course) => (
              <div key={course._id || course.course_id}>
                {renderCourseCard(course)}
              </div>
            ))}
          </div>
        </>
      )}
    </TabsContent>
</Tabs>

      </div>
    </div>
  );
}  

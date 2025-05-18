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
      className="relative bg-white shadow-lg rounded-lg transition duration-200 hover:shadow-xl"
    >
      {course.origin && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md shadow-md">
          {course.origin}
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-blue-800 leading-snug">
          {course.title}
        </CardTitle>
        {course.discipline && (
          <CardDescription className="text-sm text-gray-500 mt-1">
            {course.discipline}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-gray-700">
        {course.instructor && (
          <div>
            <span className="font-medium">Instructor:</span> {course.instructor}
          </div>
        )}
        {course.institute && (
          <div>
            <span className="font-medium">Institute:</span> {course.institute}
          </div>
        )}
        {course.duration && (
          <div>
            <span className="font-medium">Duration:</span> {course.duration}
          </div>
        )}
        {course.level && (
          <div>
            <span className="font-medium">Level:</span> {course.level}
          </div>
        )}
        {course.nptel_domain && (
          <div>
            <span className="font-medium">Domain:</span> {course.nptel_domain}
          </div>
        )}
        {isLearningPath && (
          <>
            <div>
              <span className="font-medium">Time Spent:</span>{' '}
              {course.timeSpent || 0} mins
            </div>
            <div>
              <span className="font-medium">Last Accessed:</span>{' '}
              {course.lastAccessed
                ? new Date(course.lastAccessed).toLocaleDateString()
                : 'N/A'}
            </div>
          </>
        )}

        <div className="pt-3 flex gap-2 justify-end">
          {course.nptel_url && (
            <a href={course.nptel_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="text-blue-700 border-blue-500 hover:bg-blue-100">
                View Course
              </Button>
            </a>
          )}
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={async () => {
                const studentId = localStorage.getItem('studentId');
                const now = Date.now();

                // Track which course is currently being opened
                localStorage.setItem(`startTime-${course.course_id}`, now.toString());
                localStorage.setItem('activeCourse', course.course_id);

                // Optional: log a minimum starting duration (can skip if not needed)
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
              {isLearningPath ? 'Continue' : 'Join Now'}
            </Button>

          {!isLearningPath && (
            <Button variant="outline" onClick={() => handleAddToPath(course)}>
              Add to My Path
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <Header />
      <div className="container mx-auto px-10 py-30 min-h-screen bg-gray-100 text-black">
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

    <TabsTrigger
      value="study-rooms"
      isSelected={currentTab === "study-rooms"}
      onClick={setCurrentTab}
    >
      Study Rooms
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


  <TabsContent isActive={currentTab === "study-rooms"}>
    <Card>
      <CardHeader>
        <CardTitle>Collaborative Study Rooms</CardTitle>
        <CardDescription>Join or create a virtual study room</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          <li className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Python Coding Challenge</h3>
              <p className="text-sm text-muted-foreground">7 participants | Topic: Algorithms</p>
            </div>
            <Button>Join Room</Button>
          </li>
        </ul>
        <Button className="w-full mt-4" variant="outline">
          <Users className="mr-2 h-4 w-4" />
          Create New Study Room
        </Button>
      </CardContent>
    </Card>
  </TabsContent>
</Tabs>

      </div>
    </div>
  );
}  

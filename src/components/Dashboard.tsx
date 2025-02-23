import React, { useState } from 'react';
import { Youtube, FileText, History, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  darkMode: boolean;
}

interface Course {
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  progress?: number;
  difficulty?: string;
  duration: string;
  instructor: string;
}

function Dashboard({ darkMode }: DashboardProps) {
  const navigate = useNavigate();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  const previousCourses: Course[] = [
    {
      title: "Complete React Course 2024",
      description: "Master React 18 with Hooks, Context, Redux Toolkit and TypeScript",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=u6gSSpfsoOQ",
      progress: 75,
      duration: "8h 45m",
      instructor: "Maximilian Schwarzmüller"
    },
    {
      title: "Node.js Backend Masterclass",
      description: "Build scalable Node.js REST APIs with Express, TypeScript and MongoDB",
      thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=Oe421EPjeBE",
      progress: 90,
      duration: "6h 30m",
      instructor: "John Smilga"
    },
    {
      title: "TypeScript Deep Dive",
      description: "Advanced TypeScript concepts, design patterns and best practices",
      thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=30LWjhZzg50",
      progress: 45,
      duration: "5h 15m",
      instructor: "Matt Pocock"
    }
  ];

  const suggestedCourses: Course[] = [
    {
      title: "Next.js 14 Full Course",
      description: "Build modern web applications with Next.js 14 and Server Components",
      thumbnail: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&h=400&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=ZVnjOPwW4ZA",
      difficulty: "Intermediate",
      duration: "10h 20m",
      instructor: "Lee Robinson"
    },
    {
      title: "Modern Python Development",
      description: "Learn Python with FastAPI, SQLAlchemy and modern development practices",
      thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=tLKKmouUams",
      difficulty: "Beginner",
      duration: "7h 30m",
      instructor: "Patrick Loeber"
    },
    {
      title: "Rust Programming Language",
      description: "Complete guide to Rust programming from basics to advanced concepts",
      thumbnail: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=400&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=BpPEoZW5IiY",
      difficulty: "Advanced",
      duration: "12h 45m",
      instructor: "Ryan Levick"
    }
  ];

  const handleProcessVideo = () => {
    if (youtubeUrl) {
      navigate('/video-player', { state: { url: youtubeUrl } });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      navigate('/document-learning');
    }
  };

  const handleCourseClick = (videoUrl: string) => {
    navigate('/video-player', { state: { url: videoUrl } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center mb-4">
            <Youtube className="mr-2 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">YouTube URL</h2>
          </div>
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter YouTube URL"
          />
          <button 
            className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            onClick={handleProcessVideo}
          >
            Process Video
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center mb-4">
            <FileText className="mr-2 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Document Upload</h2>
          </div>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              className="hidden"
              id="document-upload"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="document-upload"
              className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Upload Document
            </label>
          </div>
        </div>
      </div>

      <section className="mb-12">
        <div className="flex items-center mb-6">
          <History className="mr-2 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Continue Learning</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {previousCourses.map((course, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => handleCourseClick(course.videoUrl)}
            >
              <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{course.description}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{course.instructor}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{course.duration}</span>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                    <div
                      style={{ width: `${course.progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{course.progress}% Complete</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center mb-6">
          <Lightbulb className="mr-2 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended Courses</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestedCourses.map((course, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => handleCourseClick(course.videoUrl)}
            >
              <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{course.description}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{course.instructor}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{course.duration}</span>
                </div>
                <span className="inline-block px-2 py-1 text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 rounded">
                  {course.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
import { useState } from "react";
import { Book, Clock, Star, ChevronRight, Search } from "lucide-react";

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: "all", name: "All Courses" },
    { id: "web", name: "Web Security" },
    { id: "network", name: "Network Security" },
    { id: "crypto", name: "Cryptography" },
    { id: "forensics", name: "Digital Forensics" },
  ];

  const courses = [
    {
      id: 1,
      title: "Web Security Fundamentals",
      description:
        "Learn the basics of web security, including XSS, CSRF, and SQL injection.",
      category: "web",
      duration: "4 hours",
      level: "Beginner",
      rating: 4.8,
      enrolled: 1234,
    },
    {
      id: 2,
      title: "Network Penetration Testing",
      description:
        "Master the art of network penetration testing and vulnerability assessment.",
      category: "network",
      duration: "6 hours",
      level: "Intermediate",
      rating: 4.9,
      enrolled: 892,
    },
    // Add more courses as needed
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Courses
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full md:w-auto pl-10 pr-4 py-2 bg-white dark:bg-cyber-black border border-gray-300 
              dark:border-cyber-green rounded-lg focus:outline-none focus:ring-1 focus:ring-cyber-green 
              text-gray-900 dark:text-white transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div
        className="flex space-x-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 
        dark:scrollbar-thumb-cyber-green scrollbar-track-transparent"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === category.id
                ? "bg-cyber-green text-white"
                : "border border-gray-300 dark:border-cyber-green text-gray-700 dark:text-cyber-green hover:bg-cyber-green hover:text-white"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green 
              rounded-lg overflow-hidden hover:shadow-lg dark:hover:border-opacity-80 transition-all"
          >
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {course.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {course.description}
              </p>

              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-400" />
                  {course.rating}
                </div>
                <div className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">
                  {course.level}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {course.enrolled.toLocaleString()} enrolled
                </span>
                <button
                  className="flex items-center text-cyber-green hover:text-cyber-green/80 
                  transition-colors group"
                >
                  Start Course
                  <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State - Simplified */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            No courses found matching your search.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-cyber-black/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyber-green border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}

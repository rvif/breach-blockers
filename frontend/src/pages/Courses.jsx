import { useState } from "react";
import {
  Book,
  Clock,
  Star,
  ChevronRight,
  Search,
  Filter,
  X,
} from "lucide-react";

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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
    <div className="space-y-6 relative">
      {/* Header - Enhanced for mobile */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Courses
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden p-2 rounded-lg border border-gray-300 dark:border-cyber-green 
              hover:bg-cyber-green/10 transition-colors"
          >
            <Filter className="h-5 w-5 text-gray-600 dark:text-cyber-green" />
          </button>
        </div>

        {/* Search - Full width on mobile */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-cyber-black border border-gray-300 
              dark:border-cyber-green rounded-lg focus:outline-none focus:ring-1 focus:ring-cyber-green 
              text-gray-900 dark:text-white transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories - Mobile Dropdown */}
      <div
        className={`md:block ${showFilters ? "block" : "hidden"} 
        fixed md:relative top-0 md:top-auto left-0 md:left-auto w-full md:w-auto h-full md:h-auto 
        bg-white/95 dark:bg-cyber-black/95 md:bg-transparent z-50 md:z-auto
        transform transition-transform duration-300 ease-out ${
          showFilters ? "translate-y-0" : "-translate-y-full md:translate-y-0"
        }`}
      >
        <div className="p-4 md:p-0">
          <div className="flex md:hidden justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Filters
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-cyber-green/10 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-cyber-green" />
            </button>
          </div>

          <div
            className="flex flex-col md:flex-row gap-2 md:gap-4 md:overflow-x-auto md:pb-2 
            md:scrollbar-thin md:scrollbar-thumb-gray-300 md:dark:scrollbar-thumb-cyber-green 
            md:scrollbar-track-transparent"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setShowFilters(false);
                }}
                className={`px-4 py-3 md:py-2 rounded-lg transition-colors text-left md:text-center 
                  ${
                    selectedCategory === category.id
                      ? "bg-cyber-green text-white"
                      : "border border-gray-300 dark:border-cyber-green text-gray-700 dark:text-cyber-green hover:bg-cyber-green hover:text-white"
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course Grid - Responsive layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="group bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green 
              rounded-lg overflow-hidden hover:shadow-lg dark:hover:border-opacity-80 transition-all"
          >
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              <h3
                className="text-lg md:text-xl font-bold text-gray-900 dark:text-white 
                group-hover:text-cyber-green dark:group-hover:text-cyber-green transition-colors"
              >
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
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

              <div
                className="flex items-center justify-between pt-3 md:pt-4 
                border-t border-gray-100 dark:border-gray-800"
              >
                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  {course.enrolled.toLocaleString()} enrolled
                </span>
                <button
                  className="flex items-center text-cyber-green hover:text-cyber-green/80 
                    transition-colors group/btn text-sm md:text-base"
                >
                  Start Course
                  <ChevronRight className="h-4 w-4 ml-1 transform group-hover/btn:translate-x-1 transition-transform" />
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

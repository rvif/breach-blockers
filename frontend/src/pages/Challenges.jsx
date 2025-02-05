import { useState } from "react";
import {
  Trophy,
  Target,
  Flag,
  Search,
  AlertTriangle,
  Filter,
  X,
} from "lucide-react";

export default function Challenges() {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const difficulties = [
    { id: "all", name: "All Levels" },
    { id: "easy", name: "Easy" },
    { id: "medium", name: "Medium" },
    { id: "hard", name: "Hard" },
  ];

  const challenges = [
    {
      id: 1,
      title: "SQL Injection 101",
      description:
        "Practice basic SQL injection techniques on a vulnerable web application.",
      category: "Web",
      difficulty: "easy",
      points: 100,
      solvedBy: 234,
      isCompleted: false,
    },
    {
      id: 2,
      title: "Packet Analysis",
      description:
        "Analyze network traffic to find hidden messages and security threats.",
      category: "Network",
      difficulty: "medium",
      points: 250,
      solvedBy: 156,
      isCompleted: true,
    },
    // Add more challenges as needed
  ];

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch = challenge.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      difficulty === "all" || challenge.difficulty === difficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-6 relative">
      {/* Header - Enhanced for mobile */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Challenges
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
            placeholder="Search challenges..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-cyber-black border border-gray-300 
              dark:border-cyber-green rounded-lg focus:outline-none focus:ring-1 focus:ring-cyber-green 
              text-gray-900 dark:text-white transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Difficulty Filter - Mobile Dropdown */}
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
              Difficulty
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
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                onClick={() => {
                  setDifficulty(diff.id);
                  setShowFilters(false);
                }}
                className={`px-4 py-3 md:py-2 rounded-lg transition-colors text-left md:text-center 
                  ${
                    difficulty === diff.id
                      ? "bg-cyber-green text-white"
                      : "border border-gray-300 dark:border-cyber-green text-gray-700 dark:text-cyber-green hover:bg-cyber-green hover:text-white"
                  }`}
              >
                {diff.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Challenges Grid - Responsive layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className="group bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg 
              overflow-hidden hover:border-opacity-80 transition-all shadow-sm hover:shadow-lg dark:shadow-none"
          >
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    challenge.difficulty === "easy"
                      ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-500"
                      : challenge.difficulty === "medium"
                      ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-500"
                      : "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500"
                  }`}
                >
                  {challenge.difficulty.toUpperCase()}
                </span>
                {challenge.isCompleted && (
                  <Trophy className="h-5 w-5 text-cyber-green" />
                )}
              </div>

              <h3
                className="text-lg md:text-xl font-bold text-gray-900 dark:text-white 
                group-hover:text-cyber-green dark:group-hover:text-cyber-green transition-colors"
              >
                {challenge.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {challenge.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  {challenge.points} pts
                </div>
                <div className="flex items-center">
                  <Flag className="h-4 w-4 mr-1" />
                  {challenge.solvedBy} solves
                </div>
                <div className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">
                  {challenge.category}
                </div>
              </div>

              <button
                className="w-full px-4 py-2 bg-cyber-green text-white rounded-lg 
                hover:bg-opacity-90 transition-colors text-sm md:text-base"
              >
                {challenge.isCompleted ? "View Solution" : "Start Challenge"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Warning Notice - Mobile responsive */}
      <div
        className="flex items-start md:items-center gap-3 md:space-x-2 bg-yellow-50 dark:bg-yellow-500/10 
        border border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-500 p-4 rounded-lg"
      >
        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 md:mt-0" />
        <p className="text-xs md:text-sm">
          Remember to only practice these techniques in controlled, legal
          environments.
        </p>
      </div>
    </div>
  );
}

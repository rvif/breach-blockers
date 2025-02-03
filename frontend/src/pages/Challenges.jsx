import { useState } from "react";
import { Trophy, Target, Flag, Search, AlertTriangle } from "lucide-react";

export default function Challenges() {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Challenges
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search challenges..."
            className="pl-10 pr-4 py-2 bg-white dark:bg-cyber-black border border-gray-300 dark:border-cyber-green rounded-lg 
              focus:outline-none focus:ring-1 focus:ring-cyber-green text-gray-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {difficulties.map((diff) => (
          <button
            key={diff.id}
            onClick={() => setDifficulty(diff.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              difficulty === diff.id
                ? "bg-cyber-green text-white"
                : "border border-gray-300 dark:border-cyber-green text-gray-700 dark:text-cyber-green hover:bg-cyber-green hover:text-white"
            }`}
          >
            {diff.name}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg 
              overflow-hidden hover:border-opacity-80 transition-all shadow-sm hover:shadow-lg dark:shadow-none"
          >
            <div className="p-6 space-y-4">
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

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {challenge.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {challenge.description}
              </p>

              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  {challenge.points} pts
                </div>
                <div className="flex items-center">
                  <Flag className="h-4 w-4 mr-1" />
                  {challenge.solvedBy} solves
                </div>
                <div>{challenge.category}</div>
              </div>

              <button
                className="w-full px-4 py-2 bg-cyber-green text-white rounded-lg 
                hover:bg-opacity-90 transition-colors"
              >
                {challenge.isCompleted ? "View Solution" : "Start Challenge"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Warning Notice */}
      <div
        className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-500/10 
        border border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-500 p-4 rounded-lg"
      >
        <AlertTriangle className="h-5 w-5" />
        <p className="text-sm">
          Remember to only practice these techniques in controlled, legal
          environments.
        </p>
      </div>
    </div>
  );
}

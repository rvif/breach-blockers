import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, Navigate } from "react-router-dom";
import { Trophy, Target, Book, Star } from "lucide-react";

// Updated DUMMY_USERS with more creative activities
const DUMMY_USERS = {
  "john.doe": {
    name: "John Doe",
    joinDate: "2024-01-15",
    stats: {
      completedChallenges: 12,
      currentStreak: 5,
      totalPoints: 2500,
      rank: "Advanced",
    },
    recentActivities: [
      {
        type: "challenge",
        name: "The Cookie Monster",
        date: "2024-03-15",
        points: 150,
      },
      {
        type: "achievement",
        name: "First Blood: SQL Injection",
        date: "2024-03-14",
      },
      {
        type: "course",
        name: "Web App Penetration Testing",
        date: "2024-03-14",
        progress: 75,
      },
      {
        type: "challenge",
        name: "XSS Maze Runner",
        date: "2024-03-13",
        points: 200,
      },
      {
        type: "achievement",
        name: "Bug Hunter: Level 1",
        date: "2024-03-12",
      },
      {
        type: "course",
        name: "Cryptography Basics",
        date: "2024-03-12",
        progress: 40,
      },
      {
        type: "challenge",
        name: "Buffer Overflow Basics",
        date: "2024-03-11",
        points: 175,
      },
      {
        type: "achievement",
        name: "Speed Demon: Solved in 5 minutes",
        date: "2024-03-10",
      },
      {
        type: "challenge",
        name: "JWT Token Troubles",
        date: "2024-03-09",
        points: 125,
      },
      {
        type: "course",
        name: "Social Engineering Tactics",
        date: "2024-03-08",
        progress: 90,
      },
    ],
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { username } = useParams();

  // Check if username exists in dummy data or matches current user
  const isValidUser =
    DUMMY_USERS[username] ||
    (user && (user.username === username || user.name === username));

  // Redirect to NotFound if invalid username
  if (!isValidUser) {
    return <Navigate to="/404" replace />;
  }

  // Use dummy data or create default data for current user
  const profileData = DUMMY_USERS[username] || {
    name: user.name,
    joinDate: "2024-01-01",
    stats: {
      completedChallenges: 1,
      currentStreak: 4,
      totalPoints: 100,
      rank: "Novice",
    },
    recentActivities: [
      {
        type: "achievement",
        name: "Welcome to Br3achBl0ckers!",
        date: new Date().toISOString(),
      },
      {
        type: "course",
        name: "Introduction to Cybersecurity",
        date: new Date().toISOString(),
        progress: 15,
      },
      {
        type: "challenge",
        name: "Your First CTF",
        date: new Date().toISOString(),
        points: 50,
      },
    ],
  };

  const isOwnProfile =
    user && (user.username === username || user.name === username);

  return (
    <div className="space-y-6 px-4 md:px-0">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isOwnProfile
            ? `Welcome back, ${profileData.name}!`
            : `${profileData.name}'s Profile`}
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          {isOwnProfile
            ? "Continue your cybersecurity journey where you left off."
            : `Member since ${new Date(
                profileData.joinDate
              ).toLocaleDateString()}`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg p-3 md:p-4">
          <Trophy className="h-6 w-6 md:h-8 md:w-8 text-cyber-green mb-2" />
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Completed Challenges
          </p>
          <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
            {profileData.stats.completedChallenges}
          </h3>
        </div>

        <div className="bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg p-3 md:p-4">
          <Target className="h-6 w-6 md:h-8 md:w-8 text-cyber-green mb-2" />
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Current Streak
          </p>
          <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
            {profileData.stats.currentStreak} days
          </h3>
        </div>

        <div className="bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg p-3 md:p-4">
          <Star className="h-6 w-6 md:h-8 md:w-8 text-cyber-green mb-2" />
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Total Points
          </p>
          <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
            {profileData.stats.totalPoints}
          </h3>
        </div>

        <div className="bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg p-3 md:p-4">
          <Book className="h-6 w-6 md:h-8 md:w-8 text-cyber-green mb-2" />
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Rank
          </p>
          <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
            {profileData.stats.rank}
          </h3>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {profileData.recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 last:border-0"
            >
              <div className="flex items-center space-x-3 md:space-x-4">
                {activity.type === "challenge" && (
                  <Trophy className="h-4 w-4 md:h-5 md:w-5 text-cyber-green flex-shrink-0" />
                )}
                {activity.type === "course" && (
                  <Book className="h-4 w-4 md:h-5 md:w-5 text-cyber-green flex-shrink-0" />
                )}
                {activity.type === "achievement" && (
                  <Star className="h-4 w-4 md:h-5 md:w-5 text-cyber-green flex-shrink-0" />
                )}
                <div className="min-w-0">
                  {" "}
                  {/* Prevent text overflow */}
                  <p className="font-medium text-sm md:text-base text-gray-900 dark:text-white truncate">
                    {activity.name}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right ml-2 flex-shrink-0">
                {activity.points && (
                  <p className="text-xs md:text-sm text-cyber-green">
                    +{activity.points} pts
                  </p>
                )}
                {activity.progress && (
                  <p className="text-xs md:text-sm text-cyber-green">
                    {activity.progress}%
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

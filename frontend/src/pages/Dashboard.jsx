import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Trophy, Target, Book, Star } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats] = useState({
    completedChallenges: 12,
    currentStreak: 5,
    totalPoints: 2500,
    rank: "Apprentice",
  });

  const recentActivities = [
    {
      type: "challenge",
      name: "SQL Injection Basics",
      points: 100,
      date: "2024-03-15",
    },
    {
      type: "course",
      name: "Network Security",
      progress: 60,
      date: "2024-03-14",
    },
    { type: "achievement", name: "First Blood", date: "2024-03-13" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-cyber-black border border-cyber-green rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.username || "Hacker"}!
        </h1>
        <p className="text-gray-400">
          Continue your cybersecurity journey where you left off.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cyber-black border border-cyber-green rounded-lg p-4">
          <Trophy className="h-8 w-8 text-cyber-green mb-2" />
          <p className="text-gray-400">Completed Challenges</p>
          <h3 className="text-2xl font-bold">{stats.completedChallenges}</h3>
        </div>

        <div className="bg-cyber-black border border-cyber-green rounded-lg p-4">
          <Target className="h-8 w-8 text-cyber-green mb-2" />
          <p className="text-gray-400">Current Streak</p>
          <h3 className="text-2xl font-bold">{stats.currentStreak} days</h3>
        </div>

        <div className="bg-cyber-black border border-cyber-green rounded-lg p-4">
          <Star className="h-8 w-8 text-cyber-green mb-2" />
          <p className="text-gray-400">Total Points</p>
          <h3 className="text-2xl font-bold">{stats.totalPoints}</h3>
        </div>

        <div className="bg-cyber-black border border-cyber-green rounded-lg p-4">
          <Book className="h-8 w-8 text-cyber-green mb-2" />
          <p className="text-gray-400">Rank</p>
          <h3 className="text-2xl font-bold">{stats.rank}</h3>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-cyber-black border border-cyber-green rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b border-gray-800 pb-4 last:border-0"
            >
              <div className="flex items-center space-x-4">
                {activity.type === "challenge" && (
                  <Trophy className="h-5 w-5 text-cyber-green" />
                )}
                {activity.type === "course" && (
                  <Book className="h-5 w-5 text-cyber-green" />
                )}
                {activity.type === "achievement" && (
                  <Star className="h-5 w-5 text-cyber-green" />
                )}
                <div>
                  <p className="font-medium">{activity.name}</p>
                  <p className="text-sm text-gray-400">{activity.date}</p>
                </div>
              </div>
              <div className="text-right">
                {activity.points && (
                  <p className="text-cyber-green">+{activity.points} pts</p>
                )}
                {activity.progress && (
                  <p className="text-cyber-green">{activity.progress}%</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

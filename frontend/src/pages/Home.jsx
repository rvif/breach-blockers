import { Lock, Code, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: Lock,
      title: "Learn Cybersecurity",
      description:
        "Master the fundamentals of cybersecurity through hands-on exercises.",
    },
    {
      icon: Code,
      title: "Practice CTF",
      description: "Engage in Capture The Flag challenges to test your skills.",
    },
    {
      icon: Trophy,
      title: "Earn Badges",
      description:
        "Complete challenges to earn badges and track your progress.",
    },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold">
          Welcome to <span className="text-cyber-green">Br3ackBl0ckers</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Your journey to becoming a cybersecurity expert starts here. Learn,
          practice, and master security concepts.
        </p>

        {!user && (
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-cyber-green text-cyber-black font-bold rounded hover:bg-opacity-90 transition-all"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 border border-cyber-green text-cyber-green rounded hover:bg-cyber-green hover:text-cyber-black transition-all"
            >
              Login
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-6 border border-cyber-green rounded-lg hover:bg-cyber-green hover:bg-opacity-5 transition-all"
          >
            <feature.icon className="h-12 w-12 text-cyber-green mb-4" />
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
        <p className="text-gray-400">
          Join our community of cybersecurity enthusiasts and start learning
          today.
        </p>
        {!user && (
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-cyber-green text-cyber-black font-bold rounded hover:bg-opacity-90 transition-all"
          >
            Join Now
          </Link>
        )}
      </div>
    </div>
  );
}

import { Menu, Sun, Moon, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-white dark:bg-cyber-black border-b border-gray-200 dark:border-cyber-green sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-cyber-green dark:hover:bg-opacity-10"
            >
              <Menu className="h-6 w-6 text-gray-600 dark:text-cyber-green" />
            </button>

            <Link to="/" className="flex items-center space-x-2 ml-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                Br3achBl0ckers
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-cyber-green dark:hover:bg-opacity-10"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-cyber-green" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-cyber-green" />
              )}
            </button>

            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <div className="flex items-center">
                  <Link
                    to={`/${user.name}`}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-cyber-green transition-colors"
                  >
                    {user.name}
                  </Link>
                  <div className="h-4 w-px bg-gray-300 dark:bg-cyber-green mx-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-cyber-green transition-colors"
                  >
                    <span>Logout</span>
                    <LogOut className="ml-2 h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-cyber-green transition-colors"
                  >
                    Login
                  </Link>
                  <div className="h-4 w-px bg-gray-300 dark:bg-cyber-green mx-2" />
                  <Link
                    to="/register"
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-cyber-green transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

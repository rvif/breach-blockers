import { useState, useEffect } from "react";
import {
  X,
  Home,
  BookOpen,
  Trophy,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ isOpen, onClose, isCollapsed, onCollapse }) {
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "Challenges", href: "/challenges", icon: Trophy },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLinkClick = () => {
    onClose(); // Close the sidebar on mobile
    onCollapse(true); // Collapse the sidebar on desktop
  };

  const handleLogout = async () => {
    await logout();
    handleLinkClick();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 overflow-hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed top-0 left-0 h-full bg-white dark:bg-cyber-black border-r border-gray-200 dark:border-cyber-green transform transition-all duration-300 ease-in-out z-50 overflow-hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          ${isCollapsed ? "w-20" : "w-64"} 
          md:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Header with toggle button */}
          <div className="flex-shrink-0 h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-cyber-green">
            {!isCollapsed && (
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Menu
              </span>
            )}
            <button
              onClick={() => onCollapse(!isCollapsed)}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-cyber-green dark:hover:bg-opacity-10 md:block hidden ${
                isCollapsed ? "w-full flex justify-center" : ""
              }`}
            >
              {isCollapsed ? (
                <div className="flex">
                  <ChevronRight className="h-5 w-5 text-gray-600 dark:text-cyber-green" />
                  <ChevronRight className="h-5 w-5 -ml-3 text-gray-600 dark:text-cyber-green" />
                </div>
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-cyber-green" />
              )}
            </button>
            <button onClick={onClose} className="md:hidden p-2">
              <X className="h-6 w-6 text-gray-600 dark:text-cyber-green" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden  py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 mx-2 rounded hover:bg-gray-100 dark:hover:bg-cyber-green dark:hover:bg-opacity-10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-cyber-green ${
                  isCollapsed ? "justify-center" : "space-x-2"
                }`}
                onClick={handleLinkClick}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>

          {/* Footer with logout button */}
          {user && (
            <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-cyber-green">
              <button
                onClick={handleLogout}
                className={`w-full mt-auto px-4 py-2 text-gray-700 dark:text-cyber-green hover:bg-gray-100 
                  dark:hover:bg-cyber-green/10 transition-colors flex ${
                    isCollapsed
                      ? "justify-center"
                      : "justify-center items-center"
                  }`}
              >
                {isCollapsed ? (
                  <LogOut className="h-5 w-5" />
                ) : (
                  <span>Logout</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

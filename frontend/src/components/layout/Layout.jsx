import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();

  // Collapse sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
    setIsCollapsed(true);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("sidebar");
      const menuButton = document.querySelector("[data-menu-button]");

      if (
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        menuButton &&
        !menuButton.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-gray-50 dark:bg-cyber-black text-gray-900 dark:text-white font-mono">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex overflow-x-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onCollapse={setIsCollapsed}
        />

        <main
          className={`flex-grow transition-transform duration-200 ease-out ${
            isCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          <div className="container mx-auto px-4 py-8">{children}</div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

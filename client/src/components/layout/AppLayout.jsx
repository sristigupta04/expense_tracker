
import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileNavigation from "./MobileNavigation";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((previous) => !previous);
  }, []);

  // Close sidebar and reset scroll when route changes
  useEffect(() => {
    closeSidebar();

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [location.pathname, closeSidebar]);

  // Handle Escape and prevent background scrolling
  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [sidebarOpen, closeSidebar]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      {/* Main application area */}
      <div className="min-h-screen lg:pl-[260px]">
        <Navbar onMenuClick={toggleSidebar} />

        <main
          id="main-content"
          tabIndex="-1"
          className="mx-auto min-h-[calc(100vh-76px)] w-full max-w-[1800px] px-4 py-6 pb-24 outline-none sm:px-6 sm:py-8 lg:px-8 lg:pb-8"
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden">
        <MobileNavigation />
      </div>
    </div>
  );
}

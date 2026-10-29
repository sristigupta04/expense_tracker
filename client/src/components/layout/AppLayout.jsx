
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileNavigation from "./MobileNavigation";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((previous) => !previous);
  };

  // Close mobile sidebar and reset scroll on route change
  useEffect(() => {
    closeSidebar();
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [location.pathname]);

  // Close sidebar with Escape and prevent background scrolling
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
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar
        open={sidebarOpen}
        onClose={closeSidebar}
      />

      <div className="min-h-screen lg:pl-[260px]">
        <Navbar onMenuClick={toggleSidebar} />

        <main
          id="main-content"
          className="mx-auto min-h-[calc(100vh-76px)] w-full max-w-[1800px] px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-8 lg:pb-8"
        >
          <Outlet />
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}

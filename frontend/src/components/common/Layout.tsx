import React from "react";
import Navbar from "./Navbar";
import { useLayout } from "../../contexts/LayoutContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isMobile, isNavbarExpanded } = useLayout();

  const getMainMargin = () => {
    if (isMobile) return 'ml-0';
    return isNavbarExpanded ? 'ml-64' : 'ml-16';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <main className={`flex-1 transition-all duration-300 ${getMainMargin()}`}>
        <div className={isMobile ? 'pt-16' : ''}> {/* Add top padding on mobile for hamburger button */}
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

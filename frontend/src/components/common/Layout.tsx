import React from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 ml-16 lg:ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default Layout;

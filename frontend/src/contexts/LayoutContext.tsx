import React, { createContext, useContext, useState, useEffect } from 'react';

interface LayoutContextType {
  isMobile: boolean;
  isNavbarExpanded: boolean;
  setIsNavbarExpanded: (expanded: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false); // Default to collapsed

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setIsNavbarExpanded(false);
      }
      // Remove the else clause to keep it collapsed by default on desktop too
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return (
    <LayoutContext.Provider value={{ isMobile, isNavbarExpanded, setIsNavbarExpanded }}>
      {children}
    </LayoutContext.Provider>
  );
};
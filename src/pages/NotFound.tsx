
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ChevronLeft } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-agricream py-12 px-4">
      <div className="text-center max-w-md">
        <div className="bg-agrigreen-500 text-white p-3 rounded-full inline-block mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h1 className="text-5xl font-bold mb-4 text-agrigreen-900">404</h1>
        <p className="text-xl text-gray-600 mb-8">Oops! This page seems to have been harvested already.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild className="bg-agrigreen-600 hover:bg-agrigreen-700 flex items-center gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-agrigreen-600 text-agrigreen-600 hover:bg-agrigreen-50 flex items-center gap-2">
            <Link to="#" onClick={() => window.history.back()}>
              <ChevronLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

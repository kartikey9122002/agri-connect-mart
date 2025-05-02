
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              <span className="text-agrigreen-600">AgriConnect</span>
              <span className="text-gray-700">Mart</span>
            </h3>
            <p className="text-gray-600 mb-4 max-w-md">
              Connecting farmers directly to buyers, eliminating middlemen, and 
              ensuring fair prices for agricultural products across India.
            </p>
          </div>

          <div>
            <h3 className="text-gray-800 font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Email: support@agriconnectmart.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Address: 123 Farming Lane, Agricultural District, New Delhi</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">
            &copy; {currentYear} AgriConnect Mart. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="text-sm text-gray-600 hover:text-agrigreen-600">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm text-gray-600 hover:text-agrigreen-600">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

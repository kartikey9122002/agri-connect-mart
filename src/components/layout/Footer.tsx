
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-agrigreen-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">AgriConnect Mart</h3>
            <p className="text-agrigreen-100">
              Connecting farmers directly with consumers for fresher produce and fairer prices.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <address className="not-italic text-agrigreen-100">
              123 Farm Lane<br />
              Agritown, AG 12345<br />
              <a href="tel:+1234567890" className="hover:text-white">+1 (234) 567-890</a><br />
              <a href="mailto:info@agriconnect.com" className="hover:text-white">info@agriconnect.com</a>
            </address>
          </div>
        </div>
        <div className="border-t border-agrigreen-700 mt-6 pt-6 text-center text-agrigreen-200">
          <p>&copy; {new Date().getFullYear()} AgriConnect Mart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

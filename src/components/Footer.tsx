
import React from 'react';

const Footer = () => {
  return (
    <footer className="py-6 border-t">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © 2025 Web App Rescue. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-500 hover:text-rescue-blue">Help Center</a>
            <a href="#" className="text-sm text-gray-500 hover:text-rescue-blue">Documentation</a>
            <a href="#" className="text-sm text-gray-500 hover:text-rescue-blue">Contact Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

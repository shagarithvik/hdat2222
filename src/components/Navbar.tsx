import React from 'react';
import { Moon, Sun, User } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LEARN.AI</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="relative">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                <User size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
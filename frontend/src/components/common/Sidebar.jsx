import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex md:flex-col">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Menu</h2>
        <nav className="space-y-1">
          <Link to="/" className="block px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50">
            Home
          </Link>
          <Link to="/dashboard" className="block px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
            Dashboard
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

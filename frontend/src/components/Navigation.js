import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Camera, 
  Package, 
  BarChart3, 
  History,
  Scan
} from 'lucide-react';

const Navigation = () => {
  const navItems = [
    { path: '/scan', icon: Camera, label: 'Scan' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/sales', icon: History, label: 'Sales' },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Scan className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Shawl Scanner</h1>
                <p className="text-sm text-slate-500">Scan & Track Sales</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
import React from 'react';
import { Home, Timer, BarChart2, User } from 'lucide-react';
import { useAuth } from '../App';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: any) => void;
}

export default function Layout({ children, currentPage, setCurrentPage }: LayoutProps) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'focus', icon: Timer, label: 'Focus' },
    { id: 'stats', icon: BarChart2, label: 'Stats' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F0F]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tighter">ZEN FOCUS</div>
          {user && (
            <button onClick={logout} className="text-xs text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
              Logout
            </button>
          )}
        </div>
      </header>

      <main className="pt-20 pb-24 px-4 max-w-7xl mx-auto flex-1">
        {children}
      </main>
      
      <nav className="fixed bottom-0 w-full bg-[#0F0F0F]/80 backdrop-blur-lg border-t border-white/10 p-4 flex justify-around z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${currentPage === item.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

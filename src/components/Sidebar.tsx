import React from 'react';
import { TrendingUp, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface NavItem {
  name: string;
  icon: any;
}

interface SidebarProps {
  navItems: NavItem[];
  activePage: string;
  setActivePage: (name: string) => void;
  handleLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems, activePage, setActivePage, handleLogout }) => {
  return (
    <div className="w-72 p-5 flex flex-col h-full shrink-0">
      <div className="glass-card flex flex-col h-full p-5 gap-1" style={{ boxShadow: '0 8px 40px 0 rgba(139,92,246,0.10)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-2 pt-2">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl shadow-lg flex items-center justify-center text-white shrink-0">
            <TrendingUp size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none tracking-tight">WealthMind</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">AI Wealth Advisor</p>
          </div>
        </div>

        {/* Nav label */}
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] px-3 mb-2">Navigation</p>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = activePage === item.name;
            return (
              <motion.button
                key={item.name}
                onClick={() => setActivePage(item.name)}
                whileTap={{ scale: 0.97 }}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-200'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-pill"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-xl"
                    style={{ zIndex: -1 }}
                  />
                )}
                <item.icon size={17} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-violet-500 transition-colors'} />
                <span className="font-bold text-[13px]">{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
              </motion.button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="pt-4 border-t border-slate-200/60 mt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 group"
          >
            <LogOut size={17} className="group-hover:rotate-12 transition-transform duration-200" />
            <span className="font-bold text-[13px]">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

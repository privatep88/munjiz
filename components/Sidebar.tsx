import React from 'react';
import { View } from '../types';
import { LayoutDashboard, CheckSquare, Calendar, Bell, Settings, LogOut, BrainCircuit, Archive } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  toggleAI: () => void;
  unreadCount?: number;
  taskCounts: {
    total: number;
    active: number;
    completed: number;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, toggleAI, unreadCount = 0, taskCounts }) => {
  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'لوحة المهام', icon: <LayoutDashboard size={20} /> },
    { id: 'tasks', label: 'المهام', icon: <CheckSquare size={20} /> },
    { id: 'completed_log', label: 'سجل المكتملة', icon: <Archive size={20} /> },
    { id: 'calendar', label: 'التقويم', icon: <Calendar size={20} /> },
    { id: 'notifications', label: 'الإشعارات', icon: <Bell size={20} /> },
    { id: 'settings', label: 'الإعدادات', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-xl border-l border-slate-700 hidden md:flex transition-all">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center font-bold text-xl">م</div>
        <div>
          <h1 className="text-xl font-bold tracking-wide">تطبيق منجز</h1>
          <p className="text-xs text-slate-400">نظام إدارة المهام</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors duration-200 relative ${
                  currentView === item.id
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
                  )}
                </div>
                <span className="font-medium">{item.label}</span>
                
                {/* Task Counts Badges */}
                {item.id === 'dashboard' && taskCounts.total > 0 && (
                  <span className={`mr-auto text-xs font-bold px-2 py-0.5 rounded-md ${currentView === 'dashboard' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {taskCounts.total}
                  </span>
                )}
                
                {item.id === 'tasks' && taskCounts.active > 0 && (
                  <span className={`mr-auto text-xs font-bold px-2 py-0.5 rounded-md ${currentView === 'tasks' ? 'bg-white/20 text-white' : 'bg-blue-900/60 text-blue-200'}`}>
                    {taskCounts.active}
                  </span>
                )}

                {item.id === 'completed_log' && taskCounts.completed > 0 && (
                  <span className={`mr-auto text-xs font-bold px-2 py-0.5 rounded-md ${currentView === 'completed_log' ? 'bg-white/20 text-white' : 'bg-emerald-900/60 text-emerald-200'}`}>
                    {taskCounts.completed}
                  </span>
                )}

                {/* Calendar Badge (Shows Active Tasks Count) */}
                {item.id === 'calendar' && taskCounts.active > 0 && (
                  <span className={`mr-auto text-xs font-bold px-2 py-0.5 rounded-md ${currentView === 'calendar' ? 'bg-white/20 text-white' : 'bg-indigo-900/60 text-indigo-200'}`}>
                    {taskCounts.active}
                  </span>
                )}

                {/* Notifications Badge */}
                {item.id === 'notifications' && unreadCount > 0 && (
                  <span className="mr-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount > 9 ? '+9' : unreadCount}
                  </span>
                )}
              </button>
            </li>
          ))}
          
          <li className="mt-6 pt-6 border-t border-slate-800">
            <button
              onClick={toggleAI}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-purple-400 hover:bg-purple-900/20 transition-colors"
            >
              <BrainCircuit size={20} />
              <span className="font-medium">المساعد الذكي</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
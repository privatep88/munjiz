import React from 'react';
import { Notification } from '../types';
import { Bell, Mail, AlertTriangle, Info, CheckCircle2, Ban, Clock, Settings2 } from 'lucide-react';

interface NotificationsPopupProps {
  isOpen: boolean;
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  onViewAll: () => void;
  onStopReminders?: (taskId: string) => void;
  onRequestSnooze?: (notification: Notification) => void;
}

const NotificationsPopup: React.FC<NotificationsPopupProps> = ({ 
  isOpen, 
  notifications, 
  markAsRead, 
  markAllAsRead,
  onViewAll,
  onStopReminders,
  onRequestSnooze
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;
  // Sort by date descending
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const recentNotifications = sortedNotifications.slice(0, 5); // Show only 5 most recent

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="text-red-500" size={16} />;
      case 'success': return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'warning': return <Mail className="text-amber-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'alert': return 'bg-red-50';
      case 'success': return 'bg-emerald-50';
      case 'warning': return 'bg-amber-50';
      default: return 'bg-blue-50';
    }
  };

  return (
    <div className="notifications-popup absolute top-full left-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-slate-800">الإشعارات</h3>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline"
          >
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {notifications.length > 0 ? (
          <div>
            {recentNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 flex-col ${notification.read ? 'opacity-60' : 'bg-white'}`}
              >
                <div 
                   onClick={() => markAsRead(notification.id)}
                   className="flex gap-3 cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getBgColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start mb-1">
                       <p className={`text-sm font-bold truncate ${notification.read ? 'text-slate-600' : 'text-slate-800'}`}>
                         {notification.title}
                       </p>
                       <span className="text-[10px] text-slate-400 whitespace-nowrap mr-1" dir="ltr">
                         {new Date(notification.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                       </span>
                     </div>
                     <p className="text-xs text-slate-500 line-clamp-2">
                       {notification.message}
                     </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 shrink-0"></div>
                  )}
                </div>

                {/* Action Buttons for Task Reminders */}
                {notification.taskId && (notification.type === 'warning' || notification.type === 'alert') && !notification.read && (
                   <div className="flex items-center gap-2 mt-1 mr-11 flex-wrap">
                      {onStopReminders && (
                        <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             onStopReminders(notification.taskId!);
                             markAsRead(notification.id);
                          }}
                          className="text-[10px] font-bold bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                           <Ban size={12} />
                           إيقاف
                        </button>
                      )}
                      
                      {/* Customize/Snooze Button */}
                      {onRequestSnooze && (
                        <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             onRequestSnooze(notification);
                          }}
                          className="text-[10px] font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                           <Settings2 size={12} />
                           تخصيص/تأجيل
                        </button>
                      )}
                   </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400">
            <Bell size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">لا توجد إشعارات جديدة</p>
          </div>
        )}
      </div>

      <button 
        onClick={onViewAll}
        className="w-full p-3 text-center text-sm font-bold text-primary-600 hover:bg-primary-50 transition-colors border-t border-slate-100 block bg-white hover:underline"
      >
        عرض السجل الكامل
      </button>
    </div>
  );
};

export default NotificationsPopup;
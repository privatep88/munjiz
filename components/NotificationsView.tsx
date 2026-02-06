import React from 'react';
import { Notification } from '../types';
import { Bell, Check, Mail, AlertTriangle, Info, CheckCircle2, Trash2, Clock, Link, FileText } from 'lucide-react';

interface NotificationsViewProps {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  onDelete: (id: string) => void;
  onRequestSnooze?: (notification: Notification) => void;
  onClearAll?: () => void;
  onOpenTask?: (taskId: string) => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ 
  notifications, 
  markAsRead, 
  markAllAsRead, 
  onDelete, 
  onRequestSnooze,
  onClearAll,
  onOpenTask
}) => {
  
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="text-red-500" size={24} />;
      case 'success': return <CheckCircle2 className="text-emerald-500" size={24} />;
      case 'warning': return <Mail className="text-amber-500" size={24} />;
      default: return <Info className="text-blue-500" size={24} />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'alert': return 'bg-red-50 border-red-100';
      case 'success': return 'bg-emerald-50 border-emerald-100';
      case 'warning': return 'bg-amber-50 border-amber-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6 flex flex-col relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">مركز الإشعارات</h2>
          <p className="text-slate-500 mt-1">تنبيهات النظام ورسائل التذكير</p>
        </div>
        <div className="flex gap-2">
            {notifications.length > 0 && onClearAll && (
               <button 
                 onClick={onClearAll}
                 className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
               >
                 <Trash2 size={18} />
                 <span>حذف الكل</span>
               </button>
            )}
            
            {notifications.some(n => !n.read) && (
              <button 
                onClick={markAllAsRead}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-2 px-4 py-2 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Check size={18} />
                <span>تحديد الكل كمقروء</span>
              </button>
            )}
        </div>
      </div>

      <div className="space-y-4 pb-10">
        {notifications.length > 0 ? (
          notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((notification) => (
            <div 
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`relative p-5 rounded-2xl border transition-all duration-300 group ${
                notification.read ? 'bg-white border-slate-100 opacity-75' : `${getBgColor(notification.type)} border-transparent shadow-sm transform hover:-translate-y-0.5`
              }`}
            >
              {!notification.read && (
                <span className="absolute top-5 left-5 w-2.5 h-2.5 bg-primary-500 rounded-full animate-pulse"></span>
              )}
              
              <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {/* Snooze Button - Only for task-related notifications */}
                  {onRequestSnooze && notification.taskId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestSnooze(notification);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                      title="تخصيص/تأجيل التذكير"
                    >
                      <Clock size={18} />
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(notification.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    title="حذف الإشعار"
                  >
                    <Trash2 size={18} />
                  </button>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className={`p-3 rounded-xl bg-white shadow-sm shrink-0`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 pl-8">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-lg ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap mr-2" dir="ltr">
                      {new Date(notification.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {notification.message}
                  </p>
                  
                  {/* Linked Task Display */}
                  {notification.taskId && notification.taskTitle && onOpenTask && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTask(notification.taskId!);
                        markAsRead(notification.id);
                      }}
                      className="mt-4 flex items-center justify-between p-3 bg-white/70 rounded-lg border border-slate-200/60 cursor-pointer hover:bg-white hover:border-primary-200 transition-colors group/task"
                    >
                      <div className="flex items-center gap-2">
                         <div className="bg-slate-100 p-1.5 rounded-md text-slate-500 group-hover/task:text-primary-600 group-hover/task:bg-primary-50 transition-colors">
                           <FileText size={16} />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-bold">المهمة المرتبطة</span>
                            <span className="text-sm font-bold text-slate-700 group-hover/task:text-primary-700">{notification.taskTitle}</span>
                         </div>
                      </div>
                      <Link size={16} className="text-slate-300 group-hover/task:text-primary-400" />
                    </div>
                  )}

                  {notification.type === 'warning' && (
                     <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-700 bg-white/50 w-fit px-3 py-1 rounded-full border border-amber-200/50">
                        <Mail size={12} />
                        <span>تم إرسال نسخة إلى البريد الإلكتروني</span>
                     </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Bell size={64} className="mb-4 opacity-20" />
            <p className="text-lg">لا توجد إشعارات جديدة</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
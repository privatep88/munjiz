import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TasksView from './components/TasksView';
import NotificationsView from './components/NotificationsView';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import CompletedTasksLog from './components/CompletedTasksLog';
import AIAssistant from './components/AIAssistant';
import NotificationsPopup from './components/NotificationsPopup';
import ReminderModal from './components/ReminderModal';
import SnoozeModal from './components/SnoozeModal';
import TaskDetailsModal from './components/TaskDetailsModal';
import { View, Task, Notification } from './types';
import { Bell, Menu, Search, User } from 'lucide-react';
import { sendEmailReminder, sendManualTaskDetails } from './services/emailService';

// Helper to get LOCAL date string (YYYY-MM-DD) to avoid UTC timezone issues
const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get date string relative to today (Local time)
const getDateAfterDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
};

// Mock Initial Data - Used only if no local storage data exists
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'تسليم المشروع النهائي',
    description: 'يجب تسليم كافة الملفات والتقارير للعميل.',
    startDate: getDateAfterDays(-10),
    dueDate: getDateAfterDays(5),
    priority: 'urgent',
    status: 'pending',
    emailReminderFrequency: 'none',
  },
  {
    id: '2',
    title: 'مراجعة الميزانية السنوية',
    description: 'تحليل نفقات الربع الأول وإعداد تقرير للمدير المالي.',
    startDate: getDateAfterDays(-2),
    dueDate: getDateAfterDays(2),
    priority: 'high',
    status: 'in-progress',
    emailReminderFrequency: '2-days',
  },
  {
    id: '3',
    title: 'تحديث المحتوى التسويقي',
    description: 'تعديل النصوص في صفحة الهبوط وإضافة صور جديدة.',
    startDate: getDateAfterDays(-5),
    dueDate: getDateAfterDays(-1),
    priority: 'medium',
    status: 'pending',
    emailReminderFrequency: 'none',
  },
  {
    id: '4',
    title: 'اجتماع الفريق الأسبوعي',
    description: 'مناقشة سير العمل وتوزيع المهام الجديدة.',
    startDate: getDateAfterDays(10),
    dueDate: getDateAfterDays(15),
    priority: 'low',
    status: 'pending',
    emailReminderFrequency: '5-days',
  }
];

// Helper for safe localStorage access
const safeGetItem = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    try {
      return JSON.parse(item);
    } catch {
      return item; // If parsing fails, return string value
    }
  } catch (e) {
    console.warn(`Error accessing localStorage for key "${key}":`, e);
    return defaultValue;
  }
};

const safeSetItem = (key: string, value: any) => {
  try {
    const valToStore = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, valToStore);
  } catch (e) {
    console.warn(`Error setting localStorage for key "${key}":`, e);
  }
};

const App: React.FC = () => {
  // Settings State with Persistence
  const [userName, setUserName] = useState(() => safeGetItem('settings_userName_v3', 'Aljefre'));
  const [jobTitle, setJobTitle] = useState(() => safeGetItem('settings_jobTitle_v1', 'Senior Officer'));
  
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(() => safeGetItem('settings_emailEnabled_v4', true));
  const [inAppNotificationsEnabled, setInAppNotificationsEnabled] = useState(() => safeGetItem('settings_inAppEnabled_v4', true));
  const [soundEnabled, setSoundEnabled] = useState(() => safeGetItem('settings_soundEnabled_v4', true));
  
  const [language, setLanguage] = useState(() => safeGetItem('settings_language', 'ar'));
  const [timezone, setTimezone] = useState(() => safeGetItem('settings_timezone', 'Dubai (GMT+04:00)'));
  const [reminderTime, setReminderTime] = useState(() => safeGetItem('settings_reminderTime', '24'));

  // App State
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  // Data Persistence: Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = safeGetItem('munjiz_tasks_data_v1', null);
    return savedTasks || INITIAL_TASKS;
  });

  // Data Persistence: Notifications
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const savedNotifications = safeGetItem('munjiz_notifications_data_v1', null);
    if (savedNotifications && Array.isArray(savedNotifications)) {
      // Restore Date objects from strings
      return savedNotifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    }
    return [];
  });
  
  // Save Tasks when changed
  useEffect(() => {
    safeSetItem('munjiz_tasks_data_v1', tasks);
  }, [tasks]);

  // Save Notifications when changed
  useEffect(() => {
    safeSetItem('munjiz_notifications_data_v1', notifications);
  }, [notifications]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Global Task Viewer State (Opened from Notifications)
  const [globalViewingTask, setGlobalViewingTask] = useState<Task | null>(null);

  // Reminder Modal State (For Alerts)
  const [reminderModalData, setReminderModalData] = useState<{title: string, message: string, taskId?: string} | null>(null);
  
  // Snooze/Customize Modal State (Global)
  const [snoozeModalConfig, setSnoozeModalConfig] = useState<{isOpen: boolean, notificationId: string, taskId: string, taskTitle: string} | null>(null);

  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  // Request Notification Permission on Mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Audio Handler
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const now = ctx.currentTime;

      // Primary Tone (Sine)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      // Secondary Tone (Triangle for richness)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(523.25 * 2, now); // C6 (Octave up)
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      // Envelope
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.05, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      // Start
      osc1.start(now);
      osc2.start(now);

      // Stop and Close
      osc1.stop(now + 1.5);
      osc2.stop(now + 1.5);
      
      setTimeout(() => {
        if(ctx.state !== 'closed') {
          ctx.close().catch(console.error);
        }
      }, 1600);

    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  // Check Reminders Logic
  useEffect(() => {
    const interval = setInterval(() => {
      checkReminders();
    }, 30000); // Check every 30 seconds for better responsiveness
    
    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [tasks, reminderTime]);

  const checkReminders = async () => {
    const todayStr = getLocalDateString();
    const todayDate = new Date(todayStr);
    todayDate.setHours(0,0,0,0);
    const userEmail = 'munjiz@munjiz.ae';
    const nowTime = new Date().getTime();

    let alertDaysThreshold = 1;
    if (reminderTime === '1') alertDaysThreshold = 0;
    else if (reminderTime) alertDaysThreshold = parseInt(reminderTime) / 24;

    for (const task of tasks) {
      if (task.status === 'completed') continue;

      // --- Custom Reminder Logic ---
      if (task.customReminderDate) {
        const customDate = new Date(task.customReminderDate);
        if (nowTime >= customDate.getTime() && (nowTime - customDate.getTime()) < 86400000) {
          const reminderId = `custom-rem-${task.id}-${task.customReminderDate}`;
          const alreadyNotified = notifications.some(n => n.id === reminderId);

          if (!alreadyNotified) {
             if (inAppNotificationsEnabled) playNotificationSound();
             if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('تذكير مخصص 🔔', { body: `حان موعد: ${task.title}` });
             }

             setReminderModalData({
                title: task.title,
                message: `هذا تذكيرك المخصص للمهمة. هل ترغب في مراجعتها الآن؟`,
                taskId: task.id
             });

             setNotifications(prev => [
                 {
                   id: reminderId,
                   taskId: task.id,
                   taskTitle: task.title,
                   title: '🔔 تذكير مخصص',
                   message: `حان موعد التذكير للمهمة المجدولة.`,
                   type: 'alert',
                   read: false,
                   timestamp: new Date()
                 },
                 ...prev
             ]);

             if (emailNotificationsEnabled) await sendEmailReminder(userEmail, userName, task.title, 0); 
          }
        }
      }

      // --- Standard Due Date Logic ---
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      const diffTime = dueDate.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // --- FORCE POPUP 5 DAYS BEFORE DUE DATE (NEW REQUEST) ---
      // This logic runs for ALL tasks regardless of settings
      if (diffDays === 5) {
        const reminderId = `popup-5days-${todayStr}-${task.id}`;
        const alreadyNotified = notifications.some(n => n.id === reminderId);

        if (!alreadyNotified) {
           // 1. Trigger Sound & Browser Notification
           if (inAppNotificationsEnabled) {
              playNotificationSound();
              if ('Notification' in window && Notification.permission === 'granted') {
                 new Notification('⏳ تنبيه الموعد النهائي', { body: `متبقي 5 أيام على تسليم: ${task.title}` });
              }
           }

           // 2. Trigger the Popup Modal
           setReminderModalData({
              title: 'تنبيه الموعد النهائي ⏳',
              message: `متبقي 5 أيام فقط على موعد تسليم المهمة: "${task.title}". هل تريد تأجيل التذكير أم إيقافه؟`,
              taskId: task.id
           });

           // 3. Add to Notification Center
           setNotifications(prev => [
              {
                id: reminderId,
                taskId: task.id,
                taskTitle: task.title,
                title: 'متبقي 5 أيام',
                message: `المهمة تستحق التسليم خلال 5 أيام.`,
                type: 'warning',
                read: false,
                timestamp: new Date()
              },
              ...prev
           ]);
        }
      }

      // --- Configurable Reminder Logic (from Settings) ---
      if (diffDays === alertDaysThreshold && diffDays !== 5) { // Avoid double notification if threshold is also 5
        const reminderId = `rem-setting-${alertDaysThreshold}-${task.id}`;
        const alreadyNotified = notifications.some(n => n.id === reminderId);
        
        if (!alreadyNotified) {
          if (inAppNotificationsEnabled) {
            playNotificationSound();
            const dayLabel = alertDaysThreshold === 0 ? 'اليوم' : `${alertDaysThreshold} أيام متبقية`;
            setNotifications(prev => [
              {
                id: reminderId,
                taskId: task.id,
                taskTitle: task.title,
                title: `تذكير: ${dayLabel}`,
                message: `موعد استحقاق المهمة يقترب.`,
                type: 'warning',
                read: false,
                timestamp: new Date()
              },
              ...prev
            ]);
          }
          if (emailNotificationsEnabled) await sendEmailReminder(userEmail, userName, task.title, alertDaysThreshold);
        }
      }

      // --- Periodic Email Reminders ---
      if (task.emailReminderFrequency && task.emailReminderFrequency !== 'none' && emailNotificationsEnabled) {
         const freq = parseInt(task.emailReminderFrequency.split('-')[0]);
         if (diffDays > 0 && diffDays % freq === 0 && diffDays !== 5 && diffDays !== alertDaysThreshold) {
            const reminderId = `freq-${freq}-${todayStr}-${task.id}`;
            const alreadyNotified = notifications.some(n => n.id === reminderId);

            if (!alreadyNotified) {
              await sendEmailReminder(userEmail, userName, task.title, diffDays);
              setNotifications(prev => {
                playNotificationSound();
                return [
                  {
                    id: reminderId,
                    taskId: task.id,
                    taskTitle: task.title,
                    title: `تذكير دوري: متبقي ${diffDays} أيام`,
                    message: `تم إرسال تذكير للمهمة.`,
                    type: 'warning',
                    read: false,
                    timestamp: new Date()
                  },
                  ...prev
                ];
              });
            }
         }
      }

      // --- Due Date Today Alert ---
      if (diffDays === 0 && alertDaysThreshold !== 0) {
         const reminderId = `rem-today-${task.id}`;
         const alreadyNotified = notifications.some(n => n.id === reminderId);
         if (!alreadyNotified && inAppNotificationsEnabled) {
            setNotifications(prev => [
             {
               id: reminderId,
               taskId: task.id,
               taskTitle: task.title,
               title: 'موعد التسليم اليوم!',
               message: `يجب تسليم المهمة اليوم.`,
               type: 'alert',
               read: false,
               timestamp: new Date()
             },
             ...prev
            ]);
         }
      }
    }
  };

  const handleStopReminders = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, emailReminderFrequency: 'none', customReminderDate: undefined } : t
    ));

    playNotificationSound();
    setNotifications(prev => [
      {
        id: `stop-${Date.now()}`,
        title: 'تم إيقاف التذكيرات',
        message: 'لن تستلم تذكيرات تلقائية لهذه المهمة بعد الآن.',
        type: 'success',
        read: false,
        timestamp: new Date()
      },
      ...prev
    ]);
  };

  // Updated delete function with confirmation
  const deleteNotification = (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الإشعار؟')) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  // Updated clear all function with confirmation
  const clearAllNotifications = () => {
    if (notifications.length === 0) return;
    
    if (window.confirm('تنبيه: هل أنت متأكد من رغبتك في حذف جميع الإشعارات نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
       setNotifications([]);
       playNotificationSound();
    }
  };

  const handleManualEmailSending = async (task: Task) => {
    const userEmail = 'munjiz@munjiz.ae';
    const notificationId = `manual-email-${Date.now()}`;
    try {
      await sendManualTaskDetails(userEmail, userName, task);
      playNotificationSound();
      setNotifications(prev => [
        {
          id: notificationId,
          title: 'تم إرسال البريد',
          message: `تم إرسال تفاصيل المهمة "${task.title}" إلى بريدك الإلكتروني بنجاح.`,
          type: 'success',
          read: false,
          timestamp: new Date()
        },
        ...prev
      ]);
    } catch (error) {
      console.error("Failed to send email", error);
    }
  };
  
  // Handle Snooze (Add 15 minutes) - Used by Alert Modal
  const handleSnooze = (taskId: string) => {
    const newDate = new Date();
    newDate.setMinutes(newDate.getMinutes() + 15);
    const newDateStr = new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    
    setTasks(prev => prev.map(t => 
       t.id === taskId ? { ...t, customReminderDate: newDateStr } : t
    ));
    setReminderModalData(null);
  };

  // Main logic for snoozing a reminder to a specific date
  const handleRescheduleReminder = (notificationId: string, taskId: string, snoozeDate: string) => {
    // 1. Update task with new custom reminder date
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, customReminderDate: snoozeDate } : t
    ));

    // 2. Mark this notification as read/handled
    markAsRead(notificationId);
    
    // 3. Play sound feedback
    playNotificationSound();
  };

  // Open the global Snooze Modal
  const openSnoozeModal = (notification: Notification) => {
    if (!notification.taskId) return;
    setSnoozeModalConfig({
      isOpen: true,
      notificationId: notification.id,
      taskId: notification.taskId,
      taskTitle: notification.taskTitle || notification.title
    });
  };

  // Function to handle opening task details from a notification
  const handleOpenTaskFromNotification = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setGlobalViewingTask(task);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isNotificationsOpen && 
        notificationButtonRef.current && 
        !notificationButtonRef.current.contains(target) &&
        !target.closest('.notifications-popup')
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSaveSettings = (newSettings: any) => {
    setUserName(newSettings.fullName);
    setJobTitle(newSettings.jobTitle);
    setEmailNotificationsEnabled(newSettings.emailEnabled);
    setInAppNotificationsEnabled(newSettings.inAppEnabled);
    setSoundEnabled(newSettings.soundEnabled);
    setLanguage(newSettings.language);
    setTimezone(newSettings.timezone);
    setReminderTime(newSettings.reminderTime);
    
    safeSetItem('settings_userName_v3', newSettings.fullName);
    safeSetItem('settings_jobTitle_v1', newSettings.jobTitle);
    safeSetItem('settings_emailEnabled_v4', newSettings.emailEnabled);
    safeSetItem('settings_inAppEnabled_v4', newSettings.inAppEnabled);
    safeSetItem('settings_soundEnabled_v4', newSettings.soundEnabled);
    safeSetItem('settings_language', newSettings.language);
    safeSetItem('settings_timezone', newSettings.timezone);
    safeSetItem('settings_reminderTime', newSettings.reminderTime);
  };

  const addTask = (newTask: Omit<Task, 'id' | 'status'>) => {
    const task: Task = {
      ...newTask,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
    };
    setTasks(prev => [task, ...prev]);
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const taskStats = {
    total: tasks.length,
    active: tasks.filter(t => t.status !== 'completed').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            tasks={tasks} 
            onStatusChange={updateTaskStatus} 
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            onAddTask={addTask}
            onSendEmail={handleManualEmailSending}
          />
        );
      case 'tasks':
        return (
          <TasksView 
            tasks={tasks} 
            addTask={addTask} 
            updateTaskStatus={updateTaskStatus}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            onSendEmail={handleManualEmailSending}
          />
        );
      case 'completed_log':
        return (
          <CompletedTasksLog 
            tasks={tasks}
            onStatusChange={updateTaskStatus}
            onDeleteTask={deleteTask}
            onSendEmail={handleManualEmailSending}
          />
        );
      case 'calendar':
        return (
          <CalendarView 
            tasks={tasks}
            onUpdateTask={updateTask}
            onSendEmail={handleManualEmailSending}
          />
        );
      case 'notifications':
        return (
          <NotificationsView 
             notifications={notifications}
             markAsRead={markAsRead}
             markAllAsRead={markAllAsRead}
             onDelete={deleteNotification}
             onRequestSnooze={openSnoozeModal}
             onClearAll={clearAllNotifications}
             onOpenTask={handleOpenTaskFromNotification}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            settings={{
              fullName: userName,
              jobTitle,
              emailEnabled: emailNotificationsEnabled,
              inAppEnabled: inAppNotificationsEnabled,
              soundEnabled,
              language,
              timezone,
              reminderTime
            }}
            onSave={handleSaveSettings}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <p className="text-xl">جاري العمل على هذه الصفحة...</p>
            <button onClick={() => setCurrentView('dashboard')} className="mt-4 text-primary-600 hover:underline">
              العودة للرئيسية
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[100dvh] bg-slate-50 font-sans" dir="rtl">
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 right-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar 
          currentView={currentView} 
          setCurrentView={(v) => { setCurrentView(v); setIsMobileMenuOpen(false); }}
          toggleAI={() => { setIsAIOpen(true); setIsMobileMenuOpen(false); }}
          unreadCount={unreadCount}
          taskCounts={taskStats}
        />
      </div>

      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50">
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-slate-300 hover:text-white p-1 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-white hidden sm:block">
              {currentView === 'dashboard' ? 'لوحة المهام' : 
               currentView === 'tasks' ? 'إدارة المهام' : 
               currentView === 'completed_log' ? 'سجل المكتملة' :
               currentView === 'calendar' ? 'التقويم' : 
               currentView === 'notifications' ? 'الإشعارات' : 'الإعدادات'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="بحث سريع..." 
                className="bg-slate-800 border-none rounded-full pl-4 pr-10 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-primary-600 outline-none w-64 transition-all focus:w-72"
              />
            </div>
            
            <div className="relative">
              <button 
                ref={notificationButtonRef}
                className={`relative p-2 rounded-full transition-colors ${
                  isNotificationsOpen 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell size={20} className={unreadCount > 0 ? 'text-white' : ''} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900 animate-pulse"></span>
                )}
              </button>

              <NotificationsPopup 
                isOpen={isNotificationsOpen}
                notifications={notifications}
                markAsRead={markAsRead}
                markAllAsRead={markAllAsRead}
                onViewAll={() => {
                  setIsNotificationsOpen(false);
                  setCurrentView('notifications');
                }}
                onStopReminders={handleStopReminders}
                onRequestSnooze={openSnoozeModal}
              />
            </div>
            
            <div className="flex items-center gap-3 pr-4 border-r border-slate-800">
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-white">{userName}</p>
                <p className="text-xs text-slate-400">{jobTitle}</p>
              </div>
              <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 border border-slate-700 shadow-sm">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1">
          {renderView()}
        </div>

        <footer className="bg-slate-900 border-t border-slate-800 py-3 px-6 shadow-md shrink-0">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-300 opacity-90 hover:opacity-100 transition-opacity">
            <span>اعداد وتصميم / خالد الجفري</span>
            <span className="text-slate-600">|</span>
            <span className="dir-ltr">{new Date().getFullYear()}</span>
          </div>
        </footer>
      </main>

      <AIAssistant 
        isOpen={isAIOpen} 
        onClose={() => setIsAIOpen(false)} 
        tasks={tasks} 
      />
      
      {/* Alert Reminder Popup Modal */}
      <ReminderModal 
        isOpen={!!reminderModalData}
        data={reminderModalData}
        onClose={() => setReminderModalData(null)}
        onSnooze={handleSnooze}
        onStopReminders={handleStopReminders}
      />

      {/* Customize/Snooze Modal (Global) */}
      <SnoozeModal 
        isOpen={!!snoozeModalConfig && snoozeModalConfig.isOpen}
        title={snoozeModalConfig ? snoozeModalConfig.taskTitle : ''}
        onClose={() => setSnoozeModalConfig(null)}
        onConfirm={(dateStr) => {
          if (snoozeModalConfig) {
            handleRescheduleReminder(snoozeModalConfig.notificationId, snoozeModalConfig.taskId, dateStr);
            setSnoozeModalConfig(null);
            // Also close popup if it's open, to be clean
            setIsNotificationsOpen(false);
          }
        }}
      />

      {/* Global Task Viewer Modal (from Notifications) */}
      {globalViewingTask && (
        <TaskDetailsModal 
          task={globalViewingTask} 
          onClose={() => setGlobalViewingTask(null)} 
          onSendEmail={handleManualEmailSending}
        />
      )}
    </div>
  );
};

export default App;
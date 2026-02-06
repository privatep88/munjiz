import React, { useState, useMemo } from 'react';
import { Task, Priority, Attachment } from '../types';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, CalendarClock, X, CalendarCheck, TrendingUp, AlertOctagon, Hourglass, CalendarRange, ChevronDown, Plus, Paperclip, FileText, Trash2, Mail, Bell } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskDetailsModal from './TaskDetailsModal';

interface DashboardProps {
  tasks: Task[];
  onStatusChange: (id: string, status: Task['status']) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id' | 'status'>) => void;
  onSendEmail: (task: Task) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, onStatusChange, onDeleteTask, onUpdateTask, onAddTask, onSendEmail }) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  
  // Helper for local date string
  const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to calculate reminder date based on hours
  const calculateReminderDate = (hours: number): string => {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    // Format to YYYY-MM-DDTHH:mm local time
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  // Add Task State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState<{
    title: string;
    description: string;
    startDate: string;
    dueDate: string;
    priority: Priority;
    attachments: Attachment[];
    emailReminderFrequency: 'none' | '2-days' | '5-days' | '10-days';
    customReminderDate?: string;
  }>({
    title: '',
    description: '',
    startDate: getLocalDateString(), // FIX: Use local date
    dueDate: getLocalDateString(),   // FIX: Use local date
    priority: 'medium',
    attachments: [],
    emailReminderFrequency: 'none',
    customReminderDate: ''
  });
  
  // Year Filter State
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  // Extract available years from tasks + Future years up to 2090
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    
    // 1. Add years from existing tasks
    tasks.forEach(t => {
      const taskYear = new Date(t.dueDate).getFullYear();
      if (!isNaN(taskYear)) {
        years.add(taskYear);
      }
    });

    // 2. Add range from current year up to 2090
    const endYear = 2090;
    for (let y = currentYear; y <= endYear; y++) {
      years.add(y);
    }

    return Array.from(years).sort((a, b) => a - b); 
  }, [tasks, currentYear]);

  // Filter tasks based on selected year
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => new Date(t.dueDate).getFullYear() === selectedYear);
  }, [tasks, selectedYear]);

  // Date Helpers
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysDiff = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // --- Statistics Calculation ---
  const completedCount = filteredTasks.filter(t => t.status === 'completed').length;
  const remainingCount = filteredTasks.filter(t => t.status !== 'completed').length;
  // Updated threshold to 5 days
  const dueSoonCount = filteredTasks.filter(t => {
    if (t.status === 'completed') return false;
    const diff = getDaysDiff(t.dueDate);
    return diff >= 0 && diff <= 5;
  }).length;
  const overdueCount = filteredTasks.filter(t => {
    if (t.status === 'completed') return false;
    const diff = getDaysDiff(t.dueDate);
    return diff < 0;
  }).length;
  
  // Active Tasks List (Sorted by Due Date Ascending: Overdue -> Due Soon -> Future)
  const activeTasks = filteredTasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const monthlyStats = new Array(12).fill(0);
  filteredTasks.filter(t => t.status === 'completed').forEach(task => {
    const date = new Date(task.dueDate);
    const monthIndex = date.getMonth();
    if (monthIndex >= 0 && monthIndex < 12) {
      monthlyStats[monthIndex]++;
    }
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      onUpdateTask(editingTask);
      setEditingTask(null);
    }
  };

  // --- File Handling Logic (New Task) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const validFiles: Attachment[] = [];
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB

      files.forEach(file => {
        if (file.size > MAX_SIZE) {
          alert(`عذراً، الملف "${file.name}" يتجاوز الحد المسموح (10 ميجابايت).`);
          return;
        }
        validFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file) // Creating a local URL for preview/demo
        });
      });

      setNewTaskData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles]
      }));
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setNewTaskData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attachmentId)
    }));
  };

  // --- File Handling Logic (Edit Task) ---
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && editingTask) {
      const files = Array.from(e.target.files) as File[];
      const validFiles: Attachment[] = [];
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB

      files.forEach(file => {
        if (file.size > MAX_SIZE) {
          alert(`عذراً، الملف "${file.name}" يتجاوز الحد المسموح (10 ميجابايت).`);
          return;
        }
        validFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file) // Creating a local URL for preview/demo
        });
      });

      setEditingTask({
        ...editingTask,
        attachments: [...(editingTask.attachments || []), ...validFiles]
      });
    }
  };

  const removeEditAttachment = (attachmentId: string) => {
    if (editingTask) {
      setEditingTask({
        ...editingTask,
        attachments: (editingTask.attachments || []).filter(a => a.id !== attachmentId)
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(newTaskData);
    setIsAddModalOpen(false);
    // Reset form
    setNewTaskData({
      title: '',
      description: '',
      startDate: getLocalDateString(), // FIX: Use local date
      dueDate: getLocalDateString(),   // FIX: Use local date
      priority: 'medium' as Priority,
      attachments: [],
      emailReminderFrequency: 'none',
      customReminderDate: ''
    });
  };

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">نظرة عامة</h2>
          <p className="text-slate-500 mt-1">ملخص الإنجاز ومتابعة حالة المهام لعام {selectedYear}.</p>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Add Task Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">مهمة جديدة</span>
            </button>

            {/* Year Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 transition-colors font-bold w-32 justify-between"
              >
                <div className="flex items-center gap-2">
                  <CalendarRange size={18} className="text-primary-600" />
                  <span>{selectedYear}</span>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isYearDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[120px] bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 custom-scrollbar">
                  {availableYears.map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setIsYearDropdownOpen(false);
                      }}
                      className={`w-full text-right px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${selectedYear === year ? 'text-primary-600 font-bold bg-primary-50' : 'text-slate-600'}`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="text-sm bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-slate-500 hidden sm:block">
              {new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
        </div>
      </div>

      {/* Main Statistics Cards (Top) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Remaining */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-blue-500"></div>
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <ListTodo size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold mb-1">المهام المتبقية ({selectedYear})</p>
            <p className="text-3xl font-black text-slate-800">{remainingCount}</p>
          </div>
        </div>

        {/* Overdue - Moved here as requested */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-red-500"></div>
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold mb-1">مهام متأخرة</p>
            <p className="text-3xl font-black text-slate-800">{overdueCount}</p>
            <p className="text-[10px] text-red-600 font-medium">تحتاج انتباه فوري</p>
          </div>
        </div>

        {/* Due Soon - Moved here */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-amber-500"></div>
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <CalendarClock size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold mb-1">تقترب من الموعد</p>
            <p className="text-3xl font-black text-slate-800">{dueSoonCount}</p>
            <p className="text-[10px] text-amber-600 font-medium">خلال 5 أيام</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500"></div>
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold mb-1">المهام المنجزة</p>
            <p className="text-3xl font-black text-slate-800">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Active Tasks List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-blue-500" size={24} />
            المهام الجارية - {selectedYear}
          </h3>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{activeTasks.length}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTasks.length > 0 ? (
            activeTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={onStatusChange}
                onDelete={onDeleteTask}
                onEdit={setEditingTask}
                onClick={setViewingTask}
                onSendEmail={onSendEmail}
              />
            ))
          ) : (
            <div className="col-span-full bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center text-slate-400">
              <p>لا توجد مهام جارية لعام {selectedYear}، وقت الراحة! 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* Yearly Statistics Section - UPDATED TO DISTINCT LIGHT THEME (BLUE-50) */}
      <div className="bg-primary-50 rounded-3xl shadow-sm border border-primary-100 p-6 md:p-8 text-slate-800 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg text-primary-600 border border-primary-200 shadow-sm">
              <CalendarCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">إحصائيات الإنجاز السنوي</h3>
              <p className="text-xs text-slate-500">تحليل الأداء لعام {selectedYear}</p>
            </div>
          </div>
        </div>

        {/* New Stylish Summary Cards - Light Version - REORDERED TO MATCH TOP SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
          
          {/* Remaining Summary (First) */}
          <div className="bg-white border border-blue-100 p-4 rounded-2xl flex items-center justify-between group hover:shadow-lg hover:shadow-blue-100/50 transition-all shadow-sm">
             <div>
                <p className="text-blue-700 font-bold text-xs mb-1">المهام المتبقية</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-black text-slate-800">{remainingCount}</p>
                </div>
             </div>
             <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform border border-blue-100">
                <Hourglass size={20} />
             </div>
          </div>

          {/* Overdue Summary (Second) */}
          <div className="bg-white border border-red-100 p-4 rounded-2xl flex items-center justify-between group hover:shadow-lg hover:shadow-red-100/50 transition-all shadow-sm">
             <div>
                <p className="text-red-700 font-bold text-xs mb-1">مهام متأخرة</p>
                <div className="flex items-baseline gap-1">
                   <p className="text-2xl font-black text-slate-800">{overdueCount}</p>
                   {overdueCount > 0 && <span className="text-[10px] text-red-600 font-bold">!</span>}
                </div>
             </div>
             <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform border border-red-100">
                <AlertOctagon size={20} />
             </div>
          </div>

          {/* Due Soon Summary (Third) */}
          <div className="bg-white border border-amber-100 p-4 rounded-2xl flex items-center justify-between group hover:shadow-lg hover:shadow-amber-100/50 transition-all shadow-sm">
             <div>
                <p className="text-amber-700 font-bold text-xs mb-1">مهام قريبة</p>
                <div className="flex items-baseline gap-1">
                   <p className="text-2xl font-black text-slate-800">{dueSoonCount}</p>
                   {dueSoonCount > 0 && <span className="text-[10px] text-amber-600 animate-pulse">●</span>}
                </div>
             </div>
             <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform border border-amber-100">
                <Clock size={20} />
             </div>
          </div>

           {/* Completed Summary (Fourth) */}
           <div className="bg-white border border-emerald-100 p-4 rounded-2xl flex items-center justify-between group hover:shadow-lg hover:shadow-emerald-100/50 transition-all shadow-sm">
             <div>
                <p className="text-emerald-700 font-bold text-xs mb-1">المهام المنجزة</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-black text-slate-800">{completedCount}</p>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                    {filteredTasks.length > 0 ? Math.round((completedCount / filteredTasks.length) * 100) : 0}%
                  </span>
                </div>
             </div>
             <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform border border-emerald-100">
                <TrendingUp size={20} />
             </div>
          </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-primary-200/50 mb-8 relative z-10"></div>
        
        {/* Monthly Grid - Updated for Light Theme */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 relative z-10">
          {arabicMonths.map((month, index) => {
            const count = monthlyStats[index];
            const isCurrentMonth = selectedYear === currentYear && index === new Date().getMonth();
            const hasData = count > 0;
            
            return (
              <div 
                key={month} 
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                  isCurrentMonth 
                    ? 'bg-white border-primary-300 shadow-md ring-2 ring-primary-100' 
                    : 'bg-white/60 border-primary-100 hover:bg-white hover:border-primary-200'
                }`}
              >
                {isCurrentMonth && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                )}
                <span className={`text-sm font-bold mb-2 ${isCurrentMonth ? 'text-primary-700' : 'text-slate-500'}`}>
                  {month}
                </span>
                <div className={`text-2xl font-black ${hasData ? (isCurrentMonth ? 'text-primary-800' : 'text-slate-700') : 'text-slate-300'}`}>
                  {count}
                </div>
                <span className="text-[10px] text-slate-400 mt-1">مهمة منجزة</span>
                
                {/* Visual Progress Bar per month */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden border border-slate-100">
                  <div 
                    className={`h-full rounded-full ${isCurrentMonth ? 'bg-primary-500' : 'bg-slate-300'}`} 
                    style={{ width: `${Math.min((count / 10) * 100, 100)}%` }} // Visual cap at 10 tasks for demo
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
               <h3 className="text-xl font-bold text-slate-800">إضافة مهمة جديدة</h3>
               <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                 <X size={24} />
               </button>
             </div>
             
            <form onSubmit={handleAddNewTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">عنوان المهمة</label>
                <input
                  required
                  value={newTaskData.title}
                  onChange={e => setNewTaskData({...newTaskData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                  placeholder="مثال: إعداد التقرير الشهري"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    required
                    value={newTaskData.startDate}
                    onChange={e => setNewTaskData({...newTaskData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    required
                    value={newTaskData.dueDate}
                    onChange={e => setNewTaskData({...newTaskData, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الأولوية</label>
                  <select
                    value={newTaskData.priority}
                    onChange={e => setNewTaskData({...newTaskData, priority: e.target.value as Priority})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                  >
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                    <option value="urgent">عاجلة</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <Mail size={14} className="text-slate-400"/>
                    تكرار التذكير بالبريد
                  </label>
                  <select
                    value={newTaskData.emailReminderFrequency || 'none'}
                    onChange={e => setNewTaskData({...newTaskData, emailReminderFrequency: e.target.value as any})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                  >
                    <option value="none">لا ترسل تلقائياً</option>
                    <option value="2-days">كل يومين</option>
                    <option value="5-days">كل 5 أيام</option>
                    <option value="10-days">كل 10 أيام</option>
                  </select>
                </div>
              </div>

              {/* Custom Reminder Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Bell size={14} className="text-slate-400"/>
                  تذكير مخصص (اختياري)
                </label>
                <div className="flex gap-2 mb-2">
                   <select
                     onChange={(e) => {
                       if(e.target.value) {
                         setNewTaskData({...newTaskData, customReminderDate: calculateReminderDate(Number(e.target.value))});
                       }
                     }}
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 text-sm"
                   >
                     <option value="">-- اختر مدة سريعة --</option>
                     <option value="1">بعد ساعة</option>
                     <option value="2">بعد ساعتين</option>
                     <option value="5">بعد 5 ساعات</option>
                     <option value="24">بعد يوم</option>
                     <option value="48">بعد يومين</option>
                     <option value="120">بعد 5 أيام</option>
                   </select>
                </div>
                <input
                  type="datetime-local"
                  value={newTaskData.customReminderDate || ''}
                  onChange={e => setNewTaskData({...newTaskData, customReminderDate: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 ltr-input"
                  style={{direction: 'ltr'}}
                />
                <p className="text-[10px] text-slate-400 mt-1">سيصلك إشعار في الوقت المحدد.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">التفاصيل</label>
                <textarea
                  value={newTaskData.description}
                  onChange={e => setNewTaskData({...newTaskData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none bg-white text-slate-900"
                  placeholder="تفاصيل إضافية..."
                />
              </div>

              {/* Attachments Section */}
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">المرفقات</label>
                 <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors relative">
                    <input 
                      type="file" 
                      multiple 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                       <Paperclip size={24} />
                       <p className="text-sm font-medium">اضغط هنا لإرفاق ملفات أو قم بسحبها وإفلاتها</p>
                       <p className="text-xs">الحد الأقصى 10 ميجابايت للملف الواحد (جميع الصيغ مدعومة)</p>
                    </div>
                 </div>

                 {newTaskData.attachments.length > 0 && (
                   <div className="mt-3 space-y-2">
                     {newTaskData.attachments.map(file => (
                       <div key={file.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2 overflow-hidden">
                             <div className="bg-white p-1.5 rounded-md border border-slate-100">
                               <FileText size={16} className="text-primary-600" />
                             </div>
                             <div className="flex flex-col min-w-0">
                               <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                               <span className="text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
                             </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeAttachment(file.id)}
                            className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 shadow-md shadow-primary-200 transition-colors"
                >
                  حفظ المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
               <h3 className="text-xl font-bold text-slate-800">تعديل المهمة</h3>
               <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-600">
                 <X size={24} />
               </button>
             </div>
             
             <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">عنوان المهمة</label>
                  <input
                    required
                    value={editingTask.title}
                    onChange={e => setEditingTask({...editingTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ البدء</label>
                    <input
                      type="date"
                      required
                      value={editingTask.startDate}
                      onChange={e => setEditingTask({...editingTask, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الاستحقاق</label>
                    <input
                      type="date"
                      required
                      value={editingTask.dueDate}
                      onChange={e => setEditingTask({...editingTask, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">الأولوية</label>
                    <select
                      value={editingTask.priority}
                      onChange={e => setEditingTask({...editingTask, priority: e.target.value as Priority})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                    >
                      <option value="low">منخفضة</option>
                      <option value="medium">متوسطة</option>
                      <option value="high">عالية</option>
                      <option value="urgent">عاجلة</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                       <Mail size={14} className="text-slate-400"/>
                       تكرار التذكير بالبريد
                    </label>
                    <select
                      value={editingTask.emailReminderFrequency || 'none'}
                      onChange={e => setEditingTask({...editingTask, emailReminderFrequency: e.target.value as any})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                    >
                      <option value="none">لا ترسل تلقائياً</option>
                      <option value="2-days">كل يومين</option>
                      <option value="5-days">كل 5 أيام</option>
                      <option value="10-days">كل 10 أيام</option>
                    </select>
                  </div>
                </div>

                {/* Custom Reminder Input (Edit) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <Bell size={14} className="text-slate-400"/>
                    تذكير مخصص (اختياري)
                  </label>
                  <div className="flex gap-2 mb-2">
                   <select
                     onChange={(e) => {
                       if(e.target.value) {
                         setEditingTask({...editingTask, customReminderDate: calculateReminderDate(Number(e.target.value))});
                       }
                     }}
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 text-sm"
                   >
                     <option value="">-- اختر مدة سريعة --</option>
                     <option value="1">بعد ساعة</option>
                     <option value="2">بعد ساعتين</option>
                     <option value="5">بعد 5 ساعات</option>
                     <option value="24">بعد يوم</option>
                     <option value="48">بعد يومين</option>
                     <option value="120">بعد 5 أيام</option>
                   </select>
                  </div>
                  <input
                    type="datetime-local"
                    value={editingTask.customReminderDate || ''}
                    onChange={e => setEditingTask({...editingTask, customReminderDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 ltr-input"
                    style={{direction: 'ltr'}}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">التفاصيل</label>
                  <textarea
                    value={editingTask.description}
                    onChange={e => setEditingTask({...editingTask, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none bg-white text-slate-900"
                  />
                </div>

                {/* Attachments Section (Edit) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">المرفقات</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors relative">
                      <input 
                        type="file" 
                        multiple 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleEditFileChange}
                      />
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Paperclip size={24} />
                        <p className="text-sm font-medium">اضغط هنا لإرفاق ملفات أو قم بسحبها وإفلاتها</p>
                        <p className="text-xs">الحد الأقصى 10 ميجابايت للملف الواحد</p>
                      </div>
                  </div>

                  {editingTask.attachments && editingTask.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {editingTask.attachments.map(file => (
                        <div key={file.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="bg-white p-1.5 rounded-md border border-slate-100">
                                <FileText size={16} className="text-primary-600" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                                <span className="text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => removeEditAttachment(file.id)}
                              className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="flex-1 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 shadow-md shadow-primary-200 transition-colors"
                  >
                    حفظ التعديلات
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {viewingTask && (
        <TaskDetailsModal 
          task={viewingTask} 
          onClose={() => setViewingTask(null)} 
          onEdit={setEditingTask}
          onSendEmail={onSendEmail}
        />
      )}
    </div>
  );
};

export default Dashboard;
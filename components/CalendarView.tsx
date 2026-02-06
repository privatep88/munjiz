import React, { useState } from 'react';
import { Task, Priority, Attachment } from '../types';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, MapPin, Clock, X, Paperclip, FileText, Trash2, Mail, Bell } from 'lucide-react';
import TaskDetailsModal from './TaskDetailsModal';

interface CalendarViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onSendEmail: (task: Task) => void;
}

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onUpdateTask, onSendEmail }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
    setSelectedDate(null); // Clear selection when changing month
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Helper to calculate reminder date based on hours
  const calculateReminderDate = (hours: number): string => {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    // Format to YYYY-MM-DDTHH:mm local time
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  const getTasksForDate = (date: Date) => {
    // FIX: Construct local date string YYYY-MM-DD manually to avoid timezone shifts
    // This matches the storage format of tasks
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return tasks.filter(task => task.dueDate === dateStr);
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

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      onUpdateTask(editingTask);
      setEditingTask(null);
    }
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-start-${i}`} className="min-h-[7rem] bg-slate-50/40 border-b border-r border-slate-100"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayTasks = getTasksForDate(date);
      const isToday = isSameDay(date, new Date());
      const isSelected = selectedDate && isSameDay(date, selectedDate);

      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDate(date)}
          className={`min-h-[7rem] border-b border-r border-slate-100 p-2 cursor-pointer transition-all hover:bg-slate-50 relative group ${
            isSelected ? 'bg-primary-50 ring-2 ring-inset ring-primary-500 z-10' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
              isToday 
                ? 'bg-primary-600 text-white shadow-md' 
                : isSelected ? 'text-primary-700' : 'text-slate-700'
            }`}>
              {day}
            </span>
            {dayTasks.length > 0 && (
              <span className="bg-primary-100 text-primary-700 text-[10px] font-bold px-1.5 rounded-full">
                {dayTasks.length}
              </span>
            )}
          </div>
          
          <div className="mt-2 space-y-1 overflow-hidden">
            {dayTasks.slice(0, 3).map((task, idx) => (
              <div 
                key={idx} 
                className={`text-[10px] truncate px-1.5 py-0.5 rounded-full border ${
                  task.priority === 'urgent' ? 'bg-red-100 text-red-700 border-red-200' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                  'bg-blue-100 text-blue-700 border-blue-200'
                }`}
              >
                {task.title}
              </div>
            ))}
            {dayTasks.length > 3 && (
              <div className="text-[10px] text-slate-400 font-medium text-center">
                +{dayTasks.length - 3} المزيد
              </div>
            )}
          </div>
        </div>
      );
    }

    // Fill remaining cells for the last row to complete the grid
    const totalCells = firstDay + daysInMonth;
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push(<div key={`empty-end-${i}`} className="min-h-[7rem] bg-slate-50/40 border-b border-r border-slate-100"></div>);
      }
    }

    return days;
  };

  const selectedDayTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="p-6 md:p-10 space-y-6 flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">التقويم</h2>
          <p className="text-slate-500 mt-1">جدول المهام حسب تاريخ الاستحقاق</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <span className="text-lg font-bold text-slate-800 min-w-[140px] text-center">
            {ARABIC_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Grid */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          {/* Days Header */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {ARABIC_DAYS.map((day) => (
              <div key={day} className="py-3 text-center text-sm font-bold text-slate-600">
                {day}
              </div>
            ))}
          </div>
          
          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-auto">
            {renderCalendarGrid()}
          </div>
        </div>

        {/* Selected Day Sidebar */}
        <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-fit">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CalendarIcon className="text-primary-500" size={20} />
            <span>
              {selectedDate 
                ? `${selectedDate.getDate()} ${ARABIC_MONTHS[selectedDate.getMonth()]}` 
                : 'حدد يوماً'}
            </span>
            {selectedDayTasks.length > 0 && (
               <span className="mr-auto bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md font-bold">
                 {selectedDayTasks.length} مهمة
               </span>
            )}
          </h3>
          
          <div className="space-y-4">
            {selectedDate ? (
              selectedDayTasks.length > 0 ? (
                selectedDayTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => setViewingTask(task)}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">{task.title}</h4>
                      <span className={`text-[10px] px-2 py-1 rounded-full ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {task.priority === 'urgent' ? 'عاجل' : task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={12} />
                      <span>يستحق في: {task.dueDate}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <p>لا توجد مهام مستحقة في هذا اليوم</p>
                </div>
              )
            ) : (
              <div className="text-center py-10 text-slate-400">
                <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                <p>اضغط على أي يوم في التقويم لعرض المهام</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
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

export default CalendarView;
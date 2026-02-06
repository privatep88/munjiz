import React, { useState } from 'react';
import { Task, Priority, Attachment } from '../types';
import TaskCard from './TaskCard';
import { Plus, Search, Filter, X, Paperclip, FileText, Trash2, Mail, Bell } from 'lucide-react';
import TaskDetailsModal from './TaskDetailsModal';

interface TasksViewProps {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onSendEmail: (task: Task) => void;
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, addTask, updateTaskStatus, onDeleteTask, onUpdateTask, onSendEmail }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  
  // Combine Add/Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const [formData, setFormData] = useState<{
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

  // Filter and Sort Logic
  const filteredTasks = tasks
    .filter(t => {
      if (filter === 'all') return true;
      if (filter === 'completed') return t.status === 'completed';
      return t.status !== 'completed';
    })
    .sort((a, b) => {
      // Sort by Due Date Ascending:
      // Oldest dates (Overdue) come first -> Current dates -> Future dates
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      startDate: getLocalDateString(),
      dueDate: getLocalDateString(),
      priority: 'medium',
      attachments: [],
      emailReminderFrequency: 'none',
      customReminderDate: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingId(task.id);
    setFormData({
      title: task.title,
      description: task.description,
      startDate: task.startDate,
      dueDate: task.dueDate,
      priority: task.priority,
      attachments: task.attachments || [],
      emailReminderFrequency: task.emailReminderFrequency || 'none',
      customReminderDate: task.customReminderDate || ''
    });
    setIsModalOpen(true);
  };

  // --- File Handling Logic ---
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
          url: URL.createObjectURL(file)
        });
      });

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles]
      }));
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attachmentId)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing
      const originalTask = tasks.find(t => t.id === editingId);
      if (originalTask) {
        onUpdateTask({
          ...originalTask,
          ...formData
        });
      }
    } else {
      // Add new
      addTask(formData);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 md:p-10 space-y-6 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">قائمة المهام</h2>
          <p className="text-slate-500 mt-1">إدارة ومتابعة الأعمال اليومية (مرتبة حسب الأقرب للاستحقاق)</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-200 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          <span>إضافة مهمة جديدة</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث عن مهمة..."
            className="w-full pl-4 pr-10 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary-100 outline-none text-slate-700"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f === 'all' ? 'الكل' : f === 'pending' ? 'قيد التنفيذ' : 'مكتملة'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {filteredTasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onStatusChange={updateTaskStatus}
            onDelete={onDeleteTask}
            onEdit={openEditModal}
            onClick={setViewingTask}
            onSendEmail={onSendEmail}
          />
        ))}
        {filteredTasks.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
            <Filter size={48} className="mb-4 opacity-50" />
            <p>لا توجد مهام مطابقة للبحث</p>
          </div>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
               <h3 className="text-xl font-bold text-slate-800">{editingId ? 'تعديل المهمة' : 'مهمة جديدة'}</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                 <X size={24} />
               </button>
             </div>
             
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">عنوان المهمة</label>
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
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
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الأولوية</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
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
                    value={formData.emailReminderFrequency || 'none'}
                    onChange={e => setFormData({...formData, emailReminderFrequency: e.target.value as any})}
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
                         setFormData({...formData, customReminderDate: calculateReminderDate(Number(e.target.value))});
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
                  value={formData.customReminderDate || ''}
                  onChange={e => setFormData({...formData, customReminderDate: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-900 ltr-input"
                  style={{direction: 'ltr'}}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">التفاصيل</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
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

                 {formData.attachments.length > 0 && (
                   <div className="mt-3 space-y-2">
                     {formData.attachments.map(file => (
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
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 shadow-md shadow-primary-200 transition-colors"
                >
                  {editingId ? 'حفظ التعديلات' : 'حفظ المهمة'}
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
          onEdit={openEditModal}
          onSendEmail={onSendEmail}
        />
      )}
    </div>
  );
};

export default TasksView;
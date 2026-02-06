import React from 'react';
import { Task, PRIORITY_LABELS, STATUS_LABELS } from '../types';
import { X, Calendar, Clock, AlertCircle, CheckCircle2, Flag, AlignLeft, Paperclip, FileText, Download, Mail, Bell } from 'lucide-react';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onSendEmail?: (task: Task) => void;
}

const priorityConfig = {
  low: { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', label: 'منخفضة' },
  medium: { color: 'text-amber-600 bg-amber-50 border-amber-200', label: 'متوسطة' },
  high: { color: 'text-orange-600 bg-orange-50 border-orange-200', label: 'عالية' },
  urgent: { color: 'text-red-600 bg-red-50 border-red-200', label: 'عاجلة' },
};

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, onClose, onEdit, onSendEmail }) => {
  if (!task) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Date Logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateObj = new Date(task.dueDate);
  dueDateObj.setHours(0, 0, 0, 0);
  const diffTime = dueDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isCompleted = task.status === 'completed';
  const isDueSoon = !isCompleted && diffDays >= 0 && diffDays <= 5;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${priorityConfig[task.priority].color}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                task.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                task.status === 'in-progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {STATUS_LABELS[task.status]}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 leading-snug">{task.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {onSendEmail && (
               <button 
                 onClick={() => onSendEmail(task)}
                 className="text-slate-400 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-full transition-colors flex items-center gap-2"
                 title="إرسال تفاصيل المهمة للبريد الإلكتروني"
               >
                 <Mail size={20} />
               </button>
            )}
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 flex items-center gap-2">
              <AlignLeft size={18} />
              تفاصيل المهمة
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
              {task.description || "لا توجد تفاصيل إضافية لهذه المهمة."}
            </div>
          </div>

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <Paperclip size={18} />
                المرفقات ({task.attachments.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {task.attachments.map(file => (
                  <a 
                    key={file.id} 
                    href={file.url} 
                    download={file.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50 hover:shadow-sm transition-all group"
                  >
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500 group-hover:bg-white group-hover:text-primary-600">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate group-hover:text-primary-700">{file.name}</p>
                      <p className="text-xs text-slate-400 group-hover:text-primary-400">{formatFileSize(file.size)}</p>
                    </div>
                    <Download size={16} className="text-slate-300 group-hover:text-primary-500" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Start Date */}
            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
              <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">تاريخ البدء</p>
                <p className="font-bold text-slate-800 text-lg">{task.startDate}</p>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
              <div className={`p-3 rounded-lg ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : isDueSoon ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">تاريخ الاستحقاق</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800 text-lg">{task.dueDate}</p>
                  {!isCompleted && diffDays > 0 && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                      diffDays <= 5 
                        ? 'text-amber-600 bg-amber-50' 
                        : 'text-blue-600 bg-blue-50'
                    }`}>
                      متبقي {diffDays} أيام
                    </span>
                  )}
                  {!isCompleted && diffDays === 0 && (
                     <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">اليوم</span>
                  )}
                  {!isCompleted && diffDays < 0 && (
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                      متأخرة {Math.abs(diffDays)} أيام
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Reminder Info (Only if set) */}
            {task.customReminderDate && (
               <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm md:col-span-2">
                  <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
                    <Bell size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">تذكير مخصص</p>
                    <p className="font-bold text-slate-800 text-base" dir="ltr">
                      {new Date(task.customReminderDate).toLocaleString('ar-SA', { 
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                  </div>
               </div>
            )}

          </div>

          {/* ID or System Info */}
          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
             <span>رقم المهمة: {task.id}</span>
             {onEdit && (
               <button 
                 onClick={() => { onClose(); onEdit(task); }}
                 className="text-primary-600 hover:underline font-bold"
               >
                 تعديل بيانات المهمة
               </button>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
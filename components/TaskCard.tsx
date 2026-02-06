import React, { useState, useRef, useEffect } from 'react';
import { Task, PRIORITY_LABELS, STATUS_LABELS } from '../types';
import { Calendar, MoreVertical, CheckCircle2, Circle, Edit, Trash2, AlertCircle, Clock, Mail, FileText, Paperclip, Bell } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: Task['status']) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onClick?: (task: Task) => void;
  onSendEmail?: (task: Task) => void;
}

const priorityColors = {
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onEdit, onDelete, onClick, onSendEmail }) => {
  const isCompleted = task.status === 'completed';
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Date Logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateObj = new Date(task.dueDate);
  dueDateObj.setHours(0, 0, 0, 0);
  
  const diffTime = dueDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const isOverdue = !isCompleted && diffDays < 0;
  // Changed threshold to 5 days as requested
  const isDueSoon = !isCompleted && diffDays >= 0 && diffDays <= 5;

  // Dynamic Styles
  let containerClasses = "rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md relative cursor-pointer ";
  let dateClasses = "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border ";

  if (isCompleted) {
    containerClasses += "bg-slate-50 border-slate-100 opacity-75";
    dateClasses += "text-slate-400 bg-slate-100 border-slate-200";
  } else if (isOverdue) {
    containerClasses += "bg-red-50/60 border-red-200 hover:border-red-300 hover:shadow-red-100";
    dateClasses += "text-red-700 bg-red-100 border-red-200 font-medium";
  } else if (isDueSoon) {
    containerClasses += "bg-amber-50/60 border-amber-200 hover:border-amber-300 hover:shadow-amber-100";
    dateClasses += "text-amber-700 bg-amber-100 border-amber-200 font-medium";
  } else {
    containerClasses += "bg-white border-slate-100 hover:border-slate-200";
    dateClasses += "text-slate-500 bg-slate-50 border-slate-100";
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatReminderDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const isReminderFuture = task.customReminderDate 
    ? new Date(task.customReminderDate).getTime() > new Date().getTime() 
    : false;

  return (
    <div 
      className={containerClasses}
      onClick={() => onClick && onClick(task)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-start">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(task.id, isCompleted ? 'pending' : 'completed');
            }}
            className={`mt-1 transition-colors ${isCompleted ? 'text-primary-500' : isOverdue ? 'text-red-400 hover:text-red-600' : 'text-slate-300 hover:text-primary-500'}`}
          >
            {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
          </button>
          <div>
            <h3 className={`font-bold text-lg text-slate-800 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
              {task.title}
            </h3>
            <p className="text-sm text-slate-500 line-clamp-2 mt-1">{task.description}</p>
          </div>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <MoreVertical size={20} />
          </button>
          
          {showMenu && (
            <div className="absolute left-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={(e) => { 
                  e.stopPropagation();
                  setShowMenu(false); 
                  if (onEdit) onEdit(task); 
                }}
                className="w-full text-right px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Edit size={16} />
                <span>تعديل</span>
              </button>
              
              {onSendEmail && (
                 <button 
                   onClick={(e) => { 
                     e.stopPropagation();
                     setShowMenu(false); 
                     onSendEmail(task);
                   }}
                   className="w-full text-right px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                 >
                   <Mail size={16} />
                   <span>إرسال للبريد</span>
                 </button>
              )}

              <div className="h-px bg-slate-100 my-1"></div>

              <button 
                onClick={(e) => { 
                  e.stopPropagation();
                  setShowMenu(false); 
                  if (onDelete) onDelete(task.id); 
                }}
                className="w-full text-right px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={16} />
                <span>حذف</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Attachments Section - Added visible files */}
      {task.attachments && task.attachments.length > 0 && (
        <div className="mt-3 mb-2 flex flex-col gap-2">
           <div className="flex flex-wrap gap-2">
              {task.attachments.map((file) => (
                <a 
                   key={file.id}
                   href={file.url}
                   target="_blank"
                   rel="noopener noreferrer"
                   onClick={(e) => e.stopPropagation()}
                   className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:border-primary-300 hover:bg-primary-50 text-slate-600 hover:text-primary-700 px-2.5 py-1.5 rounded-lg transition-all text-xs max-w-full group"
                   title={file.name}
                >
                  <FileText size={14} className="text-slate-400 group-hover:text-primary-500 shrink-0" />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                </a>
              ))}
           </div>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${priorityColors[task.priority]}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        
        <div className={dateClasses}>
          {isOverdue ? <AlertCircle size={14} /> : <Calendar size={14} />}
          <span>
            {task.dueDate} 
            {isOverdue && <span className="mr-1">(متأخرة)</span>}
            {!isCompleted && !isOverdue && diffDays === 0 && <span className="mr-1">(اليوم)</span>}
            {!isCompleted && !isOverdue && diffDays === 1 && <span className="mr-1">(غداً)</span>}
            {!isCompleted && !isOverdue && diffDays > 1 && <span className="mr-1">(متبقي {diffDays} أيام)</span>}
          </span>
        </div>

        {/* Custom Reminder Badge - Only show if pending/future */}
        {task.customReminderDate && !isCompleted && isReminderFuture && (
           <div className="flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-100" title="موعد التنبيه المخصص">
              <Bell size={14} className="fill-purple-100" />
              <span>سيتم الإشعار: {formatReminderDate(task.customReminderDate)}</span>
           </div>
        )}

        {task.status === 'in-progress' && (
           <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
             {STATUS_LABELS['in-progress']}
           </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
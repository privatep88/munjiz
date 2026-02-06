import React, { useState } from 'react';
import { Task } from '../types';
import TaskCard from './TaskCard';
import { Archive, CheckCircle2, RotateCcw } from 'lucide-react';
import TaskDetailsModal from './TaskDetailsModal';

interface CompletedTasksLogProps {
  tasks: Task[];
  onStatusChange: (id: string, status: Task['status']) => void;
  onDeleteTask: (id: string) => void;
  onSendEmail: (task: Task) => void;
}

const CompletedTasksLog: React.FC<CompletedTasksLogProps> = ({ tasks, onStatusChange, onDeleteTask, onSendEmail }) => {
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  
  // Filter only completed tasks
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="p-6 md:p-10 space-y-6 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Archive className="text-emerald-600" size={32} />
            سجل المهام المكتملة
          </h2>
          <p className="text-slate-500 mt-1">أرشيف بجميع المهام التي تم إنجازها بنجاح.</p>
        </div>
        
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 shadow-sm">
          <CheckCircle2 size={20} />
          <span className="font-bold">{completedTasks.length} مهمة مكتملة</span>
        </div>
      </div>

      {completedTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {completedTasks.map(task => (
            <div key={task.id} className="relative group">
               {/* Overlay mainly to show it's archived, but task card is still functional */}
              <TaskCard 
                task={task} 
                onStatusChange={onStatusChange}
                onDelete={onDeleteTask}
                onClick={setViewingTask}
                onSendEmail={onSendEmail}
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(task.id, 'pending');
                  }}
                  className="bg-white text-slate-600 hover:text-blue-600 p-2 rounded-full shadow-md border border-slate-100 flex items-center gap-2 text-xs font-bold"
                  title="استعادة للمهام الجارية"
                >
                  <RotateCcw size={14} />
                  <span>استعادة</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl m-4 bg-slate-50/50 py-20">
          <Archive size={64} className="mb-4 opacity-20" />
          <h3 className="text-xl font-bold text-slate-500 mb-2">السجل فارغ</h3>
          <p>لم يتم نقل أي مهام إلى سجل المكتملة بعد.</p>
          <p className="text-sm mt-2">عند تحديد مهمة كـ "مكتملة"، ستظهر هنا تلقائياً.</p>
        </div>
      )}

      {/* Task Details Modal */}
      {viewingTask && (
        <TaskDetailsModal 
          task={viewingTask} 
          onClose={() => setViewingTask(null)} 
          onSendEmail={onSendEmail}
        />
      )}
    </div>
  );
};

export default CompletedTasksLog;
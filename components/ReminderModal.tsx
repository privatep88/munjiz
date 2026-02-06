import React, { useEffect, useState } from 'react';
import { Bell, X, Clock, CheckCircle2, AlertCircle, Ban } from 'lucide-react';

interface ReminderModalProps {
  isOpen: boolean;
  data: { title: string; message: string; taskId?: string } | null;
  onClose: () => void;
  onSnooze: (taskId: string) => void;
  onStopReminders?: (taskId: string) => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, data, onClose, onSnooze, onStopReminders }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      setTimeout(() => setVisible(false), 200);
    }
  }, [isOpen]);

  if (!visible && !isOpen) return null;
  if (!data) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Card */}
      <div className={`bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
        {/* Header decoration */}
        <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-white/10 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center animate-bounce shadow-inner border border-white/20">
                <Bell size={40} className="text-white drop-shadow-md" />
            </div>
        </div>

        <div className="p-6 text-center">
          <h3 className="text-sm font-bold text-indigo-600 tracking-wider mb-2 flex items-center justify-center gap-1">
             <AlertCircle size={16} />
             تذكير بالمهمة
          </h3>
          <h2 className="text-2xl font-black text-slate-800 mb-4 leading-tight">
            {data.title}
          </h2>
          <p className="text-slate-500 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {data.message}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => {
                if(data.taskId) onSnooze(data.taskId);
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-slate-700 bg-white border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all active:scale-95"
            >
              <Clock size={18} />
              <span>تأجيل</span>
            </button>
            
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              <CheckCircle2 size={18} />
              <span>حسناً</span>
            </button>
          </div>

          {/* Stop Reminders Button */}
          {onStopReminders && data.taskId && (
            <button
              onClick={() => {
                 onStopReminders(data.taskId!);
                 onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Ban size={16} />
              <span>إيقاف التذكيرات لهذه المهمة</span>
            </button>
          )}
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ReminderModal;
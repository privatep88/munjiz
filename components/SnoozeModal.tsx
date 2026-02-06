import React, { useState } from 'react';
import { X, Clock, Calendar } from 'lucide-react';

interface SnoozeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dateStr: string) => void;
  title: string;
}

const SnoozeModal: React.FC<SnoozeModalProps> = ({ isOpen, onClose, onConfirm, title }) => {
  const [customSnoozeDate, setCustomSnoozeDate] = useState('');

  if (!isOpen) return null;

  // Helper to format ISO date for datetime-local input
  const getISODateString = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const getTomorrowMorning = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return getISODateString(d);
  };

  const handleQuickSnooze = (minutes: number) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    onConfirm(getISODateString(date));
  };

  const handleCustomConfirm = () => {
    if (customSnoozeDate) {
      onConfirm(customSnoozeDate);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95" 
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Clock size={18} className="text-indigo-600" />
            تخصيص وقت التذكير
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 mb-2">
            إعادة جدولة التذكير للمهمة: <span className="font-bold text-slate-800 block mt-1 truncate">{title}</span>
          </p>
          
          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => handleQuickSnooze(15)} className="py-2.5 px-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-sm font-medium text-slate-700 transition-colors">
                بعد 15 دقيقة
             </button>
             <button onClick={() => handleQuickSnooze(60)} className="py-2.5 px-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-sm font-medium text-slate-700 transition-colors">
                بعد ساعة
             </button>
             <button onClick={() => handleQuickSnooze(180)} className="py-2.5 px-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-sm font-medium text-slate-700 transition-colors">
                بعد 3 ساعات
             </button>
             <button onClick={() => onConfirm(getTomorrowMorning())} className="py-2.5 px-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-sm font-medium text-slate-700 transition-colors">
                غداً صباحاً (9 ص)
             </button>
          </div>

          <div className="relative border-t border-slate-100 pt-4 mt-2">
             <label className="text-xs font-bold text-slate-500 mb-2 block flex items-center gap-1">
               <Calendar size={12} />
               أو اختر وقتاً محدداً:
             </label>
             <div className="flex gap-2">
                <input 
                  type="datetime-local" 
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm ltr-input focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                  style={{ direction: 'ltr' }}
                  value={customSnoozeDate}
                  onChange={(e) => setCustomSnoozeDate(e.target.value)}
                />
                <button 
                  onClick={handleCustomConfirm}
                  disabled={!customSnoozeDate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  تأكيد
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnoozeModal;
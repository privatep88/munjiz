import React, { useState } from 'react';
import { Task } from '../types';
import { analyzeTasks } from '../services/geminiService';
import { BrainCircuit, Sparkles, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, tasks }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeTasks(tasks);
    setAnalysis(result);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
              <BrainCircuit size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">المساعد الذكي</h2>
              <p className="text-indigo-100 text-sm opacity-90">مدعوم بواسطة Gemini AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
          {!analysis && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-2">
                <Sparkles size={32} />
              </div>
              <div className="max-w-md">
                <h3 className="text-lg font-bold text-slate-800 mb-2">تحليل جدول أعمالك</h3>
                <p className="text-slate-500 mb-6">
                  يمكنني مساعدتك في تنظيم يومك، تحديد الأولويات، وتقديم نصائح لزيادة الإنتاجية بناءً على مهامك الحالية.
                </p>
                <button
                  onClick={handleAnalyze}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                >
                  <Sparkles size={18} />
                  <span>تحليل المهام الآن</span>
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-600 font-medium animate-pulse">جاري تحليل البيانات...</p>
            </div>
          )}

          {analysis && !loading && (
            <div className="prose prose-slate prose-invert max-w-none text-right" dir="rtl">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                 <ReactMarkdown 
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-indigo-700 mb-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3 border-b border-indigo-100 pb-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pr-5 space-y-2 mb-4 text-slate-700" {...props} />,
                      li: ({node, ...props}) => <li className="" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-indigo-900" {...props} />
                    }}
                 >
                   {analysis}
                 </ReactMarkdown>
              </div>
              <div className="mt-6 flex justify-center">
                 <button 
                   onClick={handleAnalyze}
                   className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1"
                 >
                   <Sparkles size={14} />
                   <span>تحديث التحليل</span>
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
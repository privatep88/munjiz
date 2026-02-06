import React, { useState, useEffect } from 'react';
import { 
  Bell, Mail, User, Globe, Camera, 
  Smartphone, Volume2, Clock, Save,
  ChevronDown, CheckCircle2, Languages, Play, Zap, ShieldCheck
} from 'lucide-react';

interface SettingsData {
  fullName: string;
  jobTitle: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  soundEnabled: boolean;
  language: string;
  timezone: string;
  reminderTime: string;
}

interface SettingsViewProps {
  settings: SettingsData;
  onSave: (settings: SettingsData) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  // Local state for form fields
  const [formData, setFormData] = useState<SettingsData>(settings);
  const [isSaved, setIsSaved] = useState(false);

  // Sync with props if they change externally (optional but good practice)
  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (key: keyof SettingsData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Reset success indicator
  };

  const handleCancel = () => {
    setFormData(settings); // Revert to original props
  };

  const testSound = () => {
      try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(523.25 * 2, now);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.05, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + 1.5);
      osc2.stop(now + 1.5);

      // FIX: Close context after playing to prevent running out of audio contexts
      setTimeout(() => {
        if(ctx.state !== 'closed') {
          ctx.close().catch(console.error);
        }
      }, 1600);

    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  // Helper component for "Active" badge
  const ActiveBadge = () => (
    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 animate-in fade-in">
      <CheckCircle2 size={10} />
      <span>نشط</span>
    </span>
  );

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800">الإعدادات والتذكيرات</h2>
        <p className="text-slate-500 mt-2 text-lg">تحكم في تفضيلات حسابك، أوقات التذكير، ولغة النظام</p>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <User size={20} className="text-primary-600" />
            المعلومات الشخصية
          </h3>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Form Fields */}
            <div className="flex-1 w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
                  <input 
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">المسمى الوظيفي</label>
                  <input 
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <input 
                    disabled 
                    value="munjiz@munjiz.ae" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" 
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                  <User size={40} className="text-slate-300" />
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <button className="text-sm font-bold text-primary-600 hover:text-primary-700">تحديث الصورة</button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Preferences Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Bell size={20} className="text-primary-600" />
            تفضيلات الإشعارات والتنبيهات
          </h3>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Email Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className={`hidden sm:flex w-12 h-12 rounded-full items-center justify-center transition-colors ${formData.emailEnabled ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-600'}`}>
                <Mail size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-base">إشعارات البريد الإلكتروني</h4>
                    {formData.emailEnabled && <ActiveBadge />}
                </div>
                <p className="text-sm text-slate-500 mt-1">تلقي ملخص يومي وتحديثات المهام عبر البريد</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.emailEnabled}
                onChange={(e) => handleChange('emailEnabled', e.target.checked)}
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <hr className="border-slate-50" />

          {/* In-App Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className={`hidden sm:flex w-12 h-12 rounded-full items-center justify-center transition-colors ${formData.inAppEnabled ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>
                <Smartphone size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-base">إشعارات داخل التطبيق (نوافذ منبثقة)</h4>
                    {formData.inAppEnabled && <ActiveBadge />}
                </div>
                <p className="text-sm text-slate-500 mt-1">ظهور النوافذ المنبثقة عند استحقاق المهام (قبل 5 أيام، وقبل يوم واحد)</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.inAppEnabled}
                onChange={(e) => handleChange('inAppEnabled', e.target.checked)}
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <hr className="border-slate-50" />

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className={`hidden sm:flex w-12 h-12 rounded-full items-center justify-center transition-colors ${formData.soundEnabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-600'}`}>
                <Volume2 size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-base">أصوات التنبيه</h4>
                    {formData.soundEnabled && <ActiveBadge />}
                </div>
                <p className="text-sm text-slate-500 mt-1">تشغيل نغمة عند وصول إشعار جديد أو تذكير</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                 onClick={testSound}
                 className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors"
                 title="تجربة الصوت"
              >
                <Play size={12} fill="currentColor" />
                <span>تجربة</span>
              </button>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.soundEnabled}
                  onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Regional Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Globe size={20} className="text-primary-600" />
              إعدادات المنطقة
            </h3>
          </div>
          <div className="p-8 space-y-6 flex-1">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700">لغة النظام</label>
                {/* Visual Proof of Active Setting */}
                <ActiveBadge />
              </div>
              <div className="relative group">
                <select 
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none appearance-none cursor-pointer hover:border-primary-200 transition-colors"
                >
                  <option value="ar">العربية (الأساسية)</option>
                  <option value="en">English (English)</option>
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-primary-500 transition-colors">
                  <Languages className="ml-2" size={20} />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">اللغة العربية هي اللغة الافتراضية للنظام.</p>
            </div>

            <div>
               <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700">المنطقة الزمنية</label>
                <ActiveBadge />
              </div>
              <div className="relative group">
                <select 
                  value={formData.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none appearance-none cursor-pointer hover:border-primary-200 transition-colors"
                >
                  <option value="Dubai (GMT+04:00)">الإمارات (GMT+04:00)</option>
                </select>
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-primary-500 transition-colors" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Reminder Timing */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary-600" />
              توقيت التذكيرات
            </h3>
          </div>
          <div className="p-8 space-y-6 flex-1">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700">وقت التذكير الافتراضي</label>
                <ActiveBadge />
              </div>
              <div className="relative group">
                <select 
                  value={formData.reminderTime}
                  onChange={(e) => handleChange('reminderTime', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none appearance-none cursor-pointer hover:border-primary-200 transition-colors"
                >
                  <option value="1">في نفس اليوم</option>
                  <option value="24">قبل يوم واحد (٢٤ ساعة)</option>
                  <option value="48">قبل يومين (٤٨ ساعة)</option>
                  <option value="120">قبل ٥ أيام (تلقائي)</option>
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-primary-500 transition-colors" size={18} />
              </div>
              <p className="text-xs text-slate-400 mt-2 bg-blue-50 p-2 rounded-lg text-blue-600 flex items-center gap-1 border border-blue-100">
                <Zap size={12} fill="currentColor" />
                سيتم تطبيق توقيت التذكير المختار ({formData.reminderTime === '1' ? 'نفس اليوم' : formData.reminderTime === '120' ? 'قبل 5 أيام' : 'قبل ' + (parseInt(formData.reminderTime)/24) + ' يوم'}) على نظام التنبيهات.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-200 mt-8">
        <button 
          onClick={handleSave}
          className={`bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary-200 transition-all flex items-center gap-2 ${isSaved ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
        >
          {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          <span>{isSaved ? 'تم الحفظ وتطبيق التغييرات' : 'حفظ الإعدادات'}</span>
        </button>
        <button 
          onClick={handleCancel}
          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all"
        >
          إلغاء التغييرات
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
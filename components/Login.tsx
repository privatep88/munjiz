import React, { useState } from 'react';
import { CheckSquare, ArrowRight, User, ShieldCheck, Globe } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('Aljefre');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-row overflow-hidden bg-slate-50 font-sans text-slate-900" dir="rtl">
      {/* Right Section (Form) */}
      <div className="flex w-full flex-col justify-center bg-white px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:w-5/12 shadow-xl z-10 relative">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <CheckSquare size={28} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">تطبيق منجز</h2>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900">
              تسجيل الدخول
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              مرحباً بك مجدداً! الرجاء إدخال اسمك للمتابعة.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900" htmlFor="username">
                اسم المستخدم
              </label>
              <div className="relative flex h-12 w-full items-center rounded-lg bg-slate-100 focus-within:ring-2 focus-within:ring-primary-500/50 transition-all border border-transparent focus-within:border-primary-500 focus-within:bg-white">
                <div className="flex h-full w-12 items-center justify-center text-slate-400">
                  <User size={20} />
                </div>
                <input
                  className="h-full flex-1 border-none bg-transparent px-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                  id="username"
                  name="username"
                  placeholder="الاسم الكامل..."
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!username.trim()}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary-600 py-3 text-sm font-bold text-white transition-all hover:bg-primary-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span>دخول</span>
              {/* Icon rotated for RTL flow */}
              <ArrowRight size={18} className="rotate-180 transition-transform group-hover:-translate-x-1" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-12 border-t border-slate-100 pt-6 text-center">
            <div className="flex justify-center gap-6">
              <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">سياسة الخصوصية</button>
              <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">شروط الاستخدام</button>
              <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">المساعدة</button>
            </div>
          </div>
        </div>
      </div>

      {/* Left Section (Image/Brand) */}
      <div className="relative hidden w-0 flex-1 lg:block bg-slate-900">
        <div className="absolute inset-0 h-full w-full">
            <img 
                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                alt="Office" 
                className="h-full w-full object-cover opacity-40 mix-blend-overlay"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/10" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end p-20 text-white z-20">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl">
            <CheckSquare size={32} className="text-white" />
          </div>
          <h2 className="mb-4 max-w-lg text-4xl font-black leading-tight tracking-tight">
            إدارة مهامك بكفاءة عالية واحترافية
          </h2>
          <p className="max-w-md text-lg font-normal leading-relaxed text-slate-300">
            المنصة العربية الأولى لإدارة فرق العمل والمهام اليومية بمرونة وسهولة.
          </p>
          
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/5">
              <ShieldCheck size={18} />
              <span className="text-sm font-bold">آمن وموثوق</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/5">
              <Globe size={18} />
              <span className="text-sm font-bold">دعم عربي كامل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
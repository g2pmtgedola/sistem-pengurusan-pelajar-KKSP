import React, { useState } from 'react';
import InteractiveLogo from './InteractiveLogo';
import { 
  ShieldCheck, 
  GraduationCap, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';

export default function LoginScreen({ onLogin, users }) {
  const [selectedRole, setSelectedRole] = useState('admin'); // 'admin' | 'pensyarah'
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Switch role preset handler
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('pensyarah');
      setPassword('pensyarah123');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      // Find matching user
      const matched = users.find(u => 
        (u.username.toLowerCase() === username.trim().toLowerCase() || 
         u.email.toLowerCase() === username.trim().toLowerCase()) && 
        u.password === password
      );

      if (matched) {
        if (matched.status === 'Tidak Aktif') {
          setErrorMessage('Akaun ini telah dinyahaktifkan oleh Pentadbir Sistem.');
          setIsLoading(false);
          return;
        }
        onLogin(matched);
      } else {
        setErrorMessage('Nama pengguna atau kata laluan tidak tepat. Sila semak semula.');
        setIsLoading(false);
      }
    }, 350);
  };

  const handleQuickLogin = (roleOrUsername) => {
    const targetUser = users.find(u => u.username === roleOrUsername) || users.find(u => u.role === roleOrUsername);
    if (targetUser) {
      setIsLoading(true);
      setTimeout(() => {
        onLogin(targetUser);
      }, 250);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Decorative Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-slate-300/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Login Card Container */}
      <div className="w-full max-w-md z-10 space-y-5">
        {/* Top Header Card */}
        <div className="clay-card p-6 text-center space-y-3 bg-white/90 border border-white">
          <div className="flex justify-center">
            <InteractiveLogo size="lg" />
          </div>

          <div>
            <span className="text-[10px] font-black tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full uppercase inline-block">
              SISTEM MAKLUMAT & AKTIVITI PELAJAR
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
              Kolej Komuniti Sungai Petani
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Portal Bersepadu Pengurusan Hal Ehwal Pelajar, Biasiswa, Kokurikulum & Program
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="clay-card p-6 sm:p-7 bg-white space-y-5 border border-slate-200 shadow-xl">
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-2 text-center">
              PILIH PERANAN LOG MASUK
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-slate-900 text-white shadow-md ring-2 ring-amber-400/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${selectedRole === 'admin' ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>Admin UPP</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('pensyarah')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'pensyarah'
                    ? 'bg-slate-900 text-white shadow-md ring-2 ring-indigo-400/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${selectedRole === 'pensyarah' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>Pensyarah</span>
              </button>
            </div>
          </div>

          {/* Role Feature Indicator */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            {selectedRole === 'admin' ? (
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-black block">Akses Pentadbir (Admin):</strong>
                  <span>Akses penuh ke semua modul sistem termasuk <strong>Pengurusan Ahli & Kakitangan</strong> (edit, delete, reset kata laluan).</span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-black block">Akses Pensyarah Akademik:</strong>
                  <span>Urus data pelajar, biasiswa BKPKK, keahlian kelab & pelaksanaan program kokurikulum.</span>
                </div>
              </div>
            )}
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Nama Pengguna / Emel *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: admin atau pensyarah"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full clay-input pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 bg-white"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Kata Laluan *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata laluan"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full clay-input pl-9 pr-10 py-2.5 text-xs font-bold text-slate-900 bg-white"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute right-2.5 top-2 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer rounded-xl shadow-md active:scale-98 border border-slate-700"
            >
              {isLoading ? (
                <span>Mengesahkan...</span>
              ) : (
                <>
                  <span>Log Masuk Sistem</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login (Pilihan Log Masuk Pantas 1-Klik) */}
          <div className="pt-3 border-t border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-center mb-2.5">
              LOG MASUK PANTAS (DEMO 1-KLIK)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-300 text-amber-950 text-left transition-all cursor-pointer flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-black block text-amber-900 group-hover:text-amber-950 truncate">
                    Sebagai Admin
                  </span>
                  <span className="text-[9px] text-amber-700 font-mono block">admin (Semua Kelas)</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('pensyarah')}
                className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-950 text-left transition-all cursor-pointer flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black shrink-0">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-black block text-indigo-900 group-hover:text-indigo-950 truncate">
                    Pensyarah SPK 1A
                  </span>
                  <span className="text-[9px] text-indigo-700 font-mono block">pensyarah (Kelas SPK 1A)</span>
                </div>
              </button>
            </div>

            {/* Quick class switcher pills for testing other lecturers */}
            <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 flex items-center justify-between gap-1.5 flex-wrap">
              <span className="text-[9px] font-bold text-slate-500">Uji Kelas Lain:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('syahrul')}
                  className="px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-900 border border-slate-300 transition-all cursor-pointer"
                  title="En. Syahrul Nizam - Pensyarah SPK 1B"
                >
                  SPK 1B (@syahrul)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('norhayati')}
                  className="px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-900 border border-slate-300 transition-all cursor-pointer"
                  title="Pn. Norhayati - Pensyarah SPK 2A"
                >
                  SPK 2A (@norhayati)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 font-semibold space-y-1">
          <p>© 2026 Kolej Komuniti Sungai Petani. Hak Cipta Terpelihara.</p>
          <p className="text-[10px] text-slate-400">Unit Pembangunan Pelajar (UPP) & Unit Pengurusan Sistem Maklumat</p>
        </div>
      </div>
    </div>
  );
}

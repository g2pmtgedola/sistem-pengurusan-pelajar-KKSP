import React from 'react';
import { Search, Bell, Download, Upload, ShieldCheck, GraduationCap } from 'lucide-react';

export default function HeaderBanner({ totalStudents, onQuickSearch }) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-20">
      {/* Top Banner with Logos & Title matching the user's screenshots */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          {/* Logo visual badge */}
          <div className="flex items-center gap-2">
            <div className="h-10 px-3 py-1 bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-md flex items-center font-black tracking-tight text-sm shadow-xs">
              <span className="text-amber-400 mr-1.5 text-base">▶</span> Kolej Komuniti Sungai Petani
            </div>
            <div className="h-10 px-3 py-1 bg-amber-500 text-slate-900 rounded-md font-bold text-xs flex items-center shadow-xs">
              @KKSP PROGRESS
            </div>
            <div className="h-10 px-3 py-1 bg-purple-700 text-white rounded-md font-bold text-xs flex items-center shadow-xs">
              UPP KKSP
            </div>
          </div>

          <div className="hidden lg:block h-8 w-[1px] bg-slate-200"></div>

          <div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
              SISTEM PENGURUSAN AKTIVITI & MAKLUMAT PELAJAR
            </h2>
            <p className="text-xs font-semibold text-blue-700">
              Kolej Komuniti Sungai Petani, KEDAH DARUL AMAN
            </p>
          </div>
        </div>

        {/* Status stats on header */}
        <div className="flex items-center gap-4">
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-600" />
            <div>
              <div className="text-[10px] text-amber-700 uppercase font-bold tracking-wider leading-none">
                Jumlah Pelajar Berdaftar
              </div>
              <div className="text-lg font-black text-amber-900 leading-tight">
                {totalStudents} <span className="text-xs font-normal">Orang</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-2 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sesi Semasa 2024/2025</span>
          </div>
        </div>
      </div>
    </header>
  );
}


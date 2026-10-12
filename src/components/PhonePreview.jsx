import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Radar, 
  DollarSign, 
  Compass, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  Wifi,
  Battery,
  Sparkles,
  Search,
  ExternalLink,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Doughnut, Radar as RadarChart } from 'react-chartjs-2';
import InteractiveLogo from './InteractiveLogo';

export default function PhonePreview({
  students,
  enrollmentData,
  programs,
  scholarships,
  clubs,
  activeTab,
  setActiveTab,
  currentUser
}) {
  const [phoneScreen, setPhoneScreen] = useState('home'); // 'home' | 'students' | 'enrollment' | 'programs' | 'spider' | 'scholarships' | 'clubs'

  // Calculations for quick preview
  const currentEnrollment = enrollmentData[enrollmentData.length - 1]?.count || 72;
  const totalScholarshipRM = scholarships.reduce((acc, c) => acc + (Number(c.jumlah) || 0), 0);

  // Active top student for radar preview
  const topStudent = students[0];

  const radarData = {
    labels: ['Cergas', 'Pimpin', 'Rohani', 'Ilmu', 'Usahawan', 'Inovasi'],
    datasets: [
      {
        label: topStudent?.nama?.split(' ')[0] || 'Pelajar',
        data: [85, 95, 80, 95, 90, 85],
        backgroundColor: 'rgba(245, 158, 11, 0.4)',
        borderColor: '#f59e0b',
        borderWidth: 2,
        pointBackgroundColor: '#d97706',
        pointRadius: 3,
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { display: false },
        pointLabels: { font: { size: 9, weight: 'bold' } }
      }
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-6">
      {/* Visual Device Frame (Claymorphic / Soft Apple iPhone Style) */}
      <div className="phone-outer-frame w-full max-w-[390px] shadow-2xl transition-all">
        <div className="phone-inner-screen min-h-[780px] max-h-[820px] flex flex-col justify-between p-4 sm:p-5 select-none">
          
          {/* Top Notch & Status Bar (Identical to reference screenshot) */}
          <div className="w-full flex items-center justify-between text-xs font-bold text-slate-800 px-3 pt-1 pb-3">
            <span className="font-semibold text-xs tracking-tight">15:11</span>
            
            {/* Dynamic Island / Notch */}
            <div className="w-24 h-5 bg-black rounded-full mx-auto -mt-1 shadow-inner flex items-center justify-end pr-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-800">
              <span className="text-[10px]">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 fill-current" />
            </div>
          </div>

          {/* Sub Header (Mobile title & pill icons from reference) */}
          <div className="flex items-center justify-between px-2 mb-3">
            <InteractiveLogo size="sm" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full clay-btn flex items-center justify-center text-slate-600">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="w-8 h-8 rounded-full clay-btn flex items-center justify-center text-slate-600 font-black text-[11px]">
                ∞
              </div>
            </div>
          </div>

          {/* SCREEN CONTENT: Dynamic depending on user navigation */}
          <div className="flex-1 overflow-y-auto space-y-3 px-1 py-1">
            {phoneScreen === 'home' && (
              <>
                {/* 1. Large Pill: Maklumat Pelajar (Matching reference Messages pill with Green 3D Badge) */}
                <div
                  onClick={() => setPhoneScreen('students')}
                  className="clay-card-pill p-4 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-sm text-slate-900 truncate">
                        Maklumat Pelajar
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {students.length} Orang Berdaftar
                      </div>
                    </div>
                  </div>

                  {/* Reference Image Green Round 3D Badge with small 'S' badge */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full clay-badge-green flex items-center justify-center text-white font-black text-sm">
                      {students.length}
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[8px] font-bold flex items-center justify-center border-2 border-white">
                      ✓
                    </div>
                  </div>
                </div>

                {/* 2. Large Pill: Enrolmen (Admin) ATAU BKPKK & Biasiswa (Pensyarah) */}
                {currentUser?.role === 'pensyarah' ? (
                  <div
                    onClick={() => setPhoneScreen('scholarships')}
                    className="clay-card-pill p-4 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm text-slate-900 truncate">
                          BKPKK & Biasiswa
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {scholarships.length} Rekod Pelajar
                        </div>
                      </div>
                    </div>

                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full clay-badge-green flex items-center justify-center text-white font-black text-sm">
                        {scholarships.length}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setPhoneScreen('enrollment')}
                    className="clay-card-pill p-4 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm text-slate-900 truncate">
                          Enrolmen Tahunan
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Tahun Terkini: {currentEnrollment} Pelajar
                        </div>
                      </div>
                    </div>

                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full clay-badge-red flex items-center justify-center text-white font-black text-sm">
                        {currentEnrollment}
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-700 text-white text-[8px] font-bold flex items-center justify-center border-2 border-white">
                        1
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Large Pill: Program Siswa (Matching reference Alerts pill with Orange 3D Badge) */}
                <div
                  onClick={() => setPhoneScreen('programs')}
                  className="clay-card-pill p-4 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-sm text-slate-900 truncate">
                        Program Pelajar
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {programs.length} Aktiviti Didaftar
                      </div>
                    </div>
                  </div>

                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full clay-badge-orange flex items-center justify-center text-white font-black text-sm">
                      {programs.length}
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-600 text-white text-[8px] font-bold flex items-center justify-center border-2 border-white">
                      2
                    </div>
                  </div>
                </div>

                {/* 4. Large Pill: Spider Web Radar Potensi (Matching reference Alerts pill with User Avatar Badge) */}
                <div
                  onClick={() => setPhoneScreen('spider')}
                  className="clay-card-pill p-4 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Radar className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-sm text-slate-900 truncate">
                        Spider Web Radar
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        6 Dimensi Potensi Siswa
                      </div>
                    </div>
                  </div>

                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full clay-badge-blue flex items-center justify-center text-white font-black text-xs">
                      6D
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-700 text-white text-[8px] font-bold flex items-center justify-center border-2 border-white">
                      ★
                    </div>
                  </div>
                </div>

                {/* Quick 2-Column Mini Links (Matching reference bottom mini list) */}
                <div className="clay-card-sm p-3.5 grid grid-cols-2 gap-2 mt-2">
                  <div
                    onClick={() => setPhoneScreen('scholarships')}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-white transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-[11px] font-bold text-slate-700 truncate">BKPKK</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div
                    onClick={() => setPhoneScreen('clubs')}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-white transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Compass className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="text-[11px] font-bold text-slate-700 truncate">Kelab</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </>
            )}

            {/* SCREEN: Students List on Mobile */}
            {phoneScreen === 'students' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2">
                  <span className="font-extrabold text-xs text-slate-800">Senarai Pelajar ({students.length})</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    SPK KKSP
                  </span>
                </div>

                <div className="space-y-2 max-h-[440px] overflow-y-auto pr-0.5">
                  {students.slice(0, 15).map((s) => (
                    <div key={s.matrik} className="clay-card-sm p-3 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-xs text-slate-900 truncate">{s.nama}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{s.matrik} • {s.kelas}</div>
                        <div className="text-[9px] text-amber-600 font-medium truncate">🏠 {s.rumahSewa || '-'}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 whitespace-nowrap">
                        CGPA {s.cgpa}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN: Enrollment on Mobile */}
            {phoneScreen === 'enrollment' && (
              <div className="space-y-3">
                <div className="clay-card-sm p-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider block">STATUS TERKINI</span>
                  <div className="text-2xl font-black">{currentEnrollment} Orang</div>
                  <span className="text-[10px] text-amber-100">Sesi Semasa Kolej Komuniti Sungai Petani</span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto">
                  {enrollmentData.slice().reverse().map(e => (
                    <div key={e.year} className="clay-card-sm p-2.5 flex items-center justify-between">
                      <span className="font-black text-xs px-2.5 py-1 rounded bg-slate-800 text-white">
                        {e.year}
                      </span>
                      <span className="font-bold text-sm text-slate-800">
                        {e.count} <span className="text-[10px] font-normal text-slate-500">Orang</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN: Spider Web on Mobile */}
            {phoneScreen === 'spider' && (
              <div className="space-y-3">
                <div className="clay-card-sm p-3 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Pelajar Pilihan</span>
                  <div className="font-black text-xs text-slate-900 truncate">{topStudent?.nama}</div>
                  <span className="text-[10px] text-amber-600 font-mono">{topStudent?.matrik}</span>

                  <div className="h-44 mt-2">
                    <RadarChart data={radarData} options={radarOptions} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="clay-card-sm p-1.5">
                    <span className="text-[8px] text-slate-400 uppercase block">Cergas</span>
                    <span className="font-black text-xs text-cyan-600">85%</span>
                  </div>
                  <div className="clay-card-sm p-1.5">
                    <span className="text-[8px] text-slate-400 uppercase block">Pimpin</span>
                    <span className="font-black text-xs text-blue-600">95%</span>
                  </div>
                  <div className="clay-card-sm p-1.5">
                    <span className="text-[8px] text-slate-400 uppercase block">Rohani</span>
                    <span className="font-black text-xs text-amber-600">80%</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN: Programs on Mobile */}
            {phoneScreen === 'programs' && (
              <div className="space-y-2 max-h-[440px] overflow-y-auto">
                {programs.map(p => (
                  <div key={p.id} className="clay-card-sm p-3 space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-xs text-slate-900 leading-tight line-clamp-2">
                        {p.namaProgram}
                      </span>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 whitespace-nowrap">
                        {p.peringkat}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {p.kategori} • {p.peserta.length} Peserta
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600">
                      🏆 {p.pencapaian}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SCREEN: Scholarships on Mobile */}
            {phoneScreen === 'scholarships' && (
              <div className="space-y-2 max-h-[440px] overflow-y-auto">
                <div className="clay-card-sm p-3 bg-emerald-50 text-emerald-900 text-center">
                  <span className="text-[10px] font-bold block uppercase">Jumlah BKPKK Disalurkan</span>
                  <div className="text-xl font-black">RM {totalScholarshipRM.toLocaleString()}</div>
                </div>

                {scholarships.map(s => (
                  <div key={s.id} className="clay-card-sm p-2.5 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-xs text-slate-900 truncate">{s.namaPelajar}</div>
                      <div className="text-[10px] text-slate-500 truncate">{s.jenisBantuan}</div>
                    </div>
                    <span className="font-black text-xs text-emerald-700 whitespace-nowrap">
                      RM {s.jumlah}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* SCREEN: Clubs on Mobile */}
            {phoneScreen === 'clubs' && (
              <div className="space-y-2 max-h-[440px] overflow-y-auto">
                {clubs.map(c => (
                  <div key={c.id} className="clay-card-sm p-3">
                    <div className="font-bold text-xs text-purple-900">{c.namaKelab}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Penasihat: {c.penasihat}</div>
                    <div className="flex justify-between items-center mt-2 text-[10px] font-semibold text-slate-600">
                      <span>{c.kategori}</span>
                      <span className="text-purple-700 font-bold">{c.bilAhli} Ahli</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOTTOM CONTROLS (Identical to 3-circle buttons in reference mockup) */}
          <div className="flex items-center justify-center gap-4 pt-4 pb-2 border-t border-slate-200/40">
            {/* Left Button */}
            <button
              onClick={() => setPhoneScreen('home')}
              title="Kembali ke Menu Utama"
              className="w-12 h-12 rounded-full clay-btn flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Center Main Pill Button (Matches reference middle tall round button) */}
            <button
              onClick={() => setPhoneScreen('home')}
              title="Skrin Utama"
              className="w-16 h-16 rounded-full clay-btn flex items-center justify-center text-slate-800 shadow-md active:scale-95 cursor-pointer"
            >
              <div className="w-2 h-6 bg-slate-400 rounded-full"></div>
            </button>

            {/* Right Button */}
            <button
              onClick={() => {
                const nextScreen = 
                  phoneScreen === 'home' ? 'students' :
                  phoneScreen === 'students' ? 'enrollment' :
                  phoneScreen === 'enrollment' ? 'spider' : 'home';
                setPhoneScreen(nextScreen);
              }}
              title="Seterusnya"
              className="w-12 h-12 rounded-full clay-btn flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}


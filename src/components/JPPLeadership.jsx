import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import TabHeroBanner from './TabHeroBanner';

export default function JPPLeadership({ students, clubs }) {
  // Find JPP Club
  const jppClub = clubs.find(c => c.id === 'CLB-01') || {
    namaKelab: 'Jawatankuasa Perwakilan Pelajar (JPP)',
    penasihat: 'En. Mohd Rosli bin Ahmad',
    ahliPelajar: []
  };

  const dutySchedule = [
    { hari: 'Isnin', tarikh: 'Setiap Isnin', masa: '08:00 PG - 05:00 PTG', bertugas: 'NUR SHAHRINA BINTI ABDUL HAMID (YDP)', lokasi: 'Bilik JPP / Kaunter UPP' },
    { hari: 'Selasa', tarikh: 'Setiap Selasa', masa: '08:00 PG - 05:00 PTG', bertugas: 'MOHAMMAD ISYRAF IZUDDIN BIN SHAM (NYDP 1)', lokasi: 'Bilik JPP' },
    { hari: 'Rabu', tarikh: 'Setiap Rabu', masa: '08:00 PG - 05:00 PTG', bertugas: 'NUR ASYIKIN BINTI CHE MAHHADER (Setiausaha)', lokasi: 'Bilik Mesyuarat Pelajar' },
    { hari: 'Khamis', tarikh: 'Setiap Khamis', masa: '08:00 PG - 05:00 PTG', bertugas: 'MUHAMMAD AIMAN NAJMI BIN ASRUL (Exco Sukan)', lokasi: 'Pusat Aktiviti Siswa' },
    { hari: 'Jumaat', tarikh: 'Setiap Jumaat', masa: '08:00 PG - 12:15 TGH', bertugas: 'Semua Exco JPP Bertugas Bersama', lokasi: 'Surau & Dewan Kuliah' }
  ];

  return (
    <div className="space-y-6">
      {/* Dark Theme Hero Banner Matching User Reference */}
      <TabHeroBanner
        badge="KOLEJ KOMUNITI SUNGAI PETANI @ MAJLIS KEPIMPINAN SISWA"
        title="Jawatankuasa Perwakilan Pelajar (JPP) & Takwim Bertugas"
        subtitle="Struktur Majlis Tertinggi JPP Kolej Komuniti Sungai Petani Sesi 2023/2024 beserta takwim jadual giliran tugas harian di Bilik Gerakan & Kaunter UPP."
      >
        <div className="px-4 py-2 bg-[#f59e0b] text-slate-950 font-black text-xs rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-950" />
          <span>Pegawai Penasihat: {jppClub.penasihat}</span>
        </div>

        <div className="px-4 py-2 bg-slate-800/80 rounded-full border border-slate-600/60 text-slate-200 text-xs font-bold flex items-center gap-2 backdrop-blur-xs">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>Giliran Bertugas: <strong className="text-white text-sm font-black ml-1">5 Hari Aktif (Isnin - Jumaat)</strong></span>
        </div>
      </TabHeroBanner>

      {/* Grid: Barisan JPP Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {jppClub.ahliPelajar.map((leader, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-900 font-black text-lg flex items-center justify-center shadow-md">
              {leader.studentName.slice(0, 2)}
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
                {leader.jawatan}
              </span>
              <h3 className="font-bold text-xs text-slate-900 line-clamp-1" title={leader.studentName}>
                {leader.studentName}
              </h3>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">{leader.studentId}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Duty Roster Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Takwim Giliran Jadual Bertugas Kaunter & Bilik Gerakan JPP
          </h2>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            Aktif Mingguan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-4">HARI</th>
                <th className="py-2.5 px-3">MASA BERTUGAS</th>
                <th className="py-2.5 px-4">PEGAWAI / EXCO BERTUGAS</th>
                <th className="py-2.5 px-3">LOKASI / STESEN</th>
                <th className="py-2.5 px-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dutySchedule.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-800">{d.hari}</td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{d.masa}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{d.bertugas}</td>
                  <td className="py-3 px-3 text-slate-600">{d.lokasi}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Berjadual
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


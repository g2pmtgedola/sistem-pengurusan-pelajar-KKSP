import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Award, 
  Star, 
  Search, 
  Download, 
  Sparkles
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { exportToExcel } from '../utils/excelHelper';
import TabHeroBanner from './TabHeroBanner';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function StudentPotentialReport({ students, programs, onSelectStudent }) {
  const [selectedClass, setSelectedClass] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [minCGPA, setMinCGPA] = useState(3.0);

  const evaluatedStudents = useMemo(() => {
    return students.map(student => {
      const joinedPrograms = [];
      let achievementPoints = 0;
      let nationalCount = 0;
      let internationalCount = 0;

      programs.forEach(prog => {
        const found = prog.peserta.find(p => p.studentId === student.matrik);
        if (found) {
          joinedPrograms.push({
            programName: prog.namaProgram,
            peringkat: prog.peringkat,
            pencapaian: found.pencapaian,
            mata: found.mata || 70
          });

          if (prog.peringkat === 'ANTARABANGSA') {
            achievementPoints += 30;
            internationalCount++;
          } else if (prog.peringkat === 'KEBANGSAAN') {
            achievementPoints += 20;
            nationalCount++;
          } else {
            achievementPoints += 10;
          }

          if (found.pencapaian.includes('JOHAN') || found.pencapaian.includes('EMAS')) {
            achievementPoints += 15;
          }
        }
      });

      const academicScore = Math.round(((student.cgpa || 3.0) / 4.0) * 40);
      const activityScore = Math.min(30, joinedPrograms.length * 8);
      const meritScore = Math.min(30, achievementPoints);
      const totalCompositeScore = academicScore + activityScore + meritScore;

      const badges = [];
      if (student.cgpa >= 3.8) badges.push('Anugerah Pengarah');
      if (internationalCount > 0) badges.push('Antarabangsa');
      if (nationalCount >= 2) badges.push('Kebangsaan');
      if (joinedPrograms.length >= 4) badges.push('Siswa Aktif');

      return {
        ...student,
        joinedPrograms,
        academicScore,
        activityScore,
        meritScore,
        totalCompositeScore,
        badges
      };
    }).sort((a, b) => b.totalCompositeScore - a.totalCompositeScore);
  }, [students, programs]);

  const filteredList = evaluatedStudents.filter(s => {
    const matchSearch =
      !searchTerm ||
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matrik.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = selectedClass === 'All' || s.kelas === selectedClass;
    const matchCgpa = (s.cgpa || 0) >= parseFloat(minCGPA);
    return matchSearch && matchClass && matchCgpa;
  });

  const top10 = evaluatedStudents.slice(0, 10);
  const chartData = {
    labels: top10.map(s => s.nama.split(' ')[0]),
    datasets: [
      { label: 'Akademik (40)', data: top10.map(s => s.academicScore), backgroundColor: '#3b82f6' },
      { label: 'Aktiviti (30)', data: top10.map(s => s.activityScore), backgroundColor: '#10b981' },
      { label: 'Merit (30)', data: top10.map(s => s.meritScore), backgroundColor: '#f59e0b' }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { stacked: true }, y: { stacked: true, max: 100 } }
  };

  return (
    <div className="space-y-6">
      {/* Dark Theme Hero Banner Matching User Reference */}
      <TabHeroBanner
        badge="KOLEJ KOMUNITI SUNGAI PETANI @ ANUGERAH KECEMERLANGAN"
        title="Pelaporan Pencapaian & Penarafan Pelajar Terbaik"
        subtitle="Mengenal pasti calon Tokoh Kokurikulum, Tokoh Kepimpinan, dan Anugerah Khas Pengarah KKSP melalui skor komposit 100% holistik."
      >
        <button
          onClick={() => {
            const exportData = evaluatedStudents.map((s, idx) => ({
              'KEDUDUKAN': idx + 1,
              'NAMA PELAJAR': s.nama,
              'NO MATRIK': s.matrik,
              'KELAS': s.kelas,
              'CGPA': s.cgpa,
              'SKOR KOMPOSIT (%)': s.totalCompositeScore,
              'BIL PROGRAM': s.joinedPrograms.length
            }));
            exportToExcel(exportData, `Pelaporan_Potensi_Pelajar_KKSP_${new Date().toISOString().slice(0, 10)}.xlsx`);
          }}
          className="px-4 py-2.5 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300 active:scale-95"
        >
          <Download className="w-4 h-4 text-slate-950" />
          <span>Eksport Laporan Anugerah Excel</span>
        </button>

        <div className="px-4 py-2 bg-slate-800/80 rounded-full border border-slate-600/60 text-slate-200 text-xs font-bold flex items-center gap-2 backdrop-blur-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-300" />
          <span>Calon Terbaik: <strong className="text-white text-sm font-black ml-1">{evaluatedStudents[0]?.nama || '-'}</strong> ({evaluatedStudents[0]?.totalCompositeScore || 0}%)</span>
        </div>
      </TabHeroBanner>

      {/* Top 3 Podium Pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {evaluatedStudents.slice(0, 3).map((student, rank) => (
          <div
            key={student.matrik}
            onClick={() => onSelectStudent && onSelectStudent(student)}
            className="clay-card p-5 cursor-pointer hover:scale-[1.01] transition-transform"
          >
            <div className="flex justify-between items-start">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white ${
                rank === 0 ? 'clay-badge-orange' : rank === 1 ? 'clay-badge-blue' : 'clay-badge-green'
              }`}>
                #{rank + 1}
              </span>
              <span className="text-2xl font-black text-amber-600">
                {student.totalCompositeScore}%
              </span>
            </div>

            <div className="mt-3">
              <h3 className="font-extrabold text-sm text-slate-900 truncate" title={student.nama}>{student.nama}</h3>
              <span className="text-[10px] text-slate-400 font-mono block">{student.matrik} • {student.kelas}</span>
            </div>

            <div className="grid grid-cols-3 gap-1 mt-4 pt-3 border-t border-slate-200/60 text-center text-[10px]">
              <div><span className="text-slate-400 block">CGPA</span><span className="font-bold">{student.cgpa}</span></div>
              <div><span className="text-slate-400 block">Program</span><span className="font-bold">{student.joinedPrograms.length}</span></div>
              <div><span className="text-slate-400 block">Status</span><span className="font-bold text-emerald-600">Cemerlang</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Stacked Chart */}
      <div className="clay-card p-6">
        <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Komposisi Markah 10 Pelajar Terbaik
        </h2>
        <div className="h-64">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}


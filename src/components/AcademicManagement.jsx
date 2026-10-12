import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Download, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  Filter, 
  Sparkles, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Calendar, 
  AlertTriangle, 
  UserCheck, 
  FileSpreadsheet, 
  ShieldCheck, 
  BookOpen, 
  ChevronRight,
  BookMarked
} from 'lucide-react';
import { exportToExcel } from '../utils/excelHelper';
import TabHeroBanner from './TabHeroBanner';
import { ACADEMIC_SESSIONS } from '../data/mockData';

// Fallback list of academic sessions
const ALL_ACADEMIC_SESSIONS = ACADEMIC_SESSIONS || [
  'Sesi I 2026/2027',
  'Sesi II 2026/2027',
  'Sesi I 2025/2026',
  'Sesi II 2025/2026',
  'Sesi I 2024/2025',
  'Sesi II 2024/2025'
];

// Helper to ensure a student always has structured academic records for all semesters
export const ensureAcademicRecords = (student) => {
  if (Array.isArray(student.rekodAkademik) && student.rekodAkademik.length > 0) {
    return student.rekodAkademik;
  }

  const semNum = Math.max(1, Number(student.semester) || 1);
  const currentCgpa = Number(student.cgpa) || 3.50;
  const records = [];

  for (let s = 1; s <= semNum; s++) {
    const isLatest = s === semNum;
    let semGpa = currentCgpa;
    let semCgpa = currentCgpa;

    if (!isLatest) {
      // Slightly fluctuate previous semesters for realism
      const offset = (s % 2 === 0 ? 0.08 : -0.06);
      semGpa = Number(Math.max(2.0, Math.min(4.0, currentCgpa + offset)).toFixed(2));
      semCgpa = Number(Math.max(2.0, Math.min(4.0, currentCgpa + (offset / 2))).toFixed(2));
    }

    const year = 2026 - (semNum - s);
    const sesi = s % 2 === 1 ? `Sesi I ${year - 1}/${year}` : `Sesi II ${year - 1}/${year}`;

    let status = 'Lulus Penuh';
    if (semGpa >= 3.50) status = 'Lulus Cemerlang (Anugerah Pengarah)';
    else if (semGpa < 2.00) status = 'Kedudukan Bersyarat (KS)';

    records.push({
      id: `REC-${student.matrik}-SEM${s}`,
      semester: `Semester ${s}`,
      semesterNum: s,
      sesi: sesi,
      gpa: semGpa,
      cgpa: semCgpa,
      jamKredit: s === 1 ? 16 : s === 2 ? 18 : 17,
      status: status,
      catatan: isLatest ? 'Semester semasa' : 'Keputusan rasmi senat'
    });
  }

  return records;
};

export default function AcademicManagement({ 
  students, // visible students (filtered if lecturer)
  allStudents, // all students (for global reference if admin)
  setStudents, 
  currentUser,
  isClassRestricted = false,
  activeClassName = ''
}) {
  const isAdmin = currentUser?.role === 'admin';

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingStudentTranscript, setViewingStudentTranscript] = useState(null);

  // Form State for Adding / Editing Semester Academic Record
  const [formRecord, setFormRecord] = useState({
    studentMatrik: '',
    semester: 'Semester 1',
    sesi: 'Sesi I 2026/2027',
    gpa: 3.50,
    cgpa: 3.50,
    jamKredit: 16,
    status: 'Lulus Cemerlang (Anugerah Pengarah)',
    catatan: ''
  });
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Class options derived from visible students (or all students if admin)
  const classOptions = useMemo(() => {
    const targetPool = isAdmin ? (allStudents || students) : students;
    const list = Array.from(new Set(targetPool.map(s => s.kelas).filter(Boolean)));
    return ['All', ...list.sort()];
  }, [students, allStudents, isAdmin]);

  // Prepared students with assured academic records
  const studentsWithRecords = useMemo(() => {
    return students.map(s => ({
      ...s,
      rekodAkademik: ensureAcademicRecords(s)
    }));
  }, [students]);

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return studentsWithRecords.filter(s => {
      const matchSearch = 
        !searchTerm ||
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.matrik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.kelas && s.kelas.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchClass = selectedClass === 'All' || s.kelas === selectedClass;

      const latestRecord = s.rekodAkademik[s.rekodAkademik.length - 1];
      const matchSemester = selectedSemester === 'All' || 
        s.rekodAkademik.some(r => r.semester === selectedSemester);

      let matchStatus = true;
      if (selectedStatusFilter === 'CEMERLANG') {
        matchStatus = (Number(s.cgpa) >= 3.50);
      } else if (selectedStatusFilter === 'LULUS') {
        matchStatus = (Number(s.cgpa) >= 2.00 && Number(s.cgpa) < 3.50);
      } else if (selectedStatusFilter === 'BERSYARAT') {
        matchStatus = (Number(s.cgpa) < 2.00);
      }

      const matchSession = selectedSessionFilter === 'All' ||
        s.rekodAkademik.some(r => r.sesi === selectedSessionFilter);

      return matchSearch && matchClass && matchSemester && matchStatus && matchSession;
    });
  }, [studentsWithRecords, searchTerm, selectedClass, selectedSemester, selectedStatusFilter, selectedSessionFilter]);

  // Overall Statistics KPI
  const stats = useMemo(() => {
    if (studentsWithRecords.length === 0) return { avgCgpa: '0.00', cemerlang: 0, lulus: 0, bersyarat: 0 };
    const totalCgpa = studentsWithRecords.reduce((acc, s) => acc + (Number(s.cgpa) || 0), 0);
    const avg = (totalCgpa / studentsWithRecords.length).toFixed(2);
    const cemerlang = studentsWithRecords.filter(s => Number(s.cgpa) >= 3.50).length;
    const lulus = studentsWithRecords.filter(s => Number(s.cgpa) >= 2.00 && Number(s.cgpa) < 3.50).length;
    const bersyarat = studentsWithRecords.filter(s => Number(s.cgpa) < 2.00).length;

    return { avgCgpa: avg, cemerlang, lulus, bersyarat };
  }, [studentsWithRecords]);

  // Helper to get status badge style
  const getCgpaBadge = (cgpaVal) => {
    const val = Number(cgpaVal) || 0;
    if (val >= 3.75) {
      return {
        label: 'Anugerah Pengarah Emas',
        className: 'bg-amber-100 text-amber-950 border-amber-300 font-black',
        dotColor: 'bg-amber-500'
      };
    }
    if (val >= 3.50) {
      return {
        label: 'Anugerah Pengarah',
        className: 'bg-purple-100 text-purple-950 border-purple-300 font-black',
        dotColor: 'bg-purple-500'
      };
    }
    if (val >= 3.00) {
      return {
        label: 'Lulus Kepujian',
        className: 'bg-emerald-100 text-emerald-950 border-emerald-300 font-black',
        dotColor: 'bg-emerald-500'
      };
    }
    if (val >= 2.00) {
      return {
        label: 'Lulus Penuh',
        className: 'bg-blue-100 text-blue-950 border-blue-300 font-bold',
        dotColor: 'bg-blue-500'
      };
    }
    return {
      label: 'Kedudukan Bersyarat (KS)',
      className: 'bg-rose-100 text-rose-950 border-rose-300 font-black animate-pulse',
      dotColor: 'bg-rose-500'
    };
  };

  // Open modal for a specific student or generic add
  const handleOpenAddSemester = (targetMatrik = '') => {
    const defaultStudent = targetMatrik 
      ? studentsWithRecords.find(s => s.matrik === targetMatrik) 
      : studentsWithRecords[0];

    const currentRecords = defaultStudent?.rekodAkademik || [];
    const nextSemNum = currentRecords.length + 1;
    const nextSemName = `Semester ${nextSemNum <= 6 ? nextSemNum : 1}`;

    setFormRecord({
      studentMatrik: defaultStudent?.matrik || '',
      semester: nextSemName,
      sesi: 'Sesi I 2026/2027',
      gpa: 3.50,
      cgpa: defaultStudent?.cgpa || 3.50,
      jamKredit: 17,
      status: 'Lulus Cemerlang (Anugerah Pengarah)',
      catatan: `Keputusan penilaian ${nextSemName}.`
    });
    setIsEditingExisting(false);
    setIsAddModalOpen(true);
  };

  // Open modal for editing a specific semester record
  const handleOpenEditRecord = (student, rec) => {
    // Check permission: lecturers can only edit their class's students
    if (isClassRestricted && student.kelas !== activeClassName) {
      alert('Anda hanya dibenarkan mengurus rekod akademik bagi kelas anda sahaja.');
      return;
    }

    setFormRecord({
      studentMatrik: student.matrik,
      semester: rec.semester,
      sesi: rec.sesi || 'Sesi I 2026/2027',
      gpa: rec.gpa,
      cgpa: rec.cgpa,
      jamKredit: rec.jamKredit || 16,
      status: rec.status || 'Lulus Penuh',
      catatan: rec.catatan || ''
    });
    setIsEditingExisting(true);
    setIsAddModalOpen(true);
  };

  // Auto-suggest status when GPA is changed
  const handleGpaChange = (newGpa) => {
    const val = Number(newGpa) || 0;
    let suggestedStatus = 'Lulus Penuh';
    if (val >= 3.50) suggestedStatus = 'Lulus Cemerlang (Anugerah Pengarah)';
    else if (val >= 3.00) suggestedStatus = 'Lulus Kepujian';
    else if (val >= 2.00) suggestedStatus = 'Lulus Penuh';
    else if (val >= 1.67) suggestedStatus = 'Kedudukan Bersyarat (KS)';
    else suggestedStatus = 'Kedudukan Gagal (KG)';

    setFormRecord(prev => ({
      ...prev,
      gpa: newGpa,
      status: suggestedStatus
    }));
  };

  // Save new or updated semester record
  const handleSaveRecord = (e) => {
    e.preventDefault();
    if (!formRecord.studentMatrik) {
      alert('Sila pilih pelajar!');
      return;
    }

    const targetStudent = (allStudents || students).find(s => s.matrik === formRecord.studentMatrik);
    if (!targetStudent) return;

    if (isClassRestricted && targetStudent.kelas !== activeClassName) {
      alert('Anda hanya dibenarkan mengurus pelajar kelas anda sahaja.');
      return;
    }

    const existingRecords = ensureAcademicRecords(targetStudent);
    let updatedRecords;

    const recordPayload = {
      id: `REC-${targetStudent.matrik}-${formRecord.semester.replace(/\s+/g, '')}`,
      semester: formRecord.semester,
      semesterNum: Number(formRecord.semester.replace(/\D/g, '')) || 1,
      sesi: formRecord.sesi,
      gpa: Number(Number(formRecord.gpa).toFixed(2)),
      cgpa: Number(Number(formRecord.cgpa).toFixed(2)),
      jamKredit: Number(formRecord.jamKredit) || 16,
      status: formRecord.status,
      catatan: formRecord.catatan
    };

    const recordIndex = existingRecords.findIndex(r => r.semester === formRecord.semester);
    if (recordIndex >= 0) {
      // Update existing semester
      updatedRecords = existingRecords.map((r, i) => i === recordIndex ? recordPayload : r);
    } else {
      // Add new semester
      updatedRecords = [...existingRecords, recordPayload].sort((a, b) => a.semesterNum - b.semesterNum);
    }

    // Determine the latest semester record to update the student's primary cgpa
    const latestRec = updatedRecords[updatedRecords.length - 1];
    const newLatestCgpa = latestRec ? latestRec.cgpa : Number(formRecord.cgpa);
    const newLatestSemesterNum = latestRec ? latestRec.semesterNum : targetStudent.semester;

    // Update global students state (syncs to localStorage and all other tabs)
    setStudents(prev => prev.map(s => {
      if (s.matrik === formRecord.studentMatrik) {
        return {
          ...s,
          cgpa: newLatestCgpa,
          semester: newLatestSemesterNum,
          rekodAkademik: updatedRecords
        };
      }
      return s;
    }));

    setIsAddModalOpen(false);
  };

  // Delete a semester record
  const handleDeleteRecord = (studentMatrik, semesterName) => {
    const targetStudent = (allStudents || students).find(s => s.matrik === studentMatrik);
    if (!targetStudent) return;

    if (isClassRestricted && targetStudent.kelas !== activeClassName) {
      alert('Anda hanya dibenarkan memadam rekod pelajar kelas anda sahaja.');
      return;
    }

    if (!window.confirm(`Adakah anda pasti ingin memadam rekod bagi ${semesterName} untuk pelajar ${targetStudent.nama}?`)) {
      return;
    }

    const currentRecords = ensureAcademicRecords(targetStudent);
    const remaining = currentRecords.filter(r => r.semester !== semesterName);

    const latestRec = remaining[remaining.length - 1];
    const newCgpa = latestRec ? latestRec.cgpa : targetStudent.cgpa;

    setStudents(prev => prev.map(s => {
      if (s.matrik === studentMatrik) {
        return {
          ...s,
          cgpa: newCgpa,
          rekodAkademik: remaining
        };
      }
      return s;
    }));
  };

  // Export full academic list to Excel
  const handleExportExcel = () => {
    const rows = [];
    filteredStudents.forEach(s => {
      s.rekodAkademik.forEach(r => {
        rows.push({
          'NAMA PELAJAR': s.nama,
          'NO MATRIK': s.matrik,
          'NO IC': s.ic || '-',
          'KELAS': s.kelas,
          'PROGRAM': s.programPengajian,
          'SEMESTER': r.semester,
          'SESI PENGAJIAN': r.sesi,
          'HPNM (GPA)': r.gpa,
          'PNGK (CGPA)': r.cgpa,
          'JAM KREDIT': r.jamKredit,
          'STATUS KEPUTUSAN': r.status,
          'CATATAN': r.catatan || '-'
        });
      });
    });

    exportToExcel(rows, `Rekod_Akademik_KKSP_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Dark Theme Hero Banner Matching User Reference */}
      <TabHeroBanner
        badge="KOLEJ KOMUNITI SUNGAI PETANI @ HAL EHWAL AKADEMIK"
        title="Pengurusan Akademik & CGPA Semester Siswa"
        subtitle="Perekodan dan analisis HPNM (GPA), PNGK (CGPA), jam kredit, dan status kelulusan setiap semester bagi siswa Kolej Komuniti Sungai Petani."
      >
        <button
          onClick={() => handleOpenAddSemester()}
          className="px-4 py-2.5 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300 active:scale-95"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Tambah Keputusan Semester</span>
        </button>

        <button
          onClick={handleExportExcel}
          className="px-4 py-2.5 bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)] border border-emerald-300 active:scale-95"
        >
          <Download className="w-4 h-4 text-slate-950" />
          <span>Eksport Slip Akademik Excel</span>
        </button>
      </TabHeroBanner>

      {/* Role / Class Restriction Notice Banner */}
      {isClassRestricted ? (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start sm:items-center gap-3 text-xs text-amber-900 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <span className="font-black block text-amber-950">
              🔒 Mod Capaian Terhad: Pensyarah Kelas {activeClassName}
            </span>
            <span className="text-[11px] text-amber-800 font-medium">
              Sebagai Pensyarah Kelas <strong>{activeClassName}</strong>, anda dibenarkan menambah dan mengemas kini keputusan semester (GPA & CGPA) bagi pelajar dalam kelas anda sahaja. Data ini secara automatik disinkronkan ke seluruh sistem (Laporan Potensi, Graf Radar & Profil Pelajar).
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start sm:items-center gap-3 text-xs text-indigo-900 shadow-sm">
          <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <span className="font-black block text-indigo-950">
              👑 Capaian Penuh Pentadbir (Admin Hal Ehwal Akademik)
            </span>
            <span className="text-[11px] text-indigo-800 font-medium">
              Anda mempunyai kebenaran penuh untuk melihat, menambah, mengemas kini dan memadam rekod akademik bagi semua kelas di Kolej Komuniti Sungai Petani.
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards: Ringkasan Prestasi Akademik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Purata CGPA */}
        <div className="clay-card p-4 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">
              Purata CGPA {isClassRestricted ? `Kelas ${activeClassName}` : 'Keseluruhan'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-slate-900">{stats.avgCgpa}</span>
              <span className="text-xs text-slate-500 font-bold">/ 4.00</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-black flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Prestasi Stabil
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black shadow-inner">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Anugerah Pengarah */}
        <div className="clay-card p-4 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">
              Anugerah Pengarah (≥ 3.50)
            </span>
            <span className="text-2xl font-black text-purple-700 block mt-1">
              {stats.cemerlang} Orang
            </span>
            <span className="text-[10px] text-purple-600 font-bold block mt-0.5">
              Kelayakan Anugerah Senat
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black shadow-inner">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Lulus Penuh */}
        <div className="clay-card p-4 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">
              Lulus Penuh (2.00 - 3.49)
            </span>
            <span className="text-2xl font-black text-emerald-700 block mt-1">
              {stats.lulus} Orang
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
              Layak Tamat Pengajian
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shadow-inner">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Perlu Bimbingan / KS */}
        <div className="clay-card p-4 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">
              Kedudukan Bersyarat (&lt; 2.00)
            </span>
            <span className="text-2xl font-black text-rose-700 block mt-1">
              {stats.bersyarat} Orang
            </span>
            <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
              Perlu Intervensi Kaunseling
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="clay-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Penapis & Carian Rekod Akademik
            </h3>
          </div>
          <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            {filteredStudents.length} daripada {studentsWithRecords.length} pelajar dipaparkan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {/* 1. Search */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
              CARIAN PELAJAR
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nama, matrik, kelas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full clay-input pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* 2. Filter Kelas */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
              KELAS
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={isClassRestricted}
              className={`w-full clay-input px-3 py-2 text-xs font-bold text-slate-800 ${isClassRestricted ? 'bg-slate-100 opacity-80 cursor-not-allowed' : 'bg-white'}`}
            >
              {classOptions.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'Semua Kelas' : `Kelas ${c}`}</option>
              ))}
            </select>
          </div>

          {/* 3. Filter Semester */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
              SEMESTER
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full clay-input px-3 py-2 text-xs font-bold text-slate-800 bg-white"
            >
              <option value="All">Semua Semester</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
            </select>
          </div>

          {/* 4. Filter Status Prestasi */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
              STATUS PRESTASI
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full clay-input px-3 py-2 text-xs font-bold text-slate-800 bg-white"
            >
              <option value="All">Semua Status</option>
              <option value="CEMERLANG">Anugerah Pengarah (≥ 3.50)</option>
              <option value="LULUS">Lulus Penuh (2.00 - 3.49)</option>
              <option value="BERSYARAT">Kedudukan Bersyarat (&lt; 2.00)</option>
            </select>
          </div>

          {/* 5. Filter Sesi Pengajian */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
              SESI PENGAJIAN
            </label>
            <select
              value={selectedSessionFilter}
              onChange={(e) => setSelectedSessionFilter(e.target.value)}
              className="w-full clay-input px-3 py-2 text-xs font-bold text-slate-800 bg-white"
            >
              <option value="All">Semua Sesi Pengajian</option>
              {ALL_ACADEMIC_SESSIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Clear */}
        {(searchTerm || selectedClass !== 'All' || selectedSemester !== 'All' || selectedStatusFilter !== 'All' || selectedSessionFilter !== 'All') && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedClass('All');
                setSelectedSemester('All');
                setSelectedStatusFilter('All');
                setSelectedSessionFilter('All');
              }}
              className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
            >
              Set Semula Tapisan
            </button>
          </div>
        )}
      </div>

      {/* Main Student Academic Table */}
      <div className="clay-card overflow-hidden">
        <div className="p-4 bg-white/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider block">
              Senarai Rekod Akademik Siswa ({filteredStudents.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold">
              Kemas kini HPNM (GPA) & PNGK (CGPA) bagi setiap semester pengajian.
            </span>
          </div>

          <button
            onClick={() => handleOpenAddSemester()}
            className="clay-btn px-3.5 py-1.5 bg-amber-50 text-amber-950 border border-amber-300 text-xs font-black flex items-center gap-1.5 cursor-pointer rounded-xl hover:bg-amber-100 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>+ Tambah Keputusan Semester</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100/90 text-slate-800 font-black border-b border-slate-200 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">PELAJAR & KELAS</th>
                <th className="py-3 px-3 text-center">CGPA TERKINI</th>
                <th className="py-3 px-3">BREAKDOWN KEPUTUSAN MENGIKUT SEMESTER</th>
                <th className="py-3 px-3 text-center">STATUS KELULUSAN</th>
                <th className="py-3 px-3 text-center">TINDAKAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const badge = getCgpaBadge(student.cgpa);
                  const records = student.rekodAkademik || [];
                  const latestRecord = records[records.length - 1];

                  return (
                    <tr key={student.matrik} className="hover:bg-amber-50/30 transition-colors">
                      {/* Pelajar & Kelas */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 align-top">
                        <div className="space-y-0.5">
                          <span className="font-black text-slate-900 block text-xs">{student.nama}</span>
                          <span className="text-[10px] font-mono text-slate-500 font-bold block">{student.matrik}</span>
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 border border-slate-300">
                              Kelas: {student.kelas}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
                              {student.programPengajian}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CGPA Terkini */}
                      <td className="py-3.5 px-3 text-center align-top">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-base font-black text-slate-900 tracking-tight font-mono">
                            {Number(student.cgpa).toFixed(2)}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border mt-1 ${badge.className}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold mt-1">
                            Semester {student.semester || records.length}
                          </span>
                        </div>
                      </td>

                      {/* Breakdown Mengikut Semester */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="space-y-1.5 min-w-[280px]">
                          {records.map(rec => {
                            const isDean = rec.gpa >= 3.50;
                            return (
                              <div
                                key={rec.id || rec.semester}
                                className={`p-2 rounded-xl border text-xs flex items-center justify-between transition-all ${
                                  isDean 
                                    ? 'bg-purple-50/60 border-purple-200' 
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-black text-slate-900 text-[11px]">{rec.semester}</span>
                                    <span className="text-[10px] text-slate-500 font-semibold">({rec.sesi})</span>
                                    {isDean && (
                                      <Award className="w-3 h-3 text-purple-600 inline" title="Anugerah Pengarah" />
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-600 flex items-center gap-2 font-mono">
                                    <span>HPNM (GPA): <strong className="text-slate-900">{Number(rec.gpa).toFixed(2)}</strong></span>
                                    <span>•</span>
                                    <span>PNGK (CGPA): <strong className="text-emerald-700 font-bold">{Number(rec.cgpa).toFixed(2)}</strong></span>
                                    <span>•</span>
                                    <span>{rec.jamKredit} Jam Kredit</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                  <button
                                    onClick={() => handleOpenEditRecord(student, rec)}
                                    title={`Edit ${rec.semester}`}
                                    className="w-6 h-6 rounded-lg clay-btn flex items-center justify-center text-slate-600 hover:text-indigo-700 cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  {(isAdmin || (!isClassRestricted || student.kelas === activeClassName)) && (
                                    <button
                                      onClick={() => handleDeleteRecord(student.matrik, rec.semester)}
                                      title={`Padam ${rec.semester}`}
                                      className="w-6 h-6 rounded-lg clay-btn flex items-center justify-center text-slate-600 hover:text-rose-700 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* Quick button to append next semester */}
                          <button
                            onClick={() => handleOpenAddSemester(student.matrik)}
                            className="text-[10px] font-black text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer pt-0.5"
                          >
                            <Plus className="w-3 h-3" /> Tambah Semester Baharu untuk {student.nama.split(' ')[0]}
                          </button>
                        </div>
                      </td>

                      {/* Status Kelulusan Semasa */}
                      <td className="py-3.5 px-3 text-center align-top">
                        <span className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-black border ${
                          student.cgpa >= 3.50
                            ? 'bg-purple-100 text-purple-950 border-purple-300'
                            : student.cgpa >= 2.00
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                            : 'bg-rose-100 text-rose-950 border-rose-300'
                        }`}>
                          {latestRecord?.status || 'Lulus Penuh'}
                        </span>
                      </td>

                      {/* Tindakan */}
                      <td className="py-3.5 px-3 text-center align-top">
                        <div className="flex flex-col gap-1 items-center">
                          <button
                            onClick={() => setViewingStudentTranscript(student)}
                            className="px-2.5 py-1 rounded-lg clay-btn text-xs font-bold text-slate-800 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                            title="Lihat Slip Transkrip Penuh"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Slip Rasmi</span>
                          </button>

                          <button
                            onClick={() => handleOpenAddSemester(student.matrik)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-[11px] font-black text-amber-900 flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                            title="Tambah / Kemaskini Semester"
                          >
                            <Plus className="w-3 h-3 text-amber-700" />
                            <span>+ Sem</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">Tiada rekod pelajar dijumpai.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Sila semak kata kunci carian atau tetapkan semula penapis.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Tambah / Kemaskini Keputusan Semester */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-lg w-full p-6 bg-white max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  {isEditingExisting ? 'Kemaskini Keputusan Semester' : 'Tambah Keputusan Semester Siswa'}
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                  Data CGPA yang dikemaskini akan diselaraskan secara automatik ke seluruh modul.
                </span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full clay-btn flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4 pt-4 text-xs">
              {/* 1. Pilih Pelajar */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Pelajar *</label>
                <select
                  required
                  disabled={isEditingExisting}
                  value={formRecord.studentMatrik}
                  onChange={(e) => setFormRecord({ ...formRecord, studentMatrik: e.target.value })}
                  className={`w-full clay-input px-3 py-2 font-bold text-slate-900 ${isEditingExisting ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
                >
                  <option value="" disabled>-- Pilih Pelajar --</option>
                  {studentsWithRecords.map(s => (
                    <option key={s.matrik} value={s.matrik}>
                      {s.nama} ({s.matrik}) - Kelas {s.kelas} [CGPA Semasa: {s.cgpa}]
                    </option>
                  ))}
                </select>
                {isClassRestricted && (
                  <span className="text-[10px] text-amber-800 font-bold block mt-1">
                    * Terhad kepada pelajar dalam kelas {activeClassName} sahaja.
                  </span>
                )}
              </div>

              {/* 2. Semester & Sesi Pengajian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Semester Pengajian *
                  </label>
                  <select
                    required
                    value={formRecord.semester}
                    onChange={(e) => setFormRecord({ ...formRecord, semester: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-bold text-slate-800 bg-white"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    Sesi Pengajian *
                  </label>
                  <select
                    required
                    value={formRecord.sesi}
                    onChange={(e) => setFormRecord({ ...formRecord, sesi: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-bold text-slate-800 bg-white"
                  >
                    {ALL_ACADEMIC_SESSIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. GPA & CGPA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>HPNM / GPA Semester (0.00 - 4.00) *</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.00"
                    max="4.00"
                    required
                    value={formRecord.gpa}
                    onChange={(e) => handleGpaChange(e.target.value)}
                    className="w-full clay-input px-3 py-2 font-mono font-black text-slate-900 text-sm bg-white"
                  />
                  <div className="flex gap-1 mt-1">
                    {[3.50, 3.65, 3.80, 4.00].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleGpaChange(val)}
                        className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                      >
                        {val.toFixed(2)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>PNGK / CGPA Terkumpul (0.00 - 4.00) *</span>
                    <button
                      type="button"
                      onClick={() => setFormRecord({ ...formRecord, cgpa: formRecord.gpa })}
                      className="text-[10px] text-indigo-700 font-black hover:underline cursor-pointer"
                      title="Sama dengan GPA"
                    >
                      = GPA
                    </button>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.00"
                    max="4.00"
                    required
                    value={formRecord.cgpa}
                    onChange={(e) => setFormRecord({ ...formRecord, cgpa: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-mono font-black text-emerald-800 text-sm bg-white"
                  />
                  <div className="flex gap-1 mt-1">
                    {[3.50, 3.65, 3.80, 4.00].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormRecord({ ...formRecord, cgpa: val })}
                        className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                      >
                        {val.toFixed(2)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Jam Kredit & Status Kelulusan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Kredit Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={formRecord.jamKredit}
                    onChange={(e) => setFormRecord({ ...formRecord, jamKredit: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Kedudukan Akademik</label>
                  <select
                    value={formRecord.status}
                    onChange={(e) => setFormRecord({ ...formRecord, status: e.target.value })}
                    className="w-full clay-input px-3 py-2 font-bold text-slate-800 bg-white"
                  >
                    <option value="Lulus Cemerlang (Anugerah Pengarah)">Lulus Cemerlang (Anugerah Pengarah)</option>
                    <option value="Lulus Kepujian">Lulus Kepujian</option>
                    <option value="Lulus Penuh">Lulus Penuh</option>
                    <option value="Kedudukan Bersyarat (KS)">Kedudukan Bersyarat (KS)</option>
                    <option value="Kedudukan Gagal (KG)">Kedudukan Gagal (KG)</option>
                  </select>
                </div>
              </div>

              {/* 5. Catatan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan / Ulasan Prestasi</label>
                <input
                  type="text"
                  placeholder="Contoh: Layak anugerah senat / Disyorkan mengikuti kelas bimbingan"
                  value={formRecord.catatan}
                  onChange={(e) => setFormRecord({ ...formRecord, catatan: e.target.value })}
                  className="w-full clay-input px-3 py-2 text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="clay-btn px-4 py-2 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="clay-btn px-5 py-2 rounded-xl font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-500 shadow-sm cursor-pointer"
                >
                  Simpan Keputusan Semester
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Slip Transkrip Akademik Penuh */}
      {viewingStudentTranscript && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-2xl w-full p-6 bg-white max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Slip Keputusan Akademik Rasmi
                  </h3>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Kolej Komuniti Sungai Petani • Kementerian Pendidikan Tinggi
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingStudentTranscript(null)}
                className="w-7 h-7 rounded-full clay-btn flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student Biodata Summary */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white my-4 shadow-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">NAMA PELAJAR</span>
                  <span className="font-black text-white text-sm block">{viewingStudentTranscript.nama}</span>
                  <span className="font-mono text-amber-300 font-bold text-[11px]">{viewingStudentTranscript.matrik}</span>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">PROGRAM & KELAS</span>
                  <span className="font-bold text-slate-200 block truncate">{viewingStudentTranscript.programPengajian}</span>
                  <span className="font-black text-amber-400 text-xs">Kelas {viewingStudentTranscript.kelas} • Sem {viewingStudentTranscript.semester}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-xs">
                <span className="text-slate-300 font-bold">PNGK / CGPA Terkumpul Semasa:</span>
                <span className="text-lg font-black text-amber-300 font-mono bg-white/10 px-3 py-0.5 rounded-lg border border-amber-400/30">
                  {Number(viewingStudentTranscript.cgpa).toFixed(2)} / 4.00
                </span>
              </div>
            </div>

            {/* Semester-by-Semester Transcript Table */}
            <div className="overflow-hidden border border-slate-200 rounded-xl mb-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 text-slate-800 font-black text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">SEMESTER & SESI</th>
                    <th className="py-2.5 px-3 text-center">HPNM (GPA)</th>
                    <th className="py-2.5 px-3 text-center">PNGK (CGPA)</th>
                    <th className="py-2.5 px-3 text-center">JAM KREDIT</th>
                    <th className="py-2.5 px-3">STATUS KEPUTUSAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {ensureAcademicRecords(viewingStudentTranscript).map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <div>
                          <span>{r.semester}</span>
                          <span className="text-[10px] text-slate-500 font-normal block">{r.sesi}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-black text-slate-900">
                        {Number(r.gpa).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-black text-emerald-800">
                        {Number(r.cgpa).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                        {r.jamKredit}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          r.gpa >= 3.50 ? 'bg-purple-100 text-purple-900 border-purple-200' : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Transcript Footer */}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-[10px] text-slate-400 font-semibold italic">
                * Dijana secara automatik oleh Sistem Maklumat Pelajar Kolej Komuniti Sungai Petani.
              </span>
              <button
                onClick={() => setViewingStudentTranscript(null)}
                className="clay-btn px-4 py-2 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  MapPin, 
  GraduationCap,
  Home,
  CheckCircle,
  X,
  AlertTriangle,
  HeartHandshake,
  DollarSign
} from 'lucide-react';
import { exportToExcel, exportToCSV, parseUploadedFile } from '../utils/excelHelper';
import TabHeroBanner from './TabHeroBanner';

export default function StudentManagement({ 
  students, 
  setStudents, 
  onSelectStudent,
  currentUser,
  isClassRestricted,
  activeClassName
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedRentalHouse, setSelectedRentalHouse] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Form state including Ibu Bapa
  const [formData, setFormData] = useState({
    id: '',
    matrik: '',
    nama: '',
    ic: '',
    kelas: isClassRestricted && activeClassName ? activeClassName : 'SPK 1A',
    rumahSewa: 'KIARA',
    noTel: '',
    alamat: '',
    jantina: 'Lelaki',
    programPengajian: 'Sijil Pemprosesan Makanan (SPK)',
    semester: 1,
    status: 'Aktif',
    cgpa: 3.5,
    email: '',
    // Maklumat Ibu Bapa / Penjaga
    namaIbuBapa: '',
    hubunganIbuBapa: 'Bapa',
    noTelIbuBapa: '',
    alamatIbuBapa: '',
    pekerjaanIbuBapa: '',
    pendapatanIbuBapa: ''
  });

  const classOptions = useMemo(() => {
    const list = Array.from(new Set(students.map(s => s.kelas).filter(Boolean)));
    return ['All', ...list.sort()];
  }, [students]);

  const rentalOptions = useMemo(() => {
    const list = Array.from(new Set(students.map(s => s.rumahSewa).filter(Boolean)));
    return ['All', ...list.sort()];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !searchTerm ||
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.matrik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.ic && s.ic.includes(searchTerm)) ||
        (s.noTel && s.noTel.includes(searchTerm)) ||
        (s.namaIbuBapa && s.namaIbuBapa.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.alamat && s.alamat.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchClass = selectedClass === 'All' || s.kelas === selectedClass;
      const matchRental = selectedRentalHouse === 'All' || s.rumahSewa === selectedRentalHouse;
      const matchGender = selectedGender === 'All' || s.jantina === selectedGender;

      return matchSearch && matchClass && matchRental && matchGender;
    });
  }, [students, searchTerm, selectedClass, selectedRentalHouse, selectedGender]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      id: `K07SPK24F${String(Date.now()).slice(-3)}`,
      matrik: `K07SPK24F${String(Date.now()).slice(-3)}`,
      nama: '',
      ic: '',
      kelas: isClassRestricted && activeClassName ? activeClassName : 'SPK 1A',
      rumahSewa: 'KIARA',
      noTel: '',
      alamat: '',
      jantina: 'Lelaki',
      programPengajian: 'Sijil Pemprosesan Makanan (SPK)',
      semester: 1,
      status: 'Aktif',
      cgpa: 3.50,
      email: '',
      namaIbuBapa: '',
      hubunganIbuBapa: 'Bapa',
      noTelIbuBapa: '',
      alamatIbuBapa: '',
      pekerjaanIbuBapa: '',
      pendapatanIbuBapa: '2500'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      ...student,
      namaIbuBapa: student.namaIbuBapa || '',
      hubunganIbuBapa: student.hubunganIbuBapa || 'Bapa',
      noTelIbuBapa: student.noTelIbuBapa || '',
      alamatIbuBapa: student.alamatIbuBapa || student.alamat || '',
      pekerjaanIbuBapa: student.pekerjaanIbuBapa || '',
      pendapatanIbuBapa: student.pendapatanIbuBapa || '2500'
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id, nama) => {
    if (window.confirm(`Adakah anda pasti ingin memadam rekod pelajar ${nama}?`)) {
      setStudents(prev => prev.filter(s => s.id !== id && s.matrik !== id));
    }
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.matrik) {
      alert('Sila lengkapkan Nama dan No Matrik!');
      return;
    }

    const payload = {
      ...formData,
      kelas: isClassRestricted && activeClassName ? activeClassName : formData.kelas
    };

    if (editingStudent) {
      setStudents(prev => prev.map(s => (s.matrik === editingStudent.matrik ? payload : s)));
    } else {
      setStudents(prev => [payload, ...prev]);
    }
    setIsAddModalOpen(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const parsedData = await parseUploadedFile(file);
      if (!parsedData || parsedData.length === 0) {
        throw new Error('Fail tidak mengandungi data yang sah.');
      }

      const formatted = parsedData.map((row, idx) => {
        const matrik = row.matrik || row.MATRIK || row['NO MATRIK'] || row['No Matrik'] || `K07SPK24F${String(students.length + idx + 1).padStart(3, '0')}`;
        const nama = row.nama || row.NAMA || row['NAMA PELAJAR'] || row['Nama'] || 'PELAJAR BARU';
        const ic = String(row.ic || row.IC || row['NO KAD PENGENALAN'] || row['No IC'] || '');
        const kelas = row.kelas || row.KELAS || row['Kelas'] || 'SPK 1A';
        const rumahSewa = row.rumahSewa || row.RUMAH_SEWA || row['RUMAH SEWA'] || row['Rumah Sewa'] || 'KIARA';
        const noTel = String(row.noTel || row.NO_TEL || row['NO TEL PELAJAR'] || row['No Telefon'] || '');
        const alamat = row.alamat || row.ALAMAT || row['ALAMAT RUMAH'] || '';
        const jantina = row.jantina || row['JANTINA'] || (nama.includes('BINTI') || nama.includes('BT ') ? 'Perempuan' : 'Lelaki');
        const cgpa = parseFloat(row.cgpa || row.CGPA || row['PNGK'] || 3.50);

        // Ibu Bapa fields
        const namaIbuBapa = row.namaIbuBapa || row['NAMA IBU BAPA'] || row['Nama Penjaga'] || '';
        const noTelIbuBapa = String(row.noTelIbuBapa || row['NO TEL IBU BAPA'] || row['No Tel Penjaga'] || '');
        const alamatIbuBapa = row.alamatIbuBapa || row['ALAMAT IBU BAPA'] || alamat;
        const pendapatanIbuBapa = String(row.pendapatanIbuBapa || row['PENDAPATAN'] || row['Pendapatan Ibu Bapa'] || '2500');

        return {
          id: matrik,
          matrik,
          nama: nama.toUpperCase(),
          ic,
          kelas,
          rumahSewa,
          noTel,
          alamat,
          jantina,
          programPengajian: 'Sijil Pemprosesan Makanan (SPK)',
          semester: 1,
          status: 'Aktif',
          cgpa,
          email: `${matrik.toLowerCase()}@siswa.edu.my`,
          namaIbuBapa,
          hubunganIbuBapa: 'Bapa',
          noTelIbuBapa,
          alamatIbuBapa,
          pekerjaanIbuBapa: '',
          pendapatanIbuBapa
        };
      });

      setStudents(prev => {
        const existingMatriks = new Set(prev.map(p => p.matrik));
        const newRecords = formatted.filter(f => !existingMatriks.has(f.matrik));
        return [...newRecords, ...prev];
      });

      setUploadSuccess(`Berjaya memuat naik ${formatted.length} rekod pelajar!`);
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadSuccess(null);
      }, 1500);
    } catch (err) {
      setUploadError(err.message || 'Gagal memproses fail.');
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredStudents.map(s => ({
      'NAMA': s.nama,
      'KELAS': s.kelas,
      'NO MATRIK': s.matrik,
      'NO KAD PENGENALAN': s.ic,
      'RUMAH SEWA': s.rumahSewa,
      'NO TEL PELAJAR': s.noTel,
      'ALAMAT RUMAH': s.alamat,
      'JANTINA': s.jantina,
      'CGPA': s.cgpa,
      'NAMA IBU BAPA / PENJAGA': s.namaIbuBapa || '-',
      'NO TEL IBU BAPA': s.noTelIbuBapa || '-',
      'PENDAPATAN IBU BAPA (RM)': s.pendapatanIbuBapa || '-',
      'ALAMAT IBU BAPA': s.alamatIbuBapa || s.alamat || '-'
    }));
    exportToExcel(exportData, `Senarai_Pelajar_KKSP_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportCSV = () => {
    const exportData = filteredStudents.map(s => ({
      'NAMA': s.nama,
      'KELAS': s.kelas,
      'NO MATRIK': s.matrik,
      'NO KAD PENGENALAN': s.ic,
      'RUMAH SEWA': s.rumahSewa,
      'NO TEL PELAJAR': s.noTel,
      'ALAMAT RUMAH': s.alamat,
      'JANTINA': s.jantina,
      'CGPA': s.cgpa,
      'NAMA IBU BAPA / PENJAGA': s.namaIbuBapa || '-',
      'NO TEL IBU BAPA': s.noTelIbuBapa || '-',
      'PENDAPATAN IBU BAPA (RM)': s.pendapatanIbuBapa || '-'
    }));
    exportToCSV(exportData, `Senarai_Pelajar_KKSP_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Dark Theme Hero Banner Matching User Reference */}
      <TabHeroBanner
        badge="KOLEJ KOMUNITI SUNGAI PETANI @ REKOD PELAJAR & IBU BAPA"
        title="Pengurusan Maklumat Pelajar & Ibu Bapa"
        subtitle="Pusat pangkalan data rasmi bagi rekod profil siswa, maklumat waris/ibu bapa, pengurusan rumah sewa, status akademik, serta integrasi muat naik/turun fail Excel/CSV."
      >
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] border border-amber-300 active:scale-95"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Tambah Pelajar</span>
        </button>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2.5 bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)] border border-emerald-300 active:scale-95"
        >
          <Upload className="w-4 h-4 text-slate-950" />
          <span>Upload Excel / CSV</span>
        </button>

        <button
          onClick={handleExportExcel}
          className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-cyan-300 font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_12px_rgba(6,182,212,0.35)] border border-cyan-500/50 active:scale-95 backdrop-blur-xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
          <span>Eksport Excel</span>
        </button>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-blue-300 font-black text-xs transition-all flex items-center gap-2 cursor-pointer rounded-full shadow-[0_0_12px_rgba(59,130,246,0.35)] border border-blue-500/50 active:scale-95 backdrop-blur-xs"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>Eksport CSV</span>
        </button>
      </TabHeroBanner>

      {/* Restricted Class Notification Banner */}
      {isClassRestricted && (
        <div className="clay-card p-4 bg-gradient-to-r from-indigo-50/95 via-sky-50/90 to-blue-50/95 border-2 border-indigo-200 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
              <GraduationCap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                  Capaian Terhad: Pensyarah Kelas {activeClassName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white">
                  {students.length} Pelajar Berdaftar
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                Anda hanya dibenarkan melihat dan mengurus maklumat pelajar bagi kelas <strong>{activeClassName}</strong> sahaja. Pelajar baharu akan didaftarkan ke kelas ini secara automatik.
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/90 border border-indigo-200 text-indigo-950 text-xs font-black flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Mod Pensyarah Kelas Aktif
          </div>
        </div>
      )}

      {/* Filter and Search Bar Card */}
      <div className="clay-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full clay-badge-green text-white flex items-center justify-center font-black text-xs">
              {filteredStudents.length}
            </span>
            <span className="text-sm font-extrabold text-slate-900 tracking-tight">
              Carian & Penapis Rekod Siswa
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {filteredStudents.length} daripada {students.length} pelajar dipaparkan
          </span>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mt-4 items-end">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center justify-between">
              <span>KELAS</span>
              {isClassRestricted && (
                <span className="text-[9px] text-indigo-700 bg-indigo-50 font-bold px-1.5 py-0.2 rounded border border-indigo-200">
                  Terkunci
                </span>
              )}
            </label>
            <select
              value={isClassRestricted && activeClassName ? activeClassName : selectedClass}
              onChange={(e) => !isClassRestricted && setSelectedClass(e.target.value)}
              disabled={isClassRestricted}
              className={`w-full clay-input px-3.5 py-2.5 text-xs text-slate-900 font-bold ${
                isClassRestricted ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isClassRestricted && activeClassName ? (
                <option value={activeClassName}>{activeClassName} (Kelas Anda)</option>
              ) : (
                classOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1.5">
              RUMAH SEWA
            </label>
            <select
              value={selectedRentalHouse}
              onChange={(e) => setSelectedRentalHouse(e.target.value)}
              className="w-full clay-input px-3.5 py-2.5 text-xs text-slate-900 font-bold cursor-pointer"
            >
              {rentalOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1.5">
              JANTINA
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full clay-input px-3.5 py-2.5 text-xs text-slate-900 font-bold cursor-pointer"
            >
              <option value="All">Semua</option>
              <option value="Lelaki">Lelaki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1.5">
              CARIAN (NAMA / MATRIK / IBU BAPA)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari pelajar atau ibu bapa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full clay-input pl-9 pr-3 py-2.5 text-xs text-slate-900 font-bold"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="clay-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Senarai Pelajar & Maklumat Waris
          </span>
          <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            {filteredStudents.length} Rekod Aktif
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">NAMA PELAJAR</th>
                <th className="py-3 px-3">KELAS</th>
                <th className="py-3 px-3">NO MATRIK</th>
                <th className="py-3 px-3">NO TELEFON</th>
                <th className="py-3 px-3">RUMAH SEWA</th>
                <th className="py-3 px-4">IBU BAPA / PENJAGA</th>
                <th className="py-3 px-3">TEL IBU BAPA</th>
                <th className="py-3 px-3">PENDAPATAN</th>
                <th className="py-3 px-3 text-center">TINDAKAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-bold">
                    Tiada maklumat pelajar ditemui.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr
                    key={s.matrik}
                    className="hover:bg-amber-50/60 transition-colors cursor-pointer group"
                    onClick={() => onSelectStudent && onSelectStudent(s)}
                  >
                    <td className="py-3 px-4 font-black text-slate-900 group-hover:text-indigo-700">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-black flex items-center justify-center text-[10px] flex-shrink-0">
                          {s.nama.slice(0, 2)}
                        </div>
                        <span className="truncate max-w-[190px]" title={s.nama}>
                          {s.nama}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full font-black text-[10px] bg-indigo-100 text-indigo-900 border border-indigo-300">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-900 font-bold whitespace-nowrap">
                      {s.matrik}
                    </td>
                    <td className="py-3 px-3 text-slate-900 whitespace-nowrap font-bold">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        {s.noTel || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-800">
                      <span className="inline-flex items-center gap-1">
                        <Home className="w-3.5 h-3.5 text-amber-600" />
                        {s.rumahSewa || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-bold max-w-[170px] truncate" title={s.namaIbuBapa}>
                      <span className="inline-flex items-center gap-1.5 truncate">
                        <HeartHandshake className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span className="truncate">{s.namaIbuBapa || <span className="text-slate-400 font-normal">Belum diisi</span>}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-semibold whitespace-nowrap">
                      {s.noTelIbuBapa || '-'}
                    </td>
                    <td className="py-3 px-3 text-emerald-800 font-black whitespace-nowrap">
                      {s.pendapatanIbuBapa ? `RM ${s.pendapatanIbuBapa}` : '-'}
                    </td>
                    <td 
                      className="py-3 px-3 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingStudent(s)}
                          title="Lihat Profil"
                          className="w-7 h-7 rounded-lg clay-btn flex items-center justify-center text-slate-700 hover:text-indigo-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          title="Kemaskini"
                          className="w-7 h-7 rounded-lg clay-btn flex items-center justify-center text-slate-700 hover:text-amber-700"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id || s.matrik, s.nama)}
                          title="Padam"
                          className="w-7 h-7 rounded-lg clay-btn flex items-center justify-center text-slate-700 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah / Kemaskini Pelajar DENGAN MAKLUMAT IBU BAPA */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 bg-white border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  {editingStudent ? 'Kemaskini Maklumat Pelajar & Ibu Bapa' : 'Tambah Rekod Pelajar & Ibu Bapa'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Kolej Komuniti Sungai Petani</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full clay-btn flex items-center justify-center text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-5 pt-4">
              {/* BAHAGIAN 1: Maklumat Pelajar */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-indigo-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">1</span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900">
                    Maklumat Peribadi Pelajar
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">
                      Nama Penuh Pelajar *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value.toUpperCase() })}
                      placeholder="Contoh: AFIFAH ALIYAH ISMAIL"
                      className="w-full clay-input px-3.5 py-2.5 text-xs text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">
                      No. Matrik Pelajar *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.matrik}
                      onChange={(e) => setFormData({ ...formData, matrik: e.target.value.toUpperCase() })}
                      placeholder="K07SPK24F001"
                      className="w-full clay-input px-3.5 py-2.5 text-xs font-mono text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">
                      No. Kad Pengenalan (IC)
                    </label>
                    <input
                      type="text"
                      value={formData.ic}
                      onChange={(e) => setFormData({ ...formData, ic: e.target.value })}
                      placeholder="040113030756"
                      className="w-full clay-input px-3.5 py-2.5 text-xs font-mono text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1 flex items-center justify-between">
                      <span>Kelas *</span>
                      {isClassRestricted && (
                        <span className="text-[10px] text-indigo-700 bg-indigo-50 font-bold px-1.5 py-0.2 rounded border border-indigo-200">
                          Terkunci ({activeClassName})
                        </span>
                      )}
                    </label>
                    {isClassRestricted ? (
                      <input
                        type="text"
                        readOnly
                        value={activeClassName}
                        className="w-full clay-input px-3.5 py-2.5 text-xs text-indigo-950 font-black bg-indigo-50/70 border-indigo-200 cursor-not-allowed"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData.kelas}
                        onChange={(e) => setFormData({ ...formData, kelas: e.target.value.toUpperCase() })}
                        placeholder="SPK 1A / SPK 2A"
                        className="w-full clay-input px-3.5 py-2.5 text-xs text-slate-900 font-bold"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">
                      Rumah Sewa / Asrama
                    </label>
                    <input
                      type="text"
                      value={formData.rumahSewa}
                      onChange={(e) => setFormData({ ...formData, rumahSewa: e.target.value.toUpperCase() })}
                      placeholder="KIARA / PELANGI 18"
                      className="w-full clay-input px-3.5 py-2.5 text-xs text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">
                      No. Telefon Pelajar
                    </label>
                    <input
                      type="text"
                      value={formData.noTel}
                      onChange={(e) => setFormData({ ...formData, noTel: e.target.value })}
                      placeholder="019-XXXXXXX"
                      className="w-full clay-input px-3.5 py-2.5 text-xs text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">
                      Jantina
                    </label>
                    <select
                      value={formData.jantina}
                      onChange={(e) => setFormData({ ...formData, jantina: e.target.value })}
                      className="w-full clay-input px-3.5 py-2.5 text-xs text-slate-900 font-bold"
                    >
                      <option value="Lelaki">Lelaki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">
                      CGPA Terkini
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.00"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                      className="w-full clay-input px-3.5 py-2.5 text-xs text-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div className="mt-3.5">
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    Alamat Rumah Pelajar
                  </label>
                  <textarea
                    rows={2}
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value.toUpperCase() })}
                    placeholder="Alamat surat-menyurat pelajar"
                    className="w-full clay-input px-3.5 py-2 text-xs text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* BAHAGIAN 2: Maklumat Ibu Bapa / Waris */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-rose-100">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center">2</span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-900">
                    Maklumat Ibu Bapa / Penjaga (Waris)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">
                      Nama Ibu Bapa / Penjaga *
                    </label>
                    <input
                      type="text"
                      value={formData.namaIbuBapa}
                      onChange={(e) => setFormData({ ...formData, namaIbuBapa: e.target.value.toUpperCase() })}
                      placeholder="Contoh: ISMAIL BIN AHMAD"
                      className="w-full clay-input px-3.5 py-2.5 text-xs text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">
                      Hubungan
                    </label>
                    <select
                      value={formData.hubunganIbuBapa}
                      onChange={(e) => setFormData({ ...formData, hubunganIbuBapa: e.target.value })}
                      className="w-full clay-input px-3.5 py-2.5 text-xs text-slate-900 font-bold"
                    >
                      <option value="Bapa">Bapa</option>
                      <option value="Ibu">Ibu</option>
                      <option value="Penjaga Sah">Penjaga Sah</option>
                      <option value="Waris Lain">Waris Lain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">
                      No. Telefon Ibu Bapa / Penjaga *
                    </label>
                    <input
                      type="text"
                      value={formData.noTelIbuBapa}
                      onChange={(e) => setFormData({ ...formData, noTelIbuBapa: e.target.value })}
                      placeholder="012-XXXXXXX"
                      className="w-full clay-input px-3.5 py-2.5 text-xs text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">
                      Pendapatan Bulanan (RM) *
                    </label>
                    <input
                      type="number"
                      value={formData.pendapatanIbuBapa}
                      onChange={(e) => setFormData({ ...formData, pendapatanIbuBapa: e.target.value })}
                      placeholder="Contoh: 2500"
                      className="w-full clay-input px-3.5 py-2.5 text-xs font-black text-emerald-800"
                    />
                  </div>
                </div>

                <div className="mt-3.5">
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    Alamat Rumah Ibu Bapa / Penjaga
                  </label>
                  <textarea
                    rows={2}
                    value={formData.alamatIbuBapa}
                    onChange={(e) => setFormData({ ...formData, alamatIbuBapa: e.target.value.toUpperCase() })}
                    placeholder="Alamat kediaman ibu bapa (jika berbeza dari alamat pelajar)"
                    className="w-full clay-input px-3.5 py-2 text-xs text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="clay-btn px-5 py-2.5 rounded-xl text-xs font-black text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="clay-btn px-6 py-2.5 rounded-xl text-xs font-black text-indigo-900 bg-indigo-100 border border-indigo-300 cursor-pointer"
                >
                  {editingStudent ? 'Simpan Kemaskini' : 'Daftar Pelajar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Upload Excel / CSV */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-lg w-full p-6 bg-white border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Muat Naik Fail Excel / CSV Pelajar
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="w-7 h-7 rounded-full clay-btn flex items-center justify-center text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Pilih fail Excel (<code>.xlsx</code>, <code>.xls</code>) atau CSV. Sistem menyokong pemetaan automatik lajur: <strong>NAMA, KELAS, NO MATRIK, RUMAH SEWA, NO TEL, ALAMAT, NAMA IBU BAPA, NO TEL IBU BAPA, PENDAPATAN</strong>.
              </p>

              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50 transition-all">
                <input
                  type="file"
                  id="excelFileInput"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="excelFileInput" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-emerald-600" />
                  <span className="text-xs font-black text-slate-900">
                    Klik untuk pilih fail Excel / CSV
                  </span>
                </label>
              </div>

              {uploadSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-black flex items-center gap-2 border border-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-rose-50 text-rose-900 rounded-xl text-xs font-black flex items-center gap-2 border border-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="clay-btn px-4 py-2 rounded-xl text-xs font-black text-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Profile View Lengkap dengan Ibu Bapa */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="clay-card max-w-lg w-full p-6 bg-white border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center">
                  {viewingStudent.nama.slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">{viewingStudent.nama}</h3>
                  <span className="text-xs font-mono text-slate-600 font-bold">{viewingStudent.matrik}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="w-8 h-8 rounded-full clay-btn flex items-center justify-center text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              {/* Profil Pelajar */}
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block mb-1">
                  Maklumat Pelajar
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-800">
                  <div className="clay-card-sm p-2.5">
                    <span className="text-[10px] text-slate-500 font-black block uppercase">Kelas</span>
                    <span className="font-black text-slate-900">{viewingStudent.kelas}</span>
                  </div>
                  <div className="clay-card-sm p-2.5">
                    <span className="text-[10px] text-slate-500 font-black block uppercase">CGPA</span>
                    <span className="font-black text-emerald-700">{viewingStudent.cgpa}</span>
                  </div>
                  <div className="clay-card-sm p-2.5">
                    <span className="text-[10px] text-slate-500 font-black block uppercase">Rumah Sewa</span>
                    <span className="font-black text-slate-900">{viewingStudent.rumahSewa || '-'}</span>
                  </div>
                  <div className="clay-card-sm p-2.5">
                    <span className="text-[10px] text-slate-500 font-black block uppercase">No Telefon</span>
                    <span className="font-black text-slate-900">{viewingStudent.noTel || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Profil Ibu Bapa */}
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-rose-700 block mb-1">
                  Maklumat Ibu Bapa / Penjaga
                </span>
                <div className="clay-card-sm p-3 space-y-2 border border-rose-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Nama Waris:</span>
                    <span className="font-black text-slate-900">{viewingStudent.namaIbuBapa || 'Belum diisi'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Hubungan:</span>
                    <span className="font-bold text-slate-800">{viewingStudent.hubunganIbuBapa || 'Bapa'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">No Telefon:</span>
                    <span className="font-black text-slate-900">{viewingStudent.noTelIbuBapa || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Pendapatan:</span>
                    <span className="font-black text-emerald-800">
                      {viewingStudent.pendapatanIbuBapa ? `RM ${viewingStudent.pendapatanIbuBapa}` : '-'}
                    </span>
                  </div>
                  {viewingStudent.alamatIbuBapa && (
                    <div className="pt-1 border-t border-slate-100">
                      <span className="text-slate-500 font-bold block text-[10px]">Alamat Waris:</span>
                      <span className="text-slate-800 font-medium block mt-0.5">{viewingStudent.alamatIbuBapa}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="clay-card-sm p-3">
                <span className="text-[10px] text-slate-500 font-black block uppercase mb-1">Alamat Pelajar</span>
                <p className="text-slate-800 font-medium leading-relaxed">{viewingStudent.alamat || 'Tiada maklumat.'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingStudent(null)}
                className="clay-btn px-4 py-2 rounded-xl text-xs font-black text-slate-900"
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

import React, { useState, useEffect, useMemo } from 'react';
import ClaySidebar from './components/ClaySidebar';
import ClayHeader from './components/ClayHeader';
import PhonePreview from './components/PhonePreview';
import MainDashboard from './components/MainDashboard';
import StudentManagement from './components/StudentManagement';
import EnrollmentDashboard from './components/EnrollmentDashboard';
import ProgramRegistration from './components/ProgramRegistration';
import SpiderWebAnalysis from './components/SpiderWebAnalysis';
import ScholarshipManagement from './components/ScholarshipManagement';
import ClubManagement from './components/ClubManagement';
import StudentPotentialReport from './components/StudentPotentialReport';
import JPPLeadership from './components/JPPLeadership';
import UserManagement from './components/UserManagement';
import LoginScreen from './components/LoginScreen';
import AcademicManagement from './components/AcademicManagement';

import {
  INITIAL_ENROLLMENT,
  INITIAL_STUDENTS,
  INITIAL_PROGRAMS,
  INITIAL_SCHOLARSHIPS,
  INITIAL_CLUBS,
  INITIAL_USERS,
  getStoredData,
  setStoredData
} from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dual Layout Mode: 'windows' (Desktop display) or 'phone' (Phone / Tablet clay preview)
  const [activeLayout, setActiveLayout] = useState('windows');

  // Users State (Admin & Pensyarah) - ensure assignedClass is present
  const [users, setUsers] = useState(() => {
    const loaded = getStoredData('KKSP_users', INITIAL_USERS);
    return loaded.map(u => {
      if (!u.assignedClass) {
        const found = INITIAL_USERS.find(iu => iu.username === u.username);
        return {
          ...u,
          assignedClass: found?.assignedClass || (u.role === 'admin' ? 'Semua Kelas' : 'SPK 1A')
        };
      }
      return u;
    });
  });

  // Authentication State (currentUser: null = show login screen)
  const [currentUser, setCurrentUser] = useState(() => {
    const user = getStoredData('KKSP_auth_user', null);
    if (user && !user.assignedClass) {
      const found = INITIAL_USERS.find(iu => iu.username === user.username);
      return {
        ...user,
        assignedClass: found?.assignedClass || (user.role === 'admin' ? 'Semua Kelas' : 'SPK 1A')
      };
    }
    return user;
  });

  // Core Persistent State
  const [students, setStudents] = useState(() =>
    getStoredData('KKSP_students', INITIAL_STUDENTS)
  );

  const [enrollmentData, setEnrollmentData] = useState(() =>
    getStoredData('KKSP_enrollment', INITIAL_ENROLLMENT)
  );

  const [programs, setPrograms] = useState(() =>
    getStoredData('KKSP_programs', INITIAL_PROGRAMS)
  );

  const [scholarships, setScholarships] = useState(() =>
    getStoredData('KKSP_scholarships', INITIAL_SCHOLARSHIPS)
  );

  const [clubs, setClubs] = useState(() =>
    getStoredData('KKSP_clubs', INITIAL_CLUBS)
  );

  // Sync to local storage
  useEffect(() => {
    setStoredData('KKSP_auth_user', currentUser);
  }, [currentUser]);

  useEffect(() => {
    setStoredData('KKSP_users', users);
  }, [users]);

  useEffect(() => {
    setStoredData('KKSP_students', students);
  }, [students]);

  useEffect(() => {
    setStoredData('KKSP_enrollment', enrollmentData);
  }, [enrollmentData]);

  useEffect(() => {
    setStoredData('KKSP_programs', programs);
  }, [programs]);

  useEffect(() => {
    setStoredData('KKSP_scholarships', scholarships);
  }, [scholarships]);

  useEffect(() => {
    setStoredData('KKSP_clubs', clubs);
  }, [clubs]);

  // Pensyarah Class Restriction Check
  const isClassRestricted = Boolean(
    currentUser?.role === 'pensyarah' &&
    currentUser?.assignedClass &&
    currentUser.assignedClass !== 'Semua Kelas'
  );

  const activeClassName = isClassRestricted ? currentUser.assignedClass : null;

  // Filtered Students: if pensyarah with assignedClass, only see students of that class
  const visibleStudents = useMemo(() => {
    if (!isClassRestricted) return students;
    return students.filter(s => s.kelas === activeClassName);
  }, [students, isClassRestricted, activeClassName]);

  // Filtered Scholarships: only see scholarships belonging to students in the visible class
  const visibleScholarships = useMemo(() => {
    if (!isClassRestricted) return scholarships;
    const studentMatriks = new Set(visibleStudents.map(s => s.matrik));
    return scholarships.filter(
      sch => studentMatriks.has(sch.matrik) || studentMatriks.has(sch.studentId)
    );
  }, [scholarships, visibleStudents, isClassRestricted]);

  const counts = {
    students: visibleStudents.length,
    enrollment: enrollmentData[enrollmentData.length - 1]?.count || 72,
    programs: programs.length,
    scholarships: visibleScholarships.length,
    clubs: clubs.length,
    users: users.length
  };

  const handleSelectStudentForSpider = (student) => {
    setActiveTab('spider');
  };

  const handleLogin = (user) => {
    // Make sure user has assignedClass from users list if missing
    const userInList = users.find(u => u.username === user.username) || user;
    const resolvedUser = {
      ...user,
      assignedClass: userInList.assignedClass || (user.role === 'admin' ? 'Semua Kelas' : 'SPK 1A')
    };
    setCurrentUser(resolvedUser);
    if (resolvedUser.role === 'pensyarah' && (activeTab === 'users' || activeTab === 'enrollment' || activeTab === 'calendar')) {
      setActiveTab('dashboard');
    }
  };

  // Ensure pensyarah cannot remain on enrollment, calendar (JPP), or users
  useEffect(() => {
    if (currentUser?.role === 'pensyarah') {
      if (activeTab === 'users' || activeTab === 'enrollment' || activeTab === 'calendar') {
        setActiveTab('dashboard');
      }
    }
  }, [currentUser, activeTab]);

  const handleLogout = () => {
    if (window.confirm('Adakah anda pasti ingin log keluar dari sistem?')) {
      setCurrentUser(null);
      try {
        localStorage.removeItem('KKSP_auth_user');
      } catch (err) {}
    }
  };

  // If not logged in, show the Login Menu screen
  if (!currentUser) {
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        users={users} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#edf2f7] font-sans text-slate-800 flex flex-col antialiased">
      {/* Top Header with Layout Switcher & User Profile */}
      <ClayHeader
        totalStudents={visibleStudents.length}
        currentEnrollment={counts.enrollment}
        activeLayout={activeLayout}
        setActiveLayout={setActiveLayout}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Body depending on Active Layout */}
      {activeLayout === 'phone' ? (
        /* PHONE & TABLET DISPLAY MODE (Directly mimicking the uploaded mockup design) */
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center mb-4 max-w-md">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-white/70 px-3 py-1 rounded-full shadow-xs">
              PAPARAN PHONE & TABLET (CLAYMORPHISM)
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Reka bentuk kad timbul lembut, lencana 3D berwarna-warni, serta butang navigasi bulat di bawah seperti gambar rujukan.
            </p>
          </div>

          <PhonePreview
            students={visibleStudents}
            enrollmentData={enrollmentData}
            programs={programs}
            scholarships={visibleScholarships}
            clubs={clubs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
          />
        </div>
      ) : (
        /* WINDOWS DISPLAY MODE (Full Desktop Dashboard Layout with Claymorphic Theme) */
        <div className="flex-1 flex overflow-hidden">
          {/* Soft Claymorphic Sidebar */}
          <div className="hidden lg:block overflow-y-auto">
            <ClaySidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              counts={counts}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          </div>

          {/* Windows Main Content Scrollable Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto pb-16">
              {activeTab === 'dashboard' && (
                <MainDashboard
                  students={visibleStudents}
                  enrollmentData={enrollmentData}
                  programs={programs}
                  scholarships={visibleScholarships}
                  clubs={clubs}
                  setActiveTab={setActiveTab}
                  setActiveLayout={setActiveLayout}
                  currentUser={currentUser}
                />
              )}

              {activeTab === 'students' && (
                <StudentManagement
                  students={visibleStudents}
                  setStudents={setStudents}
                  onSelectStudent={handleSelectStudentForSpider}
                  currentUser={currentUser}
                  isClassRestricted={isClassRestricted}
                  activeClassName={activeClassName}
                />
              )}

              {activeTab === 'academic' && (
                <AcademicManagement
                  students={visibleStudents}
                  allStudents={students}
                  setStudents={setStudents}
                  currentUser={currentUser}
                  isClassRestricted={isClassRestricted}
                  activeClassName={activeClassName}
                />
              )}

              {activeTab === 'enrollment' && currentUser?.role === 'admin' && (
                <EnrollmentDashboard
                  enrollmentData={enrollmentData}
                  setEnrollmentData={setEnrollmentData}
                  students={visibleStudents}
                />
              )}

              {activeTab === 'programs' && (
                <ProgramRegistration
                  programs={programs}
                  setPrograms={setPrograms}
                  students={visibleStudents}
                />
              )}

              {activeTab === 'spider' && (
                <SpiderWebAnalysis
                  students={visibleStudents}
                  programs={programs}
                  clubs={clubs}
                  scholarships={visibleScholarships}
                />
              )}

              {activeTab === 'scholarships' && (
                <ScholarshipManagement
                  scholarships={visibleScholarships}
                  setScholarships={setScholarships}
                  students={visibleStudents}
                  currentUser={currentUser}
                  isClassRestricted={isClassRestricted}
                  activeClassName={activeClassName}
                />
              )}

              {activeTab === 'clubs' && (
                <ClubManagement
                  clubs={clubs}
                  setClubs={setClubs}
                  students={visibleStudents}
                  currentUser={currentUser}
                  isClassRestricted={isClassRestricted}
                  activeClassName={activeClassName}
                />
              )}

              {activeTab === 'analytics' && (
                <StudentPotentialReport
                  students={visibleStudents}
                  programs={programs}
                  onSelectStudent={handleSelectStudentForSpider}
                />
              )}

              {activeTab === 'calendar' && currentUser?.role === 'admin' && (
                <JPPLeadership
                  students={visibleStudents}
                  clubs={clubs}
                />
              )}

              {activeTab === 'users' && currentUser?.role === 'admin' && (
                <UserManagement
                  users={users}
                  setUsers={setUsers}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  students={students}
                />
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}


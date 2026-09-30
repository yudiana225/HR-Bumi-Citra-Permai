import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, googleSignOut } from './services/auth';
import { Company, Employee, SalaryRecord, EmailLog, PayrollPeriod } from './types';
import {
  INITIAL_COMPANIES,
  INITIAL_PERIODS,
  INITIAL_EMPLOYEES,
  INITIAL_SALARY_RECORDS,
} from './utils/salaryCalculator';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { LaporanUpahSheetView } from './components/LaporanUpahSheetView';
import { EmployeeManagement } from './components/EmployeeManagement';
import { SalaryEditor } from './components/SalaryEditor';
import { PayrollSender } from './components/PayrollSender';
import { SlipGajiDocument } from './components/SlipGajiDocument';
import { PWAInstallButton } from './components/PWAInstallButton';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Calculator,
  Send,
  FileText,
  CheckCircle,
  LogOut,
  Shield,
  Smartphone,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'laporan-upah' | 'editor' | 'employees' | 'sender' | 'preview'
  >('dashboard');

  // Auth states
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // App Data
  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('bcp_companies_v4');
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });

  const [periods, setPeriods] = useState<PayrollPeriod[]>(() => {
    const saved = localStorage.getItem('bcp_periods_v4');
    return saved ? JSON.parse(saved) : INITIAL_PERIODS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('bcp_employees_v4');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(() => {
    const saved = localStorage.getItem('bcp_salary_records_v4');
    return saved ? JSON.parse(saved) : INITIAL_SALARY_RECORDS;
  });

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem('bcp_email_logs_v4');
    return saved ? JSON.parse(saved) : [];
  });

  // Target record for Preview
  const [previewRecord, setPreviewRecord] = useState<SalaryRecord>(INITIAL_SALARY_RECORDS[0]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('bcp_companies_v4', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('bcp_periods_v4', JSON.stringify(periods));
  }, [periods]);

  useEffect(() => {
    localStorage.setItem('bcp_employees_v4', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('bcp_salary_records_v4', JSON.stringify(salaryRecords));
  }, [salaryRecords]);

  useEffect(() => {
    localStorage.setItem('bcp_email_logs_v4', JSON.stringify(emailLogs));
  }, [emailLogs]);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setNeedsAuth(false);
      },
      () => {
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      alert('Gagal menghubungkan akun Google/Gmail: ' + (err.message || 'Izin ditolak'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setUser(null);
    setAccessToken(null);
    setNeedsAuth(true);
  };

  // Company Handlers
  const handleAddCompany = (compData: Omit<Company, 'id'>) => {
    const newComp: Company = {
      ...compData,
      id: `comp-${Date.now()}`,
    };
    setCompanies((prev) => [...prev, newComp]);
  };

  const handleUpdateCompany = (comp: Company) => {
    setCompanies((prev) => prev.map((c) => (c.id === comp.id ? comp : c)));
  };

  const handleDeleteCompany = (id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  };

  // Period Handlers
  const handleAddPeriod = (pData: Omit<PayrollPeriod, 'id'>) => {
    const newP: PayrollPeriod = {
      ...pData,
      id: `p-${Date.now()}`,
    };
    setPeriods((prev) => [newP, ...prev]);
  };

  const handleTogglePeriodLock = (id: string) => {
    setPeriods((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isLocked: !p.isLocked } : p))
    );
  };

  // Employee Handlers
  const handleAddEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
    };
    setEmployees((prev) => [...prev, newEmp]);
  };

  const handleUpdateEmployee = (emp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? emp : e)));
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  // Salary Record Handlers
  const handleSaveSalaryRecord = (rec: SalaryRecord) => {
    setSalaryRecords((prev) => {
      const idx = prev.findIndex(
        (r) =>
          r.id === rec.id ||
          (r.employeeId === rec.employeeId && r.period.toUpperCase() === rec.period.toUpperCase())
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = rec;
        return copy;
      }
      return [...prev, rec];
    });
  };

  const handlePreviewRecord = (rec: SalaryRecord) => {
    setPreviewRecord(rec);
    setActiveTab('preview');
  };

  const handleDeleteSalaryRecord = (recordId: string) => {
    setSalaryRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  const handleAddLog = (log: EmailLog) => {
    setEmailLogs((prev) => [log, ...prev]);
  };

  // Current preview metadata
  const currentPreviewEmployee =
    employees.find((e) => e.id === previewRecord.employeeId) || employees[0];
  const currentPreviewCompany =
    companies.find((c) => c.id === (previewRecord.companyId || currentPreviewEmployee?.companyId)) ||
    companies[0];

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Professional Header Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
              BCP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                  Payroll Management System
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                  Confidential
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                PT. BUMI CITRA PERMAI & Multi-Company • PWA Enabled
              </p>
            </div>
          </div>

          {/* Controls: PWA Install + User Auth */}
          <div className="flex items-center gap-2.5">
            {/* In-app PWA install button */}
            <PWAInstallButton />

            {/* Google / Gmail Auth */}
            {user ? (
              <div className="flex items-center gap-2.5 bg-slate-50 border border-gray-200 py-1.5 px-3 rounded-full">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-gray-800 leading-tight">
                    {user.displayName || user.email}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5" /> Gmail Terhubung
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Logout"
                  className="p-1 text-gray-400 hover:text-gray-700 transition-colors ml-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-xs transition-colors cursor-pointer"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-4 h-4"
                  style={{ display: 'block' }}
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>{isLoggingIn ? 'Connecting...' : 'Connect Gmail'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation with sleek UX styling */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-gray-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Executive Dashboard
          </button>

          <button
            onClick={() => setActiveTab('laporan-upah')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'laporan-upah'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Sheet Laporan Upah
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Komponen & Kalkulasi
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'employees'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Data Karyawan ({employees.length})
          </button>

          <button
            onClick={() => setActiveTab('sender')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'sender'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Send className="w-4 h-4" />
            Distribusi Slip Gaji (Gmail API)
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'preview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Pratinjau Slip Resmi
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Notice if Gmail is not yet connected */}
        {!user && activeTab === 'sender' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs shadow-xs">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Akun Gmail Belum Terhubung:</span> Klik tombol login Google di kanan atas untuk mengizinkan sistem mendistribusikan dokumen slip gaji PDF langsung dari akun Gmail Anda.
              </div>
            </div>
            <button
              onClick={handleSignIn}
              className="px-3.5 py-1.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 shrink-0 cursor-pointer shadow-2xs"
            >
              Hubungkan Sekarang
            </button>
          </div>
        )}

        {/* Tab 1: Executive Dashboard (PRD Section 8.1 & Section 17 & 22) */}
        {activeTab === 'dashboard' && (
          <ExecutiveDashboard
            companies={companies}
            employees={employees}
            periods={periods}
            salaryRecords={salaryRecords}
            onSelectPeriod={() => {}}
            onNavigateToTab={setActiveTab}
            onPreviewRecord={handlePreviewRecord}
          />
        )}

        {/* Tab 2: Sheet Laporan Upah (Exact Excel 1:1 view) */}
        {activeTab === 'laporan-upah' && (
          <LaporanUpahSheetView
            companies={companies}
            employees={employees}
            periods={periods}
            salaryRecords={salaryRecords}
            onPreviewRecord={handlePreviewRecord}
            onSaveSalaryRecord={handleSaveSalaryRecord}
            onDeleteSalaryRecord={handleDeleteSalaryRecord}
          />
        )}

        {/* Tab 3: Komponen & Kalkulasi Gaji */}
        {activeTab === 'editor' && (
          <SalaryEditor
            companies={companies}
            employees={employees}
            periods={periods}
            salaryRecords={salaryRecords}
            onSaveSalaryRecord={handleSaveSalaryRecord}
            onPreviewRecord={handlePreviewRecord}
          />
        )}

        {/* Tab 4: Manajemen Data Karyawan & Kategori */}
        {activeTab === 'employees' && (
          <EmployeeManagement
            companies={companies}
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}

        {/* Tab 5: Payroll Sender via Gmail API */}
        {activeTab === 'sender' && (
          <PayrollSender
            companies={companies}
            employees={employees}
            periods={periods}
            salaryRecords={salaryRecords}
            accessToken={accessToken}
            onRequireAuth={handleSignIn}
            onPreviewRecord={handlePreviewRecord}
            onUpdateSalaryRecord={handleSaveSalaryRecord}
            logs={emailLogs}
            onAddLog={handleAddLog}
          />
        )}

        {/* Tab 7: Pratinjau Dokumen Resmi (Multi-Company & No Urut) */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-xs">
                <span className="font-bold text-gray-800">Menampilkan Slip Gaji:</span>{' '}
                <span className="font-semibold text-indigo-600 uppercase">
                  {currentPreviewEmployee.name}
                </span>{' '}
                (No Urut: #{currentPreviewEmployee.employeeNo}) — {currentPreviewCompany.name} ({previewRecord.period})
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={previewRecord.id}
                  onChange={(e) => {
                    const found = salaryRecords.find((r) => r.id === e.target.value);
                    if (found) setPreviewRecord(found);
                  }}
                  className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg bg-gray-50"
                >
                  {salaryRecords.map((r) => {
                    const emp = employees.find((e) => e.id === r.employeeId);
                    const comp = companies.find((c) => c.id === r.companyId);
                    return (
                      <option key={r.id} value={r.id}>
                        #{emp?.employeeNo} {emp?.name || 'Karyawan'} — {comp?.code || comp?.name} ({r.period})
                      </option>
                    );
                  })}
                </select>

                <button
                  onClick={() => setActiveTab('sender')}
                  className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer shadow-xs"
                >
                  Kirim via Gmail
                </button>
              </div>
            </div>

            <div className="bg-gray-200/70 p-6 md:p-10 rounded-2xl flex justify-center overflow-x-auto shadow-inner">
              <SlipGajiDocument
                record={previewRecord}
                employee={currentPreviewEmployee}
                company={currentPreviewCompany}
                showActions={true}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-500">
        Payroll Management System &copy; {new Date().getFullYear()} — PT. BUMI CITRA PERMAI & Multi-Company. Progressive Web App (PWA) with Gmail API Integration.
      </footer>
    </div>
  );
}

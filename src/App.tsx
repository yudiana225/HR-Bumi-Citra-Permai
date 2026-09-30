import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, googleSignOut } from './services/auth';
import { Employee, SalaryRecord, EmailLog } from './types';
import { INITIAL_EMPLOYEES, INITIAL_SALARY_RECORDS } from './utils/salaryCalculator';
import { EmployeeManagement } from './components/EmployeeManagement';
import { SalaryEditor } from './components/SalaryEditor';
import { PayrollSender } from './components/PayrollSender';
import { SlipGajiDocument } from './components/SlipGajiDocument';
import {
  Users,
  Calculator,
  Send,
  FileSpreadsheet,
  LogIn,
  LogOut,
  Building,
  CheckCircle,
  FileText,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'employees' | 'editor' | 'sender' | 'preview'>('editor');
  
  // Auth states
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // App Data (persisted in local state and localStorage for smooth multi-turn usage)
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('bcp_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(() => {
    const saved = localStorage.getItem('bcp_salary_records');
    return saved ? JSON.parse(saved) : INITIAL_SALARY_RECORDS;
  });

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem('bcp_email_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Preview target
  const [previewRecord, setPreviewRecord] = useState<SalaryRecord>(INITIAL_SALARY_RECORDS[0]);

  // Sync to local storage for persistent administrative convenience
  useEffect(() => {
    localStorage.setItem('bcp_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('bcp_salary_records', JSON.stringify(salaryRecords));
  }, [salaryRecords]);

  useEffect(() => {
    localStorage.setItem('bcp_email_logs', JSON.stringify(emailLogs));
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
        // needs sign-in
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

  // Employee handlers
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

  // Salary Record handlers
  const handleSaveSalaryRecord = (rec: SalaryRecord) => {
    setSalaryRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === rec.id || (r.employeeId === rec.employeeId && r.period === rec.period));
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

  const handleAddLog = (log: EmailLog) => {
    setEmailLogs((prev) => [log, ...prev]);
  };

  const currentPreviewEmployee = employees.find((e) => e.id === previewRecord.employeeId) || employees[0];

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              BCP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                  PT. BUMI CITRA PERMAI
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                  Confidential
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                Dashboard Sistem Pengiriman Slip Gaji Otomatis via Gmail
              </p>
            </div>
          </div>

          {/* User Auth Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-50 border border-gray-200 py-1.5 px-3 rounded-full">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full" />
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
                className="gsi-material-button inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-xs transition-colors cursor-pointer"
              >
                <div className="gsi-material-button-icon w-4 h-4 shrink-0">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                </div>
                <span>{isLoggingIn ? 'Menghubungkan...' : 'Hubungkan Gmail (OAuth)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-gray-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('editor')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Input & Edit Komponen Gaji
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
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
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
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
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'preview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Pratinjau Dokumen Resmi
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Notice if Gmail is not yet connected */}
        {!user && activeTab === 'sender' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Akun Gmail Belum Terhubung:</span> Klik tombol login Google di kanan atas untuk mengizinkan sistem mengirimkan slip gaji berlampiran PDF langsung dari Gmail Anda.
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

        {/* Tab 1: Input & Edit Komponen Gaji */}
        {activeTab === 'editor' && (
          <SalaryEditor
            employees={employees}
            salaryRecords={salaryRecords}
            onSaveSalaryRecord={handleSaveSalaryRecord}
            onPreviewRecord={handlePreviewRecord}
          />
        )}

        {/* Tab 2: Manajemen Data Karyawan */}
        {activeTab === 'employees' && (
          <EmployeeManagement
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}

        {/* Tab 3: Payroll Sender */}
        {activeTab === 'sender' && (
          <PayrollSender
            employees={employees}
            salaryRecords={salaryRecords}
            accessToken={accessToken}
            onRequireAuth={handleSignIn}
            onPreviewRecord={handlePreviewRecord}
            onUpdateSalaryRecord={handleSaveSalaryRecord}
            logs={emailLogs}
            onAddLog={handleAddLog}
          />
        )}

        {/* Tab 4: Pratinjau Dokumen Resmi (Exact Image Reference) */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-xs">
                <span className="font-bold text-gray-800">Menampilkan Slip Gaji:</span>{' '}
                <span className="font-semibold text-indigo-600 uppercase">
                  {currentPreviewEmployee.name}
                </span>{' '}
                — Jabatan: {currentPreviewEmployee.position} — Periode: {previewRecord.period}
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
                    return (
                      <option key={r.id} value={r.id}>
                        {emp?.name || 'Karyawan'} ({r.period})
                      </option>
                    );
                  })}
                </select>

                <button
                  onClick={() => setActiveTab('sender')}
                  className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer shadow-xs"
                >
                  Kirim ke Gmail
                </button>
              </div>
            </div>

            <div className="bg-gray-200/70 p-6 md:p-10 rounded-2xl flex justify-center overflow-x-auto shadow-inner">
              <SlipGajiDocument
                record={previewRecord}
                employee={currentPreviewEmployee}
                showActions={true}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-500">
        PT. BUMI CITRA PERMAI &copy; {new Date().getFullYear()} — Dashboard Sistem Pengiriman Slip Gaji Otomatis via Gmail API.
      </footer>
    </div>
  );
}

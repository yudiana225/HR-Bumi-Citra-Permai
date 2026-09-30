import React, { useState } from 'react';
import { Company, PayrollPeriod } from '../types';
import { Building2, Plus, Calendar, Edit2, Trash2, CheckCircle2, Lock, Unlock } from 'lucide-react';

interface CompanyPeriodManagerProps {
  companies: Company[];
  periods: PayrollPeriod[];
  onAddCompany: (comp: Omit<Company, 'id'>) => void;
  onUpdateCompany: (comp: Company) => void;
  onDeleteCompany: (id: string) => void;
  onAddPeriod: (p: Omit<PayrollPeriod, 'id'>) => void;
  onTogglePeriodLock: (id: string) => void;
}

export const CompanyPeriodManager: React.FC<CompanyPeriodManagerProps> = ({
  companies,
  periods,
  onAddCompany,
  onUpdateCompany,
  onDeleteCompany,
  onAddPeriod,
  onTogglePeriodLock,
}) => {
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyCode, setNewCompanyCode] = useState('');
  const [newPeriodName, setNewPeriodName] = useState('');
  const [newPeriodMonth, setNewPeriodMonth] = useState<number>(new Date().getMonth() + 1);
  const [newPeriodYear, setNewPeriodYear] = useState<number>(new Date().getFullYear());

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    onAddCompany({
      name: newCompanyName.trim().toUpperCase(),
      code: newCompanyCode.trim().toUpperCase() || undefined,
    });
    setNewCompanyName('');
    setNewCompanyCode('');
  };

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodName.trim()) return;
    onAddPeriod({
      name: newPeriodName.trim(),
      month: newPeriodMonth,
      year: newPeriodYear,
      isLocked: false,
    });
    setNewPeriodName('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Companies Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Daftar Entitas Perusahaan (Multi-Company)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Unit bisnis & holding sesuai lembar "Laporan Upah".
            </p>
          </div>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
            {companies.length} Entitas
          </span>
        </div>

        {/* Add Company Form */}
        <form onSubmit={handleCreateCompany} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Nama PT (Contoh: PT. CITRA PERMAI REALTY)"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Kode (CPR)"
            value={newCompanyCode}
            onChange={(e) => setNewCompanyCode(e.target.value)}
            className="w-20 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shrink-0 cursor-pointer shadow-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah
          </button>
        </form>

        {/* Company List */}
        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto border border-gray-100 rounded-lg">
          {companies.map((comp) => (
            <div key={comp.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
              <div>
                <div className="font-bold text-xs text-gray-900">{comp.name}</div>
                <div className="text-[10px] text-gray-400 font-mono">Kode: {comp.code || '-'}</div>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Hapus entitas ${comp.name}?`)) onDeleteCompany(comp.id);
                }}
                className="text-gray-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                title="Hapus Entitas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payroll Periods Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Siklus & Periode Penggajian (Payroll Periods)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Bulan pemrosesan laporan upah & penguncian data.
            </p>
          </div>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
            {periods.length} Periode
          </span>
        </div>

        {/* Add Period Form */}
        <form onSubmit={handleCreatePeriod} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Nama Periode (Contoh: Oktober 2025)"
            value={newPeriodName}
            onChange={(e) => setNewPeriodName(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shrink-0 cursor-pointer shadow-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Buat Periode
          </button>
        </form>

        {/* Period List */}
        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto border border-gray-100 rounded-lg">
          {periods.map((p) => (
            <div key={p.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  {p.name.slice(0, 3)}
                </div>
                <div>
                  <div className="font-bold text-xs text-gray-900">{p.name}</div>
                  <div className="text-[10px] text-gray-400">
                    Bulan: {p.month} / {p.year}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onTogglePeriodLock(p.id)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 border cursor-pointer ${
                    p.isLocked
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {p.isLocked ? <Lock className="w-3 h-3 text-amber-600" /> : <Unlock className="w-3 h-3 text-gray-400" />}
                  {p.isLocked ? 'Terkunci' : 'Terbuka'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

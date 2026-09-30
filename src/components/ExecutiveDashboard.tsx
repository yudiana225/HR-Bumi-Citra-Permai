import React, { useState } from 'react';
import { Company, Employee, SalaryRecord, PayrollPeriod } from '../types';
import { calculateSalary, formatRupiah, formatRupiahDecimal } from '../utils/salaryCalculator';
import {
  Users,
  Wallet,
  TrendingUp,
  Percent,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface ExecutiveDashboardProps {
  companies: Company[];
  employees: Employee[];
  periods: PayrollPeriod[];
  salaryRecords: SalaryRecord[];
  onSelectPeriod: (period: string) => void;
  onNavigateToTab: (tab: any) => void;
  onPreviewRecord: (record: SalaryRecord) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  companies,
  employees,
  periods,
  salaryRecords,
  onSelectPeriod,
  onNavigateToTab,
  onPreviewRecord,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(periods[0]?.name || 'Oktober 2025');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');

  const getEmployee = (empId: string) => employees.find((e) => e.id === empId);
  const getCompany = (compId: string) => companies.find((c) => c.id === compId);

  // Filter records for this view
  const periodRecords = salaryRecords.filter((r) => {
    const matchPeriod = selectedPeriod === 'all' || r.period.toUpperCase() === selectedPeriod.toUpperCase();
    const matchCompany = selectedCompanyId === 'all' || r.companyId === selectedCompanyId;
    return matchPeriod && matchCompany;
  });

  // Calculate Aggregates for KPIs
  const metrics = periodRecords.reduce(
    (acc, rec) => {
      const calc = calculateSalary(rec.items);
      acc.totalGross += calc.totalEarnings;
      acc.totalDeductions += calc.totalDeductions;
      acc.totalTHP += calc.takeHomePay;
      acc.totalBaseSalary += rec.items.baseSalary || 0;
      acc.totalAllowances +=
        (rec.items.allowanceJob || 0) +
        (rec.items.allowanceMeal || 0) +
        (rec.items.allowanceTransport || 0) +
        (rec.items.allowancePulse || 0);
      acc.totalOvertime += rec.items.overtime || 0;
      acc.totalBonus += rec.items.bonusTHR || 0;
      acc.totalBPJS +=
        (rec.items.deductionBPJSJHT || 0) +
        (rec.items.deductionBPJSKesehatan || 0) +
        (rec.items.deductionBPJSPensiun || 0);
      return acc;
    },
    {
      totalGross: 0,
      totalDeductions: 0,
      totalTHP: 0,
      totalBaseSalary: 0,
      totalAllowances: 0,
      totalOvertime: 0,
      totalBonus: 0,
      totalBPJS: 0,
    }
  );

  // Department cost breakdown
  const departmentBreakdown = periodRecords.reduce((acc, rec) => {
    const emp = getEmployee(rec.employeeId);
    const dept = emp?.department || 'OPERATIONAL';
    const calc = calculateSalary(rec.items);
    if (!acc[dept]) {
      acc[dept] = { count: 0, total: 0 };
    }
    acc[dept].count += 1;
    acc[dept].total += calc.takeHomePay;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  // Top 5 Highest Payroll Earners
  const topEarners = [...periodRecords]
    .map((r) => ({
      record: r,
      employee: getEmployee(r.employeeId),
      company: getCompany(r.companyId),
      calc: calculateSalary(r.items),
    }))
    .filter((item) => item.employee)
    .sort((a, b) => b.calc.takeHomePay - a.calc.takeHomePay)
    .slice(0, 5);

  const activePeriodObj = periods.find((p) => p.name === selectedPeriod);

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Period Filter Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              PRD Executive System v1.0
            </span>
            {activePeriodObj?.isLocked ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Active Cycle
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Payroll & Rekap Gaji Management
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Ringkasan keuangan penggajian, beban tunjangan, efisiensi potongan, dan analisis Take Home Pay.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period selector */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value);
                onSelectPeriod(e.target.value);
              }}
              className="bg-transparent text-white font-semibold focus:outline-hidden cursor-pointer"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.name} className="bg-slate-800 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Company filter */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-800 text-white">
                Semua PT ({companies.length})
              </option>
              {companies.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-800 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (4 Primary Cards as outlined in PRD Section 8.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Karyawan */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Karyawan Payroll
            </div>
            <div className="text-2xl font-black text-gray-900 mt-1 font-mono">
              {periodRecords.length}{' '}
              <span className="text-xs font-semibold text-gray-400">/ {employees.length} Orang</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Siap Cetak & Kirim
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Payroll (Gross Salary) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Payroll (Gross)
            </div>
            <div className="text-xl font-black text-emerald-600 mt-1 font-mono">
              Rp {formatRupiahDecimal(metrics.totalGross)}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              Gaji Pokok: Rp {formatRupiah(metrics.totalBaseSalary)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Total Potongan */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Potongan
            </div>
            <div className="text-xl font-black text-rose-600 mt-1 font-mono">
              Rp {formatRupiahDecimal(metrics.totalDeductions)}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              BPJS/Jamsostek: Rp {formatRupiahDecimal(metrics.totalBPJS)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Take Home Pay (THP) */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg flex items-center justify-between border border-indigo-800">
          <div>
            <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
              Take Home Pay (THP)
            </div>
            <div className="text-xl font-black text-amber-300 mt-1 font-mono">
              Rp {formatRupiahDecimal(metrics.totalTHP)}
            </div>
            <div className="text-[10px] text-slate-300 mt-1">
              Net Disbursed to Employees
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center font-bold">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Salary Composition & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Salary Composition Bars */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Komposisi Biaya Gaji
            </h3>
            <span className="text-[10px] text-gray-400">Periode Ini</span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Gaji Pokok */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>Gaji Pokok</span>
                <span className="font-mono">{formatRupiah(metrics.totalBaseSalary)}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{
                    width: `${metrics.totalGross > 0 ? (metrics.totalBaseSalary / metrics.totalGross) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Tunjangan Rutin */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>Tunjangan Rutin</span>
                <span className="font-mono">{formatRupiah(metrics.totalAllowances)}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${metrics.totalGross > 0 ? (metrics.totalAllowances / metrics.totalGross) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Lembur & Insentif */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>Lembur & Insentif</span>
                <span className="font-mono">{formatRupiah(metrics.totalOvertime)}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${metrics.totalGross > 0 ? (metrics.totalOvertime / metrics.totalGross) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* THR & Bonus */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>THR / Bonus</span>
                <span className="font-mono">{formatRupiah(metrics.totalBonus)}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{
                    width: `${metrics.totalGross > 0 ? (metrics.totalBonus / metrics.totalGross) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Total Potongan */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span className="text-rose-600 font-bold">Total Pengurangan (Potongan)</span>
                <span className="font-mono text-rose-600 font-bold">
                  {formatRupiahDecimal(metrics.totalDeductions)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{
                    width: `${metrics.totalGross > 0 ? (metrics.totalDeductions / metrics.totalGross) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Department Payroll Cost Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Payroll by Department
            </h3>
            <span className="text-[10px] text-gray-400">Total THP</span>
          </div>

          <div className="space-y-3 divide-y divide-gray-100 pt-1">
            {Object.entries(departmentBreakdown).map(([dept, data]) => (
              <div key={dept} className="pt-2 first:pt-0 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-900">{dept}</div>
                  <div className="text-[10px] text-gray-500">{data.count} Karyawan</div>
                </div>
                <div className="text-right font-mono font-bold text-xs text-gray-900">
                  Rp {formatRupiahDecimal(data.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Top 5 Highest Payroll Earners */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Top Payroll Earners
            </h3>
            <button
              onClick={() => onNavigateToTab('laporan-upah')}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
            >
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 pt-1">
            {topEarners.map(({ record, employee, company, calc }, idx) => (
              <div
                key={record.id}
                onClick={() => onPreviewRecord(record)}
                className="p-2.5 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-300 font-bold text-xs flex items-center justify-center font-mono">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 leading-tight">
                      {employee?.name}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {employee?.position} • {company?.code || company?.name}
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono font-extrabold text-xs text-emerald-700">
                  Rp {formatRupiahDecimal(calc.takeHomePay)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Matrix Banner */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h4 className="text-sm font-bold text-gray-900">
            Akses Lembar Matriks & Distribusi Slip Gaji
          </h4>
          <p className="text-xs text-gray-500">
            Kelola rincian perhitungan individual, periksa tabel Laporan Upah, atau distribusikan dokumen PDF via Gmail API.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('laporan-upah')}
            className="px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Buka Sheet Laporan Upah
          </button>
          <button
            onClick={() => onNavigateToTab('sender')}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Kirim Slip Gaji (Gmail)
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Company, Employee, SalaryRecord, PayrollPeriod, SalaryItemDetail } from '../types';
import { calculateSalary, formatRupiah, formatRupiahDecimal, parseNumber } from '../utils/salaryCalculator';
import {
  FileSpreadsheet,
  Download,
  Eye,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Sparkles,
  Calculator,
} from 'lucide-react';

interface LaporanUpahSheetViewProps {
  companies: Company[];
  employees: Employee[];
  periods: PayrollPeriod[];
  salaryRecords: SalaryRecord[];
  onPreviewRecord: (record: SalaryRecord) => void;
  onSaveSalaryRecord: (record: SalaryRecord) => void;
  onDeleteSalaryRecord: (recordId: string) => void;
}

export const LaporanUpahSheetView: React.FC<LaporanUpahSheetViewProps> = ({
  companies,
  employees,
  periods,
  salaryRecords,
  onPreviewRecord,
  onSaveSalaryRecord,
  onDeleteSalaryRecord,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(periods[0]?.name || 'Oktober 2025');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Modal State for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SalaryRecord | null>(null);

  // Form State
  const [formEmployeeId, setFormEmployeeId] = useState<string>(employees[0]?.id || '');
  const [formCompanyId, setFormCompanyId] = useState<string>(companies[0]?.id || '');
  const [formPeriod, setFormPeriod] = useState<string>(periods[0]?.name || 'Oktober 2025');
  const [formItems, setFormItems] = useState<SalaryItemDetail>({
    baseSalary: 6000000,
    allowanceJob: 0,
    allowanceMeal: 440000,
    allowanceTransport: 440000,
    allowancePulse: 0,
    overtime: 0,
    incentive: 0,
    operational: 0,
    bonusTHR: 0,
    otherIncome: 0,
    pph21Allowance: 0,

    deductionBPJSJHT: 114598,
    deductionBPJSKesehatan: 57298,
    deductionBPJSPensiun: 0,
    deductionCompanyTax: 0,
    deductionKasbon: 0,
    deductionSetting: 0,
    deductionAdvance: 0,
    deductionLate: 0,
    deductionAbsence: 0,
    deductionOther: 0,

    rounding: 0,
    cashAllowance: 0,
  });

  const getEmployee = (empId: string) => employees.find((e) => e.id === empId);
  const getCompany = (compId: string) => companies.find((c) => c.id === compId);

  // Header banner companies
  const companyNamesHeader = [
    'PT. NINDO GLOBAL NUSANTARA',
    'PT. NINDO MITRA MAKMUR',
    'PT. CITRA PERMAI REALTY',
    'PT. BUMI CITRA PRATAMA',
    'PT. CITRA PERMAI PESONA',
    'PT. SAPTAUSAHA GEMILANG INDAH, Tbk',
    'PT. CITRA PERMAI MANDIRI',
    'PT. MILLENIUM INVESMENT',
    'PT. MILLENNIUM MINING & RESOURCES',
  ];

  // Filter records
  const filteredRecords = salaryRecords.filter((rec) => {
    const emp = getEmployee(rec.employeeId);
    if (!emp) return false;

    const matchPeriod = selectedPeriod === 'all' || rec.period.toUpperCase() === selectedPeriod.toUpperCase();
    const matchCompany = selectedCompanyId === 'all' || rec.companyId === selectedCompanyId;
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.position.toLowerCase().includes(search.toLowerCase());

    return matchPeriod && matchCompany && matchSearch;
  });

  // Calculate totals
  const totals = filteredRecords.reduce(
    (acc, rec) => {
      const calc = calculateSalary(rec.items);
      acc.baseSalary += rec.items.baseSalary || 0;
      acc.allowanceJob += rec.items.allowanceJob || 0;
      acc.allowanceMeal += rec.items.allowanceMeal || 0;
      acc.allowanceTransport += rec.items.allowanceTransport || 0;
      acc.allowancePulse += rec.items.allowancePulse || 0;
      acc.overtime += rec.items.overtime || 0;
      acc.incentive += rec.items.incentive || 0;
      acc.otherIncome += rec.items.otherIncome || 0;
      acc.totalEarnings += calc.totalEarnings;

      acc.bpjsJHT += rec.items.deductionBPJSJHT || 0;
      acc.bpjsKes += rec.items.deductionBPJSKesehatan || 0;
      acc.bpjsPensiun += rec.items.deductionBPJSPensiun || 0;
      acc.setting += rec.items.deductionSetting || 0;
      acc.advance += rec.items.deductionAdvance || 0;
      acc.late += rec.items.deductionLate || 0;
      acc.absence += rec.items.deductionAbsence || 0;
      acc.kasbon += rec.items.deductionKasbon || 0;
      acc.totalDeductions += calc.totalDeductions;
      acc.thp += calc.takeHomePay;
      return acc;
    },
    {
      baseSalary: 0,
      allowanceJob: 0,
      allowanceMeal: 0,
      allowanceTransport: 0,
      allowancePulse: 0,
      overtime: 0,
      incentive: 0,
      otherIncome: 0,
      totalEarnings: 0,
      bpjsJHT: 0,
      bpjsKes: 0,
      bpjsPensiun: 0,
      setting: 0,
      advance: 0,
      late: 0,
      absence: 0,
      kasbon: 0,
      totalDeductions: 0,
      thp: 0,
    }
  );

  // CRUD Handlers
  const handleOpenCreate = () => {
    setEditingRecord(null);
    const firstEmp = employees[0];
    setFormEmployeeId(firstEmp?.id || '');
    setFormCompanyId(firstEmp?.companyId || companies[0]?.id || '');
    setFormPeriod(selectedPeriod === 'all' ? periods[0]?.name || 'Oktober 2025' : selectedPeriod);
    setFormItems({
      baseSalary: 6000000,
      allowanceJob: 0,
      allowanceMeal: 440000,
      allowanceTransport: 440000,
      allowancePulse: 0,
      overtime: 0,
      incentive: 0,
      operational: 0,
      bonusTHR: 0,
      otherIncome: 0,
      pph21Allowance: 0,

      deductionBPJSJHT: 114598,
      deductionBPJSKesehatan: 57298,
      deductionBPJSPensiun: 0,
      deductionCompanyTax: 0,
      deductionKasbon: 0,
      deductionSetting: 0,
      deductionAdvance: 0,
      deductionLate: 0,
      deductionAbsence: 0,
      deductionOther: 0,

      rounding: 0,
      cashAllowance: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: SalaryRecord) => {
    setEditingRecord(rec);
    setFormEmployeeId(rec.employeeId);
    setFormCompanyId(rec.companyId);
    setFormPeriod(rec.period);
    setFormItems(rec.items);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = (rec: SalaryRecord) => {
    const emp = getEmployee(rec.employeeId);
    if (confirm(`Apakah Anda yakin ingin menghapus data laporan upah untuk "${emp?.name || 'Karyawan'}" (${rec.period})?`)) {
      onDeleteSalaryRecord(rec.id);
    }
  };

  const handleFormItemChange = (field: keyof SalaryItemDetail, val: string) => {
    const num = parseNumber(val);
    setFormItems((prev) => ({
      ...prev,
      [field]: num,
    }));
  };

  const handleEmployeeSelect = (empId: string) => {
    setFormEmployeeId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setFormCompanyId(emp.companyId);
    }
  };

  const handleAutoCalcBPJS = () => {
    const base = formItems.baseSalary || 0;
    setFormItems((prev) => ({
      ...prev,
      deductionBPJSJHT: Math.round(base * 0.02),
      deductionBPJSKesehatan: Number((base * 0.01).toFixed(2)),
      deductionBPJSPensiun: Number((base * 0.01).toFixed(2)),
    }));
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployeeId) return;

    const recordToSave: SalaryRecord = {
      id: editingRecord?.id || `sal-${formEmployeeId}-${Date.now()}`,
      employeeId: formEmployeeId,
      companyId: formCompanyId,
      period: formPeriod,
      items: formItems,
      notes: editingRecord?.notes || 'Data dari Laporan Upah',
      sentStatus: editingRecord?.sentStatus || 'unsent',
      createdAt: editingRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveSalaryRecord(recordToSave);
    setIsModalOpen(false);
  };

  const modalCalc = calculateSalary(formItems);

  const handleExportCSV = () => {
    const headers = [
      'No',
      'NAMA',
      'NAMA PT',
      'BULAN',
      'JABATAN',
      'GAJI POKOK',
      'TUNJANGAN Jabatan',
      'TUNJANGAN Makan',
      'TUNJANGAN Transp.',
      'TUNJANGAN Pulsa',
      'Lembur',
      'Insentive',
      'Lain - Lain',
      'Total Penerimaan',
      'JAMSOSTEK JHT = 2%',
      'BPJS 1%',
      'BPJSTK Pensiun',
      'PENGATURAN GAJI',
      'UANG DIBAYAR DIMUKA',
      'TELAT',
      'MANGKIR',
      'POT. PRIBADI / Kasbon',
      'Total Potongan',
      'Take Home Pay',
    ];

    const rows = filteredRecords.map((rec, idx) => {
      const emp = getEmployee(rec.employeeId);
      const comp = getCompany(rec.companyId);
      const calc = calculateSalary(rec.items);
      return [
        emp?.employeeNo || idx + 1,
        `"${emp?.name || ''}"`,
        `"${comp?.name || ''}"`,
        `"${rec.period}"`,
        `"${emp?.position || ''}"`,
        rec.items.baseSalary,
        rec.items.allowanceJob,
        rec.items.allowanceMeal,
        rec.items.allowanceTransport,
        rec.items.allowancePulse,
        rec.items.overtime,
        rec.items.incentive,
        rec.items.otherIncome,
        calc.totalEarnings,
        rec.items.deductionBPJSJHT,
        rec.items.deductionBPJSKesehatan,
        rec.items.deductionBPJSPensiun,
        rec.items.deductionSetting,
        rec.items.deductionAdvance,
        rec.items.deductionLate,
        rec.items.deductionAbsence,
        rec.items.deductionKasbon,
        calc.totalDeductions,
        calc.takeHomePay,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Upah_Excel_${selectedPeriod.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Controls Bar with CRUD Action */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
            XLS
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <span>LAPORAN UPAH & SLIP GAJI (EXCEL MATRIX VIEW)</span>
            </h2>
            <p className="text-[11px] text-gray-500">
              Format kolom persis 1:1 lembar Excel "2025 - Slip Gaji.xls" dengan fitur Tambah, Edit, Hapus (CRUD) data baris penggajian.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Period selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="font-semibold text-gray-600">Periode:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-2 py-1 text-xs font-semibold bg-gray-50 border border-gray-300 rounded"
            >
              <option value="all">Semua Periode</option>
              {periods.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Company selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="font-semibold text-gray-600">PT:</span>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="px-2 py-1 text-xs bg-gray-50 border border-gray-300 rounded"
            >
              <option value="all">Semua Entitas PT</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code || c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari karyawan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-2.5 py-1 text-xs border border-gray-300 rounded w-36"
            />
          </div>

          {/* CREATE / TAMBAH DATA BARIS GAJI */}
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Data Gaji
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-gray-600" />
            Export XLS/CSV
          </button>
        </div>
      </div>

      {/* Excel Sheet Simulator Canvas */}
      <div className="bg-white border-2 border-black rounded-lg shadow-md overflow-hidden font-sans">
        {/* Row 0 Header Bar */}
        <div className="bg-white px-3 py-2 border-b-2 border-black text-[10px] leading-tight font-bold text-gray-800 tracking-tight flex flex-wrap gap-x-4 gap-y-1">
          <div className="text-black font-extrabold text-xs pr-4 border-r border-black flex items-center">
            SLIP GAJI
          </div>
          <div className="flex flex-wrap gap-x-3 items-center">
            {companyNamesHeader.map((name, i) => (
              <span key={i} className="text-black font-bold">
                {name} {i < companyNamesHeader.length - 1 && '•'}
              </span>
            ))}
          </div>
        </div>

        {/* Scrollable Spreadsheet Table */}
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full text-left text-[10.5px] border-collapse whitespace-nowrap select-text">
            {/* Numbered Sub-header Row (1, 2, 3... 29) */}
            <thead>
              <tr className="bg-white text-gray-500 text-[9px] text-center border-b border-gray-400">
                <th className="border-r border-gray-400 px-1 py-0.5"></th>
                <th className="border-r border-gray-400 px-1 py-0.5">1</th>
                <th className="border-r border-gray-400 px-1 py-0.5">2</th>
                <th className="border-r border-gray-400 px-1 py-0.5">3</th>
                <th className="border-r border-gray-400 px-1 py-0.5">4</th>
                <th className="border-r border-gray-400 px-1 py-0.5">5</th>
                <th className="border-r border-gray-400 px-1 py-0.5">6</th>
                <th className="border-r border-gray-400 px-1 py-0.5">7</th>
                <th className="border-r border-gray-400 px-1 py-0.5">8</th>
                <th className="border-r border-gray-400 px-1 py-0.5">9</th>
                <th className="border-r border-gray-400 px-1 py-0.5">10</th>
                <th className="border-r border-gray-400 px-1 py-0.5">11</th>
                <th className="border-r border-gray-400 px-1 py-0.5">12</th>
                <th className="border-r border-gray-400 px-1 py-0.5">13</th>
                <th className="border-r border-gray-400 px-1 py-0.5">14</th>
                <th className="border-r border-gray-400 px-1 py-0.5">15</th>
                <th className="border-r border-gray-400 px-1 py-0.5">16</th>
                <th className="border-r border-gray-400 px-1 py-0.5">17</th>
                <th className="border-r border-gray-400 px-1 py-0.5 bg-[#FDE2CA] text-black font-bold">18</th>
                <th className="border-r border-gray-400 px-1 py-0.5">19</th>
                <th className="border-r border-gray-400 px-1 py-0.5">20</th>
                <th className="border-r border-gray-400 px-1 py-0.5">21</th>
                <th className="border-r border-gray-400 px-1 py-0.5">22</th>
                <th className="border-r border-gray-400 px-1 py-0.5">23</th>
                <th className="border-r border-gray-400 px-1 py-0.5">24</th>
                <th className="border-r border-gray-400 px-1 py-0.5">25</th>
                <th className="border-r border-gray-400 px-1 py-0.5">26</th>
                <th className="border-r border-gray-400 px-1 py-0.5">27</th>
                <th className="border-r border-gray-400 px-1 py-0.5 bg-[#CCECF4] text-black font-bold">28</th>
                <th className="border-r border-gray-400 px-1 py-0.5">29</th>
                <th className="px-2 py-0.5 text-center font-bold text-gray-700">Aksi (CRUD)</th>
              </tr>

              {/* Excel Main Headers Row 1 */}
              <tr className="bg-white text-black font-extrabold text-[10px] uppercase border-b border-black">
                <th rowSpan={2} className="border-r border-black px-2 py-1 text-center bg-gray-100">
                  No.
                </th>
                <th rowSpan={2} className="border-r border-black px-3 py-1 min-w-[170px]">
                  NAMA
                </th>
                <th rowSpan={2} className="border-r border-black px-3 py-1 min-w-[190px]">
                  NAMA PT
                </th>
                <th rowSpan={2} className="border-r border-black px-2 py-1 min-w-[90px]">
                  BULAN
                </th>
                <th rowSpan={2} className="border-r border-black px-2.5 py-1 min-w-[120px]">
                  JABATAN
                </th>
                <th rowSpan={2} className="border-r border-black px-1.5 py-1 text-center">
                  STATUS TK
                </th>
                <th rowSpan={2} className="border-r border-black px-1.5 py-1 text-center">
                  PTKP
                </th>
                <th rowSpan={2} className="border-r border-black px-1 py-1 text-center">
                  L/P
                </th>
                <th colSpan={2} className="border-r border-black px-2 py-0.5 text-center bg-gray-50">
                  MASA KERJA
                </th>
                <th rowSpan={2} className="border-r border-black px-3 py-1 text-right min-w-[95px]">
                  GAJI POKOK
                </th>
                <th rowSpan={2} className="border-r border-black px-2 py-1 text-right">
                  PAJAK
                </th>
                <th colSpan={4} className="border-r border-black px-2 py-0.5 text-center bg-gray-50">
                  TUNJANGAN
                </th>
                <th rowSpan={2} className="border-r border-black px-2 py-1 text-right">
                  Lembur
                </th>
                <th rowSpan={2} className="border-r border-black px-2 py-1 text-right">
                  Insentive
                </th>
                <th rowSpan={2} className="border-r border-black px-2 py-1 text-right">
                  Lain - Lain
                </th>
                {/* Total Penerimaan: Column 18 with Orange/Peach Highlight */}
                <th
                  rowSpan={2}
                  className="border-r border-black px-3 py-1 text-right bg-[#FDE2CA] text-black font-extrabold min-w-[110px]"
                >
                  Total
                </th>
                <th colSpan={3} className="border-r border-black px-2 py-0.5 text-center bg-gray-50">
                  JAMSOSTEK / BPJS
                </th>
                <th rowSpan={2} className="border-r border-black px-2 py-1 text-right">
                  PENGATURAN GAJI
                </th>
                <th rowSpan={2} className="border-r border-black px-2 py-1 text-right">
                  UANG DIBAYAR DIMUKA
                </th>
                <th rowSpan={2} className="border-r border-black px-2 py-1 text-right">
                  TELAT
                </th>
                <th rowSpan={2} className="border-r border-black px-2 py-1 text-right">
                  MANGKIR
                </th>
                <th rowSpan={2} className="border-r border-black px-2 py-1 text-right">
                  POT. PRIBADI / Kasbon
                </th>
                <th rowSpan={2} className="border-r border-black px-3 py-1 text-right bg-rose-50 text-black font-bold">
                  Total
                </th>
                {/* Take Home Pay: Column 28 with Cyan/Soft Blue Highlight */}
                <th
                  rowSpan={2}
                  className="border-r border-black px-3 py-1 text-right bg-[#CCECF4] text-black font-extrabold min-w-[110px]"
                >
                  Take Home Pay
                </th>
                <th rowSpan={2} className="border-r border-black px-2 py-1 text-right">
                  PEMBULATAN
                </th>
                <th rowSpan={2} className="px-3 py-1 text-center bg-gray-100 font-bold min-w-[100px]">
                  AKSI
                </th>
              </tr>

              {/* Sub-row for grouped headers */}
              <tr className="bg-white text-black text-[9.5px] border-b-2 border-black">
                <th className="border-r border-black px-1.5 py-0.5 text-center">AWAL</th>
                <th className="border-r border-black px-1.5 py-0.5 text-center">AKHIR</th>
                <th className="border-r border-black px-2 py-0.5 text-right">Jabatan</th>
                <th className="border-r border-black px-2 py-0.5 text-right">Makan</th>
                <th className="border-r border-black px-2 py-0.5 text-right">Transp.</th>
                <th className="border-r border-black px-2 py-0.5 text-right">Pulsa</th>
                <th className="border-r border-black px-2 py-0.5 text-right">JHT = 2%</th>
                <th className="border-r border-black px-2 py-0.5 text-right">BPJS 1%</th>
                <th className="border-r border-black px-2 py-0.5 text-right">BPJSTK Pensiun</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-300 font-mono text-[10px]">
              <tr className="bg-white font-sans font-black text-black text-xs border-y-2 border-black">
                <td colSpan={31} className="py-1 px-3 bg-gray-100 uppercase tracking-wider">
                  KARYAWAN TETAP
                </td>
              </tr>

              {filteredRecords.map((rec, index) => {
                const emp = getEmployee(rec.employeeId);
                const comp = getCompany(rec.companyId);
                const calc = calculateSalary(rec.items);

                return (
                  <tr key={rec.id} className="hover:bg-amber-50/40 transition-colors">
                    {/* Column 0: No */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-center font-bold text-black bg-gray-50/40 font-mono">
                      {emp?.employeeNo || index + 1}
                    </td>

                    {/* Column 1: NAMA */}
                    <td className="border-r border-gray-300 px-3 py-1.5 font-sans font-extrabold text-black">
                      {emp?.name}
                    </td>

                    {/* Column 2: NAMA PT */}
                    <td className="border-r border-gray-300 px-3 py-1.5 font-sans font-bold text-gray-900">
                      {comp?.name}
                    </td>

                    {/* Column 3: BULAN */}
                    <td className="border-r border-gray-300 px-2 py-1.5 font-sans text-gray-700">
                      {rec.period}
                    </td>

                    {/* Column 4: JABATAN */}
                    <td className="border-r border-gray-300 px-2.5 py-1.5 font-sans text-gray-800">
                      {emp?.position}
                    </td>

                    {/* Column 5: STATUS TK */}
                    <td className="border-r border-gray-300 px-1.5 py-1.5 text-center font-sans text-gray-500 text-[9px]">
                      {emp?.status === 'KARYAWAN TETAP' ? 'TETAP' : 'KONTRAK'}
                    </td>

                    {/* Column 6: PTKP */}
                    <td className="border-r border-gray-300 px-1.5 py-1.5 text-center font-sans font-bold text-gray-700">
                      {emp?.ptkpStatus || 'TK/0'}
                    </td>

                    {/* Column 7: L/P */}
                    <td className="border-r border-gray-300 px-1 py-1.5 text-center font-sans text-gray-700">
                      {emp?.gender || 'L'}
                    </td>

                    {/* Column 8: MASA KERJA AWAL */}
                    <td className="border-r border-gray-300 px-1.5 py-1.5 text-center text-gray-400">
                      -
                    </td>

                    {/* Column 9: MASA KERJA AKHIR */}
                    <td className="border-r border-gray-300 px-1.5 py-1.5 text-center text-gray-400">
                      -
                    </td>

                    {/* Column 10: GAJI POKOK */}
                    <td className="border-r border-gray-300 px-3 py-1.5 text-right font-extrabold text-black">
                      {formatRupiah(rec.items.baseSalary)}
                    </td>

                    {/* Column 11: PAJAK */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-400">
                      -
                    </td>

                    {/* Column 12: Tunjangan Jabatan */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-700">
                      {formatRupiah(rec.items.allowanceJob)}
                    </td>

                    {/* Column 13: Tunjangan Makan */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-700">
                      {formatRupiah(rec.items.allowanceMeal)}
                    </td>

                    {/* Column 14: Tunjangan Transp. */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-700">
                      {formatRupiah(rec.items.allowanceTransport)}
                    </td>

                    {/* Column 15: Tunjangan Pulsa */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-700">
                      {formatRupiah(rec.items.allowancePulse)}
                    </td>

                    {/* Column 16: Lembur */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-700">
                      {formatRupiah(rec.items.overtime)}
                    </td>

                    {/* Column 17: Insentive */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-700">
                      {formatRupiah(rec.items.incentive)}
                    </td>

                    {/* Column 18: Lain - Lain */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-700">
                      {formatRupiah(rec.items.otherIncome)}
                    </td>

                    {/* Column 19: Total Penerimaan (Orange Highlight) */}
                    <td className="border-r border-black px-3 py-1.5 text-right font-black text-black bg-[#FDE2CA]">
                      {formatRupiahDecimal(calc.totalEarnings)}
                    </td>

                    {/* Column 20: Jamsostek JHT 2% */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-800">
                      {formatRupiah(rec.items.deductionBPJSJHT)}
                    </td>

                    {/* Column 21: BPJS 1% */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-800">
                      {formatRupiahDecimal(rec.items.deductionBPJSKesehatan)}
                    </td>

                    {/* Column 22: BPJSTK Pensiun */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-800">
                      {formatRupiahDecimal(rec.items.deductionBPJSPensiun)}
                    </td>

                    {/* Column 23: PENGATURAN GAJI */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-700">
                      {formatRupiah(rec.items.deductionSetting)}
                    </td>

                    {/* Column 24: UANG DIBAYAR DIMUKA */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-700">
                      {formatRupiah(rec.items.deductionAdvance)}
                    </td>

                    {/* Column 25: TELAT */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-700">
                      {formatRupiah(rec.items.deductionLate)}
                    </td>

                    {/* Column 26: MANGKIR */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-700">
                      {formatRupiah(rec.items.deductionAbsence)}
                    </td>

                    {/* Column 27: POT. PRIBADI / Kasbon */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-700">
                      {formatRupiah(rec.items.deductionKasbon)}
                    </td>

                    {/* Column 28: Total Potongan */}
                    <td className="border-r border-black px-3 py-1.5 text-right font-bold text-black bg-rose-50/70">
                      {formatRupiahDecimal(calc.totalDeductions)}
                    </td>

                    {/* Column 29: Take Home Pay (Cyan Highlight) */}
                    <td className="border-r border-black px-3 py-1.5 text-right font-black text-black bg-[#CCECF4]">
                      {formatRupiahDecimal(calc.takeHomePay)}
                    </td>

                    {/* Column 30: Pembulatan */}
                    <td className="border-r border-gray-300 px-2 py-1.5 text-right text-gray-500">
                      {formatRupiah(rec.items.rounding)}
                    </td>

                    {/* Column 31: AKSI (CRUD: SLIP, EDIT, DELETE) */}
                    <td className="px-2 py-1 text-center font-sans">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onPreviewRecord(rec)}
                          className="px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 cursor-pointer"
                          title="Lihat Slip Gaji"
                        >
                          Slip
                        </button>
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                          title="Edit Baris Gaji Ini"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(rec)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Hapus Baris Gaji Ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Total Footer Row */}
            <tfoot className="bg-white border-t-2 border-black font-extrabold text-[10.5px]">
              <tr className="border-b border-black">
                <td colSpan={10} className="py-2.5 px-3 text-right font-sans uppercase tracking-wider text-black bg-gray-100">
                  TOTAL KESELURUHAN ({filteredRecords.length} DATA KARYAWAN):
                </td>
                <td className="border-r border-black px-3 py-2 text-right text-black font-mono">
                  {formatRupiah(totals.baseSalary)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-gray-400">-</td>
                <td className="border-r border-black px-2 py-2 text-right text-black font-mono">
                  {formatRupiah(totals.allowanceJob)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-black font-mono">
                  {formatRupiah(totals.allowanceMeal)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-black font-mono">
                  {formatRupiah(totals.allowanceTransport)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-black font-mono">
                  {formatRupiah(totals.allowancePulse)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-black font-mono">
                  {formatRupiah(totals.overtime)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-black font-mono">
                  {formatRupiah(totals.incentive)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-black font-mono">
                  {formatRupiah(totals.otherIncome)}
                </td>
                {/* Total Column 19 (Orange Highlight) */}
                <td className="border-r border-black px-3 py-2 text-right text-black font-mono font-black bg-[#FDE2CA] text-xs">
                  {formatRupiahDecimal(totals.totalEarnings)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-black font-mono">
                  {formatRupiah(totals.bpjsJHT)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-black font-mono">
                  {formatRupiahDecimal(totals.bpjsKes)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-black font-mono">
                  {formatRupiahDecimal(totals.bpjsPensiun)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-black font-mono">
                  {formatRupiah(totals.setting)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-black font-mono">
                  {formatRupiah(totals.advance)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-black font-mono">
                  {formatRupiah(totals.late)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-black font-mono">
                  {formatRupiah(totals.absence)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-black font-mono">
                  {formatRupiah(totals.kasbon)}
                </td>
                <td className="border-r border-black px-3 py-2 text-right text-black font-mono font-bold bg-rose-50">
                  {formatRupiahDecimal(totals.totalDeductions)}
                </td>
                {/* Take Home Pay Column 29 (Cyan Highlight) */}
                <td className="border-r border-black px-3 py-2 text-right text-black font-mono font-black bg-[#CCECF4] text-xs">
                  {formatRupiahDecimal(totals.thp)}
                </td>
                <td className="border-r border-black px-2 py-2 text-right text-gray-500 font-mono">-</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* CRUD MODAL: TAMBAH / EDIT BARIS LAPORAN UPAH */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingRecord ? 'Edit Baris Data Laporan Upah' : 'Tambah Baris Data Laporan Upah'}
                </h3>
                <p className="text-xs text-gray-500">
                  Perubahan akan langsung mengkalkulasi Total Penerimaan, Potongan, dan Take Home Pay pada tabel matriks.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Context Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Pilih Karyawan *
                  </label>
                  <select
                    value={formEmployeeId}
                    onChange={(e) => handleEmployeeSelect(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        #{emp.employeeNo} — {emp.name} ({emp.position})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Entitas Perusahaan *
                  </label>
                  <select
                    value={formCompanyId}
                    onChange={(e) => setFormCompanyId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Periode *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Contoh: Oktober 2025"
                  />
                </div>
              </div>

              {/* Komponen Upah & Komponen Potongan In 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Penerimaan */}
                <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80 space-y-2.5">
                  <div className="text-xs font-extrabold text-emerald-900 uppercase flex items-center justify-between">
                    <span>Komponen Upah</span>
                    <span className="text-emerald-700 font-mono text-[11px]">
                      Rp {formatRupiahDecimal(modalCalc.totalEarnings)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                      Gaji Pokok
                    </label>
                    <input
                      type="text"
                      value={formItems.baseSalary ? formItems.baseSalary.toLocaleString('id-ID') : ''}
                      onChange={(e) => handleFormItemChange('baseSalary', e.target.value)}
                      className="w-full px-2.5 py-1 text-xs font-mono font-bold bg-white border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-600">Tun. Jabatan</label>
                      <input
                        type="text"
                        value={formItems.allowanceJob ? formItems.allowanceJob.toLocaleString('id-ID') : ''}
                        onChange={(e) => handleFormItemChange('allowanceJob', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-600">Tun. Makan</label>
                      <input
                        type="text"
                        value={formItems.allowanceMeal ? formItems.allowanceMeal.toLocaleString('id-ID') : ''}
                        onChange={(e) => handleFormItemChange('allowanceMeal', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-600">Tun. Transp.</label>
                      <input
                        type="text"
                        value={formItems.allowanceTransport ? formItems.allowanceTransport.toLocaleString('id-ID') : ''}
                        onChange={(e) => handleFormItemChange('allowanceTransport', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-600">Tun. Pulsa</label>
                      <input
                        type="text"
                        value={formItems.allowancePulse ? formItems.allowancePulse.toLocaleString('id-ID') : ''}
                        onChange={(e) => handleFormItemChange('allowancePulse', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-600">Lembur</label>
                      <input
                        type="text"
                        value={formItems.overtime ? formItems.overtime.toLocaleString('id-ID') : ''}
                        onChange={(e) => handleFormItemChange('overtime', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-600">Insentive</label>
                      <input
                        type="text"
                        value={formItems.incentive ? formItems.incentive.toLocaleString('id-ID') : ''}
                        onChange={(e) => handleFormItemChange('incentive', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-600">Lain - Lain / Operasional</label>
                    <input
                      type="text"
                      value={formItems.otherIncome ? formItems.otherIncome.toLocaleString('id-ID') : ''}
                      onChange={(e) => handleFormItemChange('otherIncome', e.target.value)}
                      className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Potongan */}
                <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-200/80 space-y-2.5">
                  <div className="text-xs font-extrabold text-rose-900 uppercase flex items-center justify-between">
                    <span>Komponen Potongan</span>
                    <button
                      type="button"
                      onClick={handleAutoCalcBPJS}
                      className="text-[9px] font-bold text-rose-700 bg-white border border-rose-300 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Hitung BPJS
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="block text-[10px] text-gray-600">JHT 2%</label>
                      <input
                        type="text"
                        value={formItems.deductionBPJSJHT ? formItems.deductionBPJSJHT.toLocaleString('id-ID') : ''}
                        onChange={(e) => handleFormItemChange('deductionBPJSJHT', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-600">BPJS 1%</label>
                      <input
                        type="text"
                        value={formItems.deductionBPJSKesehatan ? formItems.deductionBPJSKesehatan.toString() : ''}
                        onChange={(e) => handleFormItemChange('deductionBPJSKesehatan', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-600">Pensiun 1%</label>
                      <input
                        type="text"
                        value={formItems.deductionBPJSPensiun ? formItems.deductionBPJSPensiun.toString() : ''}
                        onChange={(e) => handleFormItemChange('deductionBPJSPensiun', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-600">Pengaturan Gaji</label>
                      <input
                        type="text"
                        value={formItems.deductionSetting ? formItems.deductionSetting.toLocaleString('id-ID') : ''}
                        onChange={(e) => handleFormItemChange('deductionSetting', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-600">Uang Dimuka</label>
                      <input
                        type="text"
                        value={formItems.deductionAdvance ? formItems.deductionAdvance.toLocaleString('id-ID') : ''}
                        onChange={(e) => handleFormItemChange('deductionAdvance', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="block text-[10px] text-gray-600">Telat</label>
                      <input
                        type="text"
                        value={formItems.deductionLate ? formItems.deductionLate.toLocaleString('id-ID') : ''}
                        onChange={(e) => handleFormItemChange('deductionLate', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-600">Mangkir</label>
                      <input
                        type="text"
                        value={formItems.deductionAbsence ? formItems.deductionAbsence.toLocaleString('id-ID') : ''}
                        onChange={(e) => handleFormItemChange('deductionAbsence', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-600">Kasbon</label>
                      <input
                        type="text"
                        value={formItems.deductionKasbon ? formItems.deductionKasbon.toLocaleString('id-ID') : ''}
                        onChange={(e) => handleFormItemChange('deductionKasbon', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex justify-between text-xs font-bold text-rose-800">
                    <span>Total Potongan:</span>
                    <span className="font-mono">Rp {formatRupiahDecimal(modalCalc.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Summary Preview in Modal */}
              <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-gray-400 block text-[10px]">TOTAL PENERIMAAN</span>
                  <span className="text-emerald-400 font-bold">Rp {formatRupiahDecimal(modalCalc.totalEarnings)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">TOTAL POTONGAN</span>
                  <span className="text-rose-400 font-bold">Rp {formatRupiahDecimal(modalCalc.totalDeductions)}</span>
                </div>
                <div className="bg-[#CCECF4] text-black px-3 py-1.5 rounded-lg text-right">
                  <span className="block text-[9px] font-extrabold uppercase text-slate-800">TAKE HOME PAY</span>
                  <span className="font-black text-sm">Rp {formatRupiahDecimal(modalCalc.takeHomePay)}</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingRecord ? 'Simpan Perubahan' : 'Tambahkan ke Laporan Upah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

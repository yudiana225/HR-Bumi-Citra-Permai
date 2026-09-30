import React, { useState } from 'react';
import { Employee, SalaryRecord, SalaryItemDetail } from '../types';
import { calculateSalary, formatRupiah, parseNumber } from '../utils/salaryCalculator';
import { Calculator, Save, Eye, RefreshCw, Sparkles, Building, Calendar, AlertCircle } from 'lucide-react';

interface SalaryEditorProps {
  employees: Employee[];
  salaryRecords: SalaryRecord[];
  onSaveSalaryRecord: (record: SalaryRecord) => void;
  onPreviewRecord: (record: SalaryRecord) => void;
}

export const SalaryEditor: React.FC<SalaryEditorProps> = ({
  employees,
  salaryRecords,
  onSaveSalaryRecord,
  onPreviewRecord,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [period, setPeriod] = useState<string>('AGUSTUS 2026');
  const [companyName, setCompanyName] = useState<string>('PT. BUMI CITRA PERMAI');

  // Check if existing record exists for this employee & period
  const existingRecord = salaryRecords.find(
    (r) => r.employeeId === selectedEmpId && r.period.toUpperCase() === period.toUpperCase()
  );

  const initialItems: SalaryItemDetail = existingRecord?.items || {
    baseSalary: 6000000,
    allowanceJob: 0,
    allowanceMeal: 440000,
    allowanceTransport: 440000,
    allowancePulse: 0,
    overtime: 0,
    operational: 0,
    bonusTHR: 0,
    pph21Allowance: 0,

    deductionBPJSJHT: 114598,
    deductionBPJSPensiun: 0,
    deductionBPJSKesehatan: 57298,
    deductionKasbon: 0,
    deductionSetting: 0,
    deductionAdvance: 0,
    deductionLateAbsence: 0,
    deductionCompanyTax: 0,

    cashAllowance: 0,
  };

  const [items, setItems] = useState<SalaryItemDetail>(initialItems);
  const [notes, setNotes] = useState<string>(existingRecord?.notes || '');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // When changing employee or period, load their data
  const handleEmployeeChange = (empId: string) => {
    setSelectedEmpId(empId);
    const rec = salaryRecords.find(
      (r) => r.employeeId === empId && r.period.toUpperCase() === period.toUpperCase()
    );
    if (rec) {
      setItems(rec.items);
      setNotes(rec.notes || '');
      setCompanyName(rec.companyName || 'PT. BUMI CITRA PERMAI');
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    const rec = salaryRecords.find(
      (r) => r.employeeId === selectedEmpId && r.period.toUpperCase() === newPeriod.toUpperCase()
    );
    if (rec) {
      setItems(rec.items);
      setNotes(rec.notes || '');
      setCompanyName(rec.companyName || 'PT. BUMI CITRA PERMAI');
    }
  };

  const handleItemChange = (field: keyof SalaryItemDetail, val: string) => {
    const num = parseNumber(val);
    setItems((prev) => ({
      ...prev,
      [field]: num,
    }));
  };

  // Auto-calculation of BPJS helper (optional convenience for HR)
  const handleAutoCalcBPJS = () => {
    // BPJS JHT employee: ~2% (or customary deduction like 114.598 on ~5.7M ceiling)
    const base = items.baseSalary || 0;
    const jht = Math.round(base * 0.02);
    const pensiun = Math.round(base * 0.01);
    const kes = Math.round(base * 0.01);

    setItems((prev) => ({
      ...prev,
      deductionBPJSJHT: jht,
      deductionBPJSPensiun: pensiun,
      deductionBPJSKesehatan: kes,
    }));
  };

  const currentEmp = employees.find((e) => e.id === selectedEmpId);
  const calculated = calculateSalary(items);

  const handleSave = () => {
    if (!currentEmp) return;

    const recordToSave: SalaryRecord = {
      id: existingRecord?.id || `sal-${Date.now()}`,
      employeeId: currentEmp.id,
      period: period.toUpperCase(),
      companyName,
      items,
      notes,
      sentStatus: existingRecord?.sentStatus || 'unsent',
      createdAt: existingRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveSalaryRecord(recordToSave);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handlePreview = () => {
    if (!currentEmp) return;
    const currentRecord: SalaryRecord = {
      id: existingRecord?.id || `sal-${Date.now()}`,
      employeeId: currentEmp.id,
      period: period.toUpperCase(),
      companyName,
      items,
      notes,
      sentStatus: existingRecord?.sentStatus || 'unsent',
      createdAt: existingRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onPreviewRecord(currentRecord);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Context */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
              Pilih Karyawan
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.position}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
              Periode Penggajian
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              placeholder="Contoh: AGUSTUS 2026"
              className="w-full px-3 py-1.5 text-xs font-semibold uppercase bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
              Nama Perusahaan
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="PT. BUMI CITRA PERMAI"
              className="w-full px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handlePreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-xs cursor-pointer"
          >
            <Eye className="w-4 h-4 text-gray-600" />
            Pratinjau Slip
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Parameter
          </button>
        </div>
      </div>

      {saveSuccessNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between animate-in fade-in">
          <span>✓ Parameter gaji berhasil disimpan dan siap digenerate ke PDF / dikirim via Gmail.</span>
          <span className="text-[10px] text-emerald-600">Otomatis tersimpan</span>
        </div>
      )}

      {/* Main Form: Komponen Upah vs Komponen Potongan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Komponen Penerimaan / Upah */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 py-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Komponen Upah (Penerimaan)
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700">
              Total: {formatRupiah(calculated.totalEarnings)}
            </span>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Gaji Pokok (Rp)
              </label>
              <input
                type="text"
                value={items.baseSalary ? items.baseSalary.toLocaleString('id-ID') : ''}
                onChange={(e) => handleItemChange('baseSalary', e.target.value)}
                placeholder="6.000.000"
                className="w-full px-3 py-1.5 text-xs font-mono font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="p-3 bg-gray-50/70 rounded-lg border border-gray-200/80 space-y-2.5">
              <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                Tunjangan Tetap / Rutin
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-gray-600 mb-0.5">Tunjangan Jabatan</label>
                  <input
                    type="text"
                    value={items.allowanceJob ? items.allowanceJob.toLocaleString('id-ID') : ''}
                    onChange={(e) => handleItemChange('allowanceJob', e.target.value)}
                    placeholder="0 / -"
                    className="w-full px-2.5 py-1 text-xs font-mono border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-0.5">Uang Makan</label>
                  <input
                    type="text"
                    value={items.allowanceMeal ? items.allowanceMeal.toLocaleString('id-ID') : ''}
                    onChange={(e) => handleItemChange('allowanceMeal', e.target.value)}
                    placeholder="440.000"
                    className="w-full px-2.5 py-1 text-xs font-mono border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-0.5">Uang Transport</label>
                  <input
                    type="text"
                    value={items.allowanceTransport ? items.allowanceTransport.toLocaleString('id-ID') : ''}
                    onChange={(e) => handleItemChange('allowanceTransport', e.target.value)}
                    placeholder="440.000"
                    className="w-full px-2.5 py-1 text-xs font-mono border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-0.5">Pulsa / Komunikasi</label>
                  <input
                    type="text"
                    value={items.allowancePulse ? items.allowancePulse.toLocaleString('id-ID') : ''}
                    onChange={(e) => handleItemChange('allowancePulse', e.target.value)}
                    placeholder="0 / -"
                    className="w-full px-2.5 py-1 text-xs font-mono border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Uang Lembur (Rp)
                </label>
                <input
                  type="text"
                  value={items.overtime ? items.overtime.toLocaleString('id-ID') : ''}
                  onChange={(e) => handleItemChange('overtime', e.target.value)}
                  placeholder="0 / -"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Operasional (Rp)
                </label>
                <input
                  type="text"
                  value={items.operational ? items.operational.toLocaleString('id-ID') : ''}
                  onChange={(e) => handleItemChange('operational', e.target.value)}
                  placeholder="0 / -"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  THR / Bonus (Rp)
                </label>
                <input
                  type="text"
                  value={items.bonusTHR ? items.bonusTHR.toLocaleString('id-ID') : ''}
                  onChange={(e) => handleItemChange('bonusTHR', e.target.value)}
                  placeholder="0 / -"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  PPh21 Tunjangan (Rp)
                </label>
                <input
                  type="text"
                  value={items.pph21Allowance ? items.pph21Allowance.toLocaleString('id-ID') : ''}
                  onChange={(e) => handleItemChange('pph21Allowance', e.target.value)}
                  placeholder="0 / -"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-gray-900">
              <span>TOTAL PENERIMAAN:</span>
              <span className="font-mono text-sm text-emerald-700">Rp {formatRupiah(calculated.totalEarnings)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Komponen Potongan */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="bg-rose-50/70 border-b border-rose-100 px-4 py-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              Komponen Potongan
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoCalcBPJS}
                className="text-[10px] font-semibold bg-white border border-rose-200 text-rose-700 px-2 py-0.5 rounded hover:bg-rose-50 cursor-pointer"
                title="Hitung otomatis standar BPJS dari Gaji Pokok"
              >
                Hitung Cepat BPJS
              </button>
              <span className="text-[11px] font-semibold text-rose-700">
                Total: {formatRupiah(calculated.totalDeductions)}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="p-3 bg-gray-50/70 rounded-lg border border-gray-200/80 space-y-2.5">
              <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                Potongan Jaminan Sosial (BPJS Karyawan)
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-600 mb-0.5">BPJS JHT</label>
                  <input
                    type="text"
                    value={items.deductionBPJSJHT ? items.deductionBPJSJHT.toLocaleString('id-ID') : ''}
                    onChange={(e) => handleItemChange('deductionBPJSJHT', e.target.value)}
                    placeholder="114.598"
                    className="w-full px-2 py-1 text-xs font-mono border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-0.5">BPJS Pensiun</label>
                  <input
                    type="text"
                    value={items.deductionBPJSPensiun ? items.deductionBPJSPensiun.toLocaleString('id-ID') : ''}
                    onChange={(e) => handleItemChange('deductionBPJSPensiun', e.target.value)}
                    placeholder="0 / -"
                    className="w-full px-2 py-1 text-xs font-mono border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-0.5">BPJS Kesehatan</label>
                  <input
                    type="text"
                    value={items.deductionBPJSKesehatan ? items.deductionBPJSKesehatan.toLocaleString('id-ID') : ''}
                    onChange={(e) => handleItemChange('deductionBPJSKesehatan', e.target.value)}
                    placeholder="57.298"
                    className="w-full px-2 py-1 text-xs font-mono border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kasbon Kantor (Rp)
                </label>
                <input
                  type="text"
                  value={items.deductionKasbon ? items.deductionKasbon.toLocaleString('id-ID') : ''}
                  onChange={(e) => handleItemChange('deductionKasbon', e.target.value)}
                  placeholder="0 / -"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pengaturan Gaji (Rp)
                </label>
                <input
                  type="text"
                  value={items.deductionSetting ? items.deductionSetting.toLocaleString('id-ID') : ''}
                  onChange={(e) => handleItemChange('deductionSetting', e.target.value)}
                  placeholder="0 / -"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Upah Dibayar Dimuka (Rp)
                </label>
                <input
                  type="text"
                  value={items.deductionAdvance ? items.deductionAdvance.toLocaleString('id-ID') : ''}
                  onChange={(e) => handleItemChange('deductionAdvance', e.target.value)}
                  placeholder="0 / -"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Telat / Mangkir / Alfa (Rp)
                </label>
                <input
                  type="text"
                  value={items.deductionLateAbsence ? items.deductionLateAbsence.toLocaleString('id-ID') : ''}
                  onChange={(e) => handleItemChange('deductionLateAbsence', e.target.value)}
                  placeholder="0 / -"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pajak Ditanggung Perusahaan / PPh21 (Rp)
              </label>
              <input
                type="text"
                value={items.deductionCompanyTax ? items.deductionCompanyTax.toLocaleString('id-ID') : ''}
                onChange={(e) => handleItemChange('deductionCompanyTax', e.target.value)}
                placeholder="0 / -"
                className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-lg"
              />
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-gray-900">
              <span>TOTAL POTONGAN:</span>
              <span className="font-mono text-sm text-rose-700">Rp {formatRupiah(calculated.totalDeductions)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary & Grand Total calculation cards */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="border-r border-slate-800 pr-4">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Penerimaan</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              Rp {formatRupiah(calculated.totalEarnings)}
            </div>
          </div>

          <div className="border-r border-slate-800 pr-4">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Potongan</div>
            <div className="text-base font-bold text-rose-400 font-mono mt-0.5">
              Rp {formatRupiah(calculated.totalDeductions)}
            </div>
          </div>

          <div className="border-r border-slate-800 pr-4">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Take Home Pay (THP)</div>
            <div className="text-lg font-black text-amber-300 font-mono mt-0.5">
              Rp {formatRupiah(calculated.takeHomePay)}
            </div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex flex-col justify-center">
            <div className="flex justify-between items-center text-[11px] text-slate-300 mb-1">
              <span>Tunjangan Cash:</span>
              <input
                type="text"
                value={items.cashAllowance ? items.cashAllowance.toLocaleString('id-ID') : ''}
                onChange={(e) => handleItemChange('cashAllowance', e.target.value)}
                placeholder="0"
                className="w-24 px-1.5 py-0.5 text-xs text-right bg-slate-900 border border-slate-600 rounded text-amber-200 font-mono"
              />
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-700 font-bold">
              <span className="text-xs text-slate-200">GRAND TOTAL:</span>
              <span className="text-base text-emerald-300 font-mono">Rp {formatRupiah(calculated.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Employee, SalaryRecord } from '../types';
import { calculateSalary, formatRupiah } from '../utils/salaryCalculator';
import { ShieldAlert, Download, Printer } from 'lucide-react';
import { generateSalarySlipPdfBlob } from '../services/gmailSender';

interface SlipGajiDocumentProps {
  record: SalaryRecord;
  employee: Employee;
  showActions?: boolean;
}

export const SlipGajiDocument: React.FC<SlipGajiDocumentProps> = ({
  record,
  employee,
  showActions = true,
}) => {
  const { items } = record;
  const calc = calculateSalary(items);

  const handleDownloadPdf = () => {
    const { doc } = generateSalarySlipPdfBlob(record, employee);
    const filename = `Slip_Gaji_${record.companyName.replace(/\s+/g, '_')}_${employee.name.replace(/\s+/g, '_')}_${record.period.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {showActions && (
        <div className="w-full max-w-4xl flex items-center justify-between mb-3 px-2 print:hidden">
          <div className="text-xs text-gray-500 font-medium">
            Format Pratinjau Dokumen Resmi Standar PT. BUMI CITRA PERMAI
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded shadow-xs hover:bg-gray-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-gray-600" />
              Unduh PDF (Resmi)
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded shadow-xs hover:bg-gray-50 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              Cetak
            </button>
          </div>
        </div>
      )}

      {/* Slip Gaji Canvas Card - Exact Match to the image reference */}
      <div
        id="slip-gaji-preview-card"
        className="w-full max-w-4xl bg-white border-2 border-black p-6 md:p-8 text-black shadow-md font-sans text-xs md:text-sm select-text"
        style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          {/* Header Left */}
          <div>
            <div className="font-bold tracking-tight text-xs text-gray-900 uppercase">
              SLIP GAJI
            </div>
            <div className="font-bold text-sm md:text-base text-black tracking-tight">
              {record.companyName || 'PT. BUMI CITRA PERMAI'}
            </div>
            <div className="font-bold text-xs uppercase text-gray-900 border-b border-black pb-1.5 inline-block min-w-[280px]">
              {record.period}
            </div>

            {/* Employee metadata */}
            <div className="mt-2 text-xs font-bold border-b border-black pb-1 min-w-[280px]">
              <div className="grid grid-cols-[80px_10px_1fr] items-center">
                <span>NAMA</span>
                <span>:</span>
                <span className="font-normal uppercase">{employee.name}</span>
              </div>
              <div className="grid grid-cols-[80px_10px_1fr] items-center mt-1">
                <span>JABATAN</span>
                <span>:</span>
                <span className="font-normal uppercase">{employee.position}</span>
              </div>
            </div>
          </div>

          {/* Header Right: Confidential Box */}
          <div className="text-center pt-1">
            <div className="border border-black px-5 py-1.5 inline-block">
              <div className="text-red-600 font-bold text-xs tracking-wider">
                CONFIDENTIAL
              </div>
              <div className="text-red-600 font-bold text-xs tracking-wider">
                RAHASIA
              </div>
            </div>
            <div className="text-[10px] text-gray-800 font-medium mt-1 tracking-tight">
              TIDAK UNTUK DISEBARLUASKAN
            </div>
          </div>
        </div>

        {/* Section Table Bar */}
        <div className="bg-[#D3D3D3] text-black font-bold text-xs py-1 px-3 grid grid-cols-2 mt-4 tracking-wider">
          <div>K O M P O N E N   U P A H</div>
          <div className="pl-4">P O T O N G A N</div>
        </div>

        {/* Two Columns Grid for Component Lines */}
        <div className="grid grid-cols-2 gap-x-4 py-2 text-[11px] md:text-xs leading-relaxed">
          {/* Left Column: KOMPONEN UPAH */}
          <div className="space-y-1">
            <div className="flex justify-between items-center pr-2">
              <span className="font-semibold text-gray-900">GAJI POKOK</span>
              <div className="flex items-center gap-4">
                <span>:</span>
                <span className="w-24 text-right font-medium">{formatRupiah(items.baseSalary)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pr-2">
              <span className="font-semibold text-gray-900">TUNJANGAN TETAP</span>
              <div className="flex items-center gap-4">
                <span>:</span>
                <span className="w-24 text-right">-</span>
              </div>
            </div>

            <div className="flex justify-between items-center pr-2">
              <span className="pl-3 text-gray-800">Jabatan</span>
              <span className="w-24 text-right font-medium">{formatRupiah(items.allowanceJob)}</span>
            </div>

            <div className="flex justify-between items-center pr-2">
              <span className="pl-3 text-gray-800">Makan</span>
              <span className="w-24 text-right font-medium">{formatRupiah(items.allowanceMeal)}</span>
            </div>

            <div className="flex justify-between items-center pr-2">
              <span className="pl-3 text-gray-800">Transport</span>
              <span className="w-24 text-right font-medium">{formatRupiah(items.allowanceTransport)}</span>
            </div>

            <div className="flex justify-between items-center pr-2">
              <span className="pl-3 text-gray-800">Pulsa</span>
              <span className="w-24 text-right font-medium">{formatRupiah(items.allowancePulse)}</span>
            </div>

            <div className="flex justify-between items-center pr-2">
              <span className="font-semibold text-gray-900">LEMBUR</span>
              <div className="flex items-center gap-4">
                <span>:</span>
                <span className="w-24 text-right font-medium">{formatRupiah(items.overtime)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pr-2">
              <span className="font-semibold text-gray-900">OPERASIONAL</span>
              <div className="flex items-center gap-4">
                <span>:</span>
                <span className="w-24 text-right font-medium">{formatRupiah(items.operational)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pr-2">
              <span className="font-semibold text-gray-900">THR / BONUS</span>
              <div className="flex items-center gap-4">
                <span>:</span>
                <span className="w-24 text-right font-medium">{formatRupiah(items.bonusTHR)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pr-2">
              <span className="font-semibold text-gray-900">PPh21</span>
              <div className="flex items-center gap-4">
                <span>:</span>
                <span className="w-24 text-right font-medium">{formatRupiah(items.pph21Allowance)}</span>
              </div>
            </div>
          </div>

          {/* Right Column: POTONGAN */}
          <div className="space-y-1 pl-4 border-l border-transparent">
            <div className="flex justify-between items-center">
              <span className="text-gray-900">BPJS JHT</span>
              <div className="flex items-center gap-4">
                <span>:</span>
                <span className="w-24 text-right font-medium">{formatRupiah(items.deductionBPJSJHT)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-900">BPJS Pensiun</span>
              <div className="flex items-center gap-4">
                <span>:</span>
                <span className="w-24 text-right font-medium">{formatRupiah(items.deductionBPJSPensiun)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-900">BPJS Kesehatan</span>
              <div className="flex items-center gap-4">
                <span>:</span>
                <span className="w-24 text-right font-medium">{formatRupiah(items.deductionBPJSKesehatan)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-900">Kasbon Kantor</span>
              <div className="flex items-center gap-4">
                <span>:</span>
                <span className="w-24 text-right font-medium">{formatRupiah(items.deductionKasbon)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-900">Pengaturan Gaji</span>
              <div className="flex items-center gap-4">
                <span>:</span>
                <span className="w-24 text-right font-medium">{formatRupiah(items.deductionSetting)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-900">Upah dibayar dimuka</span>
              <div className="flex items-center gap-4">
                <span>:</span>
                <span className="w-24 text-right font-medium">{formatRupiah(items.deductionAdvance)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-900">Telat</span>
              <div className="flex items-center gap-4">
                <span>:</span>
                <span className="w-24 text-right font-medium">{formatRupiah(items.deductionLateAbsence)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-900">MANGKIR / ALFA</span>
              <div className="flex items-center gap-4">
                <span>:</span>
                <span className="w-24 text-right">-</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-900">Pajak ditanggung Perusahaan</span>
              <div className="flex items-center gap-4">
                <span>:</span>
                <span className="w-24 text-right font-medium">{formatRupiah(items.deductionCompanyTax)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center opacity-0 pointer-events-none">
              <span>Spacer</span>
              <span>-</span>
            </div>
          </div>
        </div>

        {/* Divider above summary */}
        <div className="border-t border-black my-2" />

        {/* Totals Section */}
        <div className="grid grid-cols-2 gap-x-4 text-xs font-bold py-1">
          <div className="flex justify-between items-center pr-2">
            <span>TOTAL PENERIMAAN</span>
            <div className="flex items-center gap-3">
              <span>Rp</span>
              <span className="w-24 text-right">{formatRupiah(calc.totalEarnings)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center pl-4">
            <span>TOTAL POTONGAN</span>
            <div className="flex items-center gap-3">
              <span>Rp</span>
              <span className="w-24 text-right">{formatRupiah(calc.totalDeductions)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-black my-1" />

        {/* Take Home Pay & Grand Total Calculation */}
        <div className="w-1/2 pt-1">
          <div className="flex justify-between items-center pr-2 font-bold text-xs py-0.5">
            <span>TAKE HOME PAY</span>
            <div className="flex items-center gap-3">
              <span>Rp</span>
              <span className="border border-black px-2 py-0.5 w-24 text-right font-bold">
                {formatRupiah(calc.takeHomePay)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pr-2 text-xs py-0.5">
            <span className="font-bold">TUNJANGAN CASH</span>
            <div className="flex items-center gap-3 font-medium">
              <span className="font-bold">Rp</span>
              <span className="w-24 text-right">{formatRupiah(items.cashAllowance)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#E5E7EB] px-2 py-1 mt-1 text-xs font-bold">
            <span className="tracking-wide">GRAND TOTAL</span>
            <div className="flex items-center gap-3">
              <span>Rp</span>
              <span className="border-b-2 border-black w-24 text-right pb-0.5">
                {formatRupiah(calc.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-[10px] text-gray-700 italic mt-6">
          Slip gaji ini tidak memerlukan tanda tangan dan stempel
        </div>
      </div>
    </div>
  );
};

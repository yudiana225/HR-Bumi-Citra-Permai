export interface Company {
  id: string;
  name: string;
  code?: string;
  address?: string;
}

export type EmployeeCategory = 
  | 'KARYAWAN TETAP' 
  | 'KARYAWAN KONTRAK' 
  | 'OUTSOURCING' 
  | 'PROBATION' 
  | 'HARIAN LEPAS'
  | 'DIREKSI & MANAGEMENT';

export interface Employee {
  id: string;
  employeeNo: number; // NO URUT (1, 2, 3, etc.)
  companyId: string; // Foreign key to Company
  name: string;
  position: string;
  department?: string;
  category: EmployeeCategory; // Kategori Karyawan
  email: string;
  bankAccount?: string;
  phone?: string;
  status: 'KARYAWAN TETAP' | 'KARYAWAN KONTRAK' | 'PROBATION' | 'HARIAN';
  ptkpStatus?: string; // TK/0, K/0, K/1, etc.
  gender?: 'L' | 'P';
  startDate?: string;
  endDate?: string;
  dob?: string;
}

export interface SalaryItemDetail {
  // Pendapatan (Earnings)
  baseSalary: number; // Gaji Pokok
  allowanceJob: number; // Tunjangan Tetap / Jabatan
  allowanceMeal: number; // Tunjangan Makan
  allowanceTransport: number; // Tunjangan Transport
  allowancePulse: number; // Tunjangan Pulsa
  overtime: number; // Lembur
  incentive: number; // Insentif
  operational: number; // Operasional
  bonusTHR: number; // THR / Bonus
  otherIncome: number; // Lain - Lain
  pph21Allowance: number; // PPh21 / Pajak (jika ditunjang)

  // Potongan (Deductions)
  deductionBPJSJHT: number; // JAMSOSTEK / JHT (2%)
  deductionBPJSKesehatan: number; // BPJS 1% (Kesehatan)
  deductionBPJSPensiun: number; // BPJSTK Pensiun (1%)
  deductionCompanyTax: number; // PPh21 / Pajak Ditanggung
  deductionKasbon: number; // Kasbon Kantor
  deductionSetting: number; // Pengaturan Gaji
  deductionAdvance: number; // Uang Dibayar Dimuka
  deductionLate: number; // Telat
  deductionAbsence: number; // Mangkir / Alfa
  deductionOther: number; // Pot. Pribadi / Lain-lain

  // Penyesuaian
  rounding: number; // Pembulatan
  cashAllowance: number; // Tunjangan Cash
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  companyId: string;
  period: string; // e.g. "Oktober 2025", "Agustus 2026", "Januari 2026"
  items: SalaryItemDetail;
  notes?: string;
  sentAt?: string;
  sentStatus?: 'unsent' | 'sending' | 'sent' | 'failed';
  sentError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalculatedSalary {
  totalEarnings: number;
  totalDeductions: number;
  takeHomePay: number; // Total Penerimaan - Total Potongan
  grandTotal: number; // THP + Pembulatan + Tunjangan Cash
}

export interface PayrollPeriod {
  id: string;
  name: string; // e.g. "Oktober 2025"
  month: number;
  year: number;
  isLocked: boolean;
}

export interface EmailLog {
  id: string;
  timestamp: string;
  recipientEmail: string;
  recipientName: string;
  companyName: string;
  period: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  messageId?: string;
}

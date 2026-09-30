export interface Employee {
  id: string;
  name: string;
  position: string;
  department?: string;
  email: string;
  bankAccount: string;
  phone?: string;
  joinDate?: string;
}

export interface SalaryItemDetail {
  baseSalary: number; // Gaji Pokok
  allowanceJob: number; // Tunjangan Jabatan / Tetap
  allowanceMeal: number; // Makan
  allowanceTransport: number; // Transport
  allowancePulse: number; // Pulsa
  overtime: number; // Lembur
  operational: number; // Operasional
  bonusTHR: number; // THR / Bonus
  pph21Allowance: number; // PPh21 (jika ditunjang)

  // Potongan
  deductionBPJSJHT: number; // BPJS JHT (misal ~114.598)
  deductionBPJSPensiun: number; // BPJS Pensiun
  deductionBPJSKesehatan: number; // BPJS Kesehatan (misal ~57.298)
  deductionKasbon: number; // Kasbon Kantor
  deductionSetting: number; // Pengaturan Gaji
  deductionAdvance: number; // Upah Dibayar Dimuka
  deductionLateAbsence: number; // Telat / Mangkir / Alfa
  deductionCompanyTax: number; // Pajak ditanggung Perusahaan / PPh21

  // Tunjangan Cash
  cashAllowance: number; // Tunjangan Cash
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  period: string; // e.g. "AGUSTUS 2026"
  companyName: string; // default: "PT. BUMI CITRA PERMAI"
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
  takeHomePay: number;
  grandTotal: number;
}

export interface EmailLog {
  id: string;
  timestamp: string;
  recipientEmail: string;
  recipientName: string;
  period: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  messageId?: string;
}

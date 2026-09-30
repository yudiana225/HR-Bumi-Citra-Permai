import { SalaryItemDetail, CalculatedSalary, Employee, SalaryRecord } from '../types';

export const formatRupiah = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '-';
  if (value === 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatRupiahWithZero = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return 'Rp 0';
  return 'Rp ' + new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const parseNumber = (val: string | number): number => {
  if (typeof val === 'number') return val;
  const cleaned = val.replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
};

export const calculateSalary = (items: SalaryItemDetail): CalculatedSalary => {
  const totalEarnings =
    (items.baseSalary || 0) +
    (items.allowanceJob || 0) +
    (items.allowanceMeal || 0) +
    (items.allowanceTransport || 0) +
    (items.allowancePulse || 0) +
    (items.overtime || 0) +
    (items.operational || 0) +
    (items.bonusTHR || 0) +
    (items.pph21Allowance || 0);

  const totalDeductions =
    (items.deductionBPJSJHT || 0) +
    (items.deductionBPJSPensiun || 0) +
    (items.deductionBPJSKesehatan || 0) +
    (items.deductionKasbon || 0) +
    (items.deductionSetting || 0) +
    (items.deductionAdvance || 0) +
    (items.deductionLateAbsence || 0) +
    (items.deductionCompanyTax || 0);

  const takeHomePay = totalEarnings - totalDeductions;
  const grandTotal = takeHomePay + (items.cashAllowance || 0);

  return {
    totalEarnings,
    totalDeductions,
    takeHomePay,
    grandTotal,
  };
};

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    name: 'MUZAKIR',
    position: 'MESSENGER',
    department: 'OPERATIONAL',
    email: 'evaluasioperasi@gmail.com',
    bankAccount: 'BCA - 1234567890',
    phone: '0812-3456-7890',
    joinDate: '2022-01-10',
  },
  {
    id: 'emp-002',
    name: 'DEWI ANGGRAENI',
    position: 'STAFF HRD & FINANCE',
    department: 'HUMAN CAPITAL',
    email: 'dewi.anggraeni@bumicitrapermai.com',
    bankAccount: 'MANDIRI - 9876543210',
    phone: '0813-8889-1122',
    joinDate: '2021-06-15',
  },
  {
    id: 'emp-003',
    name: 'AHMAD FAUZI',
    position: 'SUPERVISOR LOGISTIK',
    department: 'LOGISTICS & SUPPLY',
    email: 'ahmad.fauzi@bumicitrapermai.com',
    bankAccount: 'BNI - 5544332211',
    phone: '0821-4567-8901',
    joinDate: '2020-03-01',
  },
  {
    id: 'emp-004',
    name: 'SITI RAHMAWATI',
    position: 'ADMINISTRASI UMUM',
    department: 'GENERAL AFFAIRS',
    email: 'siti.rahmawati@bumicitrapermai.com',
    bankAccount: 'BRI - 0022334455',
    phone: '0857-1234-5678',
    joinDate: '2023-08-20',
  }
];

export const INITIAL_SALARY_RECORDS: SalaryRecord[] = [
  {
    id: 'sal-001',
    employeeId: 'emp-001', // MUZAKIR (matches the exact slip gaji image provided)
    period: 'AGUSTUS 2026',
    companyName: 'PT. BUMI CITRA PERMAI',
    items: {
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
    },
    notes: 'Slip gaji periode Agustus 2026 sesuai referensi',
    sentStatus: 'unsent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sal-002',
    employeeId: 'emp-002',
    period: 'AGUSTUS 2026',
    companyName: 'PT. BUMI CITRA PERMAI',
    items: {
      baseSalary: 7500000,
      allowanceJob: 1000000,
      allowanceMeal: 500000,
      allowanceTransport: 500000,
      allowancePulse: 200000,
      overtime: 350000,
      operational: 0,
      bonusTHR: 0,
      pph21Allowance: 0,

      deductionBPJSJHT: 143248,
      deductionBPJSPensiun: 71624,
      deductionBPJSKesehatan: 71624,
      deductionKasbon: 0,
      deductionSetting: 0,
      deductionAdvance: 0,
      deductionLateAbsence: 0,
      deductionCompanyTax: 0,

      cashAllowance: 0,
    },
    notes: 'Staff HRD',
    sentStatus: 'unsent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sal-003',
    employeeId: 'emp-003',
    period: 'AGUSTUS 2026',
    companyName: 'PT. BUMI CITRA PERMAI',
    items: {
      baseSalary: 8200000,
      allowanceJob: 1500000,
      allowanceMeal: 550000,
      allowanceTransport: 600000,
      allowancePulse: 250000,
      overtime: 800000,
      operational: 300000,
      bonusTHR: 0,
      pph21Allowance: 0,

      deductionBPJSJHT: 156620,
      deductionBPJSPensiun: 78310,
      deductionBPJSKesehatan: 78310,
      deductionKasbon: 500000,
      deductionSetting: 0,
      deductionAdvance: 0,
      deductionLateAbsence: 50000,
      deductionCompanyTax: 0,

      cashAllowance: 200000,
    },
    notes: 'Supervisor Logistik',
    sentStatus: 'unsent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

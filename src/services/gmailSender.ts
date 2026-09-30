import { Employee, SalaryRecord } from '../types';
import { calculateSalary, formatRupiah } from '../utils/salaryCalculator';
import jsPDF from 'jspdf';

export interface SendEmailPayload {
  toEmail: string;
  recipientName: string;
  subject: string;
  bodyHtml: string;
  pdfBase64?: string;
  pdfFilename?: string;
}

/**
 * Builds an RFC 2822 email message with optional MIME multipart PDF attachment
 * and sends it via Gmail API users.messages.send
 */
export const sendGmailSalarySlip = async (
  accessToken: string,
  payload: SendEmailPayload
): Promise<{ id: string; threadId: string }> => {
  const boundary = '----=_Part_' + Math.random().toString(36).substring(2) + Date.now();

  const headers = [
    `To: =?UTF-8?B?${btoa(unescape(encodeURIComponent(payload.recipientName)))}?= <${payload.toEmail}>`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
  ];

  let rawMessage = headers.join('\r\n') + '\r\n\r\n';

  // Body part
  rawMessage += `--${boundary}\r\n`;
  rawMessage += 'Content-Type: text/html; charset=UTF-8\r\n';
  rawMessage += 'Content-Transfer-Encoding: 7bit\r\n\r\n';
  rawMessage += payload.bodyHtml + '\r\n\r\n';

  // Attachment part if provided
  if (payload.pdfBase64 && payload.pdfFilename) {
    rawMessage += `--${boundary}\r\n`;
    rawMessage += `Content-Type: application/pdf; name="${payload.pdfFilename}"\r\n`;
    rawMessage += 'Content-Transfer-Encoding: base64\r\n';
    rawMessage += `Content-Disposition: attachment; filename="${payload.pdfFilename}"\r\n\r\n`;
    rawMessage += payload.pdfBase64 + '\r\n\r\n';
  }

  rawMessage += `--${boundary}--`;

  // Encode web-safe base64
  const base64Safe = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: base64Safe,
    }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message ||
        `Gmail API gagal mengirimkan email (Status: ${response.status})`
    );
  }

  return await response.json();
};

/**
 * Generate a PDF matching the exact template layout of PT. BUMI CITRA PERMAI
 */
export const generateSalarySlipPdfBlob = (
  record: SalaryRecord,
  employee: Employee
): { doc: jsPDF; base64: string; blob: Blob } => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a5', // A5 landscape matches the clean landscape format
  });

  const { items } = record;
  const calc = calculateSalary(items);

  // Outer border
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.6);
  doc.rect(10, 10, 190, 128); // Outer frame

  // Header Left
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text('SLIP GAJI', 22, 22);

  doc.setFontSize(10.5);
  doc.text(record.companyName || 'PT. BUMI CITRA PERMAI', 22, 27);

  doc.setFontSize(9.5);
  doc.text(record.period.toUpperCase(), 22, 32);

  // Line below period
  doc.setLineWidth(0.4);
  doc.setDrawColor(20, 20, 20);
  doc.line(22, 34, 75, 34);

  // Employee details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('NAMA', 22, 39);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${employee.name.toUpperCase()}`, 38, 39);

  doc.setFont('helvetica', 'bold');
  doc.text('JABATAN', 22, 44);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${employee.position.toUpperCase()}`, 38, 44);

  // Line below position
  doc.setLineWidth(0.4);
  doc.line(22, 46, 75, 46);

  // Header Right - Confidential Badge
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.5);
  doc.rect(122, 19, 44, 9); // Box for CONFIDENTIAL / RAHASIA

  doc.setTextColor(220, 38, 38); // Red
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('CONFIDENTIAL', 144, 23.5, { align: 'center' });
  doc.setFontSize(8);
  doc.text('RAHASIA', 144, 27, { align: 'center' });

  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('TIDAK UNTUK DISEBARLUASKAN', 144, 31.5, { align: 'center' });

  // Section Table Header - Grey Bar
  doc.setFillColor(214, 218, 222);
  doc.rect(22, 51, 166, 5, 'F');

  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('K O M P O N E N   U P A H', 24, 54.8);
  doc.text('P O T O N G A N', 108, 54.8);

  // Items List
  let y = 61;
  const lineSpacing = 4.8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(20, 20, 20);

  // Row 1: Gaji Pokok & BPJS JHT
  doc.text('GAJI POKOK', 24, y);
  doc.text(':', 62, y);
  doc.text(formatRupiah(items.baseSalary), 98, y, { align: 'right' });

  doc.text('BPJS JHT', 108, y);
  doc.text(':', 148, y);
  doc.text(formatRupiah(items.deductionBPJSJHT), 184, y, { align: 'right' });
  y += lineSpacing;

  // Row 2: Tunjangan Tetap & BPJS Pensiun
  doc.text('TUNJANGAN TETAP', 24, y);
  doc.text(':', 62, y);
  doc.text('-', 98, y, { align: 'right' });

  doc.text('BPJS Pensiun', 108, y);
  doc.text(':', 148, y);
  doc.text(formatRupiah(items.deductionBPJSPensiun), 184, y, { align: 'right' });
  y += lineSpacing;

  // Row 3: Jabatan & BPJS Kesehatan
  doc.text('Jabatan', 24, y);
  doc.text(items.allowanceJob ? formatRupiah(items.allowanceJob) : '-', 62, y, { align: 'right' });

  doc.text('BPJS Kesehatan', 108, y);
  doc.text(':', 148, y);
  doc.text(formatRupiah(items.deductionBPJSKesehatan), 184, y, { align: 'right' });
  y += lineSpacing;

  // Row 4: Makan & Kasbon Kantor
  doc.text('Makan', 24, y);
  doc.text(items.allowanceMeal ? formatRupiah(items.allowanceMeal) : '-', 62, y, { align: 'right' });

  doc.text('Kasbon Kantor', 108, y);
  doc.text(':', 148, y);
  doc.text(formatRupiah(items.deductionKasbon), 184, y, { align: 'right' });
  y += lineSpacing;

  // Row 5: Transport & Pengaturan Gaji
  doc.text('Transport', 24, y);
  doc.text(items.allowanceTransport ? formatRupiah(items.allowanceTransport) : '-', 62, y, { align: 'right' });

  doc.text('Pengaturan Gaji', 108, y);
  doc.text(':', 148, y);
  doc.text(formatRupiah(items.deductionSetting), 184, y, { align: 'right' });
  y += lineSpacing;

  // Row 6: Pulsa & Upah dibayar dimuka
  doc.text('Pulsa', 24, y);
  doc.text(items.allowancePulse ? formatRupiah(items.allowancePulse) : '-', 62, y, { align: 'right' });

  doc.text('Upah dibayar dimuka', 108, y);
  doc.text(':', 148, y);
  doc.text(formatRupiah(items.deductionAdvance), 184, y, { align: 'right' });
  y += lineSpacing;

  // Row 7: LEMBUR & Telat
  doc.text('LEMBUR', 24, y);
  doc.text(':', 62, y);
  doc.text(formatRupiah(items.overtime), 98, y, { align: 'right' });

  doc.text('Telat', 108, y);
  doc.text(':', 148, y);
  doc.text(formatRupiah(items.deductionLateAbsence), 184, y, { align: 'right' });
  y += lineSpacing;

  // Row 8: OPERASIONAL & MANGKIR / ALFA
  doc.text('OPERASIONAL', 24, y);
  doc.text(':', 62, y);
  doc.text(formatRupiah(items.operational), 98, y, { align: 'right' });

  doc.text('MANGKIR / ALFA', 108, y);
  doc.text(':', 148, y);
  doc.text('-', 184, y, { align: 'right' });
  y += lineSpacing;

  // Row 9: THR / BONUS & Pajak ditanggung Perusahaan
  doc.text('THR / BONUS', 24, y);
  doc.text(':', 62, y);
  doc.text(formatRupiah(items.bonusTHR), 98, y, { align: 'right' });

  doc.text('Pajak ditanggung Perusahaan', 108, y);
  doc.text(':', 148, y);
  doc.text(formatRupiah(items.deductionCompanyTax), 184, y, { align: 'right' });
  y += lineSpacing;

  // Row 10: PPh21
  doc.text('PPh21', 24, y);
  doc.text(':', 62, y);
  doc.text(formatRupiah(items.pph21Allowance), 98, y, { align: 'right' });

  // Bottom Summary Lines
  const summaryY = 111;
  doc.setLineWidth(0.4);
  doc.setDrawColor(20, 20, 20);
  doc.line(22, summaryY, 188, summaryY);

  // Total Penerimaan & Total Potongan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TOTAL PENERIMAAN', 24, summaryY + 4);
  doc.text('Rp', 75, summaryY + 4);
  doc.text(formatRupiah(calc.totalEarnings), 98, summaryY + 4, { align: 'right' });

  doc.text('TOTAL POTONGAN', 108, summaryY + 4);
  doc.text('Rp', 160, summaryY + 4);
  doc.text(formatRupiah(calc.totalDeductions), 184, summaryY + 4, { align: 'right' });

  // Line below totals
  doc.line(22, summaryY + 6.5, 188, summaryY + 6.5);

  // Take Home Pay Box
  doc.text('TAKE HOME PAY', 24, summaryY + 11);
  doc.text('Rp', 75, summaryY + 11);
  // Box for THP amount
  doc.rect(73, summaryY + 7.5, 26, 4.8);
  doc.text(formatRupiah(calc.takeHomePay), 98, summaryY + 11, { align: 'right' });

  // Tunjangan Cash
  doc.text('TUNJANGAN CASH', 24, summaryY + 16);
  doc.text('Rp', 75, summaryY + 16);
  doc.text(formatRupiah(items.cashAllowance), 98, summaryY + 16, { align: 'right' });

  // Grand Total bar
  doc.setFillColor(235, 235, 235);
  doc.rect(45, summaryY + 17.5, 54, 5, 'F');
  doc.text('GRAND TOTAL', 48, summaryY + 21);
  doc.text('Rp', 75, summaryY + 21);
  doc.text(formatRupiah(calc.grandTotal), 98, summaryY + 21, { align: 'right' });

  // Thick line below Grand Total
  doc.setLineWidth(0.8);
  doc.line(73, summaryY + 22.8, 99, summaryY + 22.8);

  // Footer Disclaimer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(50, 50, 50);
  doc.text('Slip gaji ini tidak memerlukan tanda tangan dan stempel', 24, summaryY + 27);

  const pdfOutputBase64 = doc.output('datauristring').split(',')[1];
  const blob = doc.output('blob');

  return {
    doc,
    base64: pdfOutputBase64,
    blob,
  };
};

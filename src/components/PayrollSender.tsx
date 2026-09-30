import React, { useState } from 'react';
import { Company, Employee, SalaryRecord, EmailLog, PayrollPeriod } from '../types';
import { calculateSalary, formatRupiahDecimal } from '../utils/salaryCalculator';
import { generateSalarySlipPdfBlob, sendGmailSalarySlip } from '../services/gmailSender';
import { Send, Eye, CheckCircle2, XCircle, Clock, Mail, AlertTriangle, Building2, Filter } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PayrollSenderProps {
  companies: Company[];
  employees: Employee[];
  periods: PayrollPeriod[];
  salaryRecords: SalaryRecord[];
  accessToken: string | null;
  onRequireAuth: () => void;
  onPreviewRecord: (record: SalaryRecord) => void;
  onUpdateSalaryRecord: (record: SalaryRecord) => void;
  logs: EmailLog[];
  onAddLog: (log: EmailLog) => void;
}

export const PayrollSender: React.FC<PayrollSenderProps> = ({
  companies,
  employees,
  periods,
  salaryRecords,
  accessToken,
  onRequireAuth,
  onPreviewRecord,
  onUpdateSalaryRecord,
  logs,
  onAddLog,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(periods[0]?.name || 'Oktober 2025');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Modal confirmation for sending email (mandatory destructive / outgoing operation confirmation)
  const [confirmModalData, setConfirmModalData] = useState<{
    type: 'single' | 'batch';
    record?: SalaryRecord;
    employee?: Employee;
    company?: Company;
  } | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter records matching current period and company
  const periodRecords = salaryRecords.filter((r) => {
    const matchPeriod = r.period.toUpperCase() === selectedPeriod.toUpperCase();
    const matchCompany = selectedCompanyId === 'all' || r.companyId === selectedCompanyId;
    return matchPeriod && matchCompany;
  });

  const getEmployee = (empId: string) => employees.find((e) => e.id === empId);
  const getCompany = (compId: string) => companies.find((c) => c.id === compId) || companies[0];

  const handleSendSingle = async (record: SalaryRecord, employee: Employee, company: Company) => {
    if (!accessToken) {
      onRequireAuth();
      return;
    }

    setSendingId(record.id);
    setFeedback(null);

    try {
      // 1. Generate standard PDF
      const { base64 } = generateSalarySlipPdfBlob(record, employee, company);
      const filename = `Slip_Gaji_${company.name.replace(/[^a-zA-Z0-9]/g, '_')}_${employee.name.replace(/[^a-zA-Z0-9]/g, '_')}_${record.period.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

      const calc = calculateSalary(record.items);

      // 2. Email HTML template
      const emailBodyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.5;">
          <div style="border-bottom: 2px solid #1E293B; padding-bottom: 12px; margin-bottom: 16px;">
            <h2 style="margin: 0; color: #0F172A; font-size: 20px;">${company.name}</h2>
            <p style="margin: 4px 0 0 0; color: #64748B; font-size: 13px; font-weight: bold;">
              SLIP GAJI KARYAWAN — PERIODE ${record.period.toUpperCase()} (NO URUT: ${employee.employeeNo})
            </p>
          </div>
          
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">Kepada Yth. Sdr/i <strong>${employee.name}</strong>,</p>
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #475569;">
              Berikut kami lampirkan dokumen resmi Slip Gaji Anda untuk periode <strong>${record.period}</strong> dalam format PDF terlampir. Dokumen ini bersifat <strong>CONFIDENTIAL / RAHASIA</strong>.
            </p>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #64748B;">No. Urut Slip:</td>
                <td style="padding: 4px 0; font-weight: bold; text-align: right;">#${employee.employeeNo}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748B;">Jabatan:</td>
                <td style="padding: 4px 0; font-weight: bold; text-align: right;">${employee.position}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748B;">Take Home Pay (THP):</td>
                <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #059669;">Rp ${formatRupiahDecimal(calc.takeHomePay)}</td>
              </tr>
              <tr style="border-top: 1px solid #CBD5E1;">
                <td style="padding: 6px 0; font-weight: bold;">Grand Total:</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right; font-size: 15px; color: #1E293B;">Rp ${formatRupiahDecimal(calc.grandTotal)}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 12px; color: #94A3B8; margin-top: 24px;">
            * Dokumen ini dibuat otomatis oleh sistem payroll ${company.name} dan sah tanpa tanda tangan maupun stempel basah.
          </p>
        </div>
      `;

      // 3. Send via Gmail API
      const result = await sendGmailSalarySlip(accessToken, {
        toEmail: employee.email,
        recipientName: employee.name,
        subject: `Slip Gaji ${company.name} - ${employee.name} (${record.period})`,
        bodyHtml: emailBodyHtml,
        pdfBase64: base64,
        pdfFilename: filename,
      });

      // 4. Update status & log
      const updatedRec: SalaryRecord = {
        ...record,
        sentStatus: 'sent',
        sentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onUpdateSalaryRecord(updatedRec);

      onAddLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString('id-ID'),
        recipientEmail: employee.email,
        recipientName: employee.name,
        companyName: company.name,
        period: record.period,
        status: 'success',
        messageId: result.id,
      });

      confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
      setFeedback({
        type: 'success',
        message: `Slip gaji berhasil dikirimkan ke email ${employee.email} (${employee.name} - ${company.name}) via Gmail.`,
      });
    } catch (err: any) {
      console.error(err);
      onAddLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString('id-ID'),
        recipientEmail: employee.email,
        recipientName: employee.name,
        companyName: company.name,
        period: record.period,
        status: 'failed',
        errorMessage: err.message || 'Gagal mengirim email',
      });

      setFeedback({
        type: 'error',
        message: `Gagal mengirim email: ${err.message || 'Periksa koneksi atau izin Gmail.'}`,
      });
    } finally {
      setSendingId(null);
    }
  };

  const handleSendAllBatch = async () => {
    if (!accessToken) {
      onRequireAuth();
      return;
    }

    setIsSendingAll(true);
    setFeedback(null);
    let successCount = 0;
    let failCount = 0;

    for (const rec of periodRecords) {
      const emp = getEmployee(rec.employeeId);
      const comp = getCompany(rec.companyId);
      if (!emp || !emp.email) continue;

      try {
        const { base64 } = generateSalarySlipPdfBlob(rec, emp, comp);
        const filename = `Slip_Gaji_${comp.name.replace(/[^a-zA-Z0-9]/g, '_')}_${emp.name.replace(/[^a-zA-Z0-9]/g, '_')}_${rec.period.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        const calc = calculateSalary(rec.items);

        const emailBodyHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.5;">
            <div style="border-bottom: 2px solid #1E293B; padding-bottom: 12px; margin-bottom: 16px;">
              <h2 style="margin: 0; color: #0F172A; font-size: 20px;">${comp.name}</h2>
              <p style="margin: 4px 0 0 0; color: #64748B; font-size: 13px; font-weight: bold;">
                SLIP GAJI KARYAWAN — PERIODE ${rec.period.toUpperCase()} (NO URUT: ${emp.employeeNo})
              </p>
            </div>
            
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0; font-size: 14px;">Kepada Yth. Sdr/i <strong>${emp.name}</strong>,</p>
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #475569;">
                Berikut terlampir dokumen resmi Slip Gaji Anda untuk periode <strong>${rec.period}</strong> dalam format PDF. Dokumen ini bersifat <strong>CONFIDENTIAL / RAHASIA</strong>.
              </p>
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #64748B;">No. Urut:</td>
                  <td style="padding: 4px 0; font-weight: bold; text-align: right;">#${emp.employeeNo}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748B;">Jabatan:</td>
                  <td style="padding: 4px 0; font-weight: bold; text-align: right;">${emp.position}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748B;">Take Home Pay (THP):</td>
                  <td style="padding: 4px 0; font-weight: bold; text-align: right; color: #059669;">Rp ${formatRupiahDecimal(calc.takeHomePay)}</td>
                </tr>
                <tr style="border-top: 1px solid #CBD5E1;">
                  <td style="padding: 6px 0; font-weight: bold;">Grand Total:</td>
                  <td style="padding: 6px 0; font-weight: bold; text-align: right; font-size: 15px; color: #1E293B;">Rp ${formatRupiahDecimal(calc.grandTotal)}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 12px; color: #94A3B8; margin-top: 24px;">
              * Dokumen ini dibuat otomatis oleh sistem payroll ${comp.name}.
            </p>
          </div>
        `;

        const res = await sendGmailSalarySlip(accessToken, {
          toEmail: emp.email,
          recipientName: emp.name,
          subject: `Slip Gaji ${comp.name} - ${emp.name} (${rec.period})`,
          bodyHtml: emailBodyHtml,
          pdfBase64: base64,
          pdfFilename: filename,
        });

        onUpdateSalaryRecord({
          ...rec,
          sentStatus: 'sent',
          sentAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        onAddLog({
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toLocaleString('id-ID'),
          recipientEmail: emp.email,
          recipientName: emp.name,
          companyName: comp.name,
          period: rec.period,
          status: 'success',
          messageId: res.id,
        });
        successCount++;
      } catch (err: any) {
        failCount++;
        onAddLog({
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toLocaleString('id-ID'),
          recipientEmail: emp.email,
          recipientName: emp.name,
          companyName: comp.name,
          period: rec.period,
          status: 'failed',
          errorMessage: err.message,
        });
      }
    }

    setIsSendingAll(false);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    setFeedback({
      type: successCount > 0 ? 'success' : 'error',
      message: `Distribusi massal selesai: ${successCount} berhasil dikirim via Gmail, ${failCount} gagal.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            Distribusi Slip Gaji Multi-Company (Gmail API)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Kirim dokumen slip gaji berstandar resmi (PDF attachment) langsung ke email masing-masing karyawan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Company Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
            <span>Perusahaan:</span>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-gray-50"
            >
              <option value="all">Semua Perusahaan</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
            <span>Periode:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold bg-gray-50"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              if (!accessToken) {
                onRequireAuth();
                return;
              }
              setConfirmModalData({ type: 'batch' });
            }}
            disabled={isSendingAll || periodRecords.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {isSendingAll ? 'Memproses Pengiriman...' : `Kirim Semua (${periodRecords.length}) via Gmail`}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Table of Ready Salary Slips */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-500" />
            Daftar Slip Gaji Periode: {selectedPeriod}
          </div>
          <div className="text-xs text-gray-500">
            Total {periodRecords.length} slip gaji siap didistribusikan
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase border-b border-gray-200 font-semibold tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 text-center">No Urut</th>
                <th className="py-3 px-4">Karyawan & PT</th>
                <th className="py-3 px-4">Tujuan Email</th>
                <th className="py-3 px-4 text-right">Penerimaan</th>
                <th className="py-3 px-4 text-right">Potongan</th>
                <th className="py-3 px-4 text-right">Take Home Pay</th>
                <th className="py-3 px-4 text-center">Status Email</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {periodRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    Belum ada parameter slip gaji untuk periode "{selectedPeriod}". Buka tab "Input & Edit Komponen Gaji" untuk membuat.
                  </td>
                </tr>
              ) : (
                periodRecords.map((rec) => {
                  const emp = getEmployee(rec.employeeId);
                  const comp = getCompany(rec.companyId);
                  if (!emp) return null;
                  const calc = calculateSalary(rec.items);
                  const isSendingThis = sendingId === rec.id;

                  return (
                    <tr key={rec.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-gray-800 bg-gray-50/30">
                        #{emp.employeeNo}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div className="font-bold">{emp.name}</div>
                        <div className="text-[11px] text-gray-500">
                          {emp.position} — <span className="font-medium text-slate-700">{comp.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600">
                        {emp.email}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-emerald-700">
                        Rp {formatRupiahDecimal(calc.totalEarnings)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-rose-700">
                        Rp {formatRupiahDecimal(calc.totalDeductions)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                        Rp {formatRupiahDecimal(calc.takeHomePay)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {rec.sentStatus === 'sent' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Terkirim
                          </span>
                        ) : isSendingThis ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 animate-pulse">
                            <Clock className="w-3 h-3 animate-spin" />
                            Mengirim...
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                            Belum Dikirim
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onPreviewRecord(rec)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer shadow-2xs"
                            title="Pratinjau Dokumen"
                          >
                            <Eye className="w-3 h-3 text-gray-500" />
                            Pratinjau
                          </button>

                          <button
                            onClick={() => {
                              if (!accessToken) {
                                onRequireAuth();
                                return;
                              }
                              setConfirmModalData({
                                type: 'single',
                                record: rec,
                                employee: emp,
                                company: comp,
                              });
                            }}
                            disabled={isSendingThis || isSendingAll}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-700 cursor-pointer shadow-2xs disabled:opacity-50"
                            title="Kirim via Gmail"
                          >
                            <Send className="w-3 h-3" />
                            {isSendingThis ? 'Mengirim...' : 'Kirim Gmail'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog */}
      {confirmModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Konfirmasi Pengiriman Slip Gaji
                </h3>
                <p className="text-xs text-gray-500">Izin pengiriman dokumen via Gmail API</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2 mb-4 border border-gray-200">
              {confirmModalData.type === 'single' && confirmModalData.employee && confirmModalData.company && (
                <>
                  <p className="text-gray-700">
                    Anda akan mengirimkan slip gaji resmi berformat <strong>PDF Confidential</strong> ke alamat email:
                  </p>
                  <div className="p-2 bg-white rounded border border-gray-300 font-mono text-indigo-700 font-semibold">
                    {confirmModalData.employee.email}
                  </div>
                  <div className="text-[11px] text-gray-500 leading-relaxed">
                    Penerima: <strong>{confirmModalData.employee.name}</strong> (No Urut: #{confirmModalData.employee.employeeNo})<br />
                    Perusahaan: <strong>{confirmModalData.company.name}</strong><br />
                    Periode: <strong>{confirmModalData.record?.period}</strong>
                  </div>
                </>
              )}

              {confirmModalData.type === 'batch' && (
                <>
                  <p className="text-gray-700">
                    Anda akan mengirimkan slip gaji resmi secara massal ke <strong>{periodRecords.length} karyawan</strong> untuk periode <strong>{selectedPeriod}</strong>.
                  </p>
                  <p className="text-gray-500 text-[11px]">
                    Sistem akan menyusun file PDF otomatis untuk setiap entitas perusahaan terkait dan mengirimkannya secara aman.
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmModalData(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const modal = confirmModalData;
                  setConfirmModalData(null);
                  if (modal.type === 'single' && modal.record && modal.employee && modal.company) {
                    handleSendSingle(modal.record, modal.employee, modal.company);
                  } else if (modal.type === 'batch') {
                    handleSendAllBatch();
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Ya, Konfirmasi Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log of Sent Emails */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            Riwayat Log Pengiriman Slip Gaji (Gmail API)
          </div>
          <span className="text-[11px] text-gray-500">{logs.length} transaksi tercatat</span>
        </div>

        <div className="max-h-60 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              Belum ada riwayat pengiriman email pada sesi ini.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Waktu</th>
                  <th className="py-2.5 px-4">Penerima</th>
                  <th className="py-2.5 px-4">Perusahaan</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Periode</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-4 text-gray-500 font-mono text-[11px]">{log.timestamp}</td>
                    <td className="py-2.5 px-4 font-semibold text-gray-800">{log.recipientName}</td>
                    <td className="py-2.5 px-4 text-gray-600">{log.companyName}</td>
                    <td className="py-2.5 px-4 text-gray-600 font-mono text-[11px]">{log.recipientEmail}</td>
                    <td className="py-2.5 px-4 text-gray-600">{log.period}</td>
                    <td className="py-2.5 px-4">
                      {log.status === 'success' ? (
                        <span className="text-emerald-700 font-semibold inline-flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Berhasil Terkirim
                        </span>
                      ) : (
                        <span className="text-rose-700 font-semibold inline-flex items-center gap-1 text-[11px]" title={log.errorMessage}>
                          <XCircle className="w-3 h-3 text-rose-600" /> Gagal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

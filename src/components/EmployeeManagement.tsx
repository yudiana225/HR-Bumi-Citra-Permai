import React, { useState } from 'react';
import { Company, Employee, EmployeeCategory } from '../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Building2,
  UserCheck,
  Tag,
  Briefcase,
  Users,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

interface EmployeeManagementProps {
  companies: Company[];
  employees: Employee[];
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export const CATEGORY_COLORS: Record<EmployeeCategory, { bg: string; text: string; border: string }> = {
  'KARYAWAN TETAP': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'KARYAWAN KONTRAK': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'DIREKSI & MANAGEMENT': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'OUTSOURCING': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'HARIAN LEPAS': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'PROBATION': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  companies,
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  const [search, setSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    employeeNo: 1,
    companyId: companies[0]?.id || '',
    name: '',
    position: '',
    department: '',
    category: 'KARYAWAN TETAP' as EmployeeCategory,
    email: '',
    bankAccount: '',
    phone: '',
    status: 'KARYAWAN TETAP' as Employee['status'],
    ptkpStatus: 'TK/0',
    gender: 'L' as 'L' | 'P',
    startDate: '',
  });

  const categoriesList: EmployeeCategory[] = [
    'KARYAWAN TETAP',
    'KARYAWAN KONTRAK',
    'DIREKSI & MANAGEMENT',
    'OUTSOURCING',
    'HARIAN LEPAS',
    'PROBATION',
  ];

  // Count by categories for stat pills
  const categoryCounts = categoriesList.reduce((acc, cat) => {
    acc[cat] = employees.filter((e) => e.category === cat).length;
    return acc;
  }, {} as Record<EmployeeCategory, number>);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchCompany = filterCompany === 'all' || e.companyId === filterCompany;
    const matchCategory = filterCategory === 'all' || e.category === filterCategory;
    const matchSearch =
      e.name.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      (e.department && e.department.toLowerCase().includes(q));
    return matchCompany && matchCategory && matchSearch;
  });

  const getCompanyName = (compId: string) => {
    return companies.find((c) => c.id === compId)?.name || 'Perusahaan';
  };

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    const maxNo = employees.reduce((max, e) => Math.max(max, e.employeeNo || 0), 0);
    setFormData({
      employeeNo: maxNo + 1,
      companyId: companies[0]?.id || '',
      name: '',
      position: '',
      department: 'OPERATIONAL',
      category: 'KARYAWAN TETAP',
      email: '',
      bankAccount: 'BCA - ',
      phone: '',
      status: 'KARYAWAN TETAP',
      ptkpStatus: 'TK/0',
      gender: 'L',
      startDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      employeeNo: emp.employeeNo,
      companyId: emp.companyId,
      name: emp.name,
      position: emp.position,
      department: emp.department || '',
      category: emp.category || 'KARYAWAN TETAP',
      email: emp.email,
      bankAccount: emp.bankAccount || '',
      phone: emp.phone || '',
      status: emp.status,
      ptkpStatus: emp.ptkpStatus || 'TK/0',
      gender: emp.gender || 'L',
      startDate: emp.startDate || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (editingEmployee) {
      onUpdateEmployee({
        ...editingEmployee,
        ...formData,
      });
    } else {
      onAddEmployee({
        ...formData,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Category Overview Cards / Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categoriesList.map((cat) => {
          const colors = CATEGORY_COLORS[cat];
          const isSelected = filterCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(isSelected ? 'all' : cat)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-indigo-600 bg-white shadow-sm'
                  : 'bg-white hover:bg-gray-50 border-gray-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${colors.bg} ${colors.text} ${colors.border}`}
                >
                  {cat.split(' ')[0]}
                </span>
                <span className="text-xs font-mono font-bold text-gray-800">
                  {categoryCounts[cat] || 0}
                </span>
              </div>
              <div className="text-[11px] font-bold text-gray-900 truncate" title={cat}>
                {cat}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                {isSelected ? 'Klik untuk reset' : 'Klik filter'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Header Bar with Search & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Data Karyawan (Sheet Laporan Upah & Multi-Company)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola data karyawan dengan pemetaan entitas perusahaan, kategori kepegawaian, No Urut, dan profil pajak PTKP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Company Filter Dropdown */}
          <div className="relative">
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Perusahaan ({companies.length})</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Kategori ({employees.length})</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({categoryCounts[cat] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, jabatan, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Karyawan
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-600 uppercase border-b border-gray-200 font-semibold tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 text-center">No Urut</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Kategori Karyawan</th>
                <th className="py-3 px-4">Entitas Perusahaan</th>
                <th className="py-3 px-4">Jabatan & Dept</th>
                <th className="py-3 px-4">Email Gmail Aktif</th>
                <th className="py-3 px-4">PTKP / Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    Tidak ada data karyawan ditemukan untuk filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => {
                  const colors = CATEGORY_COLORS[emp.category] || CATEGORY_COLORS['KARYAWAN TETAP'];
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-gray-800 bg-gray-50/40">
                        #{emp.employeeNo}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-xs">{emp.name}</div>
                            <div className="text-[10px] text-gray-400">
                              L/P: {emp.gender || '-'} • Bank: {emp.bankAccount || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          <Tag className="w-3 h-3" />
                          {emp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-semibold text-[11px]">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          {getCompanyName(emp.companyId)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900">{emp.position}</div>
                        <div className="text-[11px] text-gray-500">{emp.department || 'OPERATIONAL'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-gray-700 font-mono text-[11px]">
                          <Mail className="w-3.5 h-3.5 text-red-500" />
                          {emp.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] font-semibold text-gray-800">PTKP: {emp.ptkpStatus || 'TK/0'}</div>
                        <div className="text-[10px] text-gray-500">{emp.status}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Edit Karyawan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus data karyawan "${emp.name}"?`)) {
                                onDeleteEmployee(emp.id);
                              }
                            }}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Hapus Karyawan"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Isi data karyawan, no urut slip gaji, kategori kepegawaian, dan entitas perusahaan.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    No Urut Slip *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.employeeNo}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeNo: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kategori Karyawan *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as EmployeeCategory })
                    }
                    className="w-full px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Entitas Perusahaan *
                </label>
                <select
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lengkap (Sesuai KTP / Laporan Upah) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: HUNGDRES HALIM"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Jabatan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: General Manager / Staff"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Departemen
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: FINANCE / OPERATIONAL"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Gmail Penerima (Distribusi Slip Gaji) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="karyawan@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Status TK
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg"
                  >
                    <option value="KARYAWAN TETAP">Karyawan Tetap</option>
                    <option value="KARYAWAN KONTRAK">Kontrak</option>
                    <option value="PROBATION">Probation</option>
                    <option value="HARIAN">Harian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Status PTKP
                  </label>
                  <input
                    type="text"
                    placeholder="TK/0, K/1"
                    value={formData.ptkpStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, ptkpStatus: e.target.value.toUpperCase() })
                    }
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    L/P
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nomor Rekening Payroll
                  </label>
                  <input
                    type="text"
                    placeholder="BCA - 1234567890"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {editingEmployee ? 'Simpan Perubahan' : 'Tambahkan Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

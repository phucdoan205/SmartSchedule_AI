import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Receipt, Eye } from 'lucide-react';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';

interface PatientRecord {
  id: string;
  name: string;
  phone: string;
  gender: string;
  dob: string;
  lastDoctor: string;
  totalVisits: number;
  status: string;
}

const MOCK_PATIENTS: PatientRecord[] = [
  {
    id: 'BN-8801',
    name: 'Nguyễn Văn An',
    phone: '0912.345.678',
    gender: 'Nam',
    dob: '1985-04-12',
    lastDoctor: 'TS.BS. Nguyễn Minh Anh',
    totalVisits: 5,
    status: 'Active',
  },
  {
    id: 'BN-8802',
    name: 'Trần Thị Mai',
    phone: '0988.777.666',
    gender: 'Nữ',
    dob: '1992-08-25',
    lastDoctor: 'BS. CKII. Tran Thi Thu Huong',
    totalVisits: 3,
    status: 'Active',
  },
];

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientRecord[]>(MOCK_PATIENTS);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPreviewReceiptOpen, setIsPreviewReceiptOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Nam');
  const [dob, setDob] = useState('');

  // Receipt form
  const [receiptPatient, setReceiptPatient] = useState('Nguyễn Văn An');
  const [serviceFee, setServiceFee] = useState('1.500.000');

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const newP: PatientRecord = {
      id: `BN-${Math.floor(8800 + Math.random() * 100)}`,
      name,
      phone,
      gender,
      dob: dob || '1990-01-01',
      lastDoctor: 'TS.BS. Nguyễn Minh Anh',
      totalVisits: 1,
      status: 'Active',
    };
    setPatients([newP, ...patients]);
    setIsPatientModalOpen(false);
  };

  const columns: Column<PatientRecord>[] = [
    {
      header: 'MÃ BỆNH NHÂN',
      cell: (row) => <span className="font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-xs">{row.id}</span>,
    },
    {
      header: 'HỌ & TÊN BỆNH NHÂN',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.name}</p>
          <p className="text-[11px] text-slate-400">{row.phone} • {row.gender}</p>
        </div>
      ),
    },
    { header: 'NGÀY SINH', accessorKey: 'dob' },
    { header: 'BÁC SĨ ĐÃ KHÁM', accessorKey: 'lastDoctor' },
    { header: 'SỐ LẦN KHÁM', cell: (row) => <span className="font-bold text-slate-800">{row.totalVisits} lần</span> },
    {
      header: 'THAO TÁC & PHIẾU THU',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setReceiptPatient(row.name);
              setIsReceiptModalOpen(true);
            }}
            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1"
          >
            <Receipt className="w-3.5 h-3.5" /> Phiếu thu
          </button>
          <button
            type="button"
            onClick={() => navigate(`/admin/patients/${row.id}`)}
            className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg"
          >
            Xem EMR
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý Bệnh Nhân & Hồ Sơ Bệnh Án Điện Tử (EMR)</h2>
          <p className="text-xs text-slate-500 mt-1">Lưu trữ toàn bộ dữ liệu lịch sử khám bệnh, sơ đồ răng và phiếu thu viện phí</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsReceiptModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" /> Lập phiếu thu
          </button>

          <button
            type="button"
            onClick={() => setIsPatientModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tạo hồ sơ bệnh nhân mới
          </button>
        </div>
      </div>

      <DataTable data={patients} columns={columns} searchPlaceholder="Tìm tên bệnh nhân, mã hồ sơ EMR..." />

      {/* Modal Tạo hồ sơ bệnh nhân */}
      <Modal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        title="Tạo Hồ Sơ Bệnh Nhân Mới"
        subtitle="Điền thông tin hành chính bệnh nhân để tạo mã EMR điện tử"
      >
        <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Họ & Tên Bệnh Nhân:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số Điện Thoại:</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912.xxx.xxx"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giới tính:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ngày Sinh:</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={() => setIsPatientModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600">
              Hủy
            </button>
            <button type="submit" className="px-4 py-2 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl">
              Lưu Hồ Sơ
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Lập phiếu thu */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Lập Phiếu Thu Bệnh Nhân"
        subtitle="Thu tiền dịch vụ khám, nhổ răng, trám răng hoặc thanh toán công nợ"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bệnh Nhân Tên:</label>
            <input
              type="text"
              value={receiptPatient}
              onChange={(e) => setReceiptPatient(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Số Tiền Thu (VNĐ):</label>
            <input
              type="text"
              value={serviceFee}
              onChange={(e) => setServiceFee(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-emerald-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={() => setIsReceiptModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600">
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                setIsReceiptModalOpen(false);
                setIsPreviewReceiptOpen(true);
              }}
              className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> Xem Trước Phiếu Thu
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Xem trước phiếu thu */}
      <Modal
        isOpen={isPreviewReceiptOpen}
        onClose={() => setIsPreviewReceiptOpen(false)}
        title="Xem Trước Phiếu Thu Viện Phí Điện Tử"
        subtitle="Hóa đơn thanh toán hợp lệ ký số bảo mật AI SmartSchedule"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Bệnh nhân: {receiptPatient}</span>
              <span className="text-sky-600">Mã hóa đơn: HD-2026-0903</span>
            </div>
            <p className="text-slate-500">Dịch vụ: Khám Răng Hàm Mặt Chuyên Sâu + Chụp X-Quang</p>
            <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-emerald-600">
              <span>TỔNG TIỀN THANH TOÁN:</span>
              <span>{serviceFee} VNĐ</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewReceiptOpen(false)}
              className="px-4 py-2 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl"
            >
              Xác Nhận In & Lưu Phiếu Thu
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

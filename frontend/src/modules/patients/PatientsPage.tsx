import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { DataTable, type Column } from '../../components/common/DataTable';
import { CreateReceiptModal, type ReceiptData } from '../../components/dental/CreateReceiptModal';
import { ReceiptPreviewModal } from '../../components/dental/ReceiptPreviewModal';
import { patientsApi, financeApi } from '../../services/api';

interface PatientRecord {
  id: string;
  rawId: string;
  name: string;
  phone: string;
  gender: string;
  dob: string;
  lastDoctor: string;
  totalVisits: number;
  status: string;
}

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Receipt form states
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPreviewReceiptOpen, setIsPreviewReceiptOpen] = useState(false);
  const [selectedPatientForReceipt, setSelectedPatientForReceipt] = useState<PatientRecord | null>(null);
  const [currentReceiptData, setCurrentReceiptData] = useState<ReceiptData | undefined>(undefined);

  const extractDob = (p: any) => {
    if (p.medicalAlerts) {
      const match = p.medicalAlerts.match(/DOB:(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }
    return p.birthYear ? `${p.birthYear}-01-01` : '1990-01-01';
  };

  const loadPatients = useCallback(async (targetPage = page, query = searchTerm) => {
    try {
      setIsLoading(true);
      const res = await patientsApi.getAll({
        page: targetPage,
        limit: 5,
        search: query.trim() || undefined,
      });

      const list = res.data || [];
      setPatients(
        list.map((p: any) => {
          const latestDoctor = p.appointments?.[0]?.doctor?.fullName || 'Chưa khám';
          return {
            id: p.patientCode || p.id,
            rawId: p.id,
            name: p.fullName,
            phone: p.phone,
            gender: p.gender || 'Nam',
            dob: extractDob(p),
            lastDoctor: latestDoctor,
            totalVisits: p._count?.appointments ?? 0,
            status: 'Active',
          };
        }),
      );
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Lỗi khi tải danh sách bệnh nhân:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    loadPatients(page, searchTerm);

    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('smartschedule_sync');
      channel.onmessage = () => {
        loadPatients(page, searchTerm);
      };
    }

    const handleFocus = () => {
      loadPatients(page, searchTerm);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      channel?.close();
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadPatients, page, searchTerm]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadPatients(newPage, searchTerm);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
    loadPatients(1, term);
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
    {
      header: 'BÁC SĨ ĐÃ KHÁM',
      cell: (row) => (
        <span className={`font-semibold ${row.lastDoctor === 'Chưa khám' ? 'text-slate-400 italic' : 'text-slate-700'}`}>
          {row.lastDoctor}
        </span>
      ),
    },
    {
      header: 'SỐ LẦN KHÁM',
      cell: (row) => (
        <span className="font-bold text-slate-800">
          {row.totalVisits > 0 ? `${row.totalVisits} lần` : '0 lần'}
        </span>
      ),
    },
    {
      header: 'THAO TÁC & PHIẾU THU',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedPatientForReceipt(row);
              setCurrentReceiptData({
                patientName: row.name,
                patientId: row.id,
                amount: 500000,
                description: `Phiếu thu dịch vụ khám nha khoa - ${row.name}`,
                paymentMethod: 'VietQR',
                collector: row.lastDoctor !== 'Chưa khám' ? row.lastDoctor : 'Thu ngân chi nhánh',
                isEvatEnabled: true,
                customerType: 'Cá nhân',
                taxCode: '',
                buyerName: row.name,
                buyerAddress: 'Hồ Chí Minh',
                buyerEmail: '',
                vatRate: '0% VAT - Dịch vụ y tế',
                sendZns: true,
              });
              setIsReceiptModalOpen(true);
            }}
            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
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
      </div>

      <DataTable
        data={patients}
        columns={columns}
        searchPlaceholder="Tìm tên bệnh nhân, mã hồ sơ EMR..."
        serverSide={true}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        itemsPerPage={5}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
      />

      {/* Modal Lập phiếu thu & Hóa đơn e-VAT */}
      <CreateReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        patientName={selectedPatientForReceipt?.name || ''}
        patientId={selectedPatientForReceipt?.id || ''}
        defaultAmount={500000}
        defaultDescription={`Phiếu thu viện phí - ${selectedPatientForReceipt?.name || ''}`}
        onOpenPreview={(data) => {
          setCurrentReceiptData(data);
          setIsReceiptModalOpen(false);
          setIsPreviewReceiptOpen(true);
        }}
        onConfirmSuccess={async (data) => {
          try {
            if (selectedPatientForReceipt?.rawId) {
              await financeApi.createReceipt({
                patientId: selectedPatientForReceipt.rawId,
                amount: data.amount,
                description: data.description,
                paymentMethod: data.paymentMethod,
                collector: data.collector,
              });
            }
          } catch (e) {
            console.error('Lỗi khi ghi nhận phiếu thu:', e);
          }
          setIsReceiptModalOpen(false);
          loadPatients(page, searchTerm);
        }}
      />

      {/* Modal Xem trước phiếu thu nhiệt K80 */}
      <ReceiptPreviewModal
        isOpen={isPreviewReceiptOpen}
        onClose={() => setIsPreviewReceiptOpen(false)}
        onBackToEdit={() => {
          setIsPreviewReceiptOpen(false);
          setIsReceiptModalOpen(true);
        }}
        receiptData={currentReceiptData}
      />
    </div>
  );
};

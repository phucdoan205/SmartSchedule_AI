import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchField?: keyof T;
  title?: string;
  actionButton?: React.ReactNode;
  itemsPerPage?: number;
  serverSide?: boolean;
  page?: number;
  totalPages?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onSearchChange?: (search: string) => void;
  isLoading?: boolean;
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  searchPlaceholder = 'Tìm kiếm dữ liệu...',
  searchField,
  title,
  actionButton,
  itemsPerPage = 6,
  serverSide = false,
  page = 1,
  totalPages: serverTotalPages,
  totalCount: serverTotalCount,
  onPageChange,
  onSearchChange,
  isLoading = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientCurrentPage, setClientCurrentPage] = useState(1);
  const pageSize = itemsPerPage;

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (serverSide) {
      if (onSearchChange) onSearchChange(val);
    } else {
      setClientCurrentPage(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (serverSide) {
      if (onPageChange) onPageChange(newPage);
    } else {
      setClientCurrentPage(newPage);
    }
  };

  // Client-side calculations
  const filteredData = serverSide
    ? data
    : data.filter((item) => {
        if (!searchTerm) return true;
        if (searchField && item[searchField]) {
          return String(item[searchField]).toLowerCase().includes(searchTerm.toLowerCase());
        }
        return JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase());
      });

  const totalPages = serverSide ? (serverTotalPages || 1) : (Math.ceil(filteredData.length / itemsPerPage) || 1);
  const activePage = serverSide ? page : clientCurrentPage;
  const startIndex = (activePage - 1) * itemsPerPage;
  const currentItems = serverSide ? data : filteredData.slice(startIndex, startIndex + itemsPerPage);
  const totalDisplayCount = serverSide ? (serverTotalCount ?? data.length) : filteredData.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {title && <h3 className="text-base font-bold text-slate-800">{title}</h3>}

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto ml-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all bg-slate-50/50"
            />
          </div>

          <button
            type="button"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Lọc
          </button>

          {actionButton}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto no-scrollbar relative min-h-[160px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-600 bg-white px-4 py-2 rounded-xl shadow-md border border-slate-100">
              <span className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></span>
              Đang tải dữ liệu...
            </div>
          </div>
        )}
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {columns.map((col, idx) => (
                <th key={idx} className="py-3.5 px-4 sm:px-6" style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {currentItems.length > 0 ? (
              currentItems.map((row, index) => (
                <tr key={row.id || index} className="hover:bg-sky-50/30 transition-colors">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="py-4 px-4 sm:px-6 align-middle font-medium">
                      {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey] ?? '') : ''}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-slate-400 font-medium">
                  {isLoading ? 'Đang tải dữ liệu...' : 'Không tìm thấy dữ liệu phù hợp.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Hiển thị <span className="font-semibold text-slate-700">{totalDisplayCount > 0 ? startIndex + 1 : 0}</span> đến{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(startIndex + itemsPerPage, totalDisplayCount)}
          </span>{' '}
          trong <span className="font-semibold text-slate-700">{totalDisplayCount}</span> kết quả
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={activePage <= 1 || isLoading}
            onClick={() => handlePageChange(Math.max(activePage - 1, 1))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-semibold text-slate-700">
            {activePage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={activePage >= totalPages || isLoading}
            onClick={() => handlePageChange(Math.min(activePage + 1, totalPages))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

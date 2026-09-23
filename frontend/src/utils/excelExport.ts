import * as XLSX from 'xlsx';

/**
 * Xuất danh sách đối tượng JSON sang file Excel (.xlsx) chuẩn OpenXML
 * Tự động căn chỉnh độ rộng cột và đảm bảo 100% không lỗi font tiếng Việt khi mở trên Microsoft Excel/WPS.
 */
export function exportToExcel(
  data: Record<string, any>[],
  fileName: string,
  sheetName: string = 'Dữ liệu'
): void {
  if (!data || data.length === 0) {
    console.warn('Không có dữ liệu để xuất Excel');
    return;
  }

  // 1. Tạo Worksheet từ mảng JSON
  const ws = XLSX.utils.json_to_sheet(data);

  // 2. Tự động tính toán độ rộng tối ưu cho từng cột
  const headers = Object.keys(data[0] || {});
  const colWidths = headers.map((key) => {
    let maxLen = key.length;
    data.forEach((row) => {
      const val = row[key];
      if (val !== undefined && val !== null) {
        const strVal = String(val);
        // Với tiếng Việt tính toán chiều dài hiển thị
        if (strVal.length > maxLen) {
          maxLen = strVal.length;
        }
      }
    });
    return { wch: Math.min(Math.max(maxLen + 4, 14), 50) };
  });
  ws['!cols'] = colWidths;

  // 3. Tạo Workbook và xuất file
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const cleanFileName = `${fileName.replace(/\.xlsx$/i, '')}.xlsx`;
  XLSX.writeFile(wb, cleanFileName);
}

/**
 * Xuất bảng 2 chiều (Headers + Rows) sang file Excel (.xlsx)
 */
export function exportTableToExcel(
  headers: string[],
  rows: (string | number)[][],
  fileName: string,
  sheetName: string = 'Bảng phân ca'
): void {
  const aoa = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  const colWidths = headers.map((h, colIdx) => {
    let maxLen = h.length;
    rows.forEach((r) => {
      const cell = r[colIdx];
      if (cell !== undefined && cell !== null) {
        const len = String(cell).length;
        if (len > maxLen) maxLen = len;
      }
    });
    return { wch: Math.min(Math.max(maxLen + 4, 15), 45) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const cleanFileName = `${fileName.replace(/\.xlsx$/i, '')}.xlsx`;
  XLSX.writeFile(wb, cleanFileName);
}

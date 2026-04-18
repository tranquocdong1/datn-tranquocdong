import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import RobotoBase64 from '../assets/fonts/Roboto-Regular.b64.js';

const HEADERS = ['Ngày', 'Giờ', 'Thiết bị', 'Sự kiện', 'Chi tiết'];

const BADGE_LABEL = {
  access_granted:   'Cho phép',
  access_denied:    'Từ chối',
  uid_scanned:      'Quét thẻ',
  gas_detected:     'Phát hiện gas',
  intruder_alert:   'Xâm nhập',
  high_temperature: 'Nhiệt cao',
  rain_detected:    'Phát hiện mưa',
  dht_record:       'DHT record',
};

const formatRow = (log) => [
  new Date(log.createdAt).toLocaleDateString('vi-VN'),
  new Date(log.createdAt).toLocaleTimeString('vi-VN'),
  log.device ?? '—',
  BADGE_LABEL[log.event] ?? log.event,
  log.payload ? JSON.stringify(log.payload) : '—',
];

/* ─── CSV (không cần font) ────────────────────────────── */
export function exportCSV(logs, filename = 'logs.csv') {
  const rows = [HEADERS, ...logs.map(formatRow)];
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
}

/* ─── PDF (có font tiếng Việt) ────────────────────────── */
export function exportPDF(logs, filename = 'logs.pdf') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  // Nhúng font Roboto vào PDF
  doc.addFileToVFS('Roboto-Regular.ttf', RobotoBase64);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.setFont('Roboto');

  // Tiêu đề
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text('Lịch sử hoạt động', 40, 40);

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    `Xuất lúc: ${new Date().toLocaleString('vi-VN')}   •   Tổng: ${logs.length} bản ghi`,
    40, 58
  );

  autoTable(doc, {
    startY: 70,
    head: [HEADERS],
    body: logs.map(formatRow),
    styles: {
      font: 'Roboto',       // ← dùng font vừa nhúng
      fontSize: 8,
      cellPadding: 5,
      overflow: 'ellipsize',
    },
    headStyles: {
      font: 'Roboto',
      fillColor: [245, 158, 11],
      textColor: 255,
      fontStyle: 'normal',  // ← không dùng 'bold' vì chưa nhúng font bold
      halign: 'left',
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 110 },
      1: { cellWidth: 70 },
      2: { cellWidth: 100 },
      3: { cellWidth: 'auto' },
    },
    margin: { left: 40, right: 40 },
  });

  doc.save(filename);
}

/* ─── Helper ──────────────────────────────────────────── */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
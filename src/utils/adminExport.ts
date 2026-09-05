import * as XLSX from 'xlsx';
import { EnrollmentRecord } from '../types/enrollment';
import { flattenFormData } from './exportHelpers';

export function exportEnrollmentsToExcel(
  records: EnrollmentRecord[],
  filename = `merabetta_enrollments_${new Date().toISOString().split('T')[0]}.xlsx`
) {
  if (!records || records.length === 0) return;

  const rows = records.map((rec) => {
    const flat = rec.flatData || flattenFormData(rec.fullData, rec.referenceId);
    return {
      'Reference ID': rec.referenceId,
      Status: (rec.status || 'submitted').toUpperCase(),
      'Admin Notes': rec.adminNotes || '',
      'Reviewed By': rec.reviewedBy || '',
      'Reviewed At': rec.reviewedAt ? new Date(rec.reviewedAt).toLocaleString() : '',
      'Submitted At': rec.submittedAt ? new Date(rec.submittedAt).toLocaleString() : '',
      ...Object.fromEntries(Object.entries(flat).filter(([k]) => k !== 'Reference ID')),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

  // Auto-fit column widths
  const maxProps = Object.keys(rows[0] || {});
  worksheet['!cols'] = maxProps.map((key) => ({
    wch: Math.min(40, Math.max(12, key.length + 2)),
  }));

  XLSX.writeFile(workbook, filename);
}

/**
 * YASH ENTERPRISE - Data Export & Backup Utilities
 * Supports CSV export for records and JSON full database backup & restore
 */
import { formatDate, formatTime } from './calculations';

/**
 * Converts array of objects to CSV and triggers browser download
 */
export function downloadCSV(data, filename) {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + (row[header] ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Formats Weighbridge entries for clean CSV export
 */
export function exportWeighbridgeToCSV(entries) {
  const formatted = entries.map(e => ({
    'Slip Number': e.slipNumber,
    'Date': formatDate(e.date),
    'Time': formatTime(e.date),
    'Party Name': e.partyName,
    'Vehicle Number': e.vehicleNumber,
    'Material': e.materialName,
    'Bag Weight (KG)': e.bagWeightKg,
    'Quantity (Bags)': e.quantityBags,
    'Tons': e.tons,
    'Gross Weight (KG)': e.grossWeightKg,
    'Tare Weight (KG)': e.tareWeightKg,
    'Net Weight (KG)': e.netWeightKg,
    'Net Tons': (e.netWeightKg / 1000).toFixed(3),
    'Remarks': e.remarks || ''
  }));
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(formatted, `YASH_ENTERPRISE_Weighbridge_Records_${dateStr}.csv`);
}

/**
 * Formats Delivery Notes for CSV export
 */
export function exportDeliveryNotesToCSV(deliveryNotes) {
  const formatted = deliveryNotes.map(dn => ({
    'Delivery Note No': dn.deliveryNoteNumber,
    'Date': formatDate(dn.date),
    'Party Name': dn.partyName,
    'Vehicle Number': dn.vehicleNumber,
    'Driver Phone': dn.driverPhone || '',
    'Delivery Location': dn.deliveryLocation || '',
    'Freight': dn.freight || '',
    'Total Bags': dn.totalBags,
    'Total Tons': dn.totalTons,
    'Total Weight (KG)': dn.totalWeightKg,
    'Products Count': (dn.products || []).length,
    'Remarks': dn.remarks || ''
  }));
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(formatted, `YASH_ENTERPRISE_Delivery_Notes_${dateStr}.csv`);
}

/**
 * Exports full system backup JSON
 */
export function exportFullBackupJSON(databaseState) {
  const dataStr = JSON.stringify(databaseState, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `YASH_ENTERPRISE_System_Backup_${dateStr}.json`);
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Reads and parses an uploaded JSON backup file
 */
export function parseBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        // Validate core structure
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON format');
        }
        resolve(parsed);
      } catch (err) {
        reject(new Error('Failed to parse backup file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsText(file);
  });
}

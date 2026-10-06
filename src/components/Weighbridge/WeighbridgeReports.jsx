import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Calendar,
  Users,
  Truck,
  Boxes,
  Printer,
  Download,
  Share2,
  FileSpreadsheet,
  TrendingUp,
  Filter
} from 'lucide-react';
import { formatDate, formatKg, formatTons } from '../../utils/calculations';
import { downloadCSV } from '../../utils/exportImport';
import { generatePdfFromElement } from '../../utils/pdfGenerator';
import { shareDocument } from '../../utils/shareUtils';

export default function WeighbridgeReports() {
  const { weighbridgeEntries, settings, showToast } = useApp();
  const reportRef = useRef(null);

  const [activeReportType, setActiveReportType] = useState('monthly'); // 'monthly' | 'party' | 'vehicle' | 'material'

  // Monthly Report Pickers
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [2024, 2025, 2026, 2027, 2028];

  // --- 1. Monthly Wise Data ---
  const monthlyEntries = weighbridgeEntries.filter((e) => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const monthlyTotals = {
    entries: monthlyEntries.length,
    bags: monthlyEntries.reduce((acc, curr) => acc + (parseInt(curr.quantityBags, 10) || 0), 0),
    tons: monthlyEntries.reduce((acc, curr) => acc + (parseFloat(curr.tons) || 0), 0),
    grossKg: monthlyEntries.reduce((acc, curr) => acc + (parseFloat(curr.grossWeightKg) || 0), 0),
    tareKg: monthlyEntries.reduce((acc, curr) => acc + (parseFloat(curr.tareWeightKg) || 0), 0),
    netKg: monthlyEntries.reduce((acc, curr) => acc + (parseFloat(curr.netWeightKg) || 0), 0)
  };

  // --- 2. Party Wise Data ---
  const partyMap = {};
  weighbridgeEntries.forEach((e) => {
    const p = e.partyName || 'Unknown Party';
    if (!partyMap[p]) {
      partyMap[p] = { partyName: p, entries: 0, bags: 0, tons: 0, netKg: 0 };
    }
    partyMap[p].entries += 1;
    partyMap[p].bags += parseInt(e.quantityBags, 10) || 0;
    partyMap[p].tons += parseFloat(e.tons) || 0;
    partyMap[p].netKg += parseFloat(e.netWeightKg) || 0;
  });
  const partyReportList = Object.values(partyMap).sort((a, b) => b.tons - a.tons);

  // --- 3. Vehicle Wise Data ---
  const vehicleMap = {};
  weighbridgeEntries.forEach((e) => {
    const v = e.vehicleNumber || 'Unknown Vehicle';
    if (!vehicleMap[v]) {
      vehicleMap[v] = { vehicleNumber: v, trips: 0, bags: 0, tons: 0, netKg: 0 };
    }
    vehicleMap[v].trips += 1;
    vehicleMap[v].bags += parseInt(e.quantityBags, 10) || 0;
    vehicleMap[v].tons += parseFloat(e.tons) || 0;
    vehicleMap[v].netKg += parseFloat(e.netWeightKg) || 0;
  });
  const vehicleReportList = Object.values(vehicleMap).sort((a, b) => b.trips - a.trips);

  // --- 4. Material Wise Data ---
  const materialMap = {};
  weighbridgeEntries.forEach((e) => {
    const m = e.materialName || 'Other Material';
    if (!materialMap[m]) {
      materialMap[m] = { materialName: m, entries: 0, bags: 0, tons: 0, bagWeightKg: e.bagWeightKg };
    }
    materialMap[m].entries += 1;
    materialMap[m].bags += parseInt(e.quantityBags, 10) || 0;
    materialMap[m].tons += parseFloat(e.tons) || 0;
  });
  const materialReportList = Object.values(materialMap).sort((a, b) => b.tons - a.tons);

  // Export CSV Handler
  const handleExportCSV = () => {
    let dataToExport = [];
    let filename = '';

    if (activeReportType === 'monthly') {
      dataToExport = monthlyEntries.map((e) => ({
        'Slip No': e.slipNumber,
        'Date': formatDate(e.date),
        'Party': e.partyName,
        'Vehicle': e.vehicleNumber,
        'Material': e.materialName,
        'Bags': e.quantityBags,
        'Tons': e.tons,
        'Gross (KG)': e.grossWeightKg,
        'Tare (KG)': e.tareWeightKg,
        'Net (KG)': e.netWeightKg
      }));
      filename = `YASH_ENTERPRISE_Monthly_Report_${months[selectedMonth]}_${selectedYear}.csv`;
    } else if (activeReportType === 'party') {
      dataToExport = partyReportList.map((p) => ({
        'Party Name': p.partyName,
        'Total Entries': p.entries,
        'Total Bags': p.bags,
        'Total Tons': p.tons.toFixed(2),
        'Total Net Weight (KG)': p.netKg
      }));
      filename = `YASH_ENTERPRISE_Party_Report.csv`;
    } else if (activeReportType === 'vehicle') {
      dataToExport = vehicleReportList.map((v) => ({
        'Vehicle Number': v.vehicleNumber,
        'Total Trips': v.trips,
        'Total Bags': v.bags,
        'Total Tons': v.tons.toFixed(2),
        'Total Net Weight (KG)': v.netKg
      }));
      filename = `YASH_ENTERPRISE_Vehicle_Report.csv`;
    } else if (activeReportType === 'material') {
      dataToExport = materialReportList.map((m) => ({
        'Material': m.materialName,
        'Total Entries': m.entries,
        'Total Bags': m.bags,
        'Total Tons': m.tons.toFixed(2)
      }));
      filename = `YASH_ENTERPRISE_Material_Report.csv`;
    }

    if (dataToExport.length === 0) {
      showToast('No report data available to export.', 'info', 'Empty Report');
      return;
    }

    downloadCSV(dataToExport, filename);
    showToast('Report CSV exported successfully!', 'success', 'Exported');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    try {
      const filename = `YASH_ENTERPRISE_${activeReportType.toUpperCase()}_REPORT.pdf`;
      await generatePdfFromElement(reportRef.current, filename, 'a4', 'portrait');
      showToast('Report PDF downloaded successfully!', 'success', 'PDF Ready');
    } catch (err) {
      showToast('PDF generation failed: ' + err.message, 'error', 'Error');
    }
  };

  const handleShareReport = async () => {
    const text = `*YASH ENTERPRISE - ${activeReportType.toUpperCase()} REPORT*\nPeriod: ${months[selectedMonth]} ${selectedYear}\nTotal Entries: ${monthlyTotals.entries}\nTotal Dispatched: ${monthlyTotals.tons.toFixed(2)} Tons (${monthlyTotals.bags} Bags)\nNet Weight: ${formatKg(monthlyTotals.netKg)}`;
    await shareDocument(`YASH ENTERPRISE Report`, text);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Tab Controls */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 size={24} style={{ color: 'var(--primary)' }} />
              <span>Weighbridge Intelligence Reports</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Detailed analytical breakdowns by Month, Party, Vehicle, and Material
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
              <FileSpreadsheet size={15} />
              <span>CSV Export</span>
            </button>

            <button className="btn btn-secondary btn-sm" onClick={handleDownloadPdf}>
              <Download size={15} />
              <span>Download PDF</span>
            </button>

            <button className="btn btn-primary btn-sm" onClick={handlePrintReport}>
              <Printer size={15} />
              <span>Print Report</span>
            </button>

            <button className="btn btn-success btn-sm" onClick={handleShareReport}>
              <Share2 size={15} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Report Type Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeReportType === 'monthly' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveReportType('monthly')}
          >
            <Calendar size={15} />
            <span>Monthly-wise Report</span>
          </button>

          <button
            className={`btn ${activeReportType === 'party' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveReportType('party')}
          >
            <Users size={15} />
            <span>Party-wise Report</span>
          </button>

          <button
            className={`btn ${activeReportType === 'vehicle' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveReportType('vehicle')}
          >
            <Truck size={15} />
            <span>Vehicle-wise Report</span>
          </button>

          <button
            className={`btn ${activeReportType === 'material' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveReportType('material')}
          >
            <Boxes size={15} />
            <span>Material-wise Report</span>
          </button>
        </div>
      </div>

      {/* Report Document Canvas */}
      <div className="card" ref={reportRef} style={{ padding: '28px' }}>
        {/* Document Header */}
        <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.04em' }}>
              {settings.companyName || 'YASH ENTERPRISE'}
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {settings.address || 'Market Yard, Pune, Maharashtra'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Contact: {settings.phone} | GSTIN: {settings.gstin}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '4px 12px' }}>
              {activeReportType.toUpperCase()} REPORT
            </span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Generated on {formatDate(new Date().toISOString())}
            </div>
          </div>
        </div>

        {/* 1. MONTHLY WISE REPORT */}
        {activeReportType === 'monthly' && (
          <div>
            {/* Month & Year Filter Selection */}
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Select Month:</label>
                <select
                  className="form-select"
                  style={{ width: '160px', padding: '6px 10px' }}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                >
                  {months.map((m, idx) => (
                    <option key={idx} value={idx}>{m}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Select Year:</label>
                <select
                  className="form-select"
                  style={{ width: '120px', padding: '6px 10px' }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>
              Monthly Summary for {months[selectedMonth]} {selectedYear}
            </h3>

            {/* Metric KPI Cards for the selected month */}
            <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Entries</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{monthlyTotals.entries}</div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Bags</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{monthlyTotals.bags.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Tons</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{monthlyTotals.tons.toFixed(2)} T</div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Gross Weight</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{formatKg(monthlyTotals.grossKg)}</div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Tare Weight</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{formatKg(monthlyTotals.tareKg)}</div>
              </div>
              <div style={{ backgroundColor: '#ecfdf5', padding: '14px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '0.72rem', color: '#065f46', textTransform: 'uppercase', fontWeight: 700 }}>Net Weight</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#047857', fontFamily: 'var(--font-mono)' }}>{formatKg(monthlyTotals.netKg)}</div>
              </div>
            </div>

            {/* Table of Monthly Entries */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Slip No</th>
                    <th>Date</th>
                    <th>Party Name</th>
                    <th>Vehicle</th>
                    <th>Material</th>
                    <th style={{ textAlign: 'right' }}>Bags</th>
                    <th style={{ textAlign: 'right' }}>Tons</th>
                    <th style={{ textAlign: 'right' }}>Net (KG)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyEntries.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="table-empty-state">No entries recorded in {months[selectedMonth]} {selectedYear}.</td>
                    </tr>
                  ) : (
                    monthlyEntries.map((e) => (
                      <tr key={e.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{e.slipNumber}</td>
                        <td>{formatDate(e.date)}</td>
                        <td style={{ fontWeight: 600 }}>{e.partyName}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{e.vehicleNumber}</td>
                        <td>{e.materialName}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{e.quantityBags}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{e.tons} Ton</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669' }}>{formatKg(e.netWeightKg)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. PARTY WISE REPORT */}
        {activeReportType === 'party' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Party-Wise Consignment Summary</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Party Name</th>
                    <th style={{ textAlign: 'center' }}>Number of Entries</th>
                    <th style={{ textAlign: 'right' }}>Total Bags</th>
                    <th style={{ textAlign: 'right' }}>Total Tons</th>
                    <th style={{ textAlign: 'right' }}>Total Net Weight (KG)</th>
                  </tr>
                </thead>
                <tbody>
                  {partyReportList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="table-empty-state">No party records available.</td>
                    </tr>
                  ) : (
                    partyReportList.map((p, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.partyName}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{p.entries}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{p.bags.toLocaleString('en-IN')} Bags</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{p.tons.toFixed(2)} Ton</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>{formatKg(p.netKg)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. VEHICLE WISE REPORT */}
        {activeReportType === 'vehicle' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Vehicle-Wise Trips & Haulage Summary</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Vehicle Number</th>
                    <th style={{ textAlign: 'center' }}>Number of Trips</th>
                    <th style={{ textAlign: 'right' }}>Total Bags</th>
                    <th style={{ textAlign: 'right' }}>Total Tons</th>
                    <th style={{ textAlign: 'right' }}>Total Net Weight (KG)</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleReportList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="table-empty-state">No vehicle records available.</td>
                    </tr>
                  ) : (
                    vehicleReportList.map((v, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--primary)' }}>
                          {v.vehicleNumber}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{v.trips} Trips</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{v.bags.toLocaleString('en-IN')} Bags</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{v.tons.toFixed(2)} Ton</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>{formatKg(v.netKg)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. MATERIAL WISE REPORT */}
        {activeReportType === 'material' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Material-Wise Dispatch Distribution</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Material Description</th>
                    <th style={{ textAlign: 'center' }}>Configured Bag Weight</th>
                    <th style={{ textAlign: 'center' }}>Number of Entries</th>
                    <th style={{ textAlign: 'right' }}>Total Bags</th>
                    <th style={{ textAlign: 'right' }}>Total Dispatched Tons</th>
                  </tr>
                </thead>
                <tbody>
                  {materialReportList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="table-empty-state">No material records available.</td>
                    </tr>
                  ) : (
                    materialReportList.map((m, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.materialName}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-primary">{m.bagWeightKg || 40} KG / Bag</span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{m.entries}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{m.bags.toLocaleString('en-IN')} Bags</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
                          {m.tons.toFixed(2)} Ton
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

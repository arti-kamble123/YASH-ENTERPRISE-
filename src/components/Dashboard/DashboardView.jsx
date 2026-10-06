import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Scale,
  FileText,
  Weight,
  Boxes,
  Users,
  Truck,
  Plus,
  Eye,
  Printer,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import DashboardCharts from './DashboardCharts';
import { formatDate, formatTime, formatKg, formatTons } from '../../utils/calculations';

export default function DashboardView() {
  const {
    weighbridgeEntries,
    deliveryNotes,
    parties,
    vehicles,
    materials,
    setActiveTab,
    setViewingWbEntry,
    setViewingDn,
    setEditingWbId,
    setEditingDnId
  } = useApp();

  // Metric Computations
  const totalWbEntries = weighbridgeEntries.length;
  const totalDnCount = deliveryNotes.length;

  const totalWbTons = weighbridgeEntries.reduce((acc, curr) => acc + (parseFloat(curr.tons) || 0), 0);
  const totalWbBags = weighbridgeEntries.reduce((acc, curr) => acc + (parseInt(curr.quantityBags, 10) || 0), 0);

  const totalParties = parties.length;
  const totalVehicles = vehicles.length;

  // Current Month Stats
  const currentMonthDate = new Date();
  const currentMonth = currentMonthDate.getMonth();
  const currentYear = currentMonthDate.getFullYear();

  const currentMonthWbEntries = weighbridgeEntries.filter((entry) => {
    if (!entry.date) return false;
    const d = new Date(entry.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const currentMonthTons = currentMonthWbEntries.reduce((acc, curr) => acc + (parseFloat(curr.tons) || 0), 0);
  const currentMonthBags = currentMonthWbEntries.reduce((acc, curr) => acc + (parseInt(curr.quantityBags, 10) || 0), 0);
  const currentMonthNetKg = currentMonthWbEntries.reduce((acc, curr) => acc + (parseFloat(curr.netWeightKg) || 0), 0);

  // Recent 5 entries
  const recentWbEntries = weighbridgeEntries.slice(0, 5);
  const recentDeliveryNotes = deliveryNotes.slice(0, 5);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = monthNames[currentMonth];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards Grid */}
      <div className="metric-grid">
        {/* Total Weighbridge Entries */}
        <div className="stat-card" style={{ '--card-accent': '#2563eb' }}>
          <div className="stat-info">
            <p>Weighbridge Slips</p>
            <div className="stat-number">
              {totalWbEntries}
              <span className="stat-unit">Slips</span>
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Scale size={26} />
          </div>
        </div>

        {/* Total Delivery Notes */}
        <div className="stat-card" style={{ '--card-accent': '#10b981' }}>
          <div className="stat-info">
            <p>Delivery Notes</p>
            <div className="stat-number">
              {totalDnCount}
              <span className="stat-unit">Challans</span>
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <FileText size={26} />
          </div>
        </div>

        {/* Total Tons */}
        <div className="stat-card" style={{ '--card-accent': '#0284c7' }}>
          <div className="stat-info">
            <p>Total Weight Dispatched</p>
            <div className="stat-number">
              {totalWbTons.toFixed(2)}
              <span className="stat-unit">Tons</span>
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>
            <Weight size={26} />
          </div>
        </div>

        {/* Total Bags */}
        <div className="stat-card" style={{ '--card-accent': '#8b5cf6' }}>
          <div className="stat-info">
            <p>Total Bags Handled</p>
            <div className="stat-number">
              {totalWbBags.toLocaleString('en-IN')}
              <span className="stat-unit">Bags</span>
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
            <Boxes size={26} />
          </div>
        </div>

        {/* Total Parties */}
        <div className="stat-card" style={{ '--card-accent': '#f59e0b' }}>
          <div className="stat-info">
            <p>Active Parties</p>
            <div className="stat-number">
              {totalParties}
              <span className="stat-unit">Clients</span>
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
            <Users size={26} />
          </div>
        </div>

        {/* Total Vehicles */}
        <div className="stat-card" style={{ '--card-accent': '#ec4899' }}>
          <div className="stat-info">
            <p>Registered Vehicles</p>
            <div className="stat-number">
              {totalVehicles}
              <span className="stat-unit">Trucks</span>
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#fdf2f8', color: '#ec4899' }}>
            <Truck size={26} />
          </div>
        </div>
      </div>

      {/* Current Month Summary Banner & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Month Summary Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} style={{ color: '#60a5fa' }} />
              <h3 style={{ color: '#ffffff', fontSize: '1.15rem' }}>{currentMonthName} {currentYear} Summary</h3>
            </div>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
              Live Operational MTD
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: '0.72rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700 }}>Entries</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{currentMonthWbEntries.length}</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: '0.72rem', color: '#86efac', textTransform: 'uppercase', fontWeight: 700 }}>Bags</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{currentMonthBags.toLocaleString('en-IN')}</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: '0.72rem', color: '#fde047', textTransform: 'uppercase', fontWeight: 700 }}>Tons</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{currentMonthTons.toFixed(2)} T</div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '10px' }}>
            <span>Net Weighbridge Weight: <strong>{formatKg(currentMonthNetKg)}</strong></span>
            <button
              style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setActiveTab('wb-reports')}
            >
              <span>Full Report</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '14px' }}>
            <h3 className="card-title">
              <Sparkles size={18} style={{ color: 'var(--primary)' }} />
              <span>Quick Actions</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fast Operations</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            <button
              className="btn btn-primary"
              style={{ flexDirection: 'column', padding: '14px 10px', height: '80px', gap: '6px' }}
              onClick={() => { setEditingWbId(null); setActiveTab('wb-new'); }}
            >
              <Scale size={20} />
              <span style={{ fontSize: '0.78rem' }}>+ Weighbridge Slip</span>
            </button>

            <button
              className="btn btn-success"
              style={{ flexDirection: 'column', padding: '14px 10px', height: '80px', gap: '6px' }}
              onClick={() => { setEditingDnId(null); setActiveTab('dn-new'); }}
            >
              <FileText size={20} />
              <span style={{ fontSize: '0.78rem' }}>+ Delivery Note</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ flexDirection: 'column', padding: '14px 10px', height: '80px', gap: '6px' }}
              onClick={() => setActiveTab('masters-parties')}
            >
              <Users size={20} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.78rem' }}>+ Add Party</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ flexDirection: 'column', padding: '14px 10px', height: '80px', gap: '6px' }}
              onClick={() => setActiveTab('masters-vehicles')}
            >
              <Truck size={20} style={{ color: '#0284c7' }} />
              <span style={{ fontSize: '0.78rem' }}>+ Add Vehicle</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ flexDirection: 'column', padding: '14px 10px', height: '80px', gap: '6px' }}
              onClick={() => setActiveTab('masters-materials')}
            >
              <Boxes size={20} style={{ color: '#8b5cf6' }} />
              <span style={{ fontSize: '0.78rem' }}>+ Add Material</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ flexDirection: 'column', padding: '14px 10px', height: '80px', gap: '6px' }}
              onClick={() => setActiveTab('wb-reports')}
            >
              <TrendingUp size={20} style={{ color: '#059669' }} />
              <span style={{ fontSize: '0.78rem' }}>View Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <DashboardCharts
        weighbridgeEntries={weighbridgeEntries}
        deliveryNotes={deliveryNotes}
        materials={materials}
        parties={parties}
      />

      {/* Recent Activity Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
        {/* Recent Weighbridge Slips */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Scale size={18} style={{ color: 'var(--primary)' }} />
              <span>Recent Weighbridge Entries</span>
            </h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('wb-records')}
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Slip No</th>
                  <th>Party & Vehicle</th>
                  <th>Material</th>
                  <th>Net Weight</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentWbEntries.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="table-empty-state">No weighbridge slips created yet.</td>
                  </tr>
                ) : (
                  recentWbEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                          {entry.slipNumber}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {formatDate(entry.date)}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{entry.partyName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {entry.vehicleNumber}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{entry.materialName}</span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {entry.quantityBags} Bags ({entry.tons} Ton)
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-ton">
                          {formatKg(entry.netWeightKg)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm btn-icon-only"
                          title="View Official A5 Slip"
                          onClick={() => setViewingWbEntry(entry)}
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Delivery Notes */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FileText size={18} style={{ color: 'var(--success)' }} />
              <span>Recent Delivery Notes</span>
            </h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('dn-history')}
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>DN Number</th>
                  <th>Party & Location</th>
                  <th>Total Goods</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentDeliveryNotes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="table-empty-state">No delivery notes recorded yet.</td>
                  </tr>
                ) : (
                  recentDeliveryNotes.map((dn) => (
                    <tr key={dn.id}>
                      <td>
                        <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--success-text)' }}>
                          {dn.deliveryNoteNumber}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {formatDate(dn.date)}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{dn.partyName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {dn.deliveryLocation || dn.vehicleNumber}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-bag" style={{ marginRight: '6px' }}>
                          {dn.totalBags} Bags
                        </span>
                        <span className="badge badge-ton">
                          {dn.totalTons} Ton
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm btn-icon-only"
                          title="View Delivery Note"
                          onClick={() => setViewingDn(dn)}
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

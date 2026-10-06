import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Scale,
  FileText,
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { formatDate, formatKg, formatTons } from '../../utils/calculations';
import { exportWeighbridgeToCSV, exportDeliveryNotesToCSV } from '../../utils/exportImport';

export default function CombinedReports() {
  const { weighbridgeEntries, deliveryNotes, parties, materials, vehicles, settings } = useApp();

  const totalWbTons = weighbridgeEntries.reduce((acc, curr) => acc + (parseFloat(curr.tons) || 0), 0);
  const totalDnTons = deliveryNotes.reduce((acc, curr) => acc + (parseFloat(curr.totalTons) || 0), 0);
  const totalWbBags = weighbridgeEntries.reduce((acc, curr) => acc + (parseInt(curr.quantityBags, 10) || 0), 0);
  const totalDnBags = deliveryNotes.reduce((acc, curr) => acc + (parseInt(curr.totalBags, 10) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={24} style={{ color: 'var(--primary)' }} />
              <span>Consolidated Business Intelligence & Analytics</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Comprehensive operational overview of Weighbridge dispatches & Delivery Note shipments
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => exportWeighbridgeToCSV(weighbridgeEntries)}
            >
              <FileSpreadsheet size={15} />
              <span>Export All Slips CSV</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => exportDeliveryNotesToCSV(deliveryNotes)}
            >
              <FileSpreadsheet size={15} />
              <span>Export All DNs CSV</span>
            </button>

            <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
              <Printer size={15} />
              <span>Print Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Weighbridge Module Aggregate */}
        <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Scale size={20} style={{ color: 'var(--primary)' }} />
              <span>Weighbridge Slip Metrics</span>
            </h3>
            <span className="badge badge-primary">{weighbridgeEntries.length} Slips</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Net Weight</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>{totalWbTons.toFixed(2)} T</div>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Dispatched Bags</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{totalWbBags.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Average Dispatch Weight: <strong>{weighbridgeEntries.length > 0 ? (totalWbTons / weighbridgeEntries.length).toFixed(2) : 0} Tons / Slip</strong>
          </div>
        </div>

        {/* Delivery Note Module Aggregate */}
        <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
          <div className="card-header">
            <h3 className="card-title">
              <FileText size={20} style={{ color: 'var(--success)' }} />
              <span>Delivery Note Challan Metrics</span>
            </h3>
            <span className="badge badge-ton">{deliveryNotes.length} Challans</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Challan Tons</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>{totalDnTons.toFixed(2)} T</div>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Challan Bags</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{totalDnBags.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Average Consignment: <strong>{deliveryNotes.length > 0 ? (totalDnTons / deliveryNotes.length).toFixed(2) : 0} Tons / Challan</strong>
          </div>
        </div>
      </div>

      {/* Master Data Snapshot */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
            <span>Master Data Repository Status</span>
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Verified Parties</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{parties.length}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Active Commercial Clients</div>
          </div>

          <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Fleet Trucks</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{vehicles.length}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Registered Transport Vehicles</div>
          </div>

          <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Configured Materials</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{materials.length}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>With Stored Bag Weights</div>
          </div>
        </div>
      </div>
    </div>
  );
}

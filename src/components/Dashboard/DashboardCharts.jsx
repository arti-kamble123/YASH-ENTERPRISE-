import React from 'react';
import { formatTons, formatKg } from '../../utils/calculations';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function DashboardCharts({ weighbridgeEntries, deliveryNotes, materials, parties }) {
  // Aggregate data by Material
  const materialStats = {};
  weighbridgeEntries.forEach((entry) => {
    const mat = entry.materialName || 'Other';
    if (!materialStats[mat]) {
      materialStats[mat] = { tons: 0, bags: 0, entries: 0 };
    }
    materialStats[mat].tons += parseFloat(entry.tons) || 0;
    materialStats[mat].bags += parseInt(entry.quantityBags, 10) || 0;
    materialStats[mat].entries += 1;
  });

  const materialList = Object.entries(materialStats)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.tons - a.tons);

  const totalMatTons = materialList.reduce((acc, curr) => acc + curr.tons, 0) || 1;

  // Aggregate by Party
  const partyStats = {};
  weighbridgeEntries.forEach((entry) => {
    const pty = entry.partyName || 'Unknown Party';
    if (!partyStats[pty]) {
      partyStats[pty] = { tons: 0, bags: 0, entries: 0 };
    }
    partyStats[pty].tons += parseFloat(entry.tons) || 0;
    partyStats[pty].bags += parseInt(entry.quantityBags, 10) || 0;
    partyStats[pty].entries += 1;
  });

  const partyList = Object.entries(partyStats)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.tons - a.tons)
    .slice(0, 5);

  const maxPartyTons = partyList.length > 0 ? Math.max(...partyList.map((p) => p.tons)) : 1;

  // Monthly summary aggregation (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = {};

  // initialize current year months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    monthlyData[key] = { monthKey: key, wbTons: 0, dnTons: 0 };
  }

  weighbridgeEntries.forEach((entry) => {
    if (!entry.date) return;
    const d = new Date(entry.date);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (monthlyData[key]) {
      monthlyData[key].wbTons += parseFloat(entry.tons) || 0;
    }
  });

  deliveryNotes.forEach((dn) => {
    if (!dn.date) return;
    const d = new Date(dn.date);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (monthlyData[key]) {
      monthlyData[key].dnTons += parseFloat(dn.totalTons) || 0;
    }
  });

  const monthlyList = Object.values(monthlyData);
  const maxMonthlyTons = Math.max(...monthlyList.map((m) => Math.max(m.wbTons, m.dnTons)), 10);

  const colors = ['#2563eb', '#059669', '#d97706', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
      {/* Monthly Trend Bar Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
            <span>Monthly Dispatch Volume (Tons)</span>
          </h3>
          <span className="badge badge-primary">Recent 6 Months</span>
        </div>

        <div style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '170px', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            {monthlyList.map((m, idx) => {
              const wbHeightPct = Math.min(100, Math.round((m.wbTons / maxMonthlyTons) * 100)) || 4;
              const dnHeightPct = Math.min(100, Math.round((m.dnTons / maxMonthlyTons) * 100)) || 4;

              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', justifyContent: 'center', height: '100%' }}>
                    {/* Weighbridge Bar */}
                    <div
                      title={`Weighbridge: ${m.wbTons.toFixed(1)} Tons`}
                      style={{
                        width: '45%',
                        height: `${wbHeightPct}%`,
                        backgroundColor: '#2563eb',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.4s ease',
                        position: 'relative'
                      }}
                    />
                    {/* Delivery Note Bar */}
                    <div
                      title={`Delivery Notes: ${m.dnTons.toFixed(1)} Tons`}
                      style={{
                        width: '45%',
                        height: `${dnHeightPct}%`,
                        backgroundColor: '#10b981',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.4s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    {m.monthKey.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '14px', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#2563eb', borderRadius: '3px' }} />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Weighbridge Slips</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '3px' }} />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Delivery Notes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Parties by Volume */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <BarChart3 size={18} style={{ color: 'var(--success)' }} />
            <span>Top Parties by Volume</span>
          </h3>
          <span className="badge badge-ton">Ranked by Tons</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '220px', justifyContent: 'center' }}>
          {partyList.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem' }}>No party dispatch data recorded yet.</p>
          ) : (
            partyList.map((party, idx) => {
              const pct = Math.min(100, Math.round((party.tons / maxPartyTons) * 100));
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{party.name}</span>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                      {party.tons.toFixed(2)} Ton <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({party.bags} Bags)</span>
                    </span>
                  </div>
                  <div style={{ height: '8px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: colors[idx % colors.length],
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Material Breakdown */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <PieChart size={18} style={{ color: 'var(--accent)' }} />
            <span>Material Distribution</span>
          </h3>
          <span className="badge badge-primary">{materialList.length} Materials</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '220px', justifyContent: 'center' }}>
          {materialList.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem' }}>No material movements registered.</p>
          ) : (
            materialList.slice(0, 5).map((mat, idx) => {
              const sharePct = Math.round((mat.tons / totalMatTons) * 100);
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors[idx % colors.length] }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{mat.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {mat.tons.toFixed(1)} T
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px', fontWeight: 600 }}>
                      ({sharePct}%)
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

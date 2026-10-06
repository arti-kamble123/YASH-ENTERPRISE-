import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Scale,
  Plus,
  Search,
  Filter,
  X,
  Eye,
  Edit,
  Trash2,
  Printer,
  Download,
  Share2,
  FileSpreadsheet,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { formatDate, formatTime, formatKg, formatTons } from '../../utils/calculations';
import { exportWeighbridgeToCSV } from '../../utils/exportImport';
import ConfirmModal from '../ConfirmModal';

export default function WeighbridgeRecords() {
  const {
    weighbridgeEntries,
    parties,
    vehicles,
    materials,
    setActiveTab,
    setViewingWbEntry,
    setEditingWbId,
    deleteWeighbridgeEntry
  } = useApp();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParty, setSelectedParty] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Delete modal state
  const [deletingId, setDeletingId] = useState(null);

  // Sorting
  const [sortField, setSortField] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter logic
  const filteredEntries = useMemo(() => {
    return weighbridgeEntries.filter((entry) => {
      // Global Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSlip = entry.slipNumber?.toLowerCase().includes(q);
        const matchParty = entry.partyName?.toLowerCase().includes(q);
        const matchVeh = entry.vehicleNumber?.toLowerCase().includes(q);
        const matchMat = entry.materialName?.toLowerCase().includes(q);
        const matchRemarks = entry.remarks?.toLowerCase().includes(q);
        if (!matchSlip && !matchParty && !matchVeh && !matchMat && !matchRemarks) {
          return false;
        }
      }

      // Party Filter
      if (selectedParty && entry.partyName !== selectedParty) {
        return false;
      }

      // Vehicle Filter
      if (selectedVehicle && entry.vehicleNumber !== selectedVehicle) {
        return false;
      }

      // Material Filter
      if (selectedMaterial && entry.materialName !== selectedMaterial) {
        return false;
      }

      // Date Range Filter
      if (startDate) {
        const entryDate = entry.date ? entry.date.split('T')[0] : '';
        if (entryDate < startDate) return false;
      }

      if (endDate) {
        const entryDate = entry.date ? entry.date.split('T')[0] : '';
        if (entryDate > endDate) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'netWeightKg' || sortField === 'tons' || sortField === 'quantityBags') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [weighbridgeEntries, searchQuery, selectedParty, selectedVehicle, selectedMaterial, startDate, endDate, sortField, sortAsc]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedParty('');
    setSelectedVehicle('');
    setSelectedMaterial('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = searchQuery || selectedParty || selectedVehicle || selectedMaterial || startDate || endDate;

  const handleEdit = (id) => {
    setEditingWbId(id);
    setActiveTab('wb-new');
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteWeighbridgeEntry(deletingId);
      setDeletingId(null);
    }
  };

  // Aggregates of filtered records
  const totalFilteredBags = filteredEntries.reduce((acc, curr) => acc + (parseInt(curr.quantityBags, 10) || 0), 0);
  const totalFilteredTons = filteredEntries.reduce((acc, curr) => acc + (parseFloat(curr.tons) || 0), 0);
  const totalFilteredNetKg = filteredEntries.reduce((acc, curr) => acc + (parseFloat(curr.netWeightKg) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Scale size={22} style={{ color: 'var(--primary)' }} />
              <span>Weighbridge Slip Records</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {filteredEntries.length} of {weighbridgeEntries.length} total recorded slips
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => exportWeighbridgeToCSV(filteredEntries)}
              title="Download filtered records as CSV Excel"
            >
              <FileSpreadsheet size={16} />
              <span>Export CSV</span>
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingWbId(null);
                setActiveTab('wb-new');
              }}
            >
              <Plus size={16} />
              <span>+ New Weighbridge Entry</span>
            </button>
          </div>
        </div>

        {/* Multi-filter Bar */}
        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="filters-grid">
            {/* Search Input */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Search Anything</label>
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search Slip, Party, Vehicle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Party Filter */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Filter by Party</label>
              <select
                className="form-select"
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
              >
                <option value="">All Parties</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.partyName}>{p.partyName}</option>
                ))}
              </select>
            </div>

            {/* Vehicle Filter */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Filter by Vehicle</label>
              <select
                className="form-select"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
              >
                <option value="">All Vehicles</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.vehicleNumber}>{v.vehicleNumber}</option>
                ))}
              </select>
            </div>

            {/* Material Filter */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Filter by Material</label>
              <select
                className="form-select"
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
              >
                <option value="">All Materials</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.materialName}>{m.materialName}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>From Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>To Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Active filters applied. Showing matching records.
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={clearFilters}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                <X size={14} />
                <span>Clear All Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Chips of Current Filter View */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem', display: 'flex', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Filtered Slips:</span>
          <strong>{filteredEntries.length}</strong>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem', display: 'flex', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Total Bags:</span>
          <strong>{totalFilteredBags.toLocaleString('en-IN')} Bags</strong>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem', display: 'flex', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Total Tons:</span>
          <strong style={{ color: 'var(--primary)' }}>{totalFilteredTons.toFixed(2)} Ton</strong>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem', display: 'flex', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Total Net Weight:</span>
          <strong style={{ color: '#059669' }}>{formatKg(totalFilteredNetKg)}</strong>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th onClick={() => { setSortField('slipNumber'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>
                Slip No
              </th>
              <th onClick={() => { setSortField('date'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>
                Date & Time
              </th>
              <th onClick={() => { setSortField('partyName'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>
                Party Name
              </th>
              <th>Vehicle</th>
              <th>Material</th>
              <th style={{ textAlign: 'right' }}>Quantity</th>
              <th style={{ textAlign: 'right' }}>Tons</th>
              <th style={{ textAlign: 'right' }}>Gross / Tare</th>
              <th style={{ textAlign: 'right' }}>Net Weight</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan="10" className="table-empty-state">
                  <Scale size={32} />
                  <p>No weighbridge records found matching your filters.</p>
                  {hasActiveFilters && (
                    <button className="btn btn-secondary btn-sm" onClick={clearFilters} style={{ marginTop: '8px' }}>
                      Clear Filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                      {entry.slipNumber}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{formatDate(entry.date)}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatTime(entry.date)}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{entry.partyName}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', backgroundColor: '#f1f5f9', padding: '3px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {entry.vehicleNumber}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{entry.materialName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{entry.bagWeightKg} KG / Bag</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {entry.quantityBags} Bags
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="badge badge-ton">
                      {formatTons(entry.tons)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                    <div>G: {formatKg(entry.grossWeightKg)}</div>
                    <div style={{ color: 'var(--text-muted)' }}>T: {formatKg(entry.tareWeightKg)}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)', fontSize: '0.92rem' }}>
                      {formatKg(entry.netWeightKg)}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                      {(entry.netWeightKg / 1000).toFixed(2)} Ton
                    </div>
                  </td>
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm btn-icon-only"
                        title="View Official A5 Slip"
                        onClick={() => setViewingWbEntry(entry)}
                        style={{ color: 'var(--primary)' }}
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        className="btn btn-secondary btn-sm btn-icon-only"
                        title="Edit Entry"
                        onClick={() => handleEdit(entry.id)}
                      >
                        <Edit size={15} />
                      </button>

                      <button
                        className="btn btn-secondary btn-sm btn-icon-only"
                        title="Delete Record"
                        onClick={() => setDeletingId(entry.id)}
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Weighbridge Slip"
        message="Are you sure you want to delete this weighbridge entry? This action will permanently remove the record from your system."
        confirmText="Yes, Delete Slip"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

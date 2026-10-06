import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
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
  Layers
} from 'lucide-react';
import { formatDate, formatKg, formatTons } from '../../utils/calculations';
import { exportDeliveryNotesToCSV } from '../../utils/exportImport';
import ConfirmModal from '../ConfirmModal';

export default function DeliveryNoteHistory() {
  const {
    deliveryNotes,
    parties,
    vehicles,
    materials,
    setActiveTab,
    setViewingDn,
    setEditingDnId,
    deleteDeliveryNote
  } = useApp();

  // Filters State
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

  // Filter Logic
  const filteredNotes = useMemo(() => {
    return deliveryNotes.filter((dn) => {
      // Global Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDn = dn.deliveryNoteNumber?.toLowerCase().includes(q);
        const matchParty = dn.partyName?.toLowerCase().includes(q);
        const matchVeh = dn.vehicleNumber?.toLowerCase().includes(q);
        const matchLoc = dn.deliveryLocation?.toLowerCase().includes(q);
        const matchItems = (dn.products || []).some((p) => p.particular?.toLowerCase().includes(q));
        if (!matchDn && !matchParty && !matchVeh && !matchLoc && !matchItems) {
          return false;
        }
      }

      // Party Filter
      if (selectedParty && dn.partyName !== selectedParty) {
        return false;
      }

      // Vehicle Filter
      if (selectedVehicle && dn.vehicleNumber !== selectedVehicle) {
        return false;
      }

      // Material Filter (search in items)
      if (selectedMaterial) {
        const hasMat = (dn.products || []).some(
          (p) => p.particular?.toLowerCase() === selectedMaterial.toLowerCase()
        );
        if (!hasMat) return false;
      }

      // Date Range Filter
      if (startDate && dn.date < startDate) return false;
      if (endDate && dn.date > endDate) return false;

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'totalBags' || sortField === 'totalTons' || sortField === 'totalWeightKg') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [deliveryNotes, searchQuery, selectedParty, selectedVehicle, selectedMaterial, startDate, endDate, sortField, sortAsc]);

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
    setEditingDnId(id);
    setActiveTab('dn-new');
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteDeliveryNote(deletingId);
      setDeletingId(null);
    }
  };

  // Aggregates of filtered notes
  const totalFilteredBags = filteredNotes.reduce((acc, curr) => acc + (parseInt(curr.totalBags, 10) || 0), 0);
  const totalFilteredTons = filteredNotes.reduce((acc, curr) => acc + (parseFloat(curr.totalTons) || 0), 0);
  const totalFilteredWeightKg = filteredNotes.reduce((acc, curr) => acc + (parseFloat(curr.totalWeightKg) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={22} style={{ color: 'var(--success)' }} />
              <span>Delivery Note History</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {filteredNotes.length} of {deliveryNotes.length} total recorded delivery notes
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => exportDeliveryNotesToCSV(filteredNotes)}
              title="Download filtered notes as CSV Excel"
            >
              <FileSpreadsheet size={16} />
              <span>Export CSV</span>
            </button>

            <button
              className="btn btn-success btn-sm"
              onClick={() => {
                setEditingDnId(null);
                setActiveTab('dn-new');
              }}
            >
              <Plus size={16} />
              <span>+ New Delivery Note</span>
            </button>
          </div>
        </div>

        {/* Multi-filter Bar */}
        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="filters-grid">
            {/* Search Input */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Search Notes</label>
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search DN No, Party, Item..."
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

            {/* Date Range */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>From Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

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
                Active filters applied.
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={clearFilters}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                <X size={14} />
                <span>Clear Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Chips */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem', display: 'flex', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Filtered Challans:</span>
          <strong>{filteredNotes.length}</strong>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem', display: 'flex', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Total Bags:</span>
          <strong>{totalFilteredBags.toLocaleString('en-IN')} Bags</strong>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem', display: 'flex', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Total Tons:</span>
          <strong style={{ color: '#059669' }}>{totalFilteredTons.toFixed(2)} Ton</strong>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem', display: 'flex', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Total Weight:</span>
          <strong>{formatKg(totalFilteredWeightKg)}</strong>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th onClick={() => { setSortField('deliveryNoteNumber'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>
                DN Number
              </th>
              <th onClick={() => { setSortField('date'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>
                Date
              </th>
              <th onClick={() => { setSortField('partyName'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>
                Consignee Party
              </th>
              <th>Vehicle & Driver</th>
              <th>Items Summary</th>
              <th style={{ textAlign: 'right' }}>Total Bags</th>
              <th style={{ textAlign: 'right' }}>Total Tons</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotes.length === 0 ? (
              <tr>
                <td colSpan="8" className="table-empty-state">
                  <FileText size={32} />
                  <p>No delivery notes found matching your filters.</p>
                </td>
              </tr>
            ) : (
              filteredNotes.map((dn) => (
                <tr key={dn.id}>
                  <td>
                    <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--success-text)' }}>
                      {dn.deliveryNoteNumber}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{formatDate(dn.date)}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{dn.partyName}</div>
                    {dn.deliveryLocation && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dn.deliveryLocation}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', backgroundColor: '#f1f5f9', padding: '3px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {dn.vehicleNumber}
                    </span>
                    {dn.driverPhone && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dn.driverPhone}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {(dn.products || []).map((p) => p.particular).filter(Boolean).join(', ') || 'General Goods'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {(dn.products || []).length} Product Line(s)
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {dn.totalBags} Bags
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="badge badge-ton">
                      {formatTons(dn.totalTons)}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm btn-icon-only"
                        title="View Delivery Note Challan"
                        onClick={() => setViewingDn(dn)}
                        style={{ color: 'var(--success)' }}
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        className="btn btn-secondary btn-sm btn-icon-only"
                        title="Edit Delivery Note"
                        onClick={() => handleEdit(dn.id)}
                      >
                        <Edit size={15} />
                      </button>

                      <button
                        className="btn btn-secondary btn-sm btn-icon-only"
                        title="Delete Delivery Note"
                        onClick={() => setDeletingId(dn.id)}
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
        title="Delete Delivery Note"
        message="Are you sure you want to delete this delivery note? This record will be permanently removed."
        confirmText="Yes, Delete Note"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

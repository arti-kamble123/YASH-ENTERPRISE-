import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  X,
  Save,
  FileSpreadsheet,
  Building
} from 'lucide-react';
import ConfirmModal from '../ConfirmModal';
import { downloadCSV } from '../../utils/exportImport';

export default function PartyMaster() {
  const { parties, addParty, updateParty, deleteParty, weighbridgeEntries, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    partyName: '',
    contactNumber: '',
    address: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  // Filter parties
  const filteredParties = useMemo(() => {
    return parties.filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.partyName?.toLowerCase().includes(q) ||
        p.contactNumber?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q)
      );
    });
  }, [parties, searchQuery]);

  // Compute party stats from actual weighbridge entries
  const getPartyStats = (partyName) => {
    const matched = weighbridgeEntries.filter(
      (e) => e.partyName?.toLowerCase() === partyName?.toLowerCase()
    );
    const trips = matched.length;
    const tons = matched.reduce((acc, curr) => acc + (parseFloat(curr.tons) || 0), 0);
    const bags = matched.reduce((acc, curr) => acc + (parseInt(curr.quantityBags, 10) || 0), 0);
    return { trips, tons, bags };
  };

  const handleOpenAdd = () => {
    setEditingParty(null);
    setFormData({
      partyName: '',
      contactNumber: '',
      address: '',
      status: 'Active'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (party) => {
    setEditingParty(party);
    setFormData({
      partyName: party.partyName || '',
      contactNumber: party.contactNumber || '',
      address: party.address || '',
      status: party.status || 'Active'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const err = {};
    if (!formData.partyName || !formData.partyName.trim()) {
      err.partyName = 'Party Name is required';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingParty) {
      updateParty({ ...editingParty, ...formData });
    } else {
      addParty(formData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteParty(deletingId);
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    const data = filteredParties.map((p) => {
      const stats = getPartyStats(p.partyName);
      return {
        'Party Name': p.partyName,
        'Contact Number': p.contactNumber || '',
        'Address': p.address || '',
        'Status': p.status,
        'Total Slips': stats.trips,
        'Total Tons Dispatched': stats.tons.toFixed(2),
        'Total Bags': stats.bags
      };
    });
    downloadCSV(data, 'YASH_ENTERPRISE_Parties_Master.csv');
    showToast('Parties master exported to CSV!', 'success', 'Exported');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={22} style={{ color: 'var(--primary)' }} />
              <span>Party Master Directory</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Manage clients and consignees. Parties automatically appear across all Weighbridge & Delivery Note forms.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
              <FileSpreadsheet size={16} />
              <span>Export CSV</span>
            </button>

            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={16} />
              <span>+ Add New Party</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', maxWidth: '400px' }}>
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by party name, phone, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Parties Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Party Name</th>
              <th>Contact Number</th>
              <th>Address / Location</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Total Movements</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredParties.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty-state">
                  <Users size={32} />
                  <p>No parties found.</p>
                </td>
              </tr>
            ) : (
              filteredParties.map((party) => {
                const stats = getPartyStats(party.partyName);
                return (
                  <tr key={party.id}>
                    <td>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {party.partyName}
                      </div>
                    </td>
                    <td>
                      {party.contactNumber ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                          <Phone size={14} style={{ color: 'var(--primary)' }} />
                          <span>{party.contactNumber}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Not specified</span>
                      )}
                    </td>
                    <td>
                      {party.address ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          <MapPin size={14} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                          <span>{party.address}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${party.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                        {party.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                        {stats.tons.toFixed(1)} Ton
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {stats.trips} Slips • {stats.bags.toLocaleString('en-IN')} Bags
                      </div>
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm btn-icon-only"
                          title="Edit Party"
                          onClick={() => handleOpenEdit(party)}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm btn-icon-only"
                          title="Delete Party"
                          onClick={() => setDeletingId(party.id)}
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Party Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-container"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                <Building size={20} style={{ color: 'var(--primary)' }} />
                <span>{editingParty ? 'Edit Party Details' : 'Add New Party'}</span>
              </h3>
              <button
                className="menu-toggle-btn"
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">
                      <span>Party Name <span className="required-star">*</span></span>
                    </label>
                    <input
                      type="text"
                      className={`form-input ${errors.partyName ? 'input-error' : ''}`}
                      placeholder="e.g. Shree Ram Traders"
                      value={formData.partyName}
                      onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                      required
                    />
                    {errors.partyName && <span className="form-error-msg">{errors.partyName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Contact / Phone Number</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. +91 98221 55443"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Address / Delivery Location</span>
                    </label>
                    <textarea
                      className="form-textarea"
                      rows="2"
                      placeholder="e.g. Shop 12, APMC Market Yard, Kolhapur"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Status</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  <span>{editingParty ? 'Update Party' : 'Save Party'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Party"
        message="Are you sure you want to delete this party? Existing slips referencing this party name will retain their records."
        confirmText="Yes, Delete Party"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

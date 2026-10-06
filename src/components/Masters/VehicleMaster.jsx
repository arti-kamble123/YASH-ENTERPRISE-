import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  User,
  X,
  Save,
  FileSpreadsheet
} from 'lucide-react';
import ConfirmModal from '../ConfirmModal';
import { downloadCSV } from '../../utils/exportImport';

export default function VehicleMaster() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, weighbridgeEntries, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.vehicleNumber?.toLowerCase().includes(q) ||
        v.driverName?.toLowerCase().includes(q) ||
        v.driverPhone?.toLowerCase().includes(q)
      );
    });
  }, [vehicles, searchQuery]);

  // Compute vehicle trips & tonnage
  const getVehicleStats = (vehicleNumber) => {
    const matched = weighbridgeEntries.filter(
      (e) => e.vehicleNumber?.toUpperCase() === vehicleNumber?.toUpperCase()
    );
    const trips = matched.length;
    const tons = matched.reduce((acc, curr) => acc + (parseFloat(curr.tons) || 0), 0);
    const bags = matched.reduce((acc, curr) => acc + (parseInt(curr.quantityBags, 10) || 0), 0);
    return { trips, tons, bags };
  };

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({
      vehicleNumber: '',
      driverName: '',
      driverPhone: '',
      status: 'Active'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (veh) => {
    setEditingVehicle(veh);
    setFormData({
      vehicleNumber: veh.vehicleNumber || '',
      driverName: veh.driverName || '',
      driverPhone: veh.driverPhone || '',
      status: veh.status || 'Active'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const err = {};
    if (!formData.vehicleNumber || !formData.vehicleNumber.trim()) {
      err.vehicleNumber = 'Vehicle Number is required';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingVehicle) {
      updateVehicle({ ...editingVehicle, ...formData });
    } else {
      addVehicle(formData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteVehicle(deletingId);
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    const data = filteredVehicles.map((v) => {
      const stats = getVehicleStats(v.vehicleNumber);
      return {
        'Vehicle Number': v.vehicleNumber,
        'Driver Name': v.driverName || '',
        'Driver Phone': v.driverPhone || '',
        'Status': v.status,
        'Total Trips': stats.trips,
        'Total Tons Hauled': stats.tons.toFixed(2),
        'Total Bags': stats.bags
      };
    });
    downloadCSV(data, 'YASH_ENTERPRISE_Vehicles_Master.csv');
    showToast('Vehicle master exported to CSV!', 'success', 'Exported');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Truck size={22} style={{ color: '#0284c7' }} />
              <span>Vehicle Master Registry</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Manage registered trucks and drivers. Vehicles automatically appear in Weighbridge & Delivery Note dropdowns.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
              <FileSpreadsheet size={16} />
              <span>Export CSV</span>
            </button>

            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={16} />
              <span>+ Add New Vehicle</span>
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
              placeholder="Search vehicle number, driver, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Vehicle Number</th>
              <th>Assigned Driver</th>
              <th>Driver Phone</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Haulage Stats</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty-state">
                  <Truck size={32} />
                  <p>No vehicles registered.</p>
                </td>
              </tr>
            ) : (
              filteredVehicles.map((veh) => {
                const stats = getVehicleStats(veh.vehicleNumber);
                return (
                  <tr key={veh.id}>
                    <td>
                      <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--primary)' }}>
                        {veh.vehicleNumber}
                      </span>
                    </td>
                    <td>
                      {veh.driverName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                          <User size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{veh.driverName}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      {veh.driverPhone ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                          <Phone size={14} style={{ color: 'var(--primary)' }} />
                          <span>{veh.driverPhone}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${veh.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                        {veh.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                        {stats.tons.toFixed(1)} Ton
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {stats.trips} Trips • {stats.bags.toLocaleString('en-IN')} Bags
                      </div>
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm btn-icon-only"
                          title="Edit Vehicle"
                          onClick={() => handleOpenEdit(veh)}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm btn-icon-only"
                          title="Delete Vehicle"
                          onClick={() => setDeletingId(veh.id)}
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

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-container"
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                <Truck size={20} style={{ color: 'var(--primary)' }} />
                <span>{editingVehicle ? 'Edit Vehicle Info' : 'Register New Vehicle'}</span>
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
                      <span>Vehicle / Truck Number <span className="required-star">*</span></span>
                    </label>
                    <input
                      type="text"
                      className={`form-input ${errors.vehicleNumber ? 'input-error' : ''}`}
                      placeholder="e.g. MH-12-RN-4589"
                      style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                      required
                    />
                    {errors.vehicleNumber && <span className="form-error-msg">{errors.vehicleNumber}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Driver Name</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Ramesh Pawar"
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Driver Phone</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. +91 98220 77112"
                      value={formData.driverPhone}
                      onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
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
                  <span>{editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle record?"
        confirmText="Yes, Delete Vehicle"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

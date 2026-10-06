import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Plus,
  Search,
  Edit,
  Trash2,
  Scale,
  Sparkles,
  Info,
  X,
  Save,
  FileSpreadsheet
} from 'lucide-react';
import ConfirmModal from '../ConfirmModal';
import { downloadCSV } from '../../utils/exportImport';

export default function MaterialMaster() {
  const { materials, addMaterial, updateMaterial, deleteMaterial, weighbridgeEntries, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    materialName: '',
    bagWeightKg: 40,
    unit: 'Bags',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.materialName?.toLowerCase().includes(q) ||
        String(m.bagWeightKg).includes(q)
      );
    });
  }, [materials, searchQuery]);

  // Compute Material stats
  const getMaterialStats = (materialName) => {
    const matched = weighbridgeEntries.filter(
      (e) => e.materialName?.toLowerCase() === materialName?.toLowerCase()
    );
    const count = matched.length;
    const tons = matched.reduce((acc, curr) => acc + (parseFloat(curr.tons) || 0), 0);
    const bags = matched.reduce((acc, curr) => acc + (parseInt(curr.quantityBags, 10) || 0), 0);
    return { count, tons, bags };
  };

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormData({
      materialName: '',
      bagWeightKg: 40,
      unit: 'Bags',
      status: 'Active'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mat) => {
    setEditingMaterial(mat);
    setFormData({
      materialName: mat.materialName || '',
      bagWeightKg: mat.bagWeightKg || 40,
      unit: mat.unit || 'Bags',
      status: mat.status || 'Active'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const err = {};
    if (!formData.materialName || !formData.materialName.trim()) {
      err.materialName = 'Material Name is required';
    }
    const weight = parseFloat(formData.bagWeightKg);
    if (!weight || weight <= 0) {
      err.bagWeightKg = 'Valid Bag Weight (greater than 0 KG) is required';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingMaterial) {
      updateMaterial({ ...editingMaterial, ...formData });
    } else {
      addMaterial(formData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteMaterial(deletingId);
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    const data = filteredMaterials.map((m) => {
      const stats = getMaterialStats(m.materialName);
      return {
        'Material Name': m.materialName,
        'Bag Weight (KG)': m.bagWeightKg,
        'Unit': m.unit || 'Bags',
        'Status': m.status,
        'Total Slips': stats.count,
        'Total Bags': stats.bags,
        'Total Dispatched (Tons)': stats.tons.toFixed(2)
      };
    });
    downloadCSV(data, 'YASH_ENTERPRISE_Materials_Master.csv');
    showToast('Materials master exported to CSV!', 'success', 'Exported');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Boxes size={22} style={{ color: '#8b5cf6' }} />
              <span>Material & Bag Weight Master</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Configure product catalog and actual bag weights. The configured bag weight directly powers automatic Bags ↔ Tons dynamic conversions.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
              <FileSpreadsheet size={16} />
              <span>Export CSV</span>
            </button>

            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={16} />
              <span>+ Add New Material</span>
            </button>
          </div>
        </div>

        {/* Calculation Rule Banner */}
        <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#1e3a8a' }}>
          <Info size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Automatic Bag Conversion Engine:</strong> Each material stores its real bag weight (e.g. 40 KG, 50 KG, 25 KG, 20 KG, 22.5 KG). When calculating Weighbridge or Delivery Notes, <code>Tons = (Bags × BagWeightKG) ÷ 1000</code> and <code>Bags = (Tons × 1000) ÷ BagWeightKG</code>.
          </span>
        </div>

        {/* Search Bar */}
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', maxWidth: '400px' }}>
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="Search material by name or weight..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Material Description</th>
              <th style={{ textAlign: 'center' }}>Configured Bag Weight</th>
              <th>Unit</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Total Movements</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty-state">
                  <Boxes size={32} />
                  <p>No materials configured.</p>
                </td>
              </tr>
            ) : (
              filteredMaterials.map((mat) => {
                const stats = getMaterialStats(mat.materialName);
                return (
                  <tr key={mat.id}>
                    <td>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {mat.materialName}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                        {mat.bagWeightKg} KG / Bag
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{mat.unit || 'Bags'}</span>
                    </td>
                    <td>
                      <span className={`badge ${mat.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                        {mat.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                        {stats.tons.toFixed(1)} Ton
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {stats.count} Slips • {stats.bags.toLocaleString('en-IN')} Bags
                      </div>
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm btn-icon-only"
                          title="Edit Material"
                          onClick={() => handleOpenEdit(mat)}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm btn-icon-only"
                          title="Delete Material"
                          onClick={() => setDeletingId(mat.id)}
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

      {/* Add / Edit Material Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-container"
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                <Boxes size={20} style={{ color: '#8b5cf6' }} />
                <span>{editingMaterial ? 'Edit Material Config' : 'Add New Material'}</span>
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
                      <span>Material Name <span className="required-star">*</span></span>
                    </label>
                    <input
                      type="text"
                      className={`form-input ${errors.materialName ? 'input-error' : ''}`}
                      placeholder="e.g. RAJLAXMI 40 KG WHITE"
                      value={formData.materialName}
                      onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                      required
                    />
                    {errors.materialName && <span className="form-error-msg">{errors.materialName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Bag Weight in KG <span className="required-star">*</span></span>
                      <span className="form-label-hint">Used for 2-way conversion</span>
                    </label>
                    <div className="input-with-badge">
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        className={`form-input ${errors.bagWeightKg ? 'input-error' : ''}`}
                        placeholder="e.g. 40, 50, 25, 20, 22.5"
                        value={formData.bagWeightKg}
                        onChange={(e) => setFormData({ ...formData, bagWeightKg: e.target.value })}
                        required
                      />
                      <span className="input-tag">KG / Bag</span>
                    </div>
                    {errors.bagWeightKg && <span className="form-error-msg">{errors.bagWeightKg}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Unit of Measurement</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Bags"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
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
                  <span>{editingMaterial ? 'Update Material' : 'Save Material'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Material"
        message="Are you sure you want to delete this material configuration?"
        confirmText="Yes, Delete Material"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

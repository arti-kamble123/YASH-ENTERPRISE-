import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building2,
  Database,
  Download,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { exportFullBackupJSON, parseBackupFile } from '../../utils/exportImport';
import ConfirmModal from '../ConfirmModal';

export default function SettingsView() {
  const {
    settings,
    updateSettings,
    restoreDatabase,
    resetToSampleData,
    getDatabaseSnapshot,
    showToast
  } = useApp();

  const [formData, setFormData] = useState({ ...settings });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleDownloadBackup = () => {
    const snapshot = getDatabaseSnapshot();
    exportFullBackupJSON(snapshot);
    showToast('Full system backup downloaded successfully!', 'success', 'Backup Saved');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await parseBackupFile(file);
      const success = restoreDatabase(parsedData);
      if (success) {
        setFormData(parsedData.settings || settings);
      }
    } catch (err) {
      showToast('Error reading backup file: ' + err.message, 'error', 'Restore Failed');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Company Profile Settings */}
      <div className="card">
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 size={22} style={{ color: 'var(--primary)' }} />
              <span>Company Information & Document Branding</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Configure your business details. These appear on all printed A5 Weighbridge Slips, Delivery Notes, and Reports.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} style={{ marginTop: '20px' }}>
          <div className="form-grid">
            <div className="col-6 form-group">
              <label className="form-label">
                <span>Company Name <span className="required-star">*</span></span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                required
              />
            </div>

            <div className="col-6 form-group">
              <label className="form-label">
                <span>Business Tagline / Subtitle</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Wholesale Material & Transport Suppliers"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
              />
            </div>

            <div className="col-12 form-group">
              <label className="form-label">
                <span>Office / Yard Address</span>
              </label>
              <textarea
                className="form-textarea"
                rows="2"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            <div className="col-6 form-group">
              <label className="form-label">
                <span>Contact Phone Numbers</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            <div className="col-6 form-group">
              <label className="form-label">
                <span>Email Address</span>
              </label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>

            <div className="col-6 form-group">
              <label className="form-label">
                <span>GSTIN / Tax Registration No.</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
              />
            </div>

            <div className="col-3 form-group">
              <label className="form-label">
                <span>Slip Prefix</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="WB-2026-"
                value={formData.weighbridgePrefix}
                onChange={(e) => handleChange('weighbridgePrefix', e.target.value)}
              />
            </div>

            <div className="col-3 form-group">
              <label className="form-label">
                <span>DN Prefix</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="DN-2026-"
                value={formData.deliveryNotePrefix}
                onChange={(e) => handleChange('deliveryNotePrefix', e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Save Company Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Database Backup & Data Protection */}
      <div className="card">
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Database size={22} style={{ color: 'var(--accent)' }} />
              <span>Database Backup & Restore</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Export complete system snapshots including masters, slips, and delivery notes. Restore at any time.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '20px' }}>
          {/* Export JSON */}
          <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Full System Backup (JSON)
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Download an offline backup containing all Parties, Vehicles, Materials, Weighbridge Slips, and Delivery Notes.
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadBackup}
              style={{ marginTop: '16px' }}
            >
              <Download size={15} />
              <span>Download Backup JSON</span>
            </button>
          </div>

          {/* Restore JSON */}
          <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Restore from Backup
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Upload a previously saved YASH ENTERPRISE JSON file to restore all master and transaction data.
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                style={{ marginTop: '16px', width: '100%' }}
              >
                <Upload size={15} />
                <span>Upload & Restore Backup</span>
              </button>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div style={{ backgroundColor: '#fef2f2', padding: '18px', borderRadius: '10px', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--danger)', marginBottom: '6px' }}>
                Reset to Sample Data
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#7f1d1d' }}>
                Reset the database to default sample records for YASH ENTERPRISE demonstrations.
              </p>
            </div>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setIsResetConfirmOpen(true)}
              style={{ marginTop: '16px' }}
            >
              <RotateCcw size={15} />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset System to Sample Data"
        message="Are you sure you want to reset all records to the original sample dataset? All custom created slips and master data will be cleared."
        confirmText="Yes, Reset Database"
        onConfirm={() => {
          resetToSampleData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}

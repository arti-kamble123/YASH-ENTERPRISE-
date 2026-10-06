import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action? This cannot be undone.',
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  confirmBtnClass = 'btn-danger',
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-container"
        style={{ maxWidth: '460px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={22} />
            <span>{title}</span>
          </h3>
          <button
            className="menu-toggle-btn"
            onClick={onCancel}
            style={{ border: 'none', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          <p>{message}</p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn ${confirmBtnClass}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

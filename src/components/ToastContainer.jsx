import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container no-print">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'error':
              return <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />;
            case 'warning':
              return <AlertTriangle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />;
            case 'info':
              return <Info size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />;
            case 'success':
            default:
              return <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />;
          }
        };

        return (
          <div key={toast.id} className={`toast-item toast-${toast.type || 'success'}`}>
            {getIcon()}
            <div className="toast-content">
              {toast.title && <h4>{toast.title}</h4>}
              <p>{toast.message}</p>
            </div>
            <button
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

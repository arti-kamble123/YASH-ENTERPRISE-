import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import DeliveryNoteTemplate from './DeliveryNoteTemplate';
import { generatePdfFromElement } from '../../utils/pdfGenerator';
import { formatDeliveryNoteWhatsAppText, shareViaWhatsApp, shareDocument, copyToClipboard } from '../../utils/shareUtils';
import { Printer, Download, MessageCircle, Copy, X, Check, Eye } from 'lucide-react';

export default function DeliveryNoteModal() {
  const { viewingDn, setViewingDn, settings, showToast } = useApp();
  const printRef = useRef(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!viewingDn) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsPdfLoading(true);
    try {
      const filename = `${viewingDn.deliveryNoteNumber}_YASH_ENTERPRISE.pdf`;
      await generatePdfFromElement(printRef.current, filename, 'a4', 'portrait');
      showToast('Delivery Note PDF downloaded!', 'success', 'PDF Saved');
    } catch (err) {
      showToast('Failed to generate PDF: ' + err.message, 'error', 'Error');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const text = formatDeliveryNoteWhatsAppText(viewingDn, settings);
    shareViaWhatsApp(text, viewingDn.driverPhone);
  };

  const handleCopy = async () => {
    const text = formatDeliveryNoteWhatsAppText(viewingDn, settings);
    await copyToClipboard(text);
    setIsCopied(true);
    showToast('Delivery Note summary copied!', 'info', 'Copied');
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="modal-backdrop" onClick={() => setViewingDn(null)}>
      <div
        className="modal-container modal-container-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '860px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Eye size={20} style={{ color: 'var(--success)' }} />
            <h3>Delivery Note – {viewingDn.deliveryNoteNumber}</h3>
          </div>
          <button
            className="menu-toggle-btn"
            onClick={() => setViewingDn(null)}
            style={{ border: 'none', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#f1f5f9',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Standard Commercial Delivery Challan (A4 Format)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print Challan</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadPdf}
              disabled={isPdfLoading}
            >
              <Download size={15} />
              <span>{isPdfLoading ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button className="btn btn-success btn-sm" onClick={handleWhatsApp}>
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </button>

            <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
              {isCopied ? <Check size={15} style={{ color: '#10b981' }} /> : <Copy size={15} />}
              <span>{isCopied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ backgroundColor: '#e2e8f0', padding: '24px 16px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '800px', boxShadow: 'var(--shadow-lg)' }}>
            <DeliveryNoteTemplate deliveryNote={viewingDn} company={settings} innerRef={printRef} />
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Consignee: {viewingDn.partyName} | Date: {viewingDn.date}
          </div>
          <button className="btn btn-secondary" onClick={() => setViewingDn(null)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

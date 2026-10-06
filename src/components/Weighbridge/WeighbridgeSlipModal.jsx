import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import A5SlipTemplate from './A5SlipTemplate';
import { generatePdfFromElement, triggerNativePrint } from '../../utils/pdfGenerator';
import { formatWeighbridgeWhatsAppText, shareViaWhatsApp, shareDocument, copyToClipboard } from '../../utils/shareUtils';
import { Printer, Download, Share2, MessageCircle, Copy, X, Check, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WeighbridgeSlipModal() {
  const { viewingWbEntry, setViewingWbEntry, settings, showToast } = useApp();
  const printRef = useRef(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!viewingWbEntry) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsPdfLoading(true);
    try {
      const filename = `${viewingWbEntry.slipNumber}_YASH_ENTERPRISE.pdf`;
      await generatePdfFromElement(printRef.current, filename, 'a5', 'portrait');
      showToast('PDF downloaded successfully!', 'success', 'PDF Ready');
    } catch (err) {
      showToast('PDF generation failed: ' + err.message, 'error', 'Error');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const text = formatWeighbridgeWhatsAppText(viewingWbEntry, settings);
    shareViaWhatsApp(text);
  };

  const handleCopyText = async () => {
    const text = formatWeighbridgeWhatsAppText(viewingWbEntry, settings);
    await copyToClipboard(text);
    setIsCopied(true);
    showToast('Slip details copied to clipboard!', 'info', 'Copied');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleShare = async () => {
    const text = formatWeighbridgeWhatsAppText(viewingWbEntry, settings);
    const res = await shareDocument(`YASH ENTERPRISE Slip ${viewingWbEntry.slipNumber}`, text);
    if (res.success && res.method === 'clipboard') {
      showToast('Details copied to clipboard for sharing!', 'info', 'Ready to Paste');
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setViewingWbEntry(null)}>
      <div
        className="modal-container modal-container-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Eye size={20} style={{ color: 'var(--primary)' }} />
            <h3>A5 Weighbridge Slip – {viewingWbEntry.slipNumber}</h3>
          </div>
          <button
            className="menu-toggle-btn"
            onClick={() => setViewingWbEntry(null)}
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
            Official A5 Print Format (148mm × 210mm)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print A5</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadPdf}
              disabled={isPdfLoading}
            >
              <Download size={15} />
              <span>{isPdfLoading ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              className="btn btn-success btn-sm"
              onClick={handleWhatsApp}
              title="Share on WhatsApp"
            >
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCopyText}
              title="Copy slip details"
            >
              {isCopied ? <Check size={15} style={{ color: '#10b981' }} /> : <Copy size={15} />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ backgroundColor: '#e2e8f0', padding: '24px 16px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '580px', boxShadow: 'var(--shadow-lg)' }}>
            <A5SlipTemplate entry={viewingWbEntry} company={settings} innerRef={printRef} />
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Created on {new Date(viewingWbEntry.createdAt || viewingWbEntry.date).toLocaleString()}
          </div>
          <button className="btn btn-secondary" onClick={() => setViewingWbEntry(null)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

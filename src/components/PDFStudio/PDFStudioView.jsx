import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import A5SlipTemplate from '../Weighbridge/A5SlipTemplate';
import DeliveryNoteTemplate from '../DeliveryNotes/DeliveryNoteTemplate';
import { generatePdfFromElement, triggerNativePrint } from '../../utils/pdfGenerator';
import { formatWeighbridgeWhatsAppText, formatDeliveryNoteWhatsAppText, shareViaWhatsApp, copyToClipboard } from '../../utils/shareUtils';
import {
  FileText,
  Scale,
  Printer,
  Download,
  Share2,
  MessageCircle,
  Eye,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  Copy,
  Sparkles,
  Layers,
  Palette,
  ShieldCheck,
  QrCode,
  Stamp
} from 'lucide-react';

export default function PDFStudioView() {
  const { weighbridgeEntries, deliveryNotes, settings, showToast } = useApp();
  const documentRef = useRef(null);

  // Document Type & Selection
  const [docType, setDocType] = useState('weighbridge'); // 'weighbridge' | 'delivery-note'
  const [selectedWbId, setSelectedWbId] = useState(weighbridgeEntries[0]?.id || '');
  const [selectedDnId, setSelectedDnId] = useState(deliveryNotes[0]?.id || '');

  // Customization Controls
  const [theme, setTheme] = useState('classic'); // 'classic' | 'corporate' | 'stamp' | 'compact'
  const [showStamp, setShowStamp] = useState(true);
  const [showQr, setShowQr] = useState(true);
  const [showTerms, setShowTerms] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100); // 75, 90, 100, 110, 125
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Active Record
  const currentWbEntry = weighbridgeEntries.find((e) => e.id === selectedWbId) || weighbridgeEntries[0] || {
    id: 'demo-wb',
    slipNumber: 'WB-2026-0001',
    date: new Date().toISOString(),
    partyName: 'Shree Ram Traders',
    vehicleNumber: 'MH-12-RN-4589',
    materialName: 'RAJLAXMI 40 KG WHITE',
    bagWeightKg: 40,
    quantityBags: 500,
    quantityUnit: 'Bags',
    tons: 20.0,
    grossWeightKg: 26500,
    tareWeightKg: 6500,
    netWeightKg: 20000,
    remarks: 'Electronic weight verified and accurate.'
  };

  const currentDeliveryNote = deliveryNotes.find((d) => d.id === selectedDnId) || deliveryNotes[0] || {
    id: 'demo-dn',
    deliveryNoteNumber: 'DN-2026-0001',
    date: new Date().toISOString().split('T')[0],
    partyName: 'Shree Ram Traders',
    vehicleNumber: 'MH-12-RN-4589',
    driverPhone: '+91 98220 77112',
    freight: 'Paid',
    deliveryLocation: 'APMC Godown #4, Kolhapur',
    products: [
      {
        particular: 'RAJLAXMI 40 KG WHITE',
        bagWeightKg: 40,
        quantityBags: 500,
        tons: 20.0,
        totalWeightKg: 20000
      }
    ],
    totalBags: 500,
    totalTons: 20.0,
    totalWeightKg: 20000,
    remarks: 'Received in good condition.'
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!documentRef.current) return;
    setIsPdfLoading(true);
    try {
      const isWb = docType === 'weighbridge';
      const filename = isWb
        ? `${currentWbEntry.slipNumber}_YASH_ENTERPRISE_A5.pdf`
        : `${currentDeliveryNote.deliveryNoteNumber}_YASH_ENTERPRISE_DN.pdf`;
      const format = isWb ? 'a5' : 'a4';

      await generatePdfFromElement(documentRef.current, filename, format, 'portrait');
      showToast('Crisp PDF downloaded successfully!', 'success', 'PDF Ready');
    } catch (err) {
      showToast('PDF generation failed: ' + err.message, 'error', 'Error');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (docType === 'weighbridge') {
      const text = formatWeighbridgeWhatsAppText(currentWbEntry, settings);
      shareViaWhatsApp(text);
    } else {
      const text = formatDeliveryNoteWhatsAppText(currentDeliveryNote, settings);
      shareViaWhatsApp(text, currentDeliveryNote.driverPhone);
    }
  };

  const handleCopyText = async () => {
    const text =
      docType === 'weighbridge'
        ? formatWeighbridgeWhatsAppText(currentWbEntry, settings)
        : formatDeliveryNoteWhatsAppText(currentDeliveryNote, settings);
    await copyToClipboard(text);
    setIsCopied(true);
    showToast('Document details copied to clipboard!', 'info', 'Copied');
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={24} style={{ color: 'var(--primary)' }} />
              <span>PDF Design Studio & Live Document Preview</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Interactive live PDF designer. Customize themes, official verification stamps, QR codes, and export crisp documents.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleCopyText}>
              {isCopied ? <Check size={15} style={{ color: '#10b981' }} /> : <Copy size={15} />}
              <span>{isCopied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button className="btn btn-success btn-sm" onClick={handleWhatsApp}>
              <MessageCircle size={15} />
              <span>WhatsApp Share</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadPdf}
              disabled={isPdfLoading}
            >
              <Download size={15} />
              <span>{isPdfLoading ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print Document</span>
            </button>
          </div>
        </div>

        {/* Document Type Switcher */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className={`btn ${docType === 'weighbridge' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setDocType('weighbridge')}
          >
            <Scale size={16} />
            <span>A5 Weighbridge Slip Designer</span>
          </button>

          <button
            className={`btn ${docType === 'delivery-note' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setDocType('delivery-note')}
          >
            <FileText size={16} />
            <span>A4 Delivery Note / Challan Designer</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Controls Sidebar + Live Canvas */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Controls Panel */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Document Customizer</h3>
          </div>

          {/* Record Selector */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem' }}>
              <span>Select Record to Preview</span>
            </label>
            {docType === 'weighbridge' ? (
              <select
                className="form-select"
                value={selectedWbId}
                onChange={(e) => setSelectedWbId(e.target.value)}
              >
                {weighbridgeEntries.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.slipNumber} - {e.partyName} ({e.tons}T)
                  </option>
                ))}
              </select>
            ) : (
              <select
                className="form-select"
                value={selectedDnId}
                onChange={(e) => setSelectedDnId(e.target.value)}
              >
                {deliveryNotes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.deliveryNoteNumber} - {d.partyName} ({d.totalTons}T)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Theme Selector */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Palette size={14} />
                <span>Visual Layout Theme</span>
              </span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: theme === 'classic' ? '#eff6ff' : '#f8fafc',
                  border: theme === 'classic' ? '1.5px solid #2563eb' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <input
                  type="radio"
                  name="theme"
                  checked={theme === 'classic'}
                  onChange={() => setTheme('classic')}
                />
                <span>Classical Double-Border (Official)</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: theme === 'corporate' ? '#eff6ff' : '#f8fafc',
                  border: theme === 'corporate' ? '1.5px solid #2563eb' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <input
                  type="radio"
                  name="theme"
                  checked={theme === 'corporate'}
                  onChange={() => setTheme('corporate')}
                />
                <span>Modern Corporate Steel Blue</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: theme === 'stamp' ? '#eff6ff' : '#f8fafc',
                  border: theme === 'stamp' ? '1.5px solid #2563eb' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <input
                  type="radio"
                  name="theme"
                  checked={theme === 'stamp'}
                  onChange={() => setTheme('stamp')}
                />
                <span>Certified Seal & Stamp Edition</span>
              </label>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="form-group" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '8px' }}>
              <span>Security & Display Elements</span>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showStamp}
                  onChange={(e) => setShowStamp(e.target.checked)}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Stamp size={14} style={{ color: '#0284c7' }} />
                  <span>Show Official Verification Stamp</span>
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showQr}
                  onChange={(e) => setShowQr(e.target.checked)}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <QrCode size={14} style={{ color: '#059669' }} />
                  <span>Show Electronic QR Code</span>
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showTerms}
                  onChange={(e) => setShowTerms(e.target.checked)}
                />
                <span>Show Terms & Declarations Footer</span>
              </label>
            </div>
          </div>

          {/* Zoom Controller */}
          <div className="form-group" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Live Zoom Level</label>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{zoomLevel}%</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setZoomLevel(Math.max(60, zoomLevel - 10))}
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>

              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, fontSize: '0.75rem' }}
                onClick={() => setZoomLevel(100)}
              >
                100% Fit
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setZoomLevel(Math.min(140, zoomLevel + 10))}
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Live Canvas Canvas */}
        <div
          style={{
            backgroundColor: '#cbd5e1',
            borderRadius: '12px',
            padding: '30px 20px',
            minHeight: '650px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflowX: 'auto',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          {/* Document Sheet Canvas */}
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.25)',
              backgroundColor: '#ffffff',
              borderRadius: '2px',
              maxWidth: docType === 'weighbridge' ? '580px' : '780px',
              width: '100%'
            }}
          >
            {docType === 'weighbridge' ? (
              <A5SlipTemplate
                entry={currentWbEntry}
                company={settings}
                innerRef={documentRef}
                theme={theme}
                showStamp={showStamp}
                showQr={showQr}
                showTerms={showTerms}
              />
            ) : (
              <DeliveryNoteTemplate
                deliveryNote={currentDeliveryNote}
                company={settings}
                innerRef={documentRef}
                theme={theme}
                showStamp={showStamp}
                showQr={showQr}
                showTerms={showTerms}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

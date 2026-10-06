import React from 'react';
import { formatDate, formatKg, formatTons } from '../../utils/calculations';

export default function DeliveryNoteTemplate({
  deliveryNote,
  company,
  innerRef,
  theme = 'classic', // 'classic' | 'corporate' | 'modern'
  showStamp = true,
  showQr = true,
  showTerms = true
}) {
  if (!deliveryNote) return null;

  const comp = company || {
    companyName: 'YASH ENTERPRISE',
    address: 'Plot No. 42, Industrial Area, Phase-II, Market Yard, Pune - 411037, Maharashtra',
    phone: '+91 98765 43210 / +91 94220 11223',
    email: 'contact@yashenterprise.in',
    gstin: '27ABCDE1234F1Z5'
  };

  const products = deliveryNote.products || [];
  const isCorporate = theme === 'corporate';

  return (
    <div
      className={`dn-document-wrapper theme-${theme}`}
      ref={innerRef}
      style={{
        border: isCorporate ? '2px solid #1e3a8a' : '1.5px solid #0f172a',
        backgroundColor: '#ffffff',
        position: 'relative'
      }}
    >
      {/* Top Header Grid */}
      <div
        className="dn-header-grid"
        style={{
          borderColor: isCorporate ? '#1e3a8a' : '#0f172a'
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          {/* Optional Verification QR */}
          {showQr && (
            <div
              style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                flexShrink: 0
              }}
              title="Delivery Challan Verification QR"
            >
              <svg viewBox="0 0 33 33" width="48" height="48" fill="#0f172a">
                <path d="M0 0h11v11H0zm2 2v7h7V2zm20-2h11v11H22zm2 2v7h7V2zM0 22h11v11H0zm2 2v7h7v-7zm13-24h3v3h-3zm0 4h3v5h-3zm4 0h3v2h-3zm-4 7h7v3h-7zm11 0h3v5h-3zm-7 4h3v3h-3zm4 0h3v7h-3zm4 0h3v3h-3zm-8 4h3v3h-3zm8 0h3v3h-3zm-4 4h7v3h-7zm-8 0h3v3h-3zm-4-4h3v7H9v-4H6v-3h3z" />
              </svg>
            </div>
          )}

          <div>
            <h1
              className="dn-company-title"
              style={{
                color: isCorporate ? '#1e3a8a' : '#0f172a'
              }}
            >
              {comp.companyName || 'YASH ENTERPRISE'}
            </h1>
            <p className="dn-company-address">{comp.address}</p>
            <p className="dn-company-address" style={{ marginTop: '2px' }}>
              Phone: {comp.phone} | Email: {comp.email}
            </p>
            {comp.gstin && (
              <p className="dn-company-address" style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                GSTIN: {comp.gstin}
              </p>
            )}
          </div>
        </div>

        <div className="dn-meta-badge-box">
          <div
            className="dn-doc-title"
            style={{
              backgroundColor: isCorporate ? '#1e3a8a' : '#0f172a'
            }}
          >
            DELIVERY NOTE
          </div>
          <div className="dn-meta-details">
            <div>
              <strong>DN No.:</strong>{' '}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#1e3a8a' }}>
                {deliveryNote.deliveryNoteNumber}
              </span>
            </div>
            <div>
              <strong>Date:</strong> {formatDate(deliveryNote.date)}
            </div>
          </div>
        </div>
      </div>

      {/* Party & Transport Details Grid */}
      <div className="dn-party-grid">
        <div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
            Consignee / Party Details:
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            {deliveryNote.partyName}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '4px' }}>
            <strong>Delivery Destination:</strong> {deliveryNote.deliveryLocation || 'As per delivery order'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
            Transport & Dispatch Details:
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            Vehicle: {deliveryNote.vehicleNumber}
          </div>
          {deliveryNote.driverPhone && (
            <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '2px' }}>
              Driver Contact: {deliveryNote.driverPhone}
            </div>
          )}
          <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '2px' }}>
            Freight Terms: <strong>{deliveryNote.freight || 'Standard / Paid'}</strong>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <table className="dn-table">
        <thead>
          <tr style={{ backgroundColor: isCorporate ? '#1e3a8a' : '#0f172a' }}>
            <th style={{ width: '6%', textAlign: 'center' }}>S.N.</th>
            <th style={{ width: '40%' }}>Description of Goods / Particulars</th>
            <th style={{ width: '12%', textAlign: 'center' }}>Bag Wt</th>
            <th style={{ width: '14%', textAlign: 'right' }}>Quantity</th>
            <th style={{ width: '14%', textAlign: 'right' }}>Weight (KG)</th>
            <th style={{ width: '14%', textAlign: 'right' }}>Tons</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                No product items listed.
              </td>
            </tr>
          ) : (
            products.map((item, idx) => (
              <tr key={idx}>
                <td style={{ textAlign: 'center', fontWeight: 700 }}>{idx + 1}</td>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.particular}</div>
                  {item.remarks && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Note: {item.remarks}</div>
                  )}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.bagWeightKg || 40} KG</td>
                <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {item.quantityBags} Bags
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {formatKg(item.totalWeightKg)}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#1e3a8a' }}>
                  {formatTons(item.tons)}
                </td>
              </tr>
            ))
          )}

          {/* Grand Totals Row */}
          <tr className="dn-table-total-row">
            <td colSpan="3" style={{ textAlign: 'right', fontSize: '0.9rem' }}>
              GRAND TOTAL:
            </td>
            <td style={{ textAlign: 'right', fontSize: '0.95rem', fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
              {deliveryNote.totalBags} Bags
            </td>
            <td style={{ textAlign: 'right', fontSize: '0.95rem', fontFamily: 'var(--font-mono)' }}>
              {formatKg(deliveryNote.totalWeightKg)}
            </td>
            <td style={{ textAlign: 'right', fontSize: '1rem', fontFamily: 'var(--font-mono)', color: '#059669' }}>
              {formatTons(deliveryNote.totalTons)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Remarks Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginTop: '14px', fontSize: '0.78rem' }}>
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '4px' }}>
          <strong>Special Instructions / Remarks:</strong>
          <p style={{ marginTop: '4px', color: '#334155' }}>
            {deliveryNote.remarks || 'Goods dispatched in satisfactory sealed packaging. Please verify goods upon receipt.'}
          </p>
        </div>

        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '4px' }}>
          <strong>Terms & Declarations:</strong>
          <p style={{ marginTop: '4px', color: '#64748b', fontSize: '0.72rem' }}>
            Goods received in sound order. Weighbridge tare/gross verified. Subject to Pune jurisdiction.
          </p>
        </div>
      </div>

      {/* Official Stamp Overlay (optional) */}
      {showStamp && (
        <div
          style={{
            position: 'absolute',
            right: '36px',
            bottom: '75px',
            width: '110px',
            height: '110px',
            border: '2.5px dashed #059669',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669',
            transform: 'rotate(-8deg)',
            opacity: 0.8,
            pointerEvents: 'none',
            padding: '4px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '0.52rem', fontWeight: 900, letterSpacing: '0.08em' }}>YASH ENTERPRISE</div>
          <div style={{ fontSize: '0.62rem', fontWeight: 900, borderTop: '1px solid #059669', borderBottom: '1px solid #059669', margin: '2px 0', padding: '1px 3px' }}>
            DISPATCHED
          </div>
          <div style={{ fontSize: '0.5rem', fontWeight: 800 }}>★ AUTHORIZED ★</div>
          <div style={{ fontSize: '0.45rem', fontWeight: 700 }}>SEAL & SIGN</div>
        </div>
      )}

      {/* Signature Section */}
      <div className="dn-signature-grid">
        <div>
          <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '6px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Prepared By</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Dispatch Operator</div>
          </div>
        </div>

        <div>
          <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '6px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Driver Signature</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Transport Carrier</div>
          </div>
        </div>

        <div>
          <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '6px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Receiver's Stamp & Sign</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>For {deliveryNote.partyName}</div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '24px', fontSize: '0.75rem', color: '#334155', fontWeight: 700 }}>
        For {comp.companyName || 'YASH ENTERPRISE'} (Authorized Signatory)
      </div>
    </div>
  );
}

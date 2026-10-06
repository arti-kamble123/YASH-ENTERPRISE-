import React from 'react';
import { formatDate, formatTime, formatKg, formatTons } from '../../utils/calculations';

export default function A5SlipTemplate({
  entry,
  company,
  innerRef,
  theme = 'classic', // 'classic' | 'corporate' | 'stamp' | 'compact'
  showStamp = true,
  showQr = true,
  showTerms = true
}) {
  if (!entry) return null;

  const compName = company?.companyName || 'YASH ENTERPRISE';
  const compAddress = company?.address || 'Plot No. 42, Industrial Area, Market Yard, Pune - 411037';
  const compPhone = company?.phone || '+91 98765 43210';
  const compGstin = company?.gstin || '27ABCDE1234F1Z5';

  const grossTon = (parseFloat(entry.grossWeightKg || 0) / 1000).toFixed(2);
  const tareTon = (parseFloat(entry.tareWeightKg || 0) / 1000).toFixed(2);
  const netTon = (parseFloat(entry.netWeightKg || 0) / 1000).toFixed(2);

  // Styling variants
  const isCorporate = theme === 'corporate';
  const isStampTheme = theme === 'stamp';
  const isCompact = theme === 'compact';

  return (
    <div className={`a5-slip-wrapper theme-${theme}`} ref={innerRef}>
      <div
        className="a5-slip-box"
        style={{
          border: isCorporate
            ? '2px solid #1e3a8a'
            : isCompact
            ? '1.5px solid #0f172a'
            : '3px double #0f172a',
          padding: isCompact ? '12px 16px' : '16px 20px',
          backgroundColor: '#ffffff',
          position: 'relative',
          borderRadius: isCorporate ? '6px' : '0px'
        }}
      >
        {/* Top Header Section */}
        <div
          className="slip-header-section"
          style={{
            borderColor: isCorporate ? '#1e3a8a' : '#0f172a',
            paddingBottom: isCompact ? '6px' : '10px',
            marginBottom: isCompact ? '8px' : '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left QR verification (optional) */}
            {showQr && (
              <div
                style={{
                  width: '54px',
                  height: '54px',
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
                title="Electronic Verification Code"
              >
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 33 33" width="46" height="46" fill="#0f172a">
                  <path d="M0 0h11v11H0zm2 2v7h7V2zm20-2h11v11H22zm2 2v7h7V2zM0 22h11v11H0zm2 2v7h7v-7zm13-24h3v3h-3zm0 4h3v5h-3zm4 0h3v2h-3zm-4 7h7v3h-7zm11 0h3v5h-3zm-7 4h3v3h-3zm4 0h3v7h-3zm4 0h3v3h-3zm-8 4h3v3h-3zm8 0h3v3h-3zm-4 4h7v3h-7zm-8 0h3v3h-3zm-4-4h3v7H9v-4H6v-3h3z" />
                </svg>
                <span style={{ fontSize: '0.55rem', fontWeight: 700, color: '#64748b' }}>VERIFIED</span>
              </div>
            )}

            {/* Main Center Header */}
            <div style={{ textAlign: 'center', flex: 1, padding: '0 8px' }}>
              <h1
                className="slip-company-name"
                style={{
                  color: isCorporate ? '#1e3a8a' : '#0f172a',
                  fontSize: isCompact ? '1.35rem' : '1.65rem'
                }}
              >
                {compName}
              </h1>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: '#475569',
                  lineHeight: '1.25',
                  marginBottom: '4px'
                }}
              >
                {compAddress} • Ph: {compPhone} {compGstin ? `• GSTIN: ${compGstin}` : ''}
              </div>
              <div
                className="slip-subtitle-badge"
                style={{
                  backgroundColor: isCorporate ? '#1e3a8a' : '#0f172a'
                }}
              >
                COMPUTERIZED WEIGHBRIDGE SLIP
              </div>
            </div>

            {/* Right Weight Scale Icon / Serial Badge */}
            <div
              style={{
                textAlign: 'right',
                minWidth: '54px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  backgroundColor: isCorporate ? '#eff6ff' : '#f1f5f9',
                  border: isCorporate ? '1px solid #bfdbfe' : '1px solid #cbd5e1',
                  color: isCorporate ? '#1e3a8a' : '#0f172a',
                  padding: '3px 6px',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                ORIGINAL
              </div>
            </div>
          </div>
        </div>

        {/* Top Metadata Grid */}
        <div className="slip-meta-grid" style={{ marginBottom: isCompact ? '8px' : '12px' }}>
          <div className="slip-meta-item">
            <span className="slip-meta-label">Slip No.:</span>
            <span
              className="slip-meta-value"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                color: isCorporate ? '#1e3a8a' : '#0f172a'
              }}
            >
              {entry.slipNumber}
            </span>
          </div>

          <div className="slip-meta-item" style={{ justifyContent: 'flex-end' }}>
            <span className="slip-meta-label">Date & Time:</span>
            <span className="slip-meta-value" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatDate(entry.date)} {formatTime(entry.date)}
            </span>
          </div>

          <div className="slip-meta-item" style={{ gridColumn: 'span 2' }}>
            <span className="slip-meta-label">Party Name:</span>
            <span className="slip-meta-value" style={{ fontSize: '1.05rem', color: '#0f172a' }}>
              {entry.partyName}
            </span>
          </div>

          <div className="slip-meta-item">
            <span className="slip-meta-label">Vehicle No.:</span>
            <span
              className="slip-meta-value"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.95rem',
                letterSpacing: '0.02em'
              }}
            >
              {entry.vehicleNumber}
            </span>
          </div>

          <div className="slip-meta-item">
            <span className="slip-meta-label">Material:</span>
            <span className="slip-meta-value">
              {entry.materialName} {entry.bagWeightKg ? `(${entry.bagWeightKg} KG)` : ''}
            </span>
          </div>

          <div className="slip-meta-item">
            <span className="slip-meta-label">Quantity:</span>
            <span className="slip-meta-value">
              {entry.quantityBags} {entry.quantityUnit || 'Bags'}
            </span>
          </div>

          <div className="slip-meta-item">
            <span className="slip-meta-label">Total Tons:</span>
            <span className="slip-meta-value" style={{ color: '#059669', fontWeight: 800 }}>
              {formatTons(entry.tons)}
            </span>
          </div>
        </div>

        {/* Weight Table */}
        <table className="slip-weight-table" style={{ marginBottom: isCompact ? '10px' : '14px' }}>
          <thead>
            <tr style={{ backgroundColor: isCorporate ? '#eff6ff' : '#f1f5f9' }}>
              <th style={{ width: '45%' }}>Particulars</th>
              <th style={{ width: '30%', textAlign: 'right' }}>Weight (KG)</th>
              <th style={{ width: '25%', textAlign: 'right' }}>Weight (Ton)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>Gross Weight</td>
              <td className="weight-col">{formatKg(entry.grossWeightKg)}</td>
              <td className="weight-col">{grossTon} Ton</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Tare Weight</td>
              <td className="weight-col">{formatKg(entry.tareWeightKg)}</td>
              <td className="weight-col">{tareTon} Ton</td>
            </tr>
            <tr
              className="slip-net-row"
              style={{
                backgroundColor: isCorporate ? '#ecfdf5' : '#f8fafc'
              }}
            >
              <td style={{ color: '#0f172a', fontWeight: 900 }}>NET WEIGHT</td>
              <td className="weight-col" style={{ color: '#0f172a', fontWeight: 900 }}>
                {formatKg(entry.netWeightKg)}
              </td>
              <td
                className="weight-col"
                style={{
                  color: isCorporate ? '#047857' : '#0f172a',
                  fontWeight: 900
                }}
              >
                {netTon} Ton
              </td>
            </tr>
          </tbody>
        </table>

        {/* Remarks Section */}
        <div
          className="slip-remarks-section"
          style={{
            marginBottom: isCompact ? '16px' : '22px',
            borderColor: isCorporate ? '#1e3a8a' : '#0f172a'
          }}
        >
          <strong>Remarks:</strong> {entry.remarks || 'Electronic weight verified and found accurate.'}
        </div>

        {/* Official Verification Stamp Overlay (if enabled) */}
        {(showStamp || isStampTheme) && (
          <div
            style={{
              position: 'absolute',
              right: '28px',
              bottom: '50px',
              width: '105px',
              height: '105px',
              border: '2.5px dashed #0284c7',
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7',
              transform: 'rotate(-12deg)',
              opacity: 0.82,
              pointerEvents: 'none',
              padding: '4px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.52rem', fontWeight: 900, letterSpacing: '0.08em' }}>YASH ENTERPRISE</div>
            <div style={{ fontSize: '0.62rem', fontWeight: 900, borderTop: '1px solid #0284c7', borderBottom: '1px solid #0284c7', margin: '2px 0', padding: '1px 3px' }}>
              WEIGHBRIDGE
            </div>
            <div style={{ fontSize: '0.5rem', fontWeight: 800 }}>★ CERTIFIED ★</div>
            <div style={{ fontSize: '0.45rem', fontWeight: 700 }}>ACCURATE WT</div>
          </div>
        )}

        {/* Signature Area */}
        <div className="slip-signature-grid" style={{ marginTop: isCompact ? '20px' : '30px' }}>
          <div className="slip-sig-box">
            <div className="slip-sig-line" style={{ borderColor: isCorporate ? '#1e3a8a' : '#0f172a' }}></div>
            <div className="slip-sig-label">Operator Sign</div>
          </div>

          <div className="slip-sig-box">
            <div className="slip-sig-line" style={{ borderColor: isCorporate ? '#1e3a8a' : '#0f172a' }}></div>
            <div className="slip-sig-label">Customer / Party Sign</div>
          </div>
        </div>

        {/* Footer info */}
        {showTerms && (
          <div
            style={{
              fontSize: '0.68rem',
              color: '#64748b',
              textAlign: 'center',
              marginTop: '14px',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '6px'
            }}
          >
            This is a computer generated weighbridge slip • No manual corrections valid without stamp.
          </div>
        )}
      </div>
    </div>
  );
}

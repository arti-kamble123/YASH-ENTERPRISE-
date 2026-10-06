import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  Truck,
  Users,
  Boxes,
  MapPin,
  CreditCard,
  Sparkles
} from 'lucide-react';
import {
  calculateBagsToTons,
  calculateTonsToBags,
  getTodayISODate,
  formatKg,
  formatTons
} from '../../utils/calculations';
import confetti from 'canvas-confetti';

export default function DeliveryNoteForm() {
  const {
    editingDnId,
    setEditingDnId,
    deliveryNotes,
    addDeliveryNote,
    updateDeliveryNote,
    getNextDeliveryNoteNumber,
    parties,
    vehicles,
    materials,
    setActiveTab,
    setViewingDn,
    showToast
  } = useApp();

  const isEditMode = Boolean(editingDnId);

  // Form State
  const [formData, setFormData] = useState({
    deliveryNoteNumber: '',
    date: getTodayISODate(),
    partyId: '',
    partyName: '',
    vehicleId: '',
    vehicleNumber: '',
    driverPhone: '',
    freight: 'Paid',
    deliveryLocation: '',
    remarks: '',
    products: [
      {
        id: `p-${Date.now()}`,
        particular: '',
        materialId: '',
        bagWeightKg: 40,
        quantityBags: '',
        totalWeightKg: 0,
        tons: '',
        remarks: ''
      }
    ]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const existing = deliveryNotes.find((d) => d.id === editingDnId);
      if (existing) {
        setFormData({
          ...existing,
          products: (existing.products || []).map((p) => ({
            ...p,
            quantityBags: String(p.quantityBags || ''),
            tons: String(p.tons || '')
          }))
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        deliveryNoteNumber: getNextDeliveryNoteNumber(),
        date: getTodayISODate()
      }));
    }
  }, [editingDnId, isEditMode, deliveryNotes]);

  // Product Row Management
  const addProductRow = () => {
    const newRow = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      particular: '',
      materialId: '',
      bagWeightKg: 40,
      quantityBags: '',
      totalWeightKg: 0,
      tons: '',
      remarks: ''
    };
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, newRow]
    }));
  };

  const removeProductRow = (index) => {
    if (formData.products.length <= 1) {
      showToast('Delivery note must contain at least one product item.', 'warning', 'Item Required');
      return;
    }
    const updated = formData.products.filter((_, idx) => idx !== index);
    setFormData((prev) => ({ ...prev, products: updated }));
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...formData.products];
    const item = { ...updated[index], [field]: value };

    // If material name changed, update bag weight from master
    if (field === 'particular') {
      const matched = materials.find(
        (m) => m.materialName.toLowerCase() === value.toLowerCase()
      );
      if (matched) {
        item.materialId = matched.id;
        item.bagWeightKg = matched.bagWeightKg;
        // recalculate if quantity was already entered
        if (item.quantityBags) {
          const tons = calculateBagsToTons(item.quantityBags, matched.bagWeightKg);
          item.tons = String(tons);
          item.totalWeightKg = (parseFloat(item.quantityBags) || 0) * matched.bagWeightKg;
        }
      }
    }

    // If Bag Weight changed
    if (field === 'bagWeightKg') {
      const bagWeight = parseFloat(value) || 40;
      if (item.quantityBags) {
        item.tons = String(calculateBagsToTons(item.quantityBags, bagWeight));
        item.totalWeightKg = (parseFloat(item.quantityBags) || 0) * bagWeight;
      }
    }

    // If Quantity Bags changed -> calculate Tons
    if (field === 'quantityBags') {
      const bags = value.replace(/[^0-9]/g, '');
      item.quantityBags = bags;
      const bagWeight = parseFloat(item.bagWeightKg) || 40;
      const tons = calculateBagsToTons(bags, bagWeight);
      item.tons = bags ? String(tons) : '';
      item.totalWeightKg = (parseFloat(bags) || 0) * bagWeight;
    }

    // If Tons changed -> calculate Bags
    if (field === 'tons') {
      item.tons = value;
      const bagWeight = parseFloat(item.bagWeightKg) || 40;
      const bags = calculateTonsToBags(value, bagWeight);
      item.quantityBags = value ? String(bags) : '';
      item.totalWeightKg = (parseFloat(value) || 0) * 1000;
    }

    updated[index] = item;
    setFormData((prev) => ({ ...prev, products: updated }));
  };

  // Compute Grand Totals
  const totalBags = formData.products.reduce(
    (acc, curr) => acc + (parseInt(curr.quantityBags, 10) || 0),
    0
  );
  const totalTons = formData.products.reduce(
    (acc, curr) => acc + (parseFloat(curr.tons) || 0),
    0
  );
  const totalWeightKg = formData.products.reduce(
    (acc, curr) => acc + (parseFloat(curr.totalWeightKg) || 0),
    0
  );

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.partyName || !formData.partyName.trim()) {
      newErrors.partyName = 'Party Name is required';
    }

    if (!formData.vehicleNumber || !formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle Number is required';
    }

    let hasValidProduct = false;
    formData.products.forEach((p, idx) => {
      if (!p.particular || !p.particular.trim()) {
        newErrors[`product_${idx}_particular`] = 'Product description is required';
      }
      const bags = parseInt(p.quantityBags, 10);
      if (!bags || bags <= 0) {
        newErrors[`product_${idx}_qty`] = 'Quantity must be > 0';
      } else {
        hasValidProduct = true;
      }
    });

    if (!hasValidProduct && !newErrors.products) {
      newErrors.products = 'At least one product with positive quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please correct form errors before saving.', 'error', 'Validation Error');
      return;
    }

    const payload = {
      ...formData,
      totalBags,
      totalTons: parseFloat(totalTons.toFixed(3)),
      totalWeightKg,
      products: formData.products.map((p) => ({
        ...p,
        bagWeightKg: parseFloat(p.bagWeightKg) || 40,
        quantityBags: parseInt(p.quantityBags, 10) || 0,
        tons: parseFloat(p.tons) || 0,
        totalWeightKg: parseFloat(p.totalWeightKg) || 0,
        unit: 'Bags'
      }))
    };

    if (isEditMode) {
      updateDeliveryNote(payload);
      setEditingDnId(null);
      setActiveTab('dn-history');
    } else {
      const savedDn = addDeliveryNote(payload);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setViewingDn(savedDn);
      setActiveTab('dn-history');
    }
  };

  return (
    <div style={{ maxWidth: '1020px', margin: '0 auto' }}>
      <div className="card">
        {/* Header */}
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={24} style={{ color: 'var(--success)' }} />
              <span>{isEditMode ? `Edit Delivery Note – ${formData.deliveryNoteNumber}` : 'New Delivery Note'}</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Create official delivery challan with itemized product lines & auto-calculated totals
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setEditingDnId(null);
              setActiveTab('dn-history');
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to History</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div className="form-grid">
            {/* Delivery Note Number */}
            <div className="col-6 form-group">
              <label className="form-label">
                <span>Delivery Note Number</span>
                <span className="form-label-hint">Auto Generated</span>
              </label>
              <input
                type="text"
                className="form-input is-readonly"
                value={formData.deliveryNoteNumber}
                readOnly
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            {/* Date */}
            <div className="col-6 form-group">
              <label className="form-label">
                <span>Date <span className="required-star">*</span></span>
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            {/* Party Name */}
            <div className="col-6 form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} style={{ color: 'var(--primary)' }} />
                  <span>Party Name (Consignee) <span className="required-star">*</span></span>
                </span>
                <span className="form-label-hint">Select or Type New</span>
              </label>
              <input
                type="text"
                list="dn-party-list"
                className={`form-input ${errors.partyName ? 'input-error' : ''}`}
                placeholder="e.g. Shree Ram Traders"
                value={formData.partyName}
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = parties.find((p) => p.partyName.toLowerCase() === val.toLowerCase());
                  setFormData({
                    ...formData,
                    partyName: val,
                    partyId: matched ? matched.id : '',
                    deliveryLocation: matched?.address || formData.deliveryLocation
                  });
                  if (errors.partyName) setErrors({ ...errors, partyName: null });
                }}
              />
              <datalist id="dn-party-list">
                {parties.map((p) => (
                  <option key={p.id} value={p.partyName}>
                    {p.address || ''}
                  </option>
                ))}
              </datalist>
              {errors.partyName && <span className="form-error-msg">{errors.partyName}</span>}
            </div>

            {/* Vehicle Number */}
            <div className="col-6 form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Truck size={14} style={{ color: '#0284c7' }} />
                  <span>Truck / Vehicle Number <span className="required-star">*</span></span>
                </span>
                <span className="form-label-hint">Select or Type</span>
              </label>
              <input
                type="text"
                list="dn-veh-list"
                className={`form-input ${errors.vehicleNumber ? 'input-error' : ''}`}
                placeholder="e.g. MH-12-RN-4589"
                style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
                value={formData.vehicleNumber}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  const matched = vehicles.find((v) => v.vehicleNumber === val);
                  setFormData({
                    ...formData,
                    vehicleNumber: val,
                    vehicleId: matched ? matched.id : '',
                    driverPhone: matched?.driverPhone || formData.driverPhone
                  });
                  if (errors.vehicleNumber) setErrors({ ...errors, vehicleNumber: null });
                }}
              />
              <datalist id="dn-veh-list">
                {vehicles.map((v) => (
                  <option key={v.id} value={v.vehicleNumber}>
                    {v.driverName ? `Driver: ${v.driverName}` : ''}
                  </option>
                ))}
              </datalist>
              {errors.vehicleNumber && <span className="form-error-msg">{errors.vehicleNumber}</span>}
            </div>

            {/* Driver Phone */}
            <div className="col-4 form-group">
              <label className="form-label">
                <span>Driver Phone</span>
                <span className="form-label-hint">Contact</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. +91 98220 77112"
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
              />
            </div>

            {/* Freight */}
            <div className="col-4 form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CreditCard size={14} />
                  <span>Freight Status</span>
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Paid / To Pay (₹ 4,500)"
                value={formData.freight}
                onChange={(e) => setFormData({ ...formData, freight: e.target.value })}
              />
            </div>

            {/* Delivery Location */}
            <div className="col-4 form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} />
                  <span>Delivery Destination</span>
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Godown #4, APMC Market Yard"
                value={formData.deliveryLocation}
                onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
              />
            </div>

            {/* Product-wise Details Table */}
            <div className="col-12" style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Boxes size={18} style={{ color: 'var(--primary)' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Product-wise Delivery Items</h4>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addProductRow}
                >
                  <Plus size={15} />
                  <span>+ Add Product Row</span>
                </button>
              </div>

              {/* Items Table */}
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '4%' }}>#</th>
                      <th style={{ width: '32%' }}>Product / Particular <span className="required-star">*</span></th>
                      <th style={{ width: '13%' }}>Bag Wt (KG)</th>
                      <th style={{ width: '15%' }}>Quantity (Bags) <span className="required-star">*</span></th>
                      <th style={{ width: '15%' }}>Tons (Ton)</th>
                      <th style={{ width: '15%' }}>Item Notes</th>
                      <th style={{ width: '6%', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.products.map((row, idx) => (
                      <tr key={row.id || idx}>
                        <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td>
                          <input
                            type="text"
                            list="product-mat-suggestions"
                            className="form-input"
                            placeholder="e.g. RAJLAXMI 40 KG WHITE"
                            value={row.particular}
                            onChange={(e) => handleProductChange(idx, 'particular', e.target.value)}
                            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                          />
                          {errors[`product_${idx}_particular`] && (
                            <span className="form-error-msg">{errors[`product_${idx}_particular`]}</span>
                          )}
                        </td>
                        <td>
                          <div className="input-with-badge">
                            <input
                              type="number"
                              step="0.5"
                              className="form-input"
                              placeholder="40"
                              value={row.bagWeightKg}
                              onChange={(e) => handleProductChange(idx, 'bagWeightKg', e.target.value)}
                              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                            />
                            <span className="input-tag" style={{ right: '4px', fontSize: '0.65rem' }}>KG</span>
                          </div>
                        </td>
                        <td>
                          <div className="input-with-badge">
                            <input
                              type="text"
                              className="form-input"
                              placeholder="500"
                              value={row.quantityBags}
                              onChange={(e) => handleProductChange(idx, 'quantityBags', e.target.value)}
                              style={{ padding: '6px 10px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                            />
                            <span className="input-tag" style={{ right: '4px', fontSize: '0.65rem' }}>Bags</span>
                          </div>
                          {errors[`product_${idx}_qty`] && (
                            <span className="form-error-msg">{errors[`product_${idx}_qty`]}</span>
                          )}
                        </td>
                        <td>
                          <div className="input-with-badge">
                            <input
                              type="number"
                              step="0.001"
                              className="form-input"
                              placeholder="20.00"
                              value={row.tons}
                              onChange={(e) => handleProductChange(idx, 'tons', e.target.value)}
                              style={{ padding: '6px 10px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}
                            />
                            <span className="input-tag tag-auto" style={{ right: '4px', fontSize: '0.65rem' }}>Ton</span>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Optional note"
                            value={row.remarks}
                            onChange={(e) => handleProductChange(idx, 'remarks', e.target.value)}
                            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm btn-icon-only"
                            onClick={() => removeProductRow(idx)}
                            style={{ color: 'var(--danger)', padding: '6px' }}
                            title="Remove Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <datalist id="product-mat-suggestions">
                {materials.map((m) => (
                  <option key={m.id} value={m.materialName}>
                    {m.bagWeightKg} KG / Bag
                  </option>
                ))}
              </datalist>

              {/* Total Summary Footer Box */}
              <div
                style={{
                  marginTop: '14px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calculator size={20} style={{ color: 'var(--primary)' }} />
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>Delivery Note Grand Totals</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Sum of all {formData.products.length} product items
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Bags</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {totalBags.toLocaleString('en-IN')} Bags
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Weight (KG)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {formatKg(totalWeightKg)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', backgroundColor: '#ecfdf5', padding: '6px 14px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#065f46', textTransform: 'uppercase', fontWeight: 700 }}>Total Tons</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#047857', fontFamily: 'var(--font-mono)' }}>
                      {totalTons.toFixed(2)} Ton
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Remarks */}
            <div className="col-12 form-group" style={{ marginTop: '10px' }}>
              <label className="form-label">
                <span>Overall Remarks / Terms</span>
              </label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="e.g. Received in good condition with original seals intact."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditingDnId(null);
                setActiveTab('dn-history');
              }}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-success btn-lg">
              <Save size={18} />
              <span>{isEditMode ? 'Update Delivery Note' : 'Save & Generate Delivery Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

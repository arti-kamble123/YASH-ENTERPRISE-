import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Scale,
  Save,
  ArrowLeft,
  Calculator,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  Truck,
  Users,
  Boxes
} from 'lucide-react';
import {
  calculateBagsToTons,
  calculateTonsToBags,
  calculateNetWeightKg,
  getCurrentISODateTime,
  formatKg,
  formatTons
} from '../../utils/calculations';
import confetti from 'canvas-confetti';

export default function WeighbridgeForm() {
  const {
    editingWbId,
    setEditingWbId,
    weighbridgeEntries,
    addWeighbridgeEntry,
    updateWeighbridgeEntry,
    getNextSlipNumber,
    parties,
    vehicles,
    materials,
    setActiveTab,
    setViewingWbEntry,
    showToast
  } = useApp();

  const isEditMode = Boolean(editingWbId);

  // Form State
  const [formData, setFormData] = useState({
    slipNumber: '',
    date: getCurrentISODateTime(),
    partyId: '',
    partyName: '',
    vehicleId: '',
    vehicleNumber: '',
    materialId: '',
    materialName: '',
    bagWeightKg: 40,
    quantityBags: '',
    quantityUnit: 'Bags',
    tons: '',
    grossWeightKg: '',
    tareWeightKg: '',
    netWeightKg: 0,
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [lastCalculationSource, setLastCalculationSource] = useState('bags'); // 'bags' | 'tons'

  // Initialize or populate form for editing
  useEffect(() => {
    if (isEditMode) {
      const existing = weighbridgeEntries.find((e) => e.id === editingWbId);
      if (existing) {
        setFormData({
          ...existing,
          quantityBags: String(existing.quantityBags || ''),
          tons: String(existing.tons || ''),
          grossWeightKg: String(existing.grossWeightKg || ''),
          tareWeightKg: String(existing.tareWeightKg || '')
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        slipNumber: getNextSlipNumber(),
        date: getCurrentISODateTime()
      }));
    }
  }, [editingWbId, isEditMode, weighbridgeEntries]);

  // Handle Material Selection & Bag Weight Updates
  const handleMaterialChange = (selectedName) => {
    const matched = materials.find(
      (m) => m.materialName.trim().toLowerCase() === selectedName.trim().toLowerCase()
    );

    const bagWeight = matched ? matched.bagWeightKg : (parseFloat(formData.bagWeightKg) || 40);

    let updatedTons = formData.tons;
    let updatedBags = formData.quantityBags;

    // Recalculate using new bag weight
    if (lastCalculationSource === 'bags' && formData.quantityBags) {
      updatedTons = calculateBagsToTons(formData.quantityBags, bagWeight);
    } else if (lastCalculationSource === 'tons' && formData.tons) {
      updatedBags = calculateTonsToBags(formData.tons, bagWeight);
    }

    setFormData((prev) => ({
      ...prev,
      materialId: matched ? matched.id : '',
      materialName: selectedName,
      bagWeightKg: bagWeight,
      quantityBags: updatedBags,
      tons: updatedTons
    }));
  };

  // Handle Bag Weight manual adjustment
  const handleBagWeightChange = (newBagWeight) => {
    const weight = parseFloat(newBagWeight) || 0;
    let updatedTons = formData.tons;
    let updatedBags = formData.quantityBags;

    if (weight > 0) {
      if (lastCalculationSource === 'bags' && formData.quantityBags) {
        updatedTons = calculateBagsToTons(formData.quantityBags, weight);
      } else if (lastCalculationSource === 'tons' && formData.tons) {
        updatedBags = calculateTonsToBags(formData.tons, weight);
      }
    }

    setFormData((prev) => ({
      ...prev,
      bagWeightKg: newBagWeight,
      quantityBags: updatedBags,
      tons: updatedTons
    }));
  };

  // Handle Bags Input -> Auto calculate Tons
  const handleBagsChange = (value) => {
    setLastCalculationSource('bags');
    const bags = value.replace(/[^0-9]/g, '');
    const calculatedTons = calculateBagsToTons(bags, formData.bagWeightKg);

    setFormData((prev) => ({
      ...prev,
      quantityBags: bags,
      tons: bags ? String(calculatedTons) : ''
    }));

    if (errors.quantityBags) {
      setErrors((prev) => ({ ...prev, quantityBags: null }));
    }
  };

  // Handle Tons Input -> Auto calculate Bags
  const handleTonsChange = (value) => {
    setLastCalculationSource('tons');
    const tonsVal = value;
    const calculatedBags = calculateTonsToBags(tonsVal, formData.bagWeightKg);

    setFormData((prev) => ({
      ...prev,
      tons: tonsVal,
      quantityBags: tonsVal ? String(calculatedBags) : ''
    }));

    if (errors.tons) {
      setErrors((prev) => ({ ...prev, tons: null }));
    }
  };

  // Handle Gross / Tare change -> Auto calculate Net Weight
  const handleWeightChange = (field, value) => {
    const cleanNum = value.replace(/[^0-9.]/g, '');
    const updated = {
      ...formData,
      [field]: cleanNum
    };

    const gross = parseFloat(field === 'grossWeightKg' ? cleanNum : formData.grossWeightKg) || 0;
    const tare = parseFloat(field === 'tareWeightKg' ? cleanNum : formData.tareWeightKg) || 0;
    const net = calculateNetWeightKg(gross, tare);

    updated.netWeightKg = net;
    setFormData(updated);

    // Validation cleanup
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.partyName || !formData.partyName.trim()) {
      newErrors.partyName = 'Party Name is required';
    }

    if (!formData.vehicleNumber || !formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle Number is required';
    }

    if (!formData.materialName || !formData.materialName.trim()) {
      newErrors.materialName = 'Material is required';
    }

    const bagWeight = parseFloat(formData.bagWeightKg);
    if (!bagWeight || bagWeight <= 0) {
      newErrors.bagWeightKg = 'Valid Bag Weight (KG) is required';
    }

    const bags = parseInt(formData.quantityBags, 10);
    if (!bags || bags <= 0) {
      newErrors.quantityBags = 'Quantity in Bags must be greater than 0';
    }

    const gross = parseFloat(formData.grossWeightKg);
    if (!gross || gross <= 0) {
      newErrors.grossWeightKg = 'Gross Weight must be greater than 0 KG';
    }

    const tare = parseFloat(formData.tareWeightKg);
    if (tare < 0) {
      newErrors.tareWeightKg = 'Tare Weight cannot be negative';
    } else if (tare >= gross) {
      newErrors.tareWeightKg = 'Tare Weight cannot be greater than or equal to Gross Weight';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors in the form before submitting.', 'error', 'Validation Error');
      return;
    }

    const payload = {
      ...formData,
      bagWeightKg: parseFloat(formData.bagWeightKg) || 40,
      quantityBags: parseInt(formData.quantityBags, 10) || 0,
      tons: parseFloat(formData.tons) || 0,
      grossWeightKg: parseFloat(formData.grossWeightKg) || 0,
      tareWeightKg: parseFloat(formData.tareWeightKg) || 0,
      netWeightKg: calculateNetWeightKg(formData.grossWeightKg, formData.tareWeightKg)
    };

    if (isEditMode) {
      updateWeighbridgeEntry(payload);
      setEditingWbId(null);
      setActiveTab('wb-records');
    } else {
      const savedEntry = addWeighbridgeEntry(payload);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      // Open the A5 slip preview for instant printing/PDF
      setViewingWbEntry(savedEntry);
      setActiveTab('wb-records');
    }
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      <div className="card">
        {/* Card Header */}
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Scale size={24} style={{ color: 'var(--primary)' }} />
              <span>{isEditMode ? `Edit Weighbridge Slip – ${formData.slipNumber}` : 'New Weighbridge Entry'}</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Automatic Bags ↔ Tons conversion & Gross-Tare-Net weight calculations
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setEditingWbId(null);
              setActiveTab('wb-records');
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Records</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div className="form-grid">
            {/* Slip Number */}
            <div className="col-6 form-group">
              <label className="form-label">
                <span>Slip Number</span>
                <span className="form-label-hint">Auto Generated</span>
              </label>
              <input
                type="text"
                className="form-input is-readonly"
                value={formData.slipNumber}
                readOnly
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            {/* Date & Time */}
            <div className="col-6 form-group">
              <label className="form-label">
                <span>Date & Time <span className="required-star">*</span></span>
              </label>
              <input
                type="datetime-local"
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
                  <span>Party Name <span className="required-star">*</span></span>
                </span>
                <span className="form-label-hint">Select or Type New</span>
              </label>
              <input
                type="text"
                list="party-suggestions"
                className={`form-input ${errors.partyName ? 'input-error' : ''}`}
                placeholder="e.g. Shree Ram Traders"
                value={formData.partyName}
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = parties.find((p) => p.partyName.toLowerCase() === val.toLowerCase());
                  setFormData({
                    ...formData,
                    partyName: val,
                    partyId: matched ? matched.id : ''
                  });
                  if (errors.partyName) setErrors({ ...errors, partyName: null });
                }}
              />
              <datalist id="party-suggestions">
                {parties.map((p) => (
                  <option key={p.id} value={p.partyName}>
                    {p.contactNumber ? `Phone: ${p.contactNumber}` : ''}
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
                  <span>Vehicle Number <span className="required-star">*</span></span>
                </span>
                <span className="form-label-hint">Select or Type New</span>
              </label>
              <input
                type="text"
                list="vehicle-suggestions"
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
                    vehicleId: matched ? matched.id : ''
                  });
                  if (errors.vehicleNumber) setErrors({ ...errors, vehicleNumber: null });
                }}
              />
              <datalist id="vehicle-suggestions">
                {vehicles.map((v) => (
                  <option key={v.id} value={v.vehicleNumber}>
                    {v.driverName ? `Driver: ${v.driverName}` : ''}
                  </option>
                ))}
              </datalist>
              {errors.vehicleNumber && <span className="form-error-msg">{errors.vehicleNumber}</span>}
            </div>

            {/* Material Name */}
            <div className="col-8 form-group">
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Boxes size={14} style={{ color: '#8b5cf6' }} />
                  <span>Material <span className="required-star">*</span></span>
                </span>
                <span className="form-label-hint">Auto Configures Bag Weight</span>
              </label>
              <input
                type="text"
                list="material-suggestions"
                className={`form-input ${errors.materialName ? 'input-error' : ''}`}
                placeholder="e.g. RAJLAXMI 40 KG WHITE"
                value={formData.materialName}
                onChange={(e) => handleMaterialChange(e.target.value)}
              />
              <datalist id="material-suggestions">
                {materials.map((m) => (
                  <option key={m.id} value={m.materialName}>
                    Configured Bag Weight: {m.bagWeightKg} KG
                  </option>
                ))}
              </datalist>
              {errors.materialName && <span className="form-error-msg">{errors.materialName}</span>}
            </div>

            {/* Bag Weight in KG */}
            <div className="col-4 form-group">
              <label className="form-label">
                <span>Bag Weight (KG) <span className="required-star">*</span></span>
                <span className="form-label-hint">per bag</span>
              </label>
              <div className="input-with-badge">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  className={`form-input ${errors.bagWeightKg ? 'input-error' : ''}`}
                  placeholder="e.g. 40"
                  value={formData.bagWeightKg}
                  onChange={(e) => handleBagWeightChange(e.target.value)}
                />
                <span className="input-tag">KG</span>
              </div>
              {errors.bagWeightKg && <span className="form-error-msg">{errors.bagWeightKg}</span>}
            </div>

            {/* Bags & Tons Bidirectional Calculator Section */}
            <div className="col-12" style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Calculator size={18} style={{ color: 'var(--primary)' }} />
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Automatic Quantity & Weight Calculator</h4>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Dynamic 2-Way Sync</span>
              </div>

              <div className="form-grid">
                {/* Quantity in Bags */}
                <div className="col-6 form-group">
                  <label className="form-label">
                    <span>Quantity (Bags) <span className="required-star">*</span></span>
                    {lastCalculationSource === 'tons' && <span className="input-tag tag-auto" style={{ position: 'static' }}>Calculated</span>}
                  </label>
                  <div className="input-with-badge">
                    <input
                      type="text"
                      className={`form-input ${errors.quantityBags ? 'input-error' : ''}`}
                      placeholder="e.g. 500"
                      value={formData.quantityBags}
                      onChange={(e) => handleBagsChange(e.target.value)}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700 }}
                    />
                    <span className="input-tag">Bags</span>
                  </div>
                  {errors.quantityBags && <span className="form-error-msg">{errors.quantityBags}</span>}
                </div>

                {/* Tons */}
                <div className="col-6 form-group">
                  <label className="form-label">
                    <span>Weight in Tons (Ton) <span className="required-star">*</span></span>
                    {lastCalculationSource === 'bags' && <span className="input-tag tag-auto" style={{ position: 'static' }}>Calculated</span>}
                  </label>
                  <div className="input-with-badge">
                    <input
                      type="number"
                      step="0.001"
                      className={`form-input ${errors.tons ? 'input-error' : ''}`}
                      placeholder="e.g. 20.00"
                      value={formData.tons}
                      onChange={(e) => handleTonsChange(e.target.value)}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}
                    />
                    <span className="input-tag tag-auto">Ton (Auto)</span>
                  </div>
                  {errors.tons && <span className="form-error-msg">{errors.tons}</span>}
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={14} />
                <span>Formula: {formData.quantityBags || 0} Bags × {formData.bagWeightKg || 40} KG = {((formData.quantityBags || 0) * (formData.bagWeightKg || 40)).toLocaleString('en-IN')} KG = {formData.tons || 0} Tons</span>
              </div>
            </div>

            {/* Weighbridge Readings: Gross, Tare, Net */}
            <div className="col-12 weight-reading-box">
              <div className="title">
                <Scale size={20} />
                <span>Weighbridge Scale Readings (Gross, Tare & Net Weight)</span>
              </div>

              <div className="form-grid">
                {/* Gross Weight */}
                <div className="col-6 form-group">
                  <label className="form-label">
                    <span>Gross Weight (KG) <span className="required-star">*</span></span>
                    <span className="form-label-hint">Truck + Material</span>
                  </label>
                  <div className="input-with-badge">
                    <input
                      type="text"
                      className={`form-input ${errors.grossWeightKg ? 'input-error' : ''}`}
                      placeholder="e.g. 26500"
                      value={formData.grossWeightKg}
                      onChange={(e) => handleWeightChange('grossWeightKg', e.target.value)}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800 }}
                    />
                    <span className="input-tag">KG</span>
                  </div>
                  {errors.grossWeightKg && <span className="form-error-msg">{errors.grossWeightKg}</span>}
                </div>

                {/* Tare Weight */}
                <div className="col-6 form-group">
                  <label className="form-label">
                    <span>Tare Weight (KG) <span className="required-star">*</span></span>
                    <span className="form-label-hint">Empty Truck</span>
                  </label>
                  <div className="input-with-badge">
                    <input
                      type="text"
                      className={`form-input ${errors.tareWeightKg ? 'input-error' : ''}`}
                      placeholder="e.g. 6500"
                      value={formData.tareWeightKg}
                      onChange={(e) => handleWeightChange('tareWeightKg', e.target.value)}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800 }}
                    />
                    <span className="input-tag">KG</span>
                  </div>
                  {errors.tareWeightKg && <span className="form-error-msg">{errors.tareWeightKg}</span>}
                </div>
              </div>

              {/* Net Weight Display Box */}
              <div className="net-weight-highlight-display">
                <div>
                  <div className="label">Automatically Calculated Net Weight</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '2px' }}>
                    Gross ({formData.grossWeightKg || 0} KG) − Tare ({formData.tareWeightKg || 0} KG)
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="value">
                    {formatKg(formData.netWeightKg)}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, opacity: 0.9 }}>
                    = {formatTons(formData.netWeightKg / 1000)}
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="col-12 form-group">
              <label className="form-label">
                <span>Remarks / Special Notes</span>
                <span className="form-label-hint">Optional</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Direct godown dispatch, moisture verified"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditingWbId(null);
                setActiveTab('wb-records');
              }}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary btn-lg">
              <Save size={18} />
              <span>{isEditMode ? 'Update Slip Record' : 'Save & Generate A5 Slip'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

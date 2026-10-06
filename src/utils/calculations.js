/**
 * YASH ENTERPRISE - Calculation & Formatting Utilities
 * Standard calculations for Weighbridge & Delivery Notes
 */

/**
 * Calculates Tons from Quantity in Bags using the material's Bag Weight (in KG)
 * Formula: (Bags * BagWeightKG) / 1000
 * @param {number} bags - Quantity of bags
 * @param {number} bagWeightKg - Weight per bag in KG (e.g., 40, 50, 25, 20)
 * @returns {number} Tons rounded to 2 decimal places
 */
export function calculateBagsToTons(bags, bagWeightKg) {
  const b = parseFloat(bags) || 0;
  const w = parseFloat(bagWeightKg) || 0;
  if (b <= 0 || w <= 0) return 0;
  const totalKg = b * w;
  return parseFloat((totalKg / 1000).toFixed(3));
}

/**
 * Calculates Quantity in Bags from Tons using the material's Bag Weight (in KG)
 * Formula: (Tons * 1000) / BagWeightKG
 * @param {number} tons - Weight in Tons
 * @param {number} bagWeightKg - Weight per bag in KG
 * @returns {number} Quantity of bags (integer)
 */
export function calculateTonsToBags(tons, bagWeightKg) {
  const t = parseFloat(tons) || 0;
  const w = parseFloat(bagWeightKg) || 0;
  if (t <= 0 || w <= 0) return 0;
  const totalKg = t * 1000;
  return Math.round(totalKg / w);
}

/**
 * Calculates Net Weight in KG from Gross and Tare weights
 * Formula: Gross Weight - Tare Weight
 * @param {number} grossKg - Gross weight in KG
 * @param {number} tareKg - Tare weight in KG
 * @returns {number} Net weight in KG
 */
export function calculateNetWeightKg(grossKg, tareKg) {
  const gross = parseFloat(grossKg) || 0;
  const tare = parseFloat(tareKg) || 0;
  if (gross <= 0) return 0;
  const net = gross - tare;
  return net > 0 ? net : 0;
}

/**
 * Converts KG to Tons
 * @param {number} kg - Weight in KG
 * @returns {number} Weight in Tons
 */
export function kgToTons(kg) {
  const k = parseFloat(kg) || 0;
  return parseFloat((k / 1000).toFixed(3));
}

/**
 * Converts Tons to KG
 * @param {number} tons - Weight in Tons
 * @returns {number} Weight in KG
 */
export function tonsToKg(tons) {
  const t = parseFloat(tons) || 0;
  return Math.round(t * 1000);
}

/**
 * Formats a number as KG string with thousands separator
 * @param {number} kg 
 * @returns {string} e.g. "25,000 KG"
 */
export function formatKg(kg) {
  const num = parseFloat(kg) || 0;
  return `${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })} KG`;
}

/**
 * Formats a number as Tons string
 * @param {number} tons 
 * @returns {string} e.g. "20.00 Ton"
 */
export function formatTons(tons) {
  const num = parseFloat(tons) || 0;
  return `${num.toFixed(2)} Ton`;
}

/**
 * Formats a date string to Indian format DD/MM/YYYY
 * @param {string|Date} dateStr 
 * @returns {string} e.g. "06/10/2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formats time string to 12-hour AM/PM format
 * @param {string|Date} dateStr 
 * @returns {string} e.g. "10:30 AM"
 */
export function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Formats full Date and Time
 * @param {string|Date} dateStr 
 * @returns {string} e.g. "06/10/2026, 10:30 AM"
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
}

/**
 * Returns today's ISO date string (YYYY-MM-DD)
 */
export function getTodayISODate() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns current ISO datetime string (YYYY-MM-DDTHH:mm)
 */
export function getCurrentISODateTime() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

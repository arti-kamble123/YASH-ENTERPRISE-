# YASH ENTERPRISE – Delivery Notes & Weighbridge Management System ⚖️📦

A commercial-grade, modern, fast, and responsive business management platform designed for wholesale grain, fertilizer, cement, and industrial material suppliers.

Developed specifically for **YASH ENTERPRISE** to handle daily operational Weighbridge Slips, Itemized Delivery Notes, Automatic Bags ↔ Tons conversions, Master Registry, and Comprehensive Business Intelligence.

---

## 🌟 Key Features

### 1. ⚖️ Weighbridge Entry & Official A5 Slip
- **Official A5 Slip Design:** Classical double-line bordered format matching authentic YASH ENTERPRISE weighbridge slips with clear weight breakdown and dual signature blocks (*Operator Sign* and *Customer / Party Sign*).
- **Dynamic 2-Way Bags ↔ Tons Calculation:**
  $$\text{Tons} = \frac{\text{Bags} \times \text{Bag Weight (KG)}}{1000}$$
  $$\text{Bags} = \frac{\text{Tons} \times 1000}{\text{Bag Weight (KG)}}$$
  *(Supports any configured bag weight: 40 KG, 50 KG, 25 KG, 20 KG, 22.5 KG, etc.)*
- **Gross, Tare & Net Weight Calculation:**
  $$\text{Net Weight (KG)} = \text{Gross Weight (KG)} - \text{Tare Weight (KG)}$$
  *(Automatically computed in KG and Tons with real-time validation).*
- **1-Click Printing & PDF Generation:** Pixel-perfect A5 layout (`148mm × 210mm`) ready for thermal or laser printing.

### 2. 📋 Delivery Note & Challan System
- **Itemized Multi-Product Challan:** Add multiple product rows in a single delivery note with separate bag weights, quantities, and auto-calculated tonnage.
- **Grand Totals:** Live total of Total Bags, Total Weight in KG, and Total Tons.
- **Transport & Dispatch Details:** Party/Consignee details, Vehicle Number, Driver Contact, Delivery Destination, Freight terms, and 4-party authorization signatures.

### 3. 🗂️ Master Data Registry
- **Party Master:** Client directory with contact numbers, addresses, and tonnage dispatch history.
- **Vehicle Master:** Transport fleet registry with driver names, phone numbers, and trip counters.
- **Material Master:** Material catalog storing exact Bag Weights (KG) used dynamically by the calculation engine.
- **Auto-Sync:** Newly typed parties, vehicles, or materials on slips are automatically registered into master data.

### 4. 📊 Analytical Intelligence & Reports
- **Monthly-wise Report:** Total entries, bags, tons, gross, tare, and net weights with Month & Year filter.
- **Party-wise Report:** Volume leaderboard and consignment metrics by client.
- **Vehicle-wise Report:** Haulage and trip frequency per vehicle.
- **Material-wise Report:** Product distribution analysis.
- **Bulk CSV / Excel Export:** Instant download of all records and reports.

### 5. 🎨 Interactive PDF Design Studio
- Live real-time document previewer in UI with zoom controls (60% to 140%).
- Visual theme switcher: *Classical Double-Border*, *Corporate Steel Blue*, *Certified Seal & Stamp Edition*.
- Toggles for official verification stamps, security QR codes, and terms.
- Instant WhatsApp dispatch with preformatted text messages.

### 6. 💾 Offline Persistence & Data Safety
- Client-side storage with zero setup required.
- Full offline **JSON Database Backup & Restore** in System Settings.

---

## 🚀 Tech Stack

- **Framework:** React 19 + Vite 8
- **Styling:** Custom Vanilla CSS Design System with responsive tokens
- **Typography:** Google Fonts (*Outfit*, *Plus Jakarta Sans*, *JetBrains Mono*)
- **Icons:** Lucide React
- **PDF Engine:** jsPDF + html2canvas
- **Animation & FX:** Canvas Confetti

---

## 💻 Installation & Local Setup

```bash
# Clone repository
git clone https://github.com/arti-kamble123/YASH-ENTERPRISE-.git

# Navigate to project directory
cd YASH-ENTERPRISE-

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 📄 License & Ownership

Proprietary Software designed for **YASH ENTERPRISE**. All rights reserved.

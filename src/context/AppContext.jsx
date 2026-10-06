/**
 * YASH ENTERPRISE - Application Context & State Manager
 * Persistent state with LocalStorage synchronization, auto-number generation, and full CRUD
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialCompanySettings,
  initialMaterials,
  initialParties,
  initialVehicles,
  initialWeighbridgeEntries,
  initialDeliveryNotes
} from '../data/initialData';

const AppContext = createContext();

const STORAGE_KEYS = {
  SETTINGS: 'yash_enterprise_settings',
  MATERIALS: 'yash_enterprise_materials',
  PARTIES: 'yash_enterprise_parties',
  VEHICLES: 'yash_enterprise_vehicles',
  WEIGHBRIDGE: 'yash_enterprise_weighbridge_entries',
  DELIVERY_NOTES: 'yash_enterprise_delivery_notes'
};

export function AppProvider({ children }) {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Editing / Preview modal state triggers
  const [editingWbId, setEditingWbId] = useState(null);
  const [viewingWbEntry, setViewingWbEntry] = useState(null);
  const [editingDnId, setEditingDnId] = useState(null);
  const [viewingDn, setViewingDn] = useState(null);

  // Notifications
  const [toasts, setToasts] = useState([]);

  // Load Initial or Stored Data
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : initialCompanySettings;
    } catch {
      return initialCompanySettings;
    }
  });

  const [materials, setMaterials] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      return saved ? JSON.parse(saved) : initialMaterials;
    } catch {
      return initialMaterials;
    }
  });

  const [parties, setParties] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARTIES);
      return saved ? JSON.parse(saved) : initialParties;
    } catch {
      return initialParties;
    }
  });

  const [vehicles, setVehicles] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      return saved ? JSON.parse(saved) : initialVehicles;
    } catch {
      return initialVehicles;
    }
  });

  const [weighbridgeEntries, setWeighbridgeEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEIGHBRIDGE);
      return saved ? JSON.parse(saved) : initialWeighbridgeEntries;
    } catch {
      return initialWeighbridgeEntries;
    }
  });

  const [deliveryNotes, setDeliveryNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DELIVERY_NOTES);
      return saved ? JSON.parse(saved) : initialDeliveryNotes;
    } catch {
      return initialDeliveryNotes;
    }
  });

  // Sync to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
  }, [parties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEIGHBRIDGE, JSON.stringify(weighbridgeEntries));
  }, [weighbridgeEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELIVERY_NOTES, JSON.stringify(deliveryNotes));
  }, [deliveryNotes]);

  // Toast Helper
  const showToast = (message, type = 'success', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auto Number Generators
  const getNextSlipNumber = () => {
    const prefix = settings.weighbridgePrefix || 'WB-2026-';
    // Find highest existing numeric suffix with matching prefix
    let maxNum = 0;
    weighbridgeEntries.forEach((entry) => {
      if (entry.slipNumber && entry.slipNumber.startsWith(prefix)) {
        const numPart = parseInt(entry.slipNumber.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    });
    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  };

  const getNextDeliveryNoteNumber = () => {
    const prefix = settings.deliveryNotePrefix || 'DN-2026-';
    let maxNum = 0;
    deliveryNotes.forEach((note) => {
      if (note.deliveryNoteNumber && note.deliveryNoteNumber.startsWith(prefix)) {
        const numPart = parseInt(note.deliveryNoteNumber.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    });
    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  };

  // --- WEIGHBRIDGE CRUD ---
  const addWeighbridgeEntry = (entryData) => {
    const now = new Date().toISOString();
    const newEntry = {
      ...entryData,
      id: `wb-${Date.now()}`,
      slipNumber: entryData.slipNumber || getNextSlipNumber(),
      createdAt: now,
      updatedAt: now
    };

    // Also auto-save party/vehicle/material if they are brand new and not yet in master
    autoSyncMastersFromEntry(newEntry);

    setWeighbridgeEntries((prev) => [newEntry, ...prev]);
    showToast(`Weighbridge Slip ${newEntry.slipNumber} created successfully!`, 'success', 'Entry Saved');
    return newEntry;
  };

  const updateWeighbridgeEntry = (entryData) => {
    const now = new Date().toISOString();
    setWeighbridgeEntries((prev) =>
      prev.map((item) => (item.id === entryData.id ? { ...entryData, updatedAt: now } : item))
    );
    showToast(`Weighbridge Slip ${entryData.slipNumber} updated successfully!`, 'success', 'Entry Updated');
  };

  const deleteWeighbridgeEntry = (id) => {
    const target = weighbridgeEntries.find((e) => e.id === id);
    setWeighbridgeEntries((prev) => prev.filter((item) => item.id !== id));
    showToast(`Slip ${target?.slipNumber || ''} has been deleted.`, 'info', 'Record Deleted');
  };

  // --- DELIVERY NOTES CRUD ---
  const addDeliveryNote = (dnData) => {
    const now = new Date().toISOString();
    const newNote = {
      ...dnData,
      id: `dn-${Date.now()}`,
      deliveryNoteNumber: dnData.deliveryNoteNumber || getNextDeliveryNoteNumber(),
      createdAt: now,
      updatedAt: now
    };

    autoSyncMastersFromDeliveryNote(newNote);

    setDeliveryNotes((prev) => [newNote, ...prev]);
    showToast(`Delivery Note ${newNote.deliveryNoteNumber} created!`, 'success', 'Note Created');
    return newNote;
  };

  const updateDeliveryNote = (dnData) => {
    const now = new Date().toISOString();
    setDeliveryNotes((prev) =>
      prev.map((item) => (item.id === dnData.id ? { ...dnData, updatedAt: now } : item))
    );
    showToast(`Delivery Note ${dnData.deliveryNoteNumber} updated!`, 'success', 'Note Updated');
  };

  const deleteDeliveryNote = (id) => {
    const target = deliveryNotes.find((d) => d.id === id);
    setDeliveryNotes((prev) => prev.filter((item) => item.id !== id));
    showToast(`Delivery Note ${target?.deliveryNoteNumber || ''} deleted.`, 'info', 'Record Deleted');
  };

  // Auto-sync new parties/vehicles/materials created on the fly
  const autoSyncMastersFromEntry = (entry) => {
    if (entry.partyName) {
      const exists = parties.some(
        (p) => p.partyName.trim().toLowerCase() === entry.partyName.trim().toLowerCase()
      );
      if (!exists) {
        addParty({
          partyName: entry.partyName.trim(),
          contactNumber: '',
          address: '',
          status: 'Active'
        }, false);
      }
    }

    if (entry.vehicleNumber) {
      const exists = vehicles.some(
        (v) => v.vehicleNumber.trim().toLowerCase() === entry.vehicleNumber.trim().toLowerCase()
      );
      if (!exists) {
        addVehicle({
          vehicleNumber: entry.vehicleNumber.trim().toUpperCase(),
          driverName: '',
          driverPhone: '',
          status: 'Active'
        }, false);
      }
    }

    if (entry.materialName) {
      const exists = materials.some(
        (m) => m.materialName.trim().toLowerCase() === entry.materialName.trim().toLowerCase()
      );
      if (!exists) {
        addMaterial({
          materialName: entry.materialName.trim(),
          bagWeightKg: parseFloat(entry.bagWeightKg) || 40,
          unit: 'Bags',
          status: 'Active'
        }, false);
      }
    }
  };

  const autoSyncMastersFromDeliveryNote = (dn) => {
    if (dn.partyName) {
      const exists = parties.some(
        (p) => p.partyName.trim().toLowerCase() === dn.partyName.trim().toLowerCase()
      );
      if (!exists) {
        addParty({
          partyName: dn.partyName.trim(),
          contactNumber: '',
          address: dn.deliveryLocation || '',
          status: 'Active'
        }, false);
      }
    }

    if (dn.vehicleNumber) {
      const exists = vehicles.some(
        (v) => v.vehicleNumber.trim().toLowerCase() === dn.vehicleNumber.trim().toLowerCase()
      );
      if (!exists) {
        addVehicle({
          vehicleNumber: dn.vehicleNumber.trim().toUpperCase(),
          driverName: '',
          driverPhone: dn.driverPhone || '',
          status: 'Active'
        }, false);
      }
    }
  };

  // --- PARTIES CRUD ---
  const addParty = (partyData, showNotification = true) => {
    const now = new Date().toISOString();
    const newParty = {
      ...partyData,
      id: `pty-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: partyData.status || 'Active',
      createdAt: now,
      updatedAt: now
    };
    setParties((prev) => [newParty, ...prev]);
    if (showNotification) {
      showToast(`Party "${newParty.partyName}" added successfully!`, 'success', 'Party Saved');
    }
    return newParty;
  };

  const updateParty = (partyData) => {
    const now = new Date().toISOString();
    setParties((prev) =>
      prev.map((item) => (item.id === partyData.id ? { ...partyData, updatedAt: now } : item))
    );
    showToast(`Party "${partyData.partyName}" updated!`, 'success', 'Party Updated');
  };

  const deleteParty = (id) => {
    const target = parties.find((p) => p.id === id);
    setParties((prev) => prev.filter((item) => item.id !== id));
    showToast(`Party "${target?.partyName}" deleted.`, 'info', 'Party Deleted');
  };

  // --- VEHICLES CRUD ---
  const addVehicle = (vehData, showNotification = true) => {
    const now = new Date().toISOString();
    const newVeh = {
      ...vehData,
      vehicleNumber: vehData.vehicleNumber.trim().toUpperCase(),
      id: `veh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: vehData.status || 'Active',
      createdAt: now,
      updatedAt: now
    };
    setVehicles((prev) => [newVeh, ...prev]);
    if (showNotification) {
      showToast(`Vehicle "${newVeh.vehicleNumber}" added!`, 'success', 'Vehicle Saved');
    }
    return newVeh;
  };

  const updateVehicle = (vehData) => {
    const now = new Date().toISOString();
    setVehicles((prev) =>
      prev.map((item) =>
        item.id === vehData.id
          ? { ...vehData, vehicleNumber: vehData.vehicleNumber.trim().toUpperCase(), updatedAt: now }
          : item
      )
    );
    showToast(`Vehicle "${vehData.vehicleNumber}" updated!`, 'success', 'Vehicle Updated');
  };

  const deleteVehicle = (id) => {
    const target = vehicles.find((v) => v.id === id);
    setVehicles((prev) => prev.filter((item) => item.id !== id));
    showToast(`Vehicle "${target?.vehicleNumber}" deleted.`, 'info', 'Vehicle Deleted');
  };

  // --- MATERIALS CRUD ---
  const addMaterial = (matData, showNotification = true) => {
    const now = new Date().toISOString();
    const newMat = {
      ...matData,
      bagWeightKg: parseFloat(matData.bagWeightKg) || 40,
      unit: matData.unit || 'Bags',
      id: `mat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: matData.status || 'Active',
      createdAt: now,
      updatedAt: now
    };
    setMaterials((prev) => [newMat, ...prev]);
    if (showNotification) {
      showToast(`Material "${newMat.materialName}" (${newMat.bagWeightKg} KG) added!`, 'success', 'Material Saved');
    }
    return newMat;
  };

  const updateMaterial = (matData) => {
    const now = new Date().toISOString();
    setMaterials((prev) =>
      prev.map((item) =>
        item.id === matData.id
          ? { ...matData, bagWeightKg: parseFloat(matData.bagWeightKg) || 40, updatedAt: now }
          : item
      )
    );
    showToast(`Material "${matData.materialName}" updated!`, 'success', 'Material Updated');
  };

  const deleteMaterial = (id) => {
    const target = materials.find((m) => m.id === id);
    setMaterials((prev) => prev.filter((item) => item.id !== id));
    showToast(`Material "${target?.materialName}" deleted.`, 'info', 'Material Deleted');
  };

  // --- SETTINGS & SYSTEM UTILITIES ---
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Company settings updated successfully!', 'success', 'Settings Saved');
  };

  const restoreDatabase = (backupData) => {
    try {
      if (backupData.settings) setSettings(backupData.settings);
      if (backupData.materials) setMaterials(backupData.materials);
      if (backupData.parties) setParties(backupData.parties);
      if (backupData.vehicles) setVehicles(backupData.vehicles);
      if (backupData.weighbridgeEntries) setWeighbridgeEntries(backupData.weighbridgeEntries);
      if (backupData.deliveryNotes) setDeliveryNotes(backupData.deliveryNotes);
      showToast('System database restored successfully from backup!', 'success', 'Restore Complete');
      return true;
    } catch (err) {
      showToast('Failed to restore backup: ' + err.message, 'error', 'Restore Failed');
      return false;
    }
  };

  const resetToSampleData = () => {
    setSettings(initialCompanySettings);
    setMaterials(initialMaterials);
    setParties(initialParties);
    setVehicles(initialVehicles);
    setWeighbridgeEntries(initialWeighbridgeEntries);
    setDeliveryNotes(initialDeliveryNotes);
    localStorage.clear();
    showToast('All records reset to sample demo data.', 'info', 'Reset Complete');
  };

  // Full Database State snapshot for export
  const getDatabaseSnapshot = () => ({
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    settings,
    materials,
    parties,
    vehicles,
    weighbridgeEntries,
    deliveryNotes
  });

  return (
    <AppContext.Provider
      value={{
        // View & Navigation
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        globalSearchQuery,
        setGlobalSearchQuery,

        // Modal triggers
        editingWbId,
        setEditingWbId,
        viewingWbEntry,
        setViewingWbEntry,
        editingDnId,
        setEditingDnId,
        viewingDn,
        setViewingDn,

        // Notifications
        toasts,
        showToast,
        removeToast,

        // Data State
        settings,
        materials,
        parties,
        vehicles,
        weighbridgeEntries,
        deliveryNotes,

        // Auto Counters
        getNextSlipNumber,
        getNextDeliveryNoteNumber,

        // Weighbridge CRUD
        addWeighbridgeEntry,
        updateWeighbridgeEntry,
        deleteWeighbridgeEntry,

        // Delivery Notes CRUD
        addDeliveryNote,
        updateDeliveryNote,
        deleteDeliveryNote,

        // Masters CRUD
        addParty,
        updateParty,
        deleteParty,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addMaterial,
        updateMaterial,
        deleteMaterial,

        // System
        updateSettings,
        restoreDatabase,
        resetToSampleData,
        getDatabaseSnapshot
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

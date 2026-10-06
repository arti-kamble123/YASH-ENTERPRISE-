import React from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ToastContainer from './components/ToastContainer';

// Views
import DashboardView from './components/Dashboard/DashboardView';
import WeighbridgeForm from './components/Weighbridge/WeighbridgeForm';
import WeighbridgeRecords from './components/Weighbridge/WeighbridgeRecords';
import WeighbridgeReports from './components/Weighbridge/WeighbridgeReports';
import WeighbridgeSlipModal from './components/Weighbridge/WeighbridgeSlipModal';

import DeliveryNoteForm from './components/DeliveryNotes/DeliveryNoteForm';
import DeliveryNoteHistory from './components/DeliveryNotes/DeliveryNoteHistory';
import DeliveryNoteModal from './components/DeliveryNotes/DeliveryNoteModal';

import PartyMaster from './components/Masters/PartyMaster';
import VehicleMaster from './components/Masters/VehicleMaster';
import MaterialMaster from './components/Masters/MaterialMaster';
import CombinedReports from './components/Reports/CombinedReports';
import SettingsView from './components/Settings/SettingsView';
import PDFStudioView from './components/PDFStudio/PDFStudioView';

export default function App() {
  const { activeTab } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'wb-new':
        return <WeighbridgeForm />;
      case 'wb-records':
        return <WeighbridgeRecords />;
      case 'wb-reports':
        return <WeighbridgeReports />;
      case 'dn-new':
        return <DeliveryNoteForm />;
      case 'dn-history':
        return <DeliveryNoteHistory />;
      case 'masters-parties':
        return <PartyMaster />;
      case 'masters-vehicles':
        return <VehicleMaster />;
      case 'masters-materials':
        return <MaterialMaster />;
      case 'pdf-studio':
        return <PDFStudioView />;
      case 'reports':
        return <CombinedReports />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main App Content Area */}
      <div className="main-wrapper">
        <Header />

        <main className="content-area">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <WeighbridgeSlipModal />
      <DeliveryNoteModal />

      {/* Notification Toast Stack */}
      <ToastContainer />
    </div>
  );
}

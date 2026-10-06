import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  Scale,
  FileText,
  Clock,
  PlusCircle,
  Building2,
  Calendar
} from 'lucide-react';
import { formatDateTime } from '../utils/calculations';

export default function Header() {
  const {
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    settings,
    setEditingWbId,
    setEditingDnId
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Executive Overview';
      case 'wb-new':
        return 'New Weighbridge Entry';
      case 'wb-records':
        return 'Weighbridge Slip Records';
      case 'wb-reports':
        return 'Weighbridge Reports';
      case 'dn-new':
        return 'New Delivery Note';
      case 'dn-history':
        return 'Delivery Note History';
      case 'masters-parties':
        return 'Party Master Directory';
      case 'masters-vehicles':
        return 'Vehicle Master Registry';
      case 'masters-materials':
        return 'Material & Bag Weight Master';
      case 'pdf-studio':
        return 'PDF Design Studio & Live Document Preview';
      case 'reports':
        return 'Consolidated Reports & Analytics';
      case 'settings':
        return 'System & Company Settings';
      default:
        return 'Management System';
    }
  };

  const handleNewWbClick = () => {
    setEditingWbId(null);
    setActiveTab('wb-new');
  };

  const handleNewDnClick = () => {
    setEditingDnId(null);
    setActiveTab('dn-new');
  };

  return (
    <header className="app-header no-print">
      <div className="header-left">
        <button
          className="menu-toggle-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-box">
          <h1>{getTabTitle()}</h1>
          <p>{settings.companyName || 'YASH ENTERPRISE'} • Operations Control</p>
        </div>
      </div>

      <div className="header-right">
        <div className="live-datetime-badge">
          <span className="live-indicator-dot" />
          <Clock size={14} style={{ color: 'var(--primary)' }} />
          <span>{formatDateTime(currentTime)}</span>
        </div>

        <div className="header-quick-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={handleNewWbClick}
            title="Create Weighbridge Entry"
          >
            <Scale size={16} />
            <span>+ New Slip</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleNewDnClick}
            title="Create Delivery Note"
          >
            <FileText size={16} />
            <span>+ New DN</span>
          </button>
        </div>
      </div>
    </header>
  );
}

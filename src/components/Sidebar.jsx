import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Scale,
  FileSpreadsheet,
  BarChart3,
  FileText,
  History,
  Users,
  Truck,
  Boxes,
  TrendingUp,
  Settings,
  Building2,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    isSidebarOpen,
    weighbridgeEntries,
    deliveryNotes,
    parties,
    vehicles,
    materials,
    settings
  } = useApp();

  const navItems = [
    {
      type: 'item',
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      type: 'section',
      title: 'Weighbridge'
    },
    {
      type: 'item',
      id: 'wb-new',
      label: 'New Weighbridge Entry',
      icon: Scale,
      isAction: true
    },
    {
      type: 'item',
      id: 'wb-records',
      label: 'Weighbridge Records',
      icon: FileSpreadsheet,
      badge: weighbridgeEntries.length
    },
    {
      type: 'item',
      id: 'wb-reports',
      label: 'Weighbridge Reports',
      icon: BarChart3
    },
    {
      type: 'section',
      title: 'Delivery Notes'
    },
    {
      type: 'item',
      id: 'dn-new',
      label: 'New Delivery Note',
      icon: FileText,
      isAction: true
    },
    {
      type: 'item',
      id: 'dn-history',
      label: 'Delivery Note History',
      icon: History,
      badge: deliveryNotes.length
    },
    {
      type: 'section',
      title: 'Master Data'
    },
    {
      type: 'item',
      id: 'masters-parties',
      label: 'Parties',
      icon: Users,
      badge: parties.length
    },
    {
      type: 'item',
      id: 'masters-vehicles',
      label: 'Vehicles',
      icon: Truck,
      badge: vehicles.length
    },
    {
      type: 'item',
      id: 'masters-materials',
      label: 'Materials',
      icon: Boxes,
      badge: materials.length
    },
    {
      type: 'section',
      title: 'Intelligence & Studio'
    },
    {
      type: 'item',
      id: 'pdf-studio',
      label: 'PDF Design Studio',
      icon: Sparkles
    },
    {
      type: 'item',
      id: 'reports',
      label: 'Reports & Analytics',
      icon: TrendingUp
    },
    {
      type: 'item',
      id: 'settings',
      label: 'System Settings',
      icon: Settings
    }
  ];

  if (!isSidebarOpen) return null;

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Building2 size={24} />
        </div>
        <div className="sidebar-brand-text">
          <h2>{settings.companyName || 'YASH ENTERPRISE'}</h2>
          <p>Weigh & Logistics System</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => {
          if (item.type === 'section') {
            return (
              <div key={`section-${index}`} className="nav-section-title">
                {item.title}
              </div>
            );
          }

          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
              {typeof item.badge !== 'undefined' && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div>
          <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} style={{ color: '#38bdf8' }} />
            <span>v1.0.0 Commercial</span>
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Yash Enterprise</span>
      </div>
    </aside>
  );
}

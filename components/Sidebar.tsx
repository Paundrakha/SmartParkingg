'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  DoorOpen,
  Search,
  History,
  BarChart3,
  Settings,
  Car,
  Wifi,
  WifiOff,
  Loader2,
} from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/monitoring', label: 'Monitoring RFID', icon: CreditCard },
  { href: '/kontrol', label: 'Kontrol Portal', icon: DoorOpen },
  { href: '/pencarian', label: 'Pencarian', icon: Search },
  { href: '/riwayat', label: 'Riwayat', icon: History },
  { href: '/statistik', label: 'Statistik', icon: BarChart3 },
  { href: '/pengaturan', label: 'Pengaturan MQTT', icon: Settings },
];

const statusConfig = {
  connected: { icon: Wifi, color: '#22c55e', label: 'Terhubung' },
  connecting: { icon: Loader2, color: '#f59e0b', label: 'Menghubungkan...' },
  disconnected: { icon: WifiOff, color: '#6b7280', label: 'Terputus' },
  error: { icon: WifiOff, color: '#ef4444', label: 'Error' },
};

export default function Sidebar() {
  const pathname = usePathname();
  const { status } = useMQTT();
  const s = statusConfig[status];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Car size={22} />
        </div>
        <div>
          <div className="brand-title">ParkIoT</div>
          <div className="brand-sub">FT UNY Smart Parking</div>
        </div>
      </div>

      <div className="mqtt-badge">
        <s.icon
          size={13}
          className={status === 'connecting' ? 'spin' : ''}
          style={{ color: s.color }}
        />
        <span style={{ color: s.color }}>{s.label}</span>
        <span className="mqtt-dot" style={{ background: s.color }} />
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-info">IoToria MQTT • ESP32-S3</div>
        <div className="footer-info">paundrakha@iotoria.web.id</div>
      </div>
    </aside>
  );
}

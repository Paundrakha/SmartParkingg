'use client';

import {
  Car, LogIn, LogOut, ParkingSquare, DoorOpen,
  Wifi, WifiOff, Loader2, AlertCircle
} from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';

function StatCard({
  label, value, meta, color, icon: Icon,
}: {
  label: string; value: string | number; meta: string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="stat-card" style={{ '--accent-color': color } as React.CSSProperties}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-meta">{meta}</div>
      <div className="stat-icon"><Icon size={28} /></div>
    </div>
  );
}

const statusConfig = {
  connected: { icon: Wifi, color: '#22c55e', text: 'Terhubung ke MQTT broker' },
  connecting: { icon: Loader2, color: '#f59e0b', text: 'Menghubungkan ke broker...' },
  disconnected: { icon: WifiOff, color: '#6b7280', text: 'Tidak terhubung' },
  error: { icon: AlertCircle, color: '#ef4444', text: 'Koneksi error' },
};

export default function DashboardPage() {
  const { parking, status, connect } = useMQTT();
  const s = statusConfig[status];
  const pct = Math.round((parking.slotTerisi / parking.totalSlot) * 100);

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <div className="page-title">Dashboard</div>
            <div className="page-sub">Monitoring parkir real-time · Fakultas Teknik UNY</div>
          </div>
          <div
            className="badge"
            style={{
              background: `${s.color}18`,
              color: s.color,
              border: `1px solid ${s.color}30`,
              fontSize: 11,
              padding: '6px 14px',
            }}
          >
            <s.icon size={12} className={status === 'connecting' ? 'spin' : ''} />
            {s.text}
          </div>
        </div>
      </div>

      {/* MQTT connection banner */}
      {status !== 'connected' && (
        <div
          className="card mb-6 flex items-center justify-between"
          style={{ borderColor: `${s.color}40`, background: `${s.color}08` }}
        >
          <div className="flex items-center gap-3">
            <s.icon size={16} style={{ color: s.color }} className={status === 'connecting' ? 'spin' : ''} />
            <span style={{ color: s.color, fontFamily: 'JetBrains Mono', fontSize: 12 }}>
              {status === 'connecting' ? 'Sedang menghubungkan ke iotoria.web.id...' : 'Tidak terhubung ke MQTT broker'}
            </span>
          </div>
          {status !== 'connecting' && (
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={connect}>
              Hubungkan
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid">
        <StatCard label="Kendaraan Masuk" value={parking.kendaraanMasuk} meta="hari ini" color="#00e5ff" icon={LogIn} />
        <StatCard label="Kendaraan Keluar" value={parking.kendaraanKeluar} meta="hari ini" color="#ffab00" icon={LogOut} />
        <StatCard label="Slot Terisi" value={parking.slotTerisi} meta={`dari ${parking.totalSlot} slot`} color="#00e676" icon={Car} />
        <StatCard label="Slot Kosong" value={parking.slotKosong} meta="tersedia" color="#7c3aed" icon={ParkingSquare} />
      </div>

      {/* Occupancy */}
      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-title">Kapasitas Parkir</div>
          <div style={{ marginBottom: 14 }}>
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontFamily: 'Space Mono', fontSize: 28, fontWeight: 700, color: pct > 80 ? 'var(--red)' : pct > 50 ? 'var(--amber)' : 'var(--green)' }}>
                {pct}%
              </span>
              <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>
                {parking.slotTerisi}/{parking.totalSlot}
              </span>
            </div>
            <div className="progress-wrap">
              <div
                className="progress-bar"
                style={{
                  width: `${pct}%`,
                  background: pct > 80 ? 'var(--red)' : pct > 50 ? 'var(--amber)' : 'var(--green)',
                }}
              />
            </div>
          </div>
          <div className="slot-grid">
            {Array.from({ length: parking.totalSlot }, (_, i) => (
              <div
                key={i}
                className={`slot-cell ${i < parking.slotTerisi ? 'filled' : 'empty'}`}
                title={i < parking.slotTerisi ? `Slot ${i + 1} – Terisi` : `Slot ${i + 1} – Kosong`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Portal status */}
        <div className="card">
          <div className="card-title">Status Portal</div>
          <div className="flex" style={{ flexDirection: 'column', gap: 12 }}>
            {(['masuk', 'keluar'] as const).map((p) => {
              const isOpen = (p === 'masuk' ? parking.portalMasuk : parking.portalKeluar) === 'OPEN';
              return (
                <div key={p} className="portal-card" style={{ borderColor: isOpen ? 'rgba(0,230,118,0.25)' : 'var(--border)' }}>
                  <div style={{ position: 'relative' }}>
                    <div
                      className="portal-indicator pulse-glow"
                      style={{
                        background: isOpen ? 'var(--green)' : 'var(--text3)',
                        color: isOpen ? 'var(--green)' : 'var(--text3)',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="portal-name">Portal {p === 'masuk' ? 'Masuk' : 'Keluar'}</div>
                    <div className="portal-status">{isOpen ? '🟢 TERBUKA' : '🔴 TERTUTUP'}</div>
                  </div>
                  <DoorOpen size={20} style={{ color: isOpen ? 'var(--green)' : 'var(--text3)' }} />
                </div>
              );
            })}

            {/* MQTT info */}
            <div style={{ marginTop: 8, padding: '14px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div className="card-title" style={{ marginBottom: 10 }}>Koneksi MQTT</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Broker', 'iotoria.web.id'],
                  ['Port (WS)', '8083'],
                  ['Username', 'paundrakha'],
                  ['Status', status.toUpperCase()],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1 }}>{k}</div>
                    <div style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

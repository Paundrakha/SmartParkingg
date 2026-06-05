'use client';

import { useState } from 'react';
import { DoorOpen, DoorClosed, LogIn, LogOut, AlertTriangle, Wifi } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';

function PortalControlCard({
  label,
  icon: Icon,
  accentColor,
  portalStatus,
  onOpen,
  onClose,
  disabled,
}: {
  label: string;
  icon: React.ElementType;
  accentColor: string;
  portalStatus: 'OPEN' | 'CLOSED';
  onOpen: () => void;
  onClose: () => void;
  disabled: boolean;
}) {
  const isOpen = portalStatus === 'OPEN';

  return (
    <div
      className="portal-control-card"
      style={{
        border: `1px solid ${isOpen ? 'rgba(0,230,118,0.3)' : 'var(--border)'}`,
        transition: 'border-color 0.3s',
      }}
    >
      <div className="portal-control-header">
        <div
          className="portal-icon-big"
          style={{
            background: isOpen ? 'rgba(0,230,118,0.1)' : `${accentColor}18`,
            border: `1px solid ${isOpen ? 'rgba(0,230,118,0.3)' : `${accentColor}30`}`,
          }}
        >
          <Icon size={24} style={{ color: isOpen ? 'var(--green)' : accentColor }} />
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>{label}</div>
          <div style={{ marginTop: 4 }}>
            <span
              className={`badge ${isOpen ? 'badge-green' : 'badge-red'}`}
              style={{ fontSize: 11 }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'currentColor',
                  display: 'inline-block',
                }}
                className={isOpen ? 'blink' : ''}
              />
              {isOpen ? 'TERBUKA' : 'TERTUTUP'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual gate */}
      <div
        style={{
          height: 80,
          background: 'var(--bg3)',
          borderRadius: 10,
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: isOpen ? '15%' : '85%',
            background: isOpen ? 'rgba(0,230,118,0.08)' : 'rgba(255,23,68,0.08)',
            borderRight: `2px solid ${isOpen ? 'var(--green)' : 'var(--red)'}`,
            transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            borderRadius: '0 4px 4px 0',
          }}
        />
        {isOpen ? (
          <DoorOpen size={28} style={{ color: 'var(--green)', position: 'relative', zIndex: 1 }} />
        ) : (
          <DoorClosed size={28} style={{ color: 'var(--text3)', position: 'relative', zIndex: 1 }} />
        )}
        <span
          style={{
            position: 'relative',
            zIndex: 1,
            marginLeft: 10,
            fontFamily: 'Space Mono',
            fontSize: 13,
            color: isOpen ? 'var(--green)' : 'var(--text3)',
          }}
        >
          {isOpen ? 'OPEN' : 'CLOSED'}
        </span>
      </div>

      <div className="btn-row">
        <button
          className="btn btn-success"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={onOpen}
          disabled={disabled || isOpen}
        >
          <DoorOpen size={16} />
          Buka Portal
        </button>
        <button
          className="btn btn-danger"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={onClose}
          disabled={disabled || !isOpen}
        >
          <DoorClosed size={16} />
          Tutup Portal
        </button>
      </div>

      <div
        style={{
          background: 'var(--bg3)',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 11,
          color: 'var(--text3)',
          fontFamily: 'JetBrains Mono',
          border: '1px solid var(--border)',
        }}
      >
        Publish ke: <span style={{ color: 'var(--accent)' }}>
          paundrakha/portal_{label.toLowerCase().replace(' ', '_')}_manual
        </span>
        <br />
        Payload: <span style={{ color: 'var(--green)' }}>1</span> = Buka,{' '}
        <span style={{ color: 'var(--red)' }}>0</span> = Tutup
      </div>
    </div>
  );
}

export default function KontrolPage() {
  const { parking, status, publishManual } = useMQTT();
  const [confirm, setConfirm] = useState<null | { portal: 'masuk' | 'keluar'; action: '1' | '0' }>(null);
  const disconnected = status !== 'connected';

  const handleAction = (portal: 'masuk' | 'keluar', action: '1' | '0') => {
    setConfirm({ portal, action });
  };

  const doPublish = () => {
    if (confirm) {
      publishManual(confirm.portal, confirm.action);
      setConfirm(null);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Kontrol Portal Manual</div>
        <div className="page-sub">Buka / tutup portal masuk & keluar secara manual via MQTT</div>
      </div>

      {disconnected && (
        <div className="card mb-6 flex items-center gap-3" style={{ borderColor: 'rgba(255,23,68,0.3)', background: 'rgba(255,23,68,0.05)' }}>
          <Wifi size={16} style={{ color: 'var(--red)' }} />
          <span style={{ color: 'var(--red)', fontFamily: 'JetBrains Mono', fontSize: 12 }}>
            Tidak terhubung ke MQTT — kontrol portal tidak tersedia
          </span>
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, backdropFilter: 'blur(4px)',
          }}
        >
          <div className="card" style={{ maxWidth: 360, width: '90%', border: '1px solid var(--border2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <AlertTriangle size={22} style={{ color: 'var(--amber)' }} />
              <div style={{ fontSize: 16, fontWeight: 700 }}>Konfirmasi Aksi</div>
            </div>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20 }}>
              {confirm.action === '1' ? 'Buka' : 'Tutup'} portal{' '}
              <strong style={{ color: 'var(--text)' }}>{confirm.portal}</strong>?
            </p>
            <div className="btn-row">
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setConfirm(null)}>Batal</button>
              <button
                className={`btn ${confirm.action === '1' ? 'btn-success' : 'btn-danger'}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={doPublish}
              >
                Ya, {confirm.action === '1' ? 'Buka' : 'Tutup'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2">
        <PortalControlCard
          label="Portal Masuk"
          icon={LogIn}
          accentColor="var(--accent)"
          portalStatus={parking.portalMasuk}
          onOpen={() => handleAction('masuk', '1')}
          onClose={() => handleAction('masuk', '0')}
          disabled={disconnected}
        />
        <PortalControlCard
          label="Portal Keluar"
          icon={LogOut}
          accentColor="var(--amber)"
          portalStatus={parking.portalKeluar}
          onOpen={() => handleAction('keluar', '1')}
          onClose={() => handleAction('keluar', '0')}
          disabled={disconnected}
        />
      </div>

      <div className="card mt-4">
        <div className="card-title">Keterangan</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text2)', fontFamily: 'JetBrains Mono' }}>
          <div>• Portal akan menutup otomatis setelah <strong style={{ color: 'var(--amber)' }}>5 detik</strong> (sesuai PORTAL_DELAY di firmware)</div>
          <div>• Perintah manual dikirim via MQTT ke topic <span style={{ color: 'var(--accent)' }}>paundrakha/portal_masuk_manual</span> atau <span style={{ color: 'var(--accent)' }}>paundrakha/portal_keluar_manual</span></div>
          <div>• Status portal di-update dari topic retain <span style={{ color: 'var(--accent)' }}>paundrakha/portal_masuk_status</span> / <span style={{ color: 'var(--accent)' }}>paundrakha/portal_keluar_status</span></div>
        </div>
      </div>
    </>
  );
}

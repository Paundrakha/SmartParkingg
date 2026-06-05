'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Wifi, WifiOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';
import { MQTTConfig } from '@/types';
import { TOPICS } from '@/lib/mqttConfig';

export default function PengaturanPage() {
  const { config, setConfig, status, connect, disconnect } = useMQTT();
  const [form, setForm] = useState<MQTTConfig>(config);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(config);
  }, [config]);

  const handleSave = () => {
    setConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReconnect = () => {
    disconnect();
    setTimeout(() => connect(), 300);
  };

  const statusConfig = {
    connected: { icon: Wifi, color: '#22c55e', label: 'Terhubung', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)' },
    connecting: { icon: Loader2, color: '#f59e0b', label: 'Menghubungkan...', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
    disconnected: { icon: WifiOff, color: '#6b7280', label: 'Terputus', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.25)' },
    error: { icon: AlertCircle, color: '#ef4444', label: 'Error Koneksi', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
  };

  const s = statusConfig[status];

  return (
    <>
      <div className="page-header">
        <div className="page-title">Pengaturan MQTT</div>
        <div className="page-sub">Konfigurasi koneksi ke broker IoToria</div>
      </div>

      {/* Status bar */}
      <div className="card mb-6" style={{ background: s.bg, borderColor: s.border }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <s.icon size={18} style={{ color: s.color }} className={status === 'connecting' ? 'spin' : ''} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>
                ws://{config.broker}:{config.port}/mqtt
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={handleReconnect} style={{ fontSize: 12 }}>
              <RefreshCw size={13} />
              Reconnect
            </button>
            {status === 'connected' ? (
              <button className="btn btn-danger" onClick={disconnect} style={{ fontSize: 12 }}>
                <WifiOff size={13} />
                Putuskan
              </button>
            ) : (
              <button className="btn btn-success" onClick={connect} style={{ fontSize: 12 }}>
                <Wifi size={13} />
                Hubungkan
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Form config */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={15} style={{ color: 'var(--text3)' }} />
            <div className="card-title" style={{ marginBottom: 0 }}>Konfigurasi Broker</div>
          </div>

          <div className="input-group">
            <label className="input-label">MQTT Broker Host</label>
            <input
              className="input"
              value={form.broker}
              onChange={(e) => setForm({ ...form, broker: e.target.value })}
              placeholder="iotoria.web.id"
            />
          </div>

          <div className="input-group">
            <label className="input-label">WebSocket Port</label>
            <input
              className="input"
              type="number"
              value={form.port}
              onChange={(e) => setForm({ ...form, port: Number(e.target.value) })}
              placeholder="8083"
            />
            <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'JetBrains Mono', marginTop: 4 }}>
              Port WebSocket untuk browser (bukan port MQTT standard 1883)
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Username</label>
            <input
              className="input"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="paundrakha"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Client ID</label>
            <input
              className="input"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSave}>
            {saved ? <CheckCircle size={15} /> : <Save size={15} />}
            {saved ? 'Tersimpan!' : 'Simpan Pengaturan'}
          </button>
        </div>

        {/* Topic list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="card-title">Daftar Topic MQTT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(TOPICS).map(([key, topic]) => {
                const isPublish = key.includes('MANUAL');
                const isSubscribe = !isPublish;
                return (
                  <div key={key} style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className={`badge ${isPublish ? 'badge-amber' : 'badge-blue'}`} style={{ fontSize: 9 }}>
                        {isPublish ? 'PUBLISH' : 'SUBSCRIBE'}
                      </span>
                      <span style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1 }}>{key.replace(/_/g, ' ')}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'JetBrains Mono' }}>{topic}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Catatan Penting</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>
              <div>• Browser memerlukan koneksi <strong style={{ color: 'var(--amber)' }}>WebSocket (ws://)</strong> bukan TCP MQTT langsung</div>
              <div>• IoToria default WebSocket port: <strong style={{ color: 'var(--accent)' }}>8083</strong></div>
              <div>• Jika tidak terhubung, pastikan IoToria mengaktifkan WebSocket listener</div>
              <div>• Pengaturan disimpan di <strong style={{ color: 'var(--text2)' }}>localStorage</strong> browser</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

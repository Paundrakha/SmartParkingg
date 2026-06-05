'use client';

import { CreditCard, CheckCircle, XCircle, ArrowDown, ArrowUp } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';
import { RFIDData } from '@/types';

function RFIDCard({ data, tipe }: { data: RFIDData | null; tipe: 'MASUK' | 'KELUAR' }) {
  if (!data) return (
    <div className="empty-state" style={{ padding: '30px 20px' }}>
      <CreditCard size={32} className="empty-state-icon" />
      <div className="empty-state-text">Menunggu scan kartu {tipe.toLowerCase()}...</div>
    </div>
  );

  const dikenal = data.status === 'DIKENAL';
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: dikenal ? 'rgba(0,230,118,0.1)' : 'rgba(255,23,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${dikenal ? 'rgba(0,230,118,0.3)' : 'rgba(255,23,68,0.3)'}` }}>
          {dikenal ? <CheckCircle size={20} style={{ color: 'var(--green)' }} /> : <XCircle size={20} style={{ color: 'var(--red)' }} />}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
            {dikenal ? data.nama : 'Kartu Tidak Terdaftar'}
          </div>
          <span className={`badge ${dikenal ? 'badge-green' : 'badge-red'}`} style={{ marginTop: 3, display: 'inline-flex' }}>
            {data.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          ['UID', data.uid],
          ['NIM', data.nim || '—'],
          ['Prodi', data.prodi || '—'],
          ['Plat', data.plat || '—'],
        ].map(([k, v]) => (
          <div key={k} style={{ background: 'var(--bg3)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MonitoringPage() {
  const { lastRfidMasuk, lastRfidKeluar, riwayat } = useMQTT();

  return (
    <>
      <div className="page-header">
        <div className="page-title">Monitoring RFID</div>
        <div className="page-sub">Data kartu RFID masuk & keluar secara real-time</div>
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <ArrowDown size={15} style={{ color: 'var(--accent)' }} />
            <div className="card-title" style={{ marginBottom: 0 }}>Scan Masuk Terakhir</div>
          </div>
          <RFIDCard data={lastRfidMasuk} tipe="MASUK" />
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUp size={15} style={{ color: 'var(--amber)' }} />
            <div className="card-title" style={{ marginBottom: 0 }}>Scan Keluar Terakhir</div>
          </div>
          <RFIDCard data={lastRfidKeluar} tipe="KELUAR" />
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div className="card-title" style={{ marginBottom: 0 }}>Log Scan RFID</div>
          <span className="badge badge-gray">{riwayat.length} entri</span>
        </div>
        {riwayat.length === 0 ? (
          <div className="empty-state">
            <CreditCard size={32} className="empty-state-icon" />
            <div className="empty-state-text">Belum ada scan kartu RFID</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>UID</th>
                  <th>Nama</th>
                  <th>NIM</th>
                  <th>Plat</th>
                  <th>Tipe</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.slice(0, 50).map((r) => (
                  <tr key={r.id} className="fade-in">
                    <td className="mono" style={{ fontSize: 11 }}>
                      {r.timestamp.toLocaleTimeString('id-ID')}
                    </td>
                    <td className="mono" style={{ color: 'var(--accent)', fontSize: 11 }}>{r.uid}</td>
                    <td style={{ color: 'var(--text)', fontWeight: 600 }}>{r.nama || '—'}</td>
                    <td className="mono" style={{ fontSize: 11 }}>{r.nim || '—'}</td>
                    <td className="mono" style={{ fontSize: 11 }}>{r.plat || '—'}</td>
                    <td>
                      <span className={`badge ${r.tipe === 'MASUK' ? 'badge-blue' : 'badge-amber'}`}>
                        {r.tipe === 'MASUK' ? '↓ MASUK' : '↑ KELUAR'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${r.status === 'DIKENAL' ? 'badge-green' : 'badge-red'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

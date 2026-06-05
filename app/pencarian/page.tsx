'use client';

import { useState, useMemo } from 'react';
import { Search, Car, User, CreditCard } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';
import { RiwayatEntry } from '@/types';

export default function PencarianPage() {
  const { riwayat } = useMQTT();
  const [query, setQuery] = useState('');

  const results = useMemo<RiwayatEntry[]>(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return riwayat.filter(
      (r) =>
        r.plat?.toLowerCase().includes(q) ||
        r.nim?.toLowerCase().includes(q) ||
        r.nama?.toLowerCase().includes(q) ||
        r.uid?.toLowerCase().includes(q) ||
        r.prodi?.toLowerCase().includes(q)
    );
  }, [query, riwayat]);

  const grouped = useMemo(() => {
    const map = new Map<string, RiwayatEntry[]>();
    for (const r of results) {
      const key = r.uid;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries());
  }, [results]);

  return (
    <>
      <div className="page-header">
        <div className="page-title">Pencarian</div>
        <div className="page-sub">Cari kendaraan berdasarkan plat nomor, NIM, nama, atau UID kartu</div>
      </div>

      <div className="search-box">
        <Search size={16} className="search-icon" />
        <input
          className="search-input"
          type="text"
          placeholder="Ketik plat nomor, NIM, nama, atau UID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {query.trim() === '' ? (
        <div className="empty-state">
          <Search size={40} className="empty-state-icon" />
          <div className="empty-state-text">Masukkan kata kunci untuk mencari</div>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <Car size={40} className="empty-state-icon" />
          <div className="empty-state-text">Tidak ada hasil untuk &quot;{query}&quot;</div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16, fontSize: 12, color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>
            {results.length} transaksi ditemukan untuk &quot;{query}&quot;
          </div>

          {grouped.map(([uid, entries]) => {
            const first = entries[0];
            const masukCount = entries.filter((e) => e.tipe === 'MASUK').length;
            const keluarCount = entries.filter((e) => e.tipe === 'KELUAR').length;
            return (
              <div key={uid} className="card mb-4 fade-in">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={20} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{first.nama || 'Tidak Dikenal'}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                      <span className="badge badge-blue"><Car size={10} />{first.plat || '—'}</span>
                      <span className="badge badge-gray"><User size={10} />{first.nim || '—'}</span>
                      <span className="badge badge-gray"><CreditCard size={10} />{uid}</span>
                    </div>
                    {first.prodi && <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'JetBrains Mono', marginTop: 4 }}>{first.prodi}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-blue">↓ {masukCount}x</span>
                    <span className="badge badge-amber">↑ {keluarCount}x</span>
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Waktu</th>
                        <th>Tanggal</th>
                        <th>Tipe</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e) => (
                        <tr key={e.id}>
                          <td className="mono" style={{ fontSize: 11 }}>{e.timestamp.toLocaleTimeString('id-ID')}</td>
                          <td className="mono" style={{ fontSize: 11 }}>{e.timestamp.toLocaleDateString('id-ID')}</td>
                          <td>
                            <span className={`badge ${e.tipe === 'MASUK' ? 'badge-blue' : 'badge-amber'}`}>
                              {e.tipe === 'MASUK' ? '↓ MASUK' : '↑ KELUAR'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${e.status === 'DIKENAL' ? 'badge-green' : 'badge-red'}`}>
                              {e.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </>
      )}
    </>
  );
}

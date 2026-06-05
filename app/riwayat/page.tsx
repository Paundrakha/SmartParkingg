'use client';

import { useState } from 'react';
import { History, Filter, Download } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';

type FilterTipe = 'ALL' | 'MASUK' | 'KELUAR';
type FilterStatus = 'ALL' | 'DIKENAL' | 'TIDAK_DIKENAL';

export default function RiwayatPage() {
  const { riwayat } = useMQTT();
  const [filterTipe, setFilterTipe] = useState<FilterTipe>('ALL');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const filtered = riwayat.filter((r) => {
    if (filterTipe !== 'ALL' && r.tipe !== filterTipe) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    return true;
  });

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const exportCSV = () => {
    const header = 'Waktu,Tipe,UID,Nama,NIM,Prodi,Plat,Status';
    const rows = filtered.map((r) =>
      [
        r.timestamp.toLocaleString('id-ID'),
        r.tipe,
        r.uid,
        r.nama,
        r.nim,
        r.prodi,
        r.plat,
        r.status,
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `riwayat_parkir_${Date.now()}.csv`;
    a.click();
  };

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <div className="page-title">Riwayat Parkir</div>
            <div className="page-sub">Semua transaksi masuk & keluar yang tercatat</div>
          </div>
          <button className="btn btn-ghost" onClick={exportCSV} disabled={riwayat.length === 0}>
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          <Filter size={14} style={{ color: 'var(--text3)' }} />
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>FILTER:</span>

          <div style={{ display: 'flex', gap: 6 }}>
            {(['ALL', 'MASUK', 'KELUAR'] as FilterTipe[]).map((t) => (
              <button
                key={t}
                className={`btn ${filterTipe === t ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '5px 14px', fontSize: 11 }}
                onClick={() => { setFilterTipe(t); setPage(1); }}
              >
                {t === 'ALL' ? 'Semua Tipe' : t === 'MASUK' ? '↓ Masuk' : '↑ Keluar'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
            {(['ALL', 'DIKENAL', 'TIDAK_DIKENAL'] as FilterStatus[]).map((s) => (
              <button
                key={s}
                className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '5px 14px', fontSize: 11 }}
                onClick={() => { setFilterStatus(s); setPage(1); }}
              >
                {s === 'ALL' ? 'Semua Status' : s === 'DIKENAL' ? '✓ Dikenal' : '✗ Tidak Dikenal'}
              </button>
            ))}
          </div>

          <span className="badge badge-gray" style={{ marginLeft: 'auto' }}>
            {total} transaksi
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {riwayat.length === 0 ? (
          <div className="empty-state">
            <History size={40} className="empty-state-icon" />
            <div className="empty-state-text">Belum ada riwayat parkir</div>
          </div>
        ) : slice.length === 0 ? (
          <div className="empty-state">
            <Filter size={40} className="empty-state-icon" />
            <div className="empty-state-text">Tidak ada data sesuai filter</div>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Waktu</th>
                    <th>Tanggal</th>
                    <th>UID Kartu</th>
                    <th>Nama</th>
                    <th>NIM</th>
                    <th>Plat</th>
                    <th>Prodi</th>
                    <th>Tipe</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map((r, i) => (
                    <tr key={r.id} className="fade-in">
                      <td className="mono" style={{ fontSize: 10, color: 'var(--text3)' }}>
                        {(page - 1) * PER_PAGE + i + 1}
                      </td>
                      <td className="mono" style={{ fontSize: 11 }}>{r.timestamp.toLocaleTimeString('id-ID')}</td>
                      <td className="mono" style={{ fontSize: 11 }}>{r.timestamp.toLocaleDateString('id-ID')}</td>
                      <td className="mono" style={{ color: 'var(--accent)', fontSize: 11 }}>{r.uid}</td>
                      <td style={{ color: 'var(--text)', fontWeight: 600, fontSize: 13 }}>{r.nama || '—'}</td>
                      <td className="mono" style={{ fontSize: 11 }}>{r.nim || '—'}</td>
                      <td className="mono" style={{ fontSize: 11 }}>{r.plat || '—'}</td>
                      <td style={{ fontSize: 11 }}>{r.prodi || '—'}</td>
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

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between mt-4" style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>
                  Halaman {page} dari {pages}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                  <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

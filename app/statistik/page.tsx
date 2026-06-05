'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { useMQTT } from '@/hooks/useMQTT';
import { useMemo } from 'react';

const COLORS = ['#00e5ff', '#ffab00', '#00e676', '#ff1744'];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f1217', border: '1px solid #1e2836', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'JetBrains Mono' }}>
      <div style={{ color: '#8fa3bc', marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function StatistikPage() {
  const { statistikHarian, riwayat, parking } = useMQTT();

  const chartData = useMemo(() => {
    return statistikHarian.filter((_, i) => i >= 6 && i <= 22);
  }, [statistikHarian]);

  const prodiStats = useMemo(() => {
    const map = new Map<string, number>();
    riwayat.forEach((r) => {
      if (r.prodi) {
        map.set(r.prodi, (map.get(r.prodi) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [riwayat]);

  const totalMasuk = parking.kendaraanMasuk;
  const totalKeluar = parking.kendaraanKeluar;
  const peakJam = statistikHarian.reduce((max, h) => (h.masuk > max.masuk ? h : max), statistikHarian[0]);
  const dikenalRate = riwayat.length > 0
    ? Math.round((riwayat.filter(r => r.status === 'DIKENAL').length / riwayat.length) * 100)
    : 0;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Statistik</div>
        <div className="page-sub">Grafik dan analisis data parkir hari ini</div>
      </div>

      {/* Summary stats */}
      <div className="stat-grid mb-6">
        {[
          { label: 'Total Masuk', value: totalMasuk, color: 'var(--accent)' },
          { label: 'Total Keluar', value: totalKeluar, color: 'var(--amber)' },
          { label: 'Jam Puncak', value: peakJam?.jam || '—', color: 'var(--green)' },
          { label: 'Tingkat Dikenal', value: `${dikenalRate}%`, color: 'var(--purple)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card" style={{ '--accent-color': color } as React.CSSProperties}>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color, fontSize: 28 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Hourly chart */}
      <div className="card mb-6">
        <div className="card-title">Kendaraan per Jam (Hari Ini)</div>
        {riwayat.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <BarChart3 size={36} className="empty-state-icon" />
            <div className="empty-state-text">Belum ada data transaksi</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2836" vertical={false} />
              <XAxis dataKey="jam" tick={{ fill: '#4a6080', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a6080', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', paddingTop: 12 }} />
              <Bar dataKey="masuk" name="Masuk" fill="#00e5ff" radius={[3, 3, 0, 0]} />
              <Bar dataKey="keluar" name="Keluar" fill="#ffab00" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid-2">
        {/* Line chart */}
        <div className="card">
          <div className="card-title">Tren Kumulatif Masuk</div>
          {riwayat.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-text">Belum ada data</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2836" vertical={false} />
                <XAxis dataKey="jam" tick={{ fill: '#4a6080', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4a6080', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="masuk" name="Masuk" stroke="#00e5ff" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="keluar" name="Keluar" stroke="#ffab00" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart prodi */}
        <div className="card">
          <div className="card-title">Distribusi per Prodi</div>
          {prodiStats.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-text">Belum ada data</div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={prodiStats} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {prodiStats.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {prodiStats.map((p, i) => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <div style={{ fontSize: 11, color: 'var(--text2)', flex: 1 }}>{p.name}</div>
                    <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--text)', fontWeight: 700 }}>{p.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary table */}
      {riwayat.length > 0 && (
        <div className="card mt-4">
          <div className="card-title">Ringkasan per Jam</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Jam</th>
                  <th>Masuk</th>
                  <th>Keluar</th>
                  <th>Selisih</th>
                  <th>Aktivitas</th>
                </tr>
              </thead>
              <tbody>
                {chartData.filter(h => h.masuk > 0 || h.keluar > 0).map((h) => {
                  const sel = h.masuk - h.keluar;
                  const total = h.masuk + h.keluar;
                  const maxTotal = Math.max(...chartData.map(x => x.masuk + x.keluar), 1);
                  return (
                    <tr key={h.jam}>
                      <td className="mono" style={{ color: 'var(--text)', fontWeight: 700 }}>{h.jam}</td>
                      <td style={{ color: 'var(--accent)' }}>{h.masuk}</td>
                      <td style={{ color: 'var(--amber)' }}>{h.keluar}</td>
                      <td style={{ color: sel >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {sel >= 0 ? '+' : ''}{sel}
                      </td>
                      <td style={{ width: 120 }}>
                        <div className="progress-wrap">
                          <div className="progress-bar" style={{ width: `${(total / maxTotal) * 100}%`, background: 'var(--accent)' }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

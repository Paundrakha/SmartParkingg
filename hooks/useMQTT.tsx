'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import mqtt, { MqttClient } from 'mqtt';
import {
  MQTTConfig,
  ParkingState,
  RFIDData,
  RiwayatEntry,
  ConnectionStatus,
  StatistikHarian,
} from '@/types';
import { DEFAULT_MQTT_CONFIG, TOPICS, TOTAL_SLOT } from '@/lib/mqttConfig';

interface MQTTContextValue {
  config: MQTTConfig;
  setConfig: (c: MQTTConfig) => void;
  status: ConnectionStatus;
  parking: ParkingState;
  riwayat: RiwayatEntry[];
  lastRfidMasuk: RFIDData | null;
  lastRfidKeluar: RFIDData | null;
  statistikHarian: StatistikHarian[];
  connect: () => void;
  disconnect: () => void;
  publishManual: (portal: 'masuk' | 'keluar', action: '1' | '0') => void;
}

const MQTTContext = createContext<MQTTContextValue | null>(null);

function getStoredConfig(): MQTTConfig {
  if (typeof window === 'undefined') return DEFAULT_MQTT_CONFIG;
  try {
    const raw = localStorage.getItem('mqtt_config');
    if (raw) return { ...DEFAULT_MQTT_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_MQTT_CONFIG;
}

function initStatistik(): StatistikHarian[] {
  return Array.from({ length: 24 }, (_, i) => ({
    jam: `${String(i).padStart(2, '0')}:00`,
    masuk: 0,
    keluar: 0,
  }));
}

export function MQTTProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<MQTTConfig>(DEFAULT_MQTT_CONFIG);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [parking, setParking] = useState<ParkingState>({
    totalSlot: TOTAL_SLOT,
    slotTerisi: 0,
    slotKosong: TOTAL_SLOT,
    kendaraanMasuk: 0,
    kendaraanKeluar: 0,
    portalMasuk: 'CLOSED',
    portalKeluar: 'CLOSED',
  });
  const [riwayat, setRiwayat] = useState<RiwayatEntry[]>([]);
  const [lastRfidMasuk, setLastRfidMasuk] = useState<RFIDData | null>(null);
  const [lastRfidKeluar, setLastRfidKeluar] = useState<RFIDData | null>(null);
  const [statistikHarian, setStatistikHarian] = useState<StatistikHarian[]>(initStatistik());

  const clientRef = useRef<MqttClient | null>(null);

  // Load config from localStorage on mount
  useEffect(() => {
    setConfigState(getStoredConfig());
  }, []);

  const setConfig = useCallback((c: MQTTConfig) => {
    setConfigState(c);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mqtt_config', JSON.stringify(c));
    }
  }, []);

  const handleRFID = useCallback(
    (payload: string, tipe: 'MASUK' | 'KELUAR') => {
      try {
        const data: RFIDData = JSON.parse(payload);
        const entry: RiwayatEntry = {
          id: `${Date.now()}-${Math.random()}`,
          uid: data.uid,
          nama: data.nama,
          nim: data.nim,
          prodi: data.prodi,
          plat: data.plat,
          tipe,
          status: data.status,
          timestamp: new Date(),
        };

        if (tipe === 'MASUK') {
          setLastRfidMasuk(data);
          if (data.status === 'DIKENAL') {
            setParking((p) => {
              const terisi = Math.min(p.slotTerisi + 1, p.totalSlot);
              return {
                ...p,
                slotTerisi: terisi,
                slotKosong: p.totalSlot - terisi,
                kendaraanMasuk: p.kendaraanMasuk + 1,
              };
            });
            const jam = new Date().getHours();
            setStatistikHarian((s) =>
              s.map((h, i) => (i === jam ? { ...h, masuk: h.masuk + 1 } : h))
            );
          }
        } else {
          setLastRfidKeluar(data);
          if (data.status === 'DIKENAL') {
            setParking((p) => {
              const terisi = Math.max(p.slotTerisi - 1, 0);
              return {
                ...p,
                slotTerisi: terisi,
                slotKosong: p.totalSlot - terisi,
                kendaraanKeluar: p.kendaraanKeluar + 1,
              };
            });
            const jam = new Date().getHours();
            setStatistikHarian((s) =>
              s.map((h, i) => (i === jam ? { ...h, keluar: h.keluar + 1 } : h))
            );
          }
        }

        setRiwayat((prev) => [entry, ...prev].slice(0, 500));
      } catch (e) {
        console.error('Failed to parse RFID payload', e);
      }
    },
    []
  );

  const connect = useCallback(() => {
    if (clientRef.current?.connected) return;
    setStatus('connecting');

    const cfg = getStoredConfig();

    // ✅ FIX: Auto-detect protocol untuk menghindari Mixed Content error
    // - Localhost (http://)  → pakai ws://  gunakan cfg.port (8083)
    // - Vercel/HTTPS         → pakai wss:// gunakan port 8084
    const isSecure =
      typeof window !== 'undefined' && window.location.protocol === 'https:';
    const protocol = isSecure ? 'wss' : 'ws';
    const port = isSecure ? 443 : cfg.port;
    const url = `${protocol}://${cfg.broker}:${port}/mqtt`;

    const client = mqtt.connect(url, {
      username: cfg.username,
      password: cfg.password,
      clientId: cfg.clientId,
      reconnectPeriod: 5000,
      connectTimeout: 10000,
    });

    client.on('connect', () => {
      setStatus('connected');
      client.subscribe(Object.values(TOPICS));
    });

    client.on('error', () => setStatus('error'));
    client.on('close', () => setStatus('disconnected'));
    client.on('reconnect', () => setStatus('connecting'));

    client.on('message', (topic, message) => {
      const payload = message.toString();
      if (topic === TOPICS.RFID_MASUK) handleRFID(payload, 'MASUK');
      if (topic === TOPICS.RFID_KELUAR) handleRFID(payload, 'KELUAR');
      if (topic === TOPICS.PORTAL_MASUK_STATUS)
        setParking((p) => ({
          ...p,
          portalMasuk: payload as 'OPEN' | 'CLOSED',
        }));
      if (topic === TOPICS.PORTAL_KELUAR_STATUS)
        setParking((p) => ({
          ...p,
          portalKeluar: payload as 'OPEN' | 'CLOSED',
        }));
    });

    clientRef.current = client;
  }, [handleRFID]);

  const disconnect = useCallback(() => {
    clientRef.current?.end(true);
    clientRef.current = null;
    setStatus('disconnected');
  }, []);

  const publishManual = useCallback(
    (portal: 'masuk' | 'keluar', action: '1' | '0') => {
      const topic =
        portal === 'masuk' ? TOPICS.PORTAL_MASUK_MANUAL : TOPICS.PORTAL_KELUAR_MANUAL;
      clientRef.current?.publish(topic, action);
    },
    []
  );

  // Auto connect on mount
  useEffect(() => {
    const timer = setTimeout(connect, 500);
    return () => {
      clearTimeout(timer);
      clientRef.current?.end(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MQTTContext.Provider
      value={{
        config,
        setConfig,
        status,
        parking,
        riwayat,
        lastRfidMasuk,
        lastRfidKeluar,
        statistikHarian,
        connect,
        disconnect,
        publishManual,
      }}
    >
      {children}
    </MQTTContext.Provider>
  );
}

export function useMQTT() {
  const ctx = useContext(MQTTContext);
  if (!ctx) throw new Error('useMQTT must be used inside MQTTProvider');
  return ctx;
}
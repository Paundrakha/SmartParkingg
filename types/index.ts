export interface MQTTConfig {
  broker: string;
  port: number;
  username: string;
  password: string;
  clientId: string;
}

export interface RFIDData {
  uid: string;
  status: 'DIKENAL' | 'TIDAK_DIKENAL';
  nama: string;
  nim: string;
  prodi: string;
  plat: string;
}

export interface RiwayatEntry {
  id: string;
  uid: string;
  nama: string;
  nim: string;
  prodi: string;
  plat: string;
  tipe: 'MASUK' | 'KELUAR';
  status: 'DIKENAL' | 'TIDAK_DIKENAL';
  timestamp: Date;
}

export interface ParkingState {
  totalSlot: number;
  slotTerisi: number;
  slotKosong: number;
  kendaraanMasuk: number;
  kendaraanKeluar: number;
  portalMasuk: 'OPEN' | 'CLOSED';
  portalKeluar: 'OPEN' | 'CLOSED';
}

export interface StatistikHarian {
  jam: string;
  masuk: number;
  keluar: number;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

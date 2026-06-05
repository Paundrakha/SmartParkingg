import { MQTTConfig } from '@/types';

export const DEFAULT_MQTT_CONFIG: MQTTConfig = {
  broker: 'iotoria.web.id',
  port: 8083, // WebSocket port for browser
  username: 'paundrakha',
  password: 'raka2003',
  clientId: `web-dashboard-${Math.random().toString(16).slice(2, 8)}`,
};

export const TOPICS = {
  RFID_MASUK: 'paundrakha/rfid_masuk',
  RFID_KELUAR: 'paundrakha/rfid_keluar',
  PORTAL_MASUK_STATUS: 'paundrakha/portal_masuk_status',
  PORTAL_KELUAR_STATUS: 'paundrakha/portal_keluar_status',
  PORTAL_MASUK_MANUAL: 'paundrakha/portal_masuk_manual',
  PORTAL_KELUAR_MANUAL: 'paundrakha/portal_keluar_manual',
};

export const TOTAL_SLOT = 20;

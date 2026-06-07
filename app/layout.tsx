//layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { MQTTProvider } from '@/hooks/useMQTT';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'ParkIoT – FT UNY Smart Parking',
  description: 'Dashboard monitoring parkir cerdas berbasis IoT',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <MQTTProvider>
          <div className="app-shell">
            <Sidebar />
            <main className="main-content">{children}</main>
          </div>
        </MQTTProvider>
      </body>
    </html>
  );
}

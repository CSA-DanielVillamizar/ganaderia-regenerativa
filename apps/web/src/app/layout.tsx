import type { Metadata } from 'next';
import { RootLayoutClient } from './layout-client';
import '@web/styles/globals.css';

export const metadata: Metadata = {
  title: 'Magrotec - Ganadería Regenerativa',
  description: 'Aplicación premium para gestión de ganadería regenerativa y rotación de potreros',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}

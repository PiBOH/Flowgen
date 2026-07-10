import type { Metadata } from 'next';
import './globals.css';
import I18nProvider from '@/i18n/Provider';

export const metadata: Metadata = {
  title: 'Flowgen - AI Flowchart Generator',
  description: 'Generate flowcharts from text using AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

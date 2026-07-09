import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Solicitações de Levantamento',
  description: 'Abertura e gestão de Ordens de Serviço de levantamentos de campo em rodovias',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

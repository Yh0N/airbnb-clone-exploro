import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AlertProvider } from '@/context/AlertContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from "@/lib/utils";

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Exploro — Descubre los mejores destinos turísticos de Pasto y Nariño',
  description:
    'Explora los destinos turísticos más increíbles de Pasto y Nariño, Colombia. Desde la Laguna de la Cocha hasta el Santuario de Las Lajas, descubre aventuras, cultura y naturaleza.',
  keywords: ['Pasto', 'Nariño', 'Colombia', 'turismo', 'viajes', 'destinos', 'Laguna de la Cocha', 'Las Lajas'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={cn("font-sans", nunito.variable)}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />

      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-bg-primary text-text-primary transition-colors duration-300">
        <AuthProvider>
          <AlertProvider>
            <Suspense fallback={<div className="h-20" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />
          </AlertProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

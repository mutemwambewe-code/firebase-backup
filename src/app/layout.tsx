import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster"
import { TenantProvider } from '@/components/tenants/tenant-provider';
import { PropertyProvider } from '@/components/properties/property-provider';

export const metadata: Metadata = {
  title: 'PropBot Zambia',
  description: 'Modern Property Management for Zambian Landlords',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppProviders>
          <PropertyProvider>
            <TenantProvider>
              <AppLayout>{children}</AppLayout>
            </TenantProvider>
          </PropertyProvider>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}

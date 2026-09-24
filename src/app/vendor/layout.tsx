'use client';

import { VendorAuthProvider } from '@/contexts/VendorAuthContext';
import VendorSidebar from '@/components/vendor/VendorSidebar';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <VendorAuthProvider>
      <div className="min-h-screen bg-slate-50 flex">
        <VendorSidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </VendorAuthProvider>
  );
}

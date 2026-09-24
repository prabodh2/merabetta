'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Vendor = {
  id: string;
  phone: string;
  name: string;
  facilityId: string;
  facilityName: string;
  facilityCity: string;
  referenceId: string;
};

interface VendorAuthContextType {
  vendor: Vendor | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string, vendor: Vendor) => void;
  logout: () => void;
}

const VendorAuthContext = createContext<VendorAuthContextType | undefined>(undefined);

const VENDOR_TOKEN_KEY = 'merabetta-vendor-token';

export function VendorAuthProvider({ children }: { children: React.ReactNode }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(VENDOR_TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/vendor/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.vendor) {
          setVendor(data.vendor);
        } else {
          localStorage.removeItem(VENDOR_TOKEN_KEY);
        }
      } catch {
        console.error('Vendor auth check failed');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (token: string, v: Vendor) => {
    localStorage.setItem(VENDOR_TOKEN_KEY, token);
    setVendor(v);
  };

  const logout = () => {
    localStorage.removeItem(VENDOR_TOKEN_KEY);
    setVendor(null);
  };

  return (
    <VendorAuthContext.Provider value={{ vendor, isLoggedIn: !!vendor, isLoading, login, logout }}>
      {children}
    </VendorAuthContext.Provider>
  );
}

export function useVendorAuth() {
  const ctx = useContext(VendorAuthContext);
  if (!ctx) throw new Error('useVendorAuth must be used within VendorAuthProvider');
  return ctx;
}

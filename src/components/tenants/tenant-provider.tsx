'use client';

import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { tenants as initialTenantsData } from '@/lib/data';
import type { Tenant, Payment } from '@/lib/types';

type TenantContextType = {
  tenants: Tenant[];
  addTenant: (tenant: Tenant) => void;
  updateTenant: (tenant: Tenant) => void;
  logPayment: (tenantId: string, payment: Payment) => void;
  isInitialized: boolean;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedTenants = localStorage.getItem('tenants');
      if (storedTenants) {
        setTenants(JSON.parse(storedTenants));
      } else {
        setTenants(initialTenantsData);
      }
    } catch (error) {
      console.error("Failed to load tenants from localStorage", error);
      setTenants(initialTenantsData);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('tenants', JSON.stringify(tenants));
      } catch (error) {
        console.error("Failed to save tenants to localStorage", error);
      }
    }
  }, [tenants, isInitialized]);


  const addTenant = (tenant: Tenant) => {
    setTenants((prevTenants) => [tenant, ...prevTenants]);
  };
  
  const updateTenant = (updatedTenant: Tenant) => {
    setTenants((prevTenants) => 
        prevTenants.map((tenant) => 
            tenant.id === updatedTenant.id ? updatedTenant : tenant
        )
    );
  };
  
  const logPayment = (tenantId: string, payment: Payment) => {
    setTenants((prevTenants) =>
      prevTenants.map((tenant) => {
        if (tenant.id === tenantId) {
          const updatedTenant = {
            ...tenant,
            paymentHistory: [payment, ...tenant.paymentHistory],
          };
          // If payment amount is equal or greater than rent amount, update status to Paid
          if (payment.amount >= tenant.rentAmount) {
            updatedTenant.rentStatus = 'Paid';
          }
          return updatedTenant;
        }
        return tenant;
      })
    );
  };


  const value = {
    tenants,
    addTenant,
    updateTenant,
    logPayment,
    isInitialized
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenants() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenants must be used within a TenantProvider');
  }
  return context;
}

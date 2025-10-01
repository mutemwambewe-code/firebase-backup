'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { tenants as initialTenants } from '@/lib/data';
import type { Tenant } from '@/lib/types';

type TenantContextType = {
  tenants: Tenant[];
  addTenant: (tenant: Tenant) => void;
  updateTenant: (tenant: Tenant) => void;
  // In a real app, you'd have deleteTenant, etc.
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);

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

  const value = {
    tenants,
    addTenant,
    updateTenant
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

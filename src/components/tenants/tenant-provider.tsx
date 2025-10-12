'use client';

import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { Tenant, Payment } from '@/lib/types';
import { isAfter, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';

type TenantContextType = {
  tenants: Tenant[];
  addTenant: (tenant: Tenant) => void;
  updateTenant: (tenant: Tenant) => void;
  logPayment: (tenantId: string, payment: Payment) => void;
  isInitialized: boolean;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const updateRentStatusForTenant = (tenant: Tenant): Tenant['rentStatus'] => {
  const today = new Date();
  const currentMonthStart = startOfMonth(today);

  // Calculate total payments made in the current month
  const totalPaidThisMonth = tenant.paymentHistory
    .filter(p => isWithinInterval(parseISO(p.date), { start: currentMonthStart, end: new Date() }))
    .reduce((sum, p) => sum + p.amount, 0);

  // If total paid this month meets or exceeds rent, they've paid.
  if (totalPaidThisMonth >= tenant.rentAmount) {
    return 'Paid';
  }
  
  const leaseEndDate = parseISO(tenant.leaseEndDate);
  // If lease has ended, we don't need to check for overdue status for the current month.
  // The logic to check if they were overdue for their last active month is more complex,
  // for now, if lease is over and they haven't paid this month, it's ok.
  if (isAfter(today, leaseEndDate)) {
      // A simple check to see if they were overdue for their final month.
      const finalMonthStart = startOfMonth(leaseEndDate);
      const totalPaidFinalMonth = tenant.paymentHistory
        .filter(p => isWithinInterval(parseISO(p.date), { start: finalMonthStart, end: leaseEndDate }))
        .reduce((sum, p) => sum + p.amount, 0);
      
      if(totalPaidFinalMonth < tenant.rentAmount) return 'Overdue';
      
      return 'Paid';
  }

  const leaseStartDate = parseISO(tenant.leaseStartDate);
  // Only consider overdue if lease started before this month or this month but before the 5th
  if (isAfter(currentMonthStart, leaseStartDate) || (isWithinInterval(leaseStartDate, {start: currentMonthStart, end: today}) && leaseStartDate.getDate() <= 5) ) {
      // If we are past the 5th of the month and they haven't paid enough
      if (today.getDate() > 5) {
           return 'Overdue';
      }
  }

  return 'Pending';
};


export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
        try {
        const storedTenants = localStorage.getItem('tenants');
        const tenantsToLoad = storedTenants ? JSON.parse(storedTenants) : []; // Start with empty array

        // Update statuses on initial load
        const updatedTenants = tenantsToLoad.map((tenant: Tenant) => ({
            ...tenant,
            rentStatus: updateRentStatusForTenant(tenant),
        }));

        setTenants(updatedTenants);
        } catch (error) {
        console.error("Failed to load tenants from localStorage", error);
        setTenants([]); // Start with empty array on error
        } finally {
            setIsInitialized(true);
        }
    }
  }, []);

  // Persist to localStorage whenever tenants change
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      try {
        localStorage.setItem('tenants', JSON.stringify(tenants));
      } catch (error) {
        console.error("Failed to save tenants to localStorage", error);
      }
    }
  }, [tenants, isInitialized]);


  const addTenant = (tenant: Tenant) => {
    const newTenantWithStatus = {
      ...tenant,
      rentStatus: updateRentStatusForTenant(tenant),
    }
    setTenants((prevTenants) => [newTenantWithStatus, ...prevTenants]);
  };
  
  const updateTenant = (updatedTenant: Tenant) => {
    // When a tenant is updated, their status should also be recalculated
    const tenantWithRecalculatedStatus = {
        ...updatedTenant,
        rentStatus: updateRentStatusForTenant(updatedTenant)
    };

    setTenants((prevTenants) => 
        prevTenants.map((tenant) => 
            tenant.id === tenantWithRecalculatedStatus.id ? tenantWithRecalculatedStatus : tenant
        )
    );
  };
  
  const logPayment = (tenantId: string, payment: Payment) => {
    setTenants((prevTenants) =>
      prevTenants.map((tenant) => {
        if (tenant.id === tenantId) {
          const updatedTenant = {
            ...tenant,
            paymentHistory: [payment, ...tenant.paymentHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
          };
          updatedTenant.rentStatus = updateRentStatusForTenant(updatedTenant);
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

'use client';

import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { tenants as initialTenantsData } from '@/lib/data';
import type { Tenant, Payment } from '@/lib/types';
import { isAfter, startOfMonth, endOfMonth, parseISO } from 'date-fns';

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

  // Find the most recent payment
  const mostRecentPayment = tenant.paymentHistory.length > 0 
    ? tenant.paymentHistory.reduce((latest, current) => 
        new Date(current.date) > new Date(latest.date) ? current : latest
      )
    : null;
    
  if (mostRecentPayment) {
    const paymentDate = parseISO(mostRecentPayment.date);
    const paymentMonthStart = startOfMonth(paymentDate);

    // If payment was made this month for at least the rent amount
    if (paymentMonthStart.getTime() === currentMonthStart.getTime() && mostRecentPayment.amount >= tenant.rentAmount) {
      return 'Paid';
    }
  }

  // Check if lease has ended
  const leaseEndDate = parseISO(tenant.leaseEndDate);
  if (isAfter(today, leaseEndDate)) {
     // If the most recent payment was before the current month, they might be overdue or if they never paid.
    if (!mostRecentPayment || startOfMonth(parseISO(mostRecentPayment.date)) < currentMonthStart) {
         const lastMonthRentDue = new Date(currentMonthStart);
         lastMonthRentDue.setDate(0); //End of last month
         const leaseStartDate = parseISO(tenant.leaseStartDate);

         if(isAfter(lastMonthRentDue, leaseStartDate) && (!mostRecentPayment || isAfter(lastMonthRentDue, parseISO(mostRecentPayment.date)))){
            return 'Overdue';
         }
    }
    // If lease ended and they are not overdue for last month, we can consider them paid up
    return 'Paid';
  }


  // Now check for Overdue status
  const lastMonthStart = new Date();
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  const lastMonthRentDueDate = startOfMonth(lastMonthStart);
  
  const leaseStartDate = parseISO(tenant.leaseStartDate);

  // Only consider overdue if lease started before this month
  if (isAfter(currentMonthStart, leaseStartDate)) {
     const hasPaidForCurrentMonth = tenant.paymentHistory.some(p => {
        const paymentDate = parseISO(p.date);
        return startOfMonth(paymentDate).getTime() === currentMonthStart.getTime();
      });

      if(!hasPaidForCurrentMonth) {
        // If we are past the 5th of the month and no payment, they are overdue
        if (today.getDate() > 5) {
             return 'Overdue';
        }
      }
  }


  return 'Pending';
};


export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedTenants = localStorage.getItem('tenants');
      let tenantsToLoad = storedTenants ? JSON.parse(storedTenants) : initialTenantsData;

      // Update statuses on initial load
      tenantsToLoad = tenantsToLoad.map((tenant: Tenant) => ({
        ...tenant,
        rentStatus: updateRentStatusForTenant(tenant),
      }));

      setTenants(tenantsToLoad);
    } catch (error) {
      console.error("Failed to load tenants from localStorage", error);
      setTenants(initialTenantsData.map(tenant => ({...tenant, rentStatus: updateRentStatusForTenant(tenant)})));
    }
    setIsInitialized(true);
  }, []);

  // Persist to localStorage whenever tenants change
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
    const newTenantWithStatus = {
      ...tenant,
      rentStatus: updateRentStatusForTenant(tenant),
    }
    setTenants((prevTenants) => [newTenantWithStatus, ...prevTenants]);
  };
  
  const updateTenant = (updatedTenant: Tenant) => {
    const newTenantWithStatus = {
        ...updatedTenant,
        rentStatus: updateRentStatusForTenant(updatedTenant)
    }

    setTenants((prevTenants) => 
        prevTenants.map((tenant) => 
            tenant.id === newTenantWithStatus.id ? newTenantWithStatus : tenant
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

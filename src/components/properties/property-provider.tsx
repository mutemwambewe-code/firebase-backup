'use client';

import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { Property } from '@/lib/types';

type PropertyContextType = {
  properties: Property[];
  addProperty: (property: Property) => void;
  updateProperty: (property: Property) => void;
  isInitialized: boolean;
};

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
        try {
        const storedProperties = localStorage.getItem('properties');
        const propertiesToLoad = storedProperties ? JSON.parse(storedProperties) : [];
        setProperties(propertiesToLoad);
        } catch (error) {
        console.error("Failed to load properties from localStorage", error);
        setProperties([]);
        } finally {
            setIsInitialized(true);
        }
    }
  }, []);

  // Persist to localStorage whenever properties change
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      try {
        localStorage.setItem('properties', JSON.stringify(properties));
      } catch (error) {
        console.error("Failed to save properties to localStorage", error);
      }
    }
  }, [properties, isInitialized]);

  const addProperty = (property: Property) => {
    setProperties((prevProperties) => [...prevProperties, property]);
  };
  
  const updateProperty = (updatedProperty: Property) => {
    setProperties((prevProperties) => 
        prevProperties.map((property) => 
            property.id === updatedProperty.id ? updatedProperty : property
        )
    );
  };

  const value = {
    properties,
    addProperty,
    updateProperty,
    isInitialized
  };

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
}

export function useProperties() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
}

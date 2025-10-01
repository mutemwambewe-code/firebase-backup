
'use client';

import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { Template } from '@/lib/types';
import { initialTemplates } from '@/lib/data';

type TemplateContextType = {
  templates: Template[];
  addTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
  isInitialized: boolean;
};

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedTemplates = localStorage.getItem('templates');
      const templatesToLoad = storedTemplates ? JSON.parse(storedTemplates) : initialTemplates;
      setTemplates(templatesToLoad);
    } catch (error) {
      console.error("Failed to load templates from localStorage", error);
      setTemplates(initialTemplates);
    }
    setIsInitialized(true);
  }, []);

  // Persist to localStorage whenever templates change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('templates', JSON.stringify(templates));
      } catch (error) {
        console.error("Failed to save templates to localStorage", error);
      }
    }
  }, [templates, isInitialized]);

  const addTemplate = (template: Template) => {
    setTemplates((prevTemplates) => [template, ...prevTemplates]);
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prevTemplates) => prevTemplates.filter((t) => t.id !== id));
  };

  const value = {
    templates,
    addTemplate,
    deleteTemplate,
    isInitialized
  };

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>;
}

export function useTemplates() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
}

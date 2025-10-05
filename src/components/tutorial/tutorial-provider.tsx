
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type TutorialContextType = {
  isTutorialOpen: boolean;
  startTutorial: () => void;
  closeTutorial: () => void;
};

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    try {
      const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
      if (!hasSeenTutorial) {
        setIsTutorialOpen(true);
      }
    } catch (error) {
      console.error('Failed to access localStorage for tutorial state', error);
    }
  }, []);

  const startTutorial = () => {
    setIsTutorialOpen(true);
  };

  const closeTutorial = () => {
    try {
      localStorage.setItem('hasSeenTutorial', 'true');
    } catch (error) {
      console.error('Failed to save tutorial state to localStorage', error);
    }
    setIsTutorialOpen(false);
  };

  const value = {
    isTutorialOpen,
    startTutorial,
    closeTutorial,
  };

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}

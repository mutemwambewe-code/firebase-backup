
'use client';

import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { MessageLog } from '@/lib/types';

type MessageLogContextType = {
  messageLogs: MessageLog[];
  addMessageLog: (message: MessageLog) => void;
  updateMessageStatus: (messageId: string, status: string) => void;
  isInitialized: boolean;
};

const MessageLogContext = createContext<MessageLogContextType | undefined>(undefined);

export function MessageLogProvider({ children }: { children: ReactNode }) {
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedLogs = localStorage.getItem('messageLogs');
      const logsToLoad = storedLogs ? JSON.parse(storedLogs) : [];
      setMessageLogs(logsToLoad);
    } catch (error) {
      console.error("Failed to load message logs from localStorage", error);
      setMessageLogs([]);
    }
    setIsInitialized(true);
  }, []);

  // Persist to localStorage whenever logs change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('messageLogs', JSON.stringify(messageLogs));
      } catch (error) {
        console.error("Failed to save message logs to localStorage", error);
      }
    }
  }, [messageLogs, isInitialized]);

  const addMessageLog = (message: MessageLog) => {
    // Add direction if it's not set
    const messageWithDirection = {
      direction: 'outgoing' as const,
      ...message,
    };
    setMessageLogs((prevLogs) => [messageWithDirection, ...prevLogs]);
  };
  
  const updateMessageStatus = (messageId: string, status: string) => {
    setMessageLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.id.includes(messageId) ? { ...log, status } : log
      )
    );
  };

  const value = {
    messageLogs,
    addMessageLog,
    updateMessageStatus,
    isInitialized
  };

  return <MessageLogContext.Provider value={value}>{children}</MessageLogContext.Provider>;
}

export function useMessageLog() {
  const context = useContext(MessageLogContext);
  if (context === undefined) {
    throw new Error('useMessageLog must be used within a MessageLogProvider');
  }
  return context;
}

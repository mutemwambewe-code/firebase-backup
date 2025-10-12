'use client';

import { createContext, useContext, useState, type ReactNode, useEffect, useCallback } from 'react';
import type { MessageLog } from '@/lib/types';
import { useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useUser } from '@/firebase';

type MessageLogContextType = {
  messageLogs: MessageLog[];
  addMessageLog: (message: Omit<MessageLog, 'id'> & { id?: string }) => void;
  updateMessageStatus: (localId: string, status: string, providerId?: string) => void;
  isInitialized: boolean;
};

const MessageLogContext = createContext<MessageLogContextType | undefined>(undefined);

export function MessageLogProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const logsCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'messagelogs');
  }, [firestore, user]);

  const { data: messageLogs, isLoading: isLogsLoading } = useCollection<MessageLog>(logsCollection);

  const addMessageLog = useCallback(async (messageData: Omit<MessageLog, 'id'> & { id?: string }) => {
    if (!logsCollection) return;
    
    const localId = messageData.id || `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const messageWithDirection: MessageLog = {
      direction: 'outgoing' as const,
      ...messageData,
      id: localId,
    };
    const docRef = doc(logsCollection, localId);
    await setDoc(docRef, messageWithDirection);
  }, [logsCollection]);
  
  const updateMessageStatus = useCallback(async (localId: string, status: string, providerId?: string) => {
    if (!logsCollection) return;
    const docRef = doc(logsCollection, localId);
    await setDoc(docRef, { status, providerId }, { merge: true });
  }, [logsCollection]);

  const isInitialized = !isUserLoading && !isLogsLoading;
  
  const value = {
    messageLogs: messageLogs || [],
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

import type { SQLiteDatabase } from "expo-sqlite";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { openAppDatabase } from "@/db/database";
import type { DbReadyState } from "@/types/models";

interface DatabaseContextValue {
  db: SQLiteDatabase | null;
  ready: DbReadyState;
  error: string | null;
  retry: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextValue | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [ready, setReady] = useState<DbReadyState>("loading");
  const [error, setError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    setReady("loading");
    setError(null);
    try {
      const instance = await openAppDatabase();
      setDb(instance);
      setReady("ready");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      setReady("error");
      setDb(null);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const value = useMemo(
    () => ({
      db,
      ready,
      error,
      retry: bootstrap,
    }),
    [db, ready, error, bootstrap]
  );

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabase(): DatabaseContextValue {
  const ctx = useContext(DatabaseContext);
  if (!ctx) {
    throw new Error("useDatabase must be used within DatabaseProvider");
  }
  return ctx;
}

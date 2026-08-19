import { storeService } from "./storeService";

/**
 * Keeps React state in sync when the same Emdad app is open in multiple tabs/windows.
 * The current prototype stores its data in localStorage, so browser storage events
 * are the correct transport until the platform moves to a shared backend.
 */
let started = false;

export function startRealtimeStoreSync(): () => void {
  if (started || typeof window === "undefined") return () => {};
  started = true;

  const refreshFromExternalContext = (event: StorageEvent) => {
    if (!event.key || !event.key.startsWith("emdad_")) return;
    (storeService as unknown as { notify: () => void }).notify();
  };

  window.addEventListener("storage", refreshFromExternalContext);

  return () => {
    window.removeEventListener("storage", refreshFromExternalContext);
    started = false;
  };
}

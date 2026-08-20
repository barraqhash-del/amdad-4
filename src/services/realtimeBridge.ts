import { storeService } from "./storeService";
import { realtimeService } from "./realtimeService";

let remoteEventInProgress = false;
let installed = false;

export function installRealtimeBridge() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const originalSubscribe = storeService.subscribe.bind(storeService);

  // Keep the existing StoreService API intact, but make every existing
  // subscriber react to server-side state-change events as well.
  (storeService as any).subscribe = (listener: () => void) => {
    const unsubscribe = originalSubscribe(listener);
    return unsubscribe;
  };

  realtimeService.subscribe(() => {
    remoteEventInProgress = true;
    try {
      // The current application still reads operational data from localStorage.
      // Triggering the existing subscribers lets the UI re-read that state
      // without forcing a page reload. Central persistence is the next phase.
      storeService.notifyExternal();
    } finally {
      remoteEventInProgress = false;
    }
  });

  // Same-browser tabs receive the native storage event. This bridge turns it
  // into the same StoreService notification path without requiring Refresh.
  window.addEventListener("storage", () => {
    if (!remoteEventInProgress) storeService.notifyExternal();
  });

  realtimeService.start();
}

export function publishLocalRealtimeChange(type = "state.changed") {
  if (remoteEventInProgress) return;
  void fetch("/api/realtime/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  }).catch(() => {
    // The app continues working locally if the realtime server is unavailable.
  });
}

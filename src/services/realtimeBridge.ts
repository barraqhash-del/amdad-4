import { storeService } from "./storeService";
import { realtimeService } from "./realtimeService";

let remoteEventInProgress = false;
let installed = false;

export function installRealtimeBridge() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const service = storeService as any;
  if (typeof service.notifyExternal !== "function") {
    service.notifyExternal = () => service.notify();
  }

  realtimeService.subscribe(() => {
    remoteEventInProgress = true;
    try {
      // Re-read current local state through the existing StoreService
      // subscribers. No browser refresh is performed.
      service.notifyExternal();
    } finally {
      remoteEventInProgress = false;
    }
  });

  window.addEventListener("storage", () => {
    if (!remoteEventInProgress) service.notifyExternal();
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
    // Local operation remains valid if the realtime server is unavailable.
  });
}

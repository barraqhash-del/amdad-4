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

  const originalSubscribe = service.subscribe.bind(service);
  service.subscribe = (listener: () => void) => {
    return originalSubscribe(() => {
      listener();
      if (!remoteEventInProgress) publishLocalRealtimeChange();
    });
  };

  realtimeService.subscribe(() => {
    remoteEventInProgress = true;
    try {
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

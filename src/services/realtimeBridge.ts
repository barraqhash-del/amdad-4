import { storeService } from "./storeService";
import { realtimeService, RealtimeEvent } from "./realtimeService";

const ORDERS_KEY = "emdad_orders_v1";
let remoteEventInProgress = false;
let installed = false;
let lastPublishedOrderSignature = "";
let syncTimer: ReturnType<typeof setInterval> | null = null;

function readLocalOrders(): any[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function pushLocalOrders() {
  if (remoteEventInProgress) return;
  const orders = readLocalOrders();
  const newestOrder = orders[0];
  if (!newestOrder?.id) return;

  const signature = JSON.stringify(newestOrder);
  if (signature === lastPublishedOrderSignature) return;

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: newestOrder }),
    });
    if (response.ok) lastPublishedOrderSignature = signature;
  } catch {
    // Keep the local operation valid; the next poll retries the upload.
  }
}

async function pullCentralOrders() {
  try {
    const response = await fetch("/api/orders", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    const remoteOrders = Array.isArray(payload?.orders) ? payload.orders : [];
    if (!remoteOrders.length) return;

    const localOrders = readLocalOrders();
    const byId = new Map<string, any>();
    localOrders.forEach((order) => byId.set(order.id, order));
    remoteOrders.forEach((order) => byId.set(order.id, order));

    const merged = Array.from(byId.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    );

    const localSignature = JSON.stringify(localOrders);
    const mergedSignature = JSON.stringify(merged);
    if (localSignature !== mergedSignature) {
      remoteEventInProgress = true;
      localStorage.setItem(ORDERS_KEY, mergedSignature);
      (storeService as any).notifyExternal?.();
      remoteEventInProgress = false;
    }
    if (merged[0]) lastPublishedOrderSignature = JSON.stringify(merged[0]);
  } catch {
    // The UI continues from local state when the central service is offline.
  }
}

function handleRealtimeEvent(event: RealtimeEvent) {
  if (event.type === "order.created" || event.type === "state.changed") {
    void pullCentralOrders();
  }
}

export function installRealtimeBridge() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const service = storeService as any;
  if (typeof service.notifyExternal !== "function") {
    service.notifyExternal = () => service.notify();
  }

  realtimeService.subscribe(handleRealtimeEvent);

  window.addEventListener("storage", () => {
    if (!remoteEventInProgress) service.notifyExternal();
  });

  realtimeService.start();
  void pullCentralOrders();
  void pushLocalOrders();

  // Temporary migration bridge: only the shared order collection is synced
  // here. Other domains will move to their own central APIs in later phases.
  syncTimer = setInterval(() => {
    void pushLocalOrders();
  }, 1000);
}

export function publishLocalRealtimeChange(type = "state.changed") {
  if (remoteEventInProgress) return;
  void fetch("/api/realtime/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  }).catch(() => undefined);
}

export function stopRealtimeBridge() {
  if (syncTimer) clearInterval(syncTimer);
  syncTimer = null;
  realtimeService.stop();
}

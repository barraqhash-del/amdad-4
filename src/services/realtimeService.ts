export type RealtimeEvent = {
  type: string;
  source?: string;
  timestamp: number;
};

type Listener = (event: RealtimeEvent) => void;

class RealtimeService {
  private source: EventSource | null = null;
  private listeners = new Set<Listener>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private started = false;

  start() {
    if (this.started || typeof window === "undefined" || typeof EventSource === "undefined") return;
    this.started = true;
    this.connect();
  }

  stop() {
    this.started = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.source?.close();
    this.source = null;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private connect() {
    if (!this.started) return;
    this.source?.close();
    const source = new EventSource("/api/realtime/events");
    this.source = source;

    source.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as RealtimeEvent;
        this.listeners.forEach((listener) => listener(event));
      } catch {
        // Ignore malformed keep-alive/event payloads.
      }
    };

    source.onerror = () => {
      source.close();
      if (!this.started || this.reconnectTimer) return;
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connect();
      }, 2000);
    };
  }
}

export const realtimeService = new RealtimeService();

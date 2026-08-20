import * as fs from "fs";
import * as path from "path";
import type { Express, Request, Response } from "express";

const DATA_DIR = path.join(process.cwd(), "server", "data");
const DATA_FILE = path.join(DATA_DIR, "realtime-orders.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

function readOrders(): any[] {
  try {
    ensureStore();
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: any[]) {
  ensureStore();
  const temp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(orders.slice(0, 500), null, 2), "utf8");
  fs.renameSync(temp, DATA_FILE);
}

export function registerRealtimeOrderRoutes(
  app: Express,
  publish: (type: string, source?: string) => void,
) {
  app.get("/api/orders", (_req: Request, res: Response) => {
    res.json({ success: true, orders: readOrders() });
  });

  app.post("/api/orders", (req: Request, res: Response) => {
    const order = req.body?.order;
    if (!order || typeof order.id !== "string") {
      return res.status(400).json({ error: "بيانات الطلب غير صالحة" });
    }

    const orders = readOrders();
    const existingIndex = orders.findIndex((item) => item.id === order.id);
    if (existingIndex >= 0) orders[existingIndex] = order;
    else orders.unshift(order);
    writeOrders(orders);

    publish("order.created", "central-order-store");
    return res.status(existingIndex >= 0 ? 200 : 201).json({
      success: true,
      order,
    });
  });
}

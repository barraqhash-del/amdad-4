import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import {
  getWhatsAppServerStatus,
  generateWhatsAppQrPayload,
  generatePairingCode,
  connectWhatsAppSession,
  disconnectWhatsAppSession,
  sendVoucherDirectBackground,
  sendWhatsAppReceipt,
  getWhatsAppServerLogs,
  clearWhatsAppServerLogs,
  updateWhatsAppCloudConfig,
} from "./server/whatsappBackend";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// ==========================================
// REALTIME EVENT HUB (SSE)
// ==========================================
// This is the transport layer for live UI updates. It intentionally does not
// replace the application's data store yet; it only tells connected clients
// that shared application state has changed.
const realtimeClients = new Set<express.Response>();

function publishRealtimeEvent(type = "state.changed", source = "client") {
  const payload = JSON.stringify({ type, source, timestamp: Date.now() });
  realtimeClients.forEach((client) => {
    try {
      client.write(`data: ${payload}\\n\\n`);
    } catch {
      realtimeClients.delete(client);
    }
  });
}

app.get("/api/realtime/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  realtimeClients.add(res);
  res.write(`data: ${JSON.stringify({ type: "connected", source: "server", timestamp: Date.now() })}\\n\\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat ${Date.now()}\\n\\n`);
    } catch {
      clearInterval(heartbeat);
      realtimeClients.delete(res);
    }
  }, 20000);

  req.on("close", () => {
    clearInterval(heartbeat);
    realtimeClients.delete(res);
  });
});

app.post("/api/realtime/publish", (req, res) => {
  const type = typeof req.body?.type === "string" ? req.body.type : "state.changed";
  publishRealtimeEvent(type, "client");
  res.status(202).json({ success: true });
});

// Initialize Gemini API client lazily / safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", system: "إمداد - Emdad B2B Platform" });
});

// ==========================================
// WHATSAPP BACKGROUND ENGINE SERVER APIS
// ==========================================

app.get("/api/whatsapp/status", (_req, res) => {
  try {
    const status = getWhatsAppServerStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to retrieve WhatsApp status" });
  }
});

app.get("/api/whatsapp/qr", (req, res) => {
  try {
    const phone = (req.query.phone as string) || "771234567";
    const qrData = generateWhatsAppQrPayload(phone);
    res.json(qrData);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate QR payload" });
  }
});

app.post("/api/whatsapp/pair-code", (req, res) => {
  try {
    const code = generatePairingCode();
    res.json({ pairingCode: code, expiresAt: Date.now() + 10 * 60 * 1000 });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate pairing code" });
  }
});

app.post("/api/whatsapp/connect", (req, res) => {
  try {
    const { phone, storeName, ownerName } = req.body;
    const session = connectWhatsAppSession(phone, storeName, ownerName);
    res.json({ success: true, session });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to connect session" });
  }
});

app.post("/api/whatsapp/disconnect", (_req, res) => {
  try {
    const session = disconnectWhatsAppSession();
    res.json({ success: true, session });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to disconnect session" });
  }
});

app.post("/api/whatsapp/send-voucher", async (req, res) => {
  try {
    const { voucher, employeePhone, managerPhone, customText, imageUrl, managerText } = req.body;
    if (!voucher) {
      return res.status(400).json({ error: "بيانات السند مطلوبة لإتمام الإرسال" });
    }

    const result = await sendVoucherDirectBackground({
      voucher,
      employeePhone,
      managerPhone,
      customText,
      managerText,
      imageUrl,
    });

    res.json(result);
  } catch (err: any) {
    console.error("[API Error] WhatsApp Send Voucher:", err);
    res.status(500).json({ error: err.message || "فشل إرسال السند عبر خدمة الواتساب الخلفية" });
  }
});

app.post("/api/whatsapp/send-receipt", async (req, res) => {
  try {
    const { phone, message, imageUrl, caption, voucherData, provider } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "رقم هاتف الموظف مطلوب للإرسال" });
    }

    const result = await sendWhatsAppReceipt({
      phone,
      message,
      imageUrl,
      caption,
      voucherData,
      provider,
    });

    res.json(result);
  } catch (err: any) {
    console.error("[API Error] WhatsApp Send Receipt:", err);
    res.status(500).json({ error: err.message || "فشل إرسال التقرير/الإيصال عبر الواتساب" });
  }
});

app.get("/api/whatsapp/logs", (_req, res) => {
  try {
    const logs = getWhatsAppServerLogs();
    res.json({ logs, count: logs.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to get logs" });
  }
});

app.post("/api/whatsapp/clear-logs", (_req, res) => {
  try {
    clearWhatsAppServerLogs();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to clear logs" });
  }
});

app.post("/api/whatsapp/cloud-config", (req, res) => {
  try {
    const session = updateWhatsAppCloudConfig(req.body);
    res.json({ success: true, session });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update configuration" });
  }
});

// AI Endpoint to parse natural language shortage notes into structured catalog items
app.post("/api/ai/parse-shortages", async (req, res) => {
  try {
    const { noteText, availableProducts } = req.body;

    if (!noteText || typeof noteText !== "string") {
      return res.status(400).json({ error: "الرجاء إدخال نص قائمة النواقص" });
    }

    const ai = getGeminiClient();
    const prompt = `أنت مساعد ذكي ونظام لإعادة التعبئة في منصة B2B إمداد.
لديك قائمة بالمنتجات المتاحة في المصانع المسجلة لدينا:
${JSON.stringify(availableProducts, null, 2)}

قام تاجر الجملة بكتابة أو رفع قائمة النواقص التالية بشكل عشوائي أو غير منظم:
"${noteText}"

المطلوب منك:
1. تحليل النص واستخراج المنتجات والكميات المطلوبة بدقة.
2. مطابقتها مع المنتجات المتاحة لدينا في قائمة المصانع بالمعرف (productId).
3. استخراج الكميات (إذا لم تذكر الكمية، اعتبرها 1 أو الكمية المنطقية الأدنى).
4. إذا وجد أي ملاحظة خاصة أو منتجات مفقودة اذكرها في ملخص سريع باللغة العربية.

قم بإعادة النتيجة بتنسيق JSON مطابق للهيكل التالي:
{
  "matches": [
    { "productId": "id_here", "quantity": number_here, "notes": "سبب الاختيار أو الكمية" }
  ],
  "summary": "ملخص باللغة العربية عما تم تحليله وإضافته للسلة"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  notes: { type: Type.STRING },
                },
                required: ["productId", "quantity"],
              },
            },
            summary: { type: Type.STRING },
          },
          required: ["matches", "summary"],
        },
      },
    });

    const parsedResult = JSON.parse(response.text || "{}");
    res.json(parsedResult);
  } catch (error: any) {
    console.error("AI Parse Error:", error);
    res.status(500).json({
      error: error?.message || "تعذر تحليل قائمة النواقص حالياً بواسطة الذكاء الاصطناعي",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Emdad Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

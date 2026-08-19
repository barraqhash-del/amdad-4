import fs from "fs";
import path from "path";
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import pino from "pino";

export interface WhatsAppSessionData {
  isConnected: boolean;
  status: "CONNECTED" | "DISCONNECTED" | "CONNECTING" | "SCAN_QR";
  phone: string;
  storeName: string;
  ownerName: string;
  managerPhone: string;
  connectedAt?: string;
  lastActiveAt?: string;
  deviceId?: string;
  batteryLevel?: number;
  qrPayload?: string;
  pairingCode?: string;
  pairingCodeExpiresAt?: number;
  autoReconnect: boolean;
  cloudApiConfig?: {
    enabled: boolean;
    provider: "BAILEYS_GATEWAY" | "META_CLOUD_API" | "BUILTIN_ENGINE";
    gatewayUrl?: string;
    apiKey?: string;
    phoneNumberId?: string;
  };
}

export interface WhatsAppServerLog {
  id: string;
  voucherNumber: string;
  voucherType: string;
  employeeName: string;
  employeePhone: string;
  amount: number;
  date: string;
  time: string;
  status: "DELIVERED" | "SENT" | "PENDING" | "FAILED";
  managerPhone?: string;
  payloadText: string;
  retryCount: number;
  error?: string;
}

// Session file path
const DATA_DIR = path.join(process.cwd(), "data");
const SESSION_FILE = path.join(DATA_DIR, "whatsapp-session.json");
const LOGS_FILE = path.join(DATA_DIR, "whatsapp-logs.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

let sessionState: WhatsAppSessionData = {
  isConnected: false,
  status: "DISCONNECTED",
  phone: "967771234567",
  storeName: "متجر إمداد النموذجي",
  ownerName: "المدير العام",
  managerPhone: "967770000000",
  connectedAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
  deviceId: "Baileys Native Server",
  batteryLevel: 100,
  autoReconnect: true,
  cloudApiConfig: {
    enabled: true,
    provider: "BUILTIN_ENGINE",
  },
};

let dispatchLogs: WhatsAppServerLog[] = [];
let sock: ReturnType<typeof makeWASocket> | null = null;
let currentQr: string | undefined = undefined;

export function loadWhatsAppServerState(): void {
  try {
    ensureDataDir();
    if (fs.existsSync(SESSION_FILE)) {
      const data = fs.readFileSync(SESSION_FILE, "utf-8");
      const parsed = JSON.parse(data);
      sessionState = { ...sessionState, ...parsed };
    }
    if (fs.existsSync(LOGS_FILE)) {
      const data = fs.readFileSync(LOGS_FILE, "utf-8");
      dispatchLogs = JSON.parse(data);
    }
    initBaileys();
  } catch (err) {
    console.error("[WhatsApp Backend] Error loading session state:", err);
  }
}

export function saveWhatsAppServerState(): void {
  try {
    ensureDataDir();
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionState, null, 2), "utf-8");
    fs.writeFileSync(LOGS_FILE, JSON.stringify(dispatchLogs, null, 2), "utf-8");
  } catch (err) {
    console.error("[WhatsApp Backend] Error saving session state:", err);
  }
}

export async function initBaileys() {
  try {
    ensureDataDir();
    const { state, saveCreds } = await useMultiFileAuthState(path.join(DATA_DIR, "baileys_auth"));
    
    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }) as any,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        currentQr = qr;
        sessionState.qrPayload = qr;
        sessionState.status = "SCAN_QR";
        sessionState.isConnected = false;
        saveWhatsAppServerState();
        console.log("[Baileys] New QR generated");
      }
      if (connection === "close") {
        currentQr = undefined;
        sessionState.isConnected = false;
        sessionState.status = "DISCONNECTED";
        const code = (lastDisconnect?.error as any)?.output?.statusCode;
        console.log(`[Baileys] Connection closed (Code: ${code})`);
        saveWhatsAppServerState();
        
        if (code === DisconnectReason.loggedOut || code === 401 || code === 428) {
             console.log("[Baileys] Logged out or conflicted! Deleting auth folder to start fresh...");
             try {
                fs.rmSync(path.join(DATA_DIR, "baileys_auth"), { recursive: true, force: true });
             } catch(e) {}
             setTimeout(initBaileys, 2000); // restart fresh!
        } else {
             setTimeout(initBaileys, 5000); // reconnect
        }
      } else if (connection === "open") {
        currentQr = undefined;
        sessionState.qrPayload = undefined;
        sessionState.isConnected = true;
        sessionState.status = "CONNECTED";
        console.log("[Baileys] Connected successfully!");
        saveWhatsAppServerState();
      }
    });
  } catch (err) {
    console.error("[WhatsApp Backend] Baileys Initialization failed:", err);
  }
}

// Ensure the frontend gets the latest ACTUAL QR
export function generateWhatsAppQrPayload(phone: string): { qrPayload: string; countdown: number } {
  return { 
    qrPayload: currentQr || sessionState.qrPayload || `FAKE_WAITING_FOR_BAILEYS_${Date.now()}`, 
    countdown: 40 
  };
}

export function generatePairingCode(): string {
  sessionState.pairingCode = "NOT_SUPPORTED_YET";
  return sessionState.pairingCode;
}

export function getWhatsAppServerStatus(): WhatsAppSessionData & { logsCount: number; uptimeSeconds: number; } {
  const uptime = sessionState.connectedAt
    ? Math.floor((Date.now() - new Date(sessionState.connectedAt).getTime()) / 1000)
    : 0;
  return { ...sessionState, logsCount: dispatchLogs.length, uptimeSeconds: uptime };
}

export function connectWhatsAppSession(phone?: string, storeName?: string, ownerName?: string): WhatsAppSessionData {
  if (phone) sessionState.phone = phone;
  if (!sock) initBaileys();
  return sessionState;
}

export function disconnectWhatsAppSession(): WhatsAppSessionData {
  if (sock) {
    sock.logout().catch(console.error);
    sock = null;
  }
  return sessionState;
}

export interface SendReceiptParams {
  phone: string;
  message: string;
  imageUrl?: string;
  caption?: string;
  voucherData?: any;
  provider?: string;
}

export interface SendReceiptResult {
  success: boolean;
  messageId: string;
  logId: string;
  providerUsed: string;
  status: "DELIVERED" | "SENT" | "FAILED";
  error?: string;
  details?: any;
}

export function formatPhoneNumberForApi(phone: string): string {
  let cleaned = (phone || "").replace(/[^0-9]/g, "");
  if (!cleaned) return "967771234567";
  if (cleaned.length === 9 && (cleaned.startsWith("7") || cleaned.startsWith("1"))) {
    cleaned = "967" + cleaned;
  } else if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 10) {
    cleaned = "967" + cleaned.substring(1);
  }
  return cleaned;
}

export async function sendWhatsAppReceipt(params: SendReceiptParams): Promise<SendReceiptResult> {
  const { phone, message, imageUrl, caption, voucherData } = params;
  if (!phone) throw new Error("رقم الهاتف مطلوب");
  
  const formattedPhone = formatPhoneNumberForApi(phone);
  const now = new Date();
  const dateStr = now.toLocaleDateString("ar-YE");
  const timeStr = now.toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" });
  const messageId = `WA-MSG-${Date.now()}`;
  const logId = `log-${Date.now()}`;

  try {
    if (!sock || !sessionState.isConnected) {
      throw new Error("نظام واتساب غير متصل. يرجى مسح الكود كجهاز مرتبط (Linked Device).");
    }

    const jid = `${formattedPhone}@s.whatsapp.net`;
    
    if (imageUrl) {
      await sock.sendMessage(jid, { 
        image: { url: imageUrl }, 
        caption: caption || message 
      });
    } else {
      await sock.sendMessage(jid, { text: message });
    }

    const logItem: WhatsAppServerLog = {
      id: logId,
      voucherNumber: voucherData?.voucherNumber || messageId,
      voucherType: voucherData?.typeLabelAr || "إشعار",
      employeeName: voucherData?.employeeName || "الموظف",
      employeePhone: formattedPhone,
      amount: Number(voucherData?.amount || 0),
      date: dateStr,
      time: timeStr,
      status: "DELIVERED",
      payloadText: message,
      retryCount: 0,
    };
    dispatchLogs.unshift(logItem);
    saveWhatsAppServerState();

    return { success: true, messageId, logId, providerUsed: "BAILEYS_NATIVE", status: "DELIVERED" };
  } catch (err: any) {
    console.error(`[WhatsApp API Error] Failed to send:`, err.message);
    const failedLog: WhatsAppServerLog = {
      id: logId,
      voucherNumber: voucherData?.voucherNumber || "FAIL",
      voucherType: "فشل إرسال رسالة",
      employeeName: "الموظف",
      employeePhone: formattedPhone,
      amount: 0,
      date: dateStr,
      time: timeStr,
      status: "FAILED",
      payloadText: message,
      retryCount: 1,
      error: err.message,
    };
    dispatchLogs.unshift(failedLog);
    saveWhatsAppServerState();
    
    return { success: false, messageId, logId, providerUsed: "BAILEYS_NATIVE", status: "FAILED", error: err.message };
  }
}

export async function sendVoucherDirectBackground(params: any) {
  const { voucher, employeePhone, managerPhone, customText, managerText, imageUrl } = params;
  if (!voucher) throw new Error("بيانات السند مطلوبة للإرسال");
  const targetEmpPhone = employeePhone || voucher.employeePhone;
  const voucherText = customText || `*${voucher.typeLabelAr}*\nمبلغ: ${voucher.amount} ري\nنظام إمداد المعتمد`;

  // Send Employee normal notification
  const res = await sendWhatsAppReceipt({
    phone: targetEmpPhone,
    message: voucherText,
    imageUrl: imageUrl || voucher.receiptImageUrl,
    voucherData: voucher,
  });

  // Send Administrative Notification to Manager
  if (managerPhone && managerPhone !== targetEmpPhone) {
    const adminText = managerText || `👑 *[إشعار إداري - نسخة إدارة المتجر]*\n\n${voucherText}`;
    try {
      await sendWhatsAppReceipt({
        phone: managerPhone,
        message: adminText,
        imageUrl: imageUrl || voucher.receiptImageUrl,
        voucherData: voucher,
      });
    } catch (e) {
      console.error("Failed to send manager copy:", e);
    }
  }

  return { success: res.success, logId: res.logId, messageId: res.messageId, status: res.status as any, error: res.error };
}

export function getWhatsAppServerLogs(): WhatsAppServerLog[] { return dispatchLogs; }
export function clearWhatsAppServerLogs(): void { dispatchLogs = []; saveWhatsAppServerState(); }
export function updateWhatsAppCloudConfig(config: any): WhatsAppSessionData {
  sessionState.cloudApiConfig = { ...sessionState.cloudApiConfig, ...config, enabled: true };
  saveWhatsAppServerState();
  return sessionState;
}

loadWhatsAppServerState();

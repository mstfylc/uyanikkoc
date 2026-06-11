import { normalizePhoneTR } from "@uyanik/shared";

export type SmsProvider = "mock" | "netgsm";

export class SmsError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "SmsError";
    this.code = code;
  }
}

function smsProvider(): SmsProvider {
  return process.env.SMS_PROVIDER === "netgsm" ? "netgsm" : "mock";
}

function netgsmPhone(e164: string): string {
  return e164.startsWith("+") ? e164.slice(1) : e164;
}

async function sendNetgsmSms(phoneE164: string, text: string): Promise<void> {
  const usercode = process.env.NETGSM_USERCODE ?? process.env.SMS_API_USER;
  const password = process.env.NETGSM_PASSWORD ?? process.env.SMS_API_KEY;
  const msgheader = process.env.NETGSM_MSGHEADER ?? process.env.SMS_SENDER_TITLE;

  if (!usercode || !password || !msgheader) {
    throw new SmsError("Netgsm SMS bilgileri eksik.", "netgsm_config_missing");
  }

  const response = await fetch("https://api.netgsm.com.tr/sms/rest/v2/send", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${usercode}:${password}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      msgheader,
      encoding: "TR",
      messages: [{ msg: text, no: netgsmPhone(phoneE164) }],
    }),
  });

  const body = (await response.text()).trim();
  if (!response.ok) {
    throw new SmsError(`Netgsm SMS istegi basarisiz: ${response.status}`, "netgsm_http_error");
  }

  let code: unknown = null;
  try {
    code = JSON.parse(body).code;
  } catch {
    code = body.split(/\s+/)[0];
  }

  if (code !== "00") {
    throw new SmsError(`Netgsm SMS reddedildi: ${body || "bos yanit"}`, "netgsm_rejected");
  }
}

export async function sendSms(phoneRaw: string, text: string): Promise<void> {
  const phone = normalizePhoneTR(phoneRaw);
  if (!phone) {
    throw new SmsError("Gecersiz telefon numarasi.", "invalid_phone");
  }

  if (smsProvider() === "mock") {
    console.info(`[sms:mock] ${phone}: ${text}`);
    return;
  }

  await sendNetgsmSms(phone, text);
}

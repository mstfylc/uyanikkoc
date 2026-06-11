import { afterEach, describe, expect, it, vi } from "vitest";

import { sendSms } from "@/server/services/sms.service";

const OLD_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...OLD_ENV };
  vi.restoreAllMocks();
});

describe("sms service", () => {
  it("logs messages in mock mode", async () => {
    process.env.SMS_PROVIDER = "mock";
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    await sendSms("0555 111 22 33", "Kod: 123456");

    expect(spy).toHaveBeenCalledWith(expect.stringContaining("+905551112233"));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("Kod: 123456"));
  });

  it("sends Netgsm REST v2 payload with Turkish encoding", async () => {
    process.env.SMS_PROVIDER = "netgsm";
    process.env.NETGSM_USERCODE = "user";
    process.env.NETGSM_PASSWORD = "pass";
    process.env.NETGSM_MSGHEADER = "UYANIKKOC";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ code: "00", jobid: "123" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await sendSms("+905551112233", "Uyanık Koç giriş kodun: 123456");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.netgsm.com.tr/sms/rest/v2/send",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Basic ${Buffer.from("user:pass").toString("base64")}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          msgheader: "UYANIKKOC",
          encoding: "TR",
          messages: [{ msg: "Uyanık Koç giriş kodun: 123456", no: "905551112233" }],
        }),
      }),
    );
  });

  it("fails closed when Netgsm credentials are missing", async () => {
    process.env.SMS_PROVIDER = "netgsm";
    delete process.env.NETGSM_USERCODE;
    delete process.env.SMS_API_USER;

    await expect(sendSms("0555 111 22 33", "Kod")).rejects.toMatchObject({
      code: "netgsm_config_missing",
    });
  });
});

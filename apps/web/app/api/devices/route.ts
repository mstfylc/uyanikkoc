import { NextResponse } from "next/server";
import { withMobileAuth } from "@/server/auth/withMobileAuth";
import { registerDevice, removeDevice } from "@/server/services/mobile-auth.service";
import { mobileError, readJson, str } from "@/server/auth/mobile-http";

// M3 — POST /api/devices  body: { token, platform } → cihaz push token kaydı
export const POST = withMobileAuth(async (req, { user }) => {
  try {
    const body = await readJson(req);
    const token = str(body.token);
    const platform = str(body.platform);
    if (!token) return NextResponse.json({ message: "token gerekli", code: "invalid_token" }, { status: 400 });
    if (platform !== "ios" && platform !== "android") {
      return NextResponse.json({ message: "platform ios|android olmalı", code: "invalid_platform" }, { status: 400 });
    }
    await registerDevice(user.id, token, platform);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return mobileError(err);
  }
});

// DELETE /api/devices  body: { token } → çıkışta cihaz token'ını sil
export const DELETE = withMobileAuth(async (req, { user }) => {
  try {
    const body = await readJson(req);
    await removeDevice(user.id, str(body.token));
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return mobileError(err);
  }
});

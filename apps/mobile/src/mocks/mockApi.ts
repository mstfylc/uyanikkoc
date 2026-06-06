/* İç-süreç mock backend — VITE_USE_MOCK=true iken apiClient bunu kullanır.
 * Gerçek uçlar apps/web'e eklendiğinde VITE_USE_MOCK=false ile devre dışı kalır.
 * KURAL: mock yalnızca bu klasörde. */
import { ApiError } from "../lib/api-error";
import type { AuthResponse, MeResponse, OtpRequestResponse, TokenPair } from "../lib/api-types";
import { STUDENT } from "./student";

export interface MockRequest {
  method: string;
  body?: unknown;
}

const MOCK_USER = {
  id: "stu_elif",
  name: STUDENT.name,
  role: "student",
  avatarInitials: "EY",
  phone: "+905551234567",
};

function makeTokens(): TokenPair {
  const rnd = () => Math.random().toString(36).slice(2);
  return { accessToken: `mock.access.${rnd()}`, refreshToken: `mock.refresh.${rnd()}` };
}

function delay<T>(value: T, ms = 360): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function asRecord(body: unknown): Record<string, unknown> {
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}

export function mockApi<T>(path: string, req: MockRequest): Promise<T> {
  const { method } = req;
  const body = asRecord(req.body);
  const key = `${method.toUpperCase()} ${path}`;

  switch (key) {
    case "POST /api/auth/otp/request": {
      const phone = String(body.phone ?? "").replace(/\D/g, "");
      if (phone.length < 10) throw new ApiError(400, "Geçersiz telefon numarası", "invalid_phone");
      return delay({ resendInMs: 60_000 } as OtpRequestResponse) as Promise<T>;
    }

    case "POST /api/auth/otp/verify": {
      const code = String(body.code ?? "").replace(/\D/g, "");
      if (code.length !== 6) throw new ApiError(401, "Kod hatalı", "invalid_code");
      return delay({ ...makeTokens(), user: MOCK_USER } as AuthResponse) as Promise<T>;
    }

    case "POST /api/auth/email": {
      const email = String(body.email ?? "");
      const password = String(body.password ?? "");
      if (!email.includes("@") || password.length < 4) throw new ApiError(401, "E-posta veya şifre hatalı", "invalid_credentials");
      return delay({ ...makeTokens(), user: MOCK_USER } as AuthResponse) as Promise<T>;
    }

    case "POST /api/auth/refresh": {
      const refreshToken = String(body.refreshToken ?? "");
      if (!refreshToken) throw new ApiError(401, "Oturum süresi doldu", "invalid_refresh");
      return delay(makeTokens() as TokenPair, 120) as Promise<T>;
    }

    case "GET /api/me": {
      const me: MeResponse = {
        user: MOCK_USER,
        student: {
          grade: STUDENT.grade,
          goal: STUDENT.goal,
          coachName: STUDENT.coach,
          streak: STUDENT.streak,
          weekHours: STUDENT.weekHours,
          totalNet: STUDENT.net,
        },
        counts: { pendingOdev: 4, unreadMessages: 2 },
      };
      return delay(me) as Promise<T>;
    }

    case "POST /api/devices":
    case "DELETE /api/devices":
      return delay({ ok: true } as unknown as T, 80);

    default:
      throw new ApiError(404, `Mock uç bulunamadı: ${key}`, "not_found");
  }
}

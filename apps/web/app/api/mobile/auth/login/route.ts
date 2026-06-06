import { compare } from "bcryptjs";
import { NextResponse } from "next/server";

import { resolveUserByEmail } from "@/lib/auth/resolve-user";
import { signMobileToken } from "@/lib/auth/mobile-token";
import { dbRoleToAppRole } from "@uyanik/tokens";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string };
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Invalid credentials payload" }, { status: 400 });
  }
  const user = await resolveUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const passwordValid = await compare(password, user.passwordHash);
  if (!passwordValid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const role = dbRoleToAppRole[user.role];
  if (role !== "student") {
    return NextResponse.json({ error: "Mobile app currently supports student accounts only" }, { status: 403 });
  }

  const token = await signMobileToken({
    sub: user.id,
    email: user.email,
    role,
    organizationId: user.organizationId,
    branchId: user.branchId,
    studentId: user.studentId ?? null,
    coachId: user.coachId ?? null,
    parentId: user.parentId ?? null,
  });

  return NextResponse.json(
    {
      token,
      user: {
        id: user.id,
        email: user.email,
        role,
        studentId: user.studentId ?? null,
      },
    },
    { status: 200 },
  );
}

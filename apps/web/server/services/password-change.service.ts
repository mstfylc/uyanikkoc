import { compare, hash } from "bcryptjs";

import { shouldUseDatabase } from "@/lib/data/env";

export async function changeOwnPassword(input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<"changed" | "invalid_current" | "invalid_new" | "not_available"> {
  if (input.newPassword.trim().length < 6) {
    return "invalid_new";
  }

  if (!shouldUseDatabase()) {
    return "not_available";
  }

  const { authRepository } = await import("@uyanik/database");
  const user = await authRepository.findUserById(input.userId);
  if (!user) {
    return "invalid_current";
  }

  const currentOk = await compare(input.currentPassword, user.passwordHash);
  if (!currentOk) {
    return "invalid_current";
  }

  const passwordHash = await hash(input.newPassword, 10);
  const updated = await authRepository.updateUserPasswordById({
    userId: input.userId,
    passwordHash,
  });

  return updated ? "changed" : "invalid_current";
}

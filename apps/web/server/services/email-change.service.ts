import { compare } from "bcryptjs";

import { shouldUseDatabase } from "@/lib/data/env";

export async function changeOwnEmail(input: {
  userId: string;
  currentPassword: string;
  newEmail: string;
}): Promise<"changed" | "invalid_current" | "invalid_email" | "email_taken" | "not_available"> {
  const normalizedEmail = input.newEmail.trim().toLowerCase();
  if (!/.+@.+\..+/.test(normalizedEmail)) {
    return "invalid_email";
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

  const result = await authRepository.updateUserEmailById({
    userId: input.userId,
    email: normalizedEmail,
  });

  if (result === "updated") {
    return "changed";
  }

  return result === "email_taken" ? "email_taken" : "invalid_current";
}

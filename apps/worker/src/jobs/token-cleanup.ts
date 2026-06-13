import { authRepository } from "@uyanik/database";

export async function runTokenCleanupJob(now = new Date()): Promise<{
  refreshTokens: number;
  passwordResetTokens: number;
  otpChallenges: number;
  total: number;
}> {
  return authRepository.purgeExpiredAuthArtifacts(now);
}

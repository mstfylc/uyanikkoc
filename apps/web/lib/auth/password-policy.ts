const PRODUCTION_MIN_LENGTH = 8;
const DEVELOPMENT_MIN_LENGTH = 6;

export function minimumPasswordLength(): number {
  return process.env.NODE_ENV === "production" ? PRODUCTION_MIN_LENGTH : DEVELOPMENT_MIN_LENGTH;
}

export function isPasswordAllowed(password: string): boolean {
  return password.trim().length >= minimumPasswordLength();
}

export function passwordPolicyMessage(): string {
  return `Şifre en az ${minimumPasswordLength()} karakter olmalı.`;
}

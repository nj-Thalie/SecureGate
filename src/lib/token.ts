import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/** Generate a cryptographically-secure 32-byte hex token */
export const generateToken = (): string =>
  crypto.randomBytes(32).toString("hex");

// ─── Verification token (15 minutes) ────────────────────────────────────────

/**
 * Create (or replace) an email verification token for the given email.
 * Old tokens for this identifier are deleted first so only one is ever active.
 */
export const createVerificationToken = async (email: string): Promise<string> => {
  const token = generateToken();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Delete any pre-existing token for this email before creating a new one
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  return token;
};

/**
 * Consume a verification token.
 * Returns the associated email if the token is valid and not expired.
 * Deletes atomically so concurrent requests can't both succeed.
 */
export const consumeVerificationToken = async (
  token: string
): Promise<string | null> => {
  try {
    const record = await prisma.verificationToken.delete({
      where: { token },
    });

    if (record.expires < new Date()) return null;

    return record.identifier;
  } catch {
    return null;
  }
};

// ─── Password-reset token (1 hour) ───────────────────────────────────────────

/**
 * Create (or replace) a password-reset token for the given email.
 * Old tokens for this email are deleted first.
 */
export const createPasswordResetToken = async (
  email: string
): Promise<string> => {
  const token = generateToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.deleteMany({ where: { email } });

  await prisma.passwordResetToken.create({
    data: { email, token, expires },
  });

  return token;
};

/**
 * Consume a password-reset token.
 * Returns the associated email if valid and not expired, null otherwise.
 */
export const consumePasswordResetToken = async (
  token: string
): Promise<string | null> => {
  try {
    const record = await prisma.passwordResetToken.delete({
      where: { token },
    });

    if (record.expires < new Date()) return null;

    return record.email;
  } catch {
    return null;
  }
};

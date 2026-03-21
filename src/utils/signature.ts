import crypto from "crypto";

export function generateSignature(
  secret: string,
  payload: Buffer
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

export function verifySignature(
  secret: string,
  payload: Buffer,
  signature: string
): boolean {
  const expected = generateSignature(secret, payload);

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

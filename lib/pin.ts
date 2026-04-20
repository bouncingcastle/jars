import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const keyLength = 64;

export function hashPin(pin: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, keyLength).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPin(pin: string, stored: string) {
  const parts = stored.split(":");
  if (parts.length !== 2) {
    return false;
  }

  const [salt, expectedHex] = parts;
  const expected = Buffer.from(expectedHex, "hex");
  const incoming = Buffer.from(scryptSync(pin, salt, keyLength));

  if (expected.length !== incoming.length) {
    return false;
  }

  return timingSafeEqual(expected, incoming);
}

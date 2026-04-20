import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const parentCookieName = "kj_parent";
const childCookiePrefix = "kj_child_";
const tokenVersion = "v1";

interface SessionPayload {
  role: "parent" | "child";
  childId?: string;
  expiresAt: number;
}

function getAuthSecret() {
  return process.env.AUTH_SECRET || "dev-insecure-auth-secret-change-me";
}

function shouldUseSecureCookies() {
  const configured = process.env.AUTH_COOKIE_SECURE;
  if (configured === "true") return true;
  if (configured === "false") return false;
  return process.env.NODE_ENV === "production";
}

function base64url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function unbase64url(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function createToken(payload: SessionPayload) {
  const encoded = base64url(JSON.stringify(payload));
  const body = `${tokenVersion}.${encoded}`;
  const signature = sign(body);
  return `${body}.${signature}`;
}

function verifyToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [version, encoded, signature] = parts;
  if (version !== tokenVersion) {
    return null;
  }

  const body = `${version}.${encoded}`;
  const expected = sign(body);
  const incoming = Buffer.from(signature);
  const actual = Buffer.from(expected);

  if (incoming.length !== actual.length || !timingSafeEqual(incoming, actual)) {
    return null;
  }

  try {
    const payload = JSON.parse(unbase64url(encoded)) as SessionPayload;
    if (!payload.expiresAt || payload.expiresAt < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function verifyParentPassword(password: string) {
  const expected = process.env.PARENT_PASSWORD || "change-me-now";
  return password.length >= 8 && password === expected;
}

export async function createParentSession() {
  const cookieStore = await cookies();
  const token = createToken({
    role: "parent",
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14
  });

  cookieStore.set(parentCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
}

export async function clearParentSession() {
  const cookieStore = await cookies();
  cookieStore.delete(parentCookieName);
}

export async function hasParentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(parentCookieName)?.value;
  if (!token) {
    return false;
  }
  const payload = verifyToken(token);
  return Boolean(payload && payload.role === "parent");
}

export async function createChildSession(childId: string) {
  const cookieStore = await cookies();
  const token = createToken({
    role: "child",
    childId,
    expiresAt: Date.now() + 1000 * 60 * 60 * 8
  });

  cookieStore.set(`${childCookiePrefix}${childId}`, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearChildSession(childId: string) {
  const cookieStore = await cookies();
  cookieStore.delete(`${childCookiePrefix}${childId}`);
}

export async function hasChildSession(childId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(`${childCookiePrefix}${childId}`)?.value;
  if (!token) {
    return false;
  }
  const payload = verifyToken(token);
  return Boolean(payload && payload.role === "child" && payload.childId === childId);
}

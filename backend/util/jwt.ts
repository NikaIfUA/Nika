import { create, verify } from "../dependencies.ts";
import { IUser } from "../interfaces.ts";

const JWT_SECRET_KEY = Deno.env.get("JWT_SECRET_KEY") || "your-secret-key";

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function generateToken(user: IUser): Promise<string> {
  const payload = {
    id: user.id,
    email: user.email,
    exp: Date.now() / 1000 + 60 * 60, // token expires in 1 hour
  };

  const key = await getCryptoKey(JWT_SECRET_KEY);
  const token = await create({ alg: "HS256", typ: "JWT" }, payload, key);
  return token;
}

export async function verifyToken(token: string) {
  try {
    const key = await getCryptoKey(JWT_SECRET_KEY);
    const payload = await verify(token, key);
    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: err };
  }
}

// Oak middleware factory for protecting routes
export function jwtMiddleware() {
  return async (ctx: any, next: any) => {
    const auth = ctx.request.headers.get('Authorization') || '';
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      ctx.response.status = 401;
      ctx.response.body = { message: 'Unauthorized: Missing or malformed Authorization header' };
      return;
    }

    const token = parts[1];
    // Check blacklist
    if (isTokenBlacklisted(token)) {
      ctx.response.status = 401;
      ctx.response.body = { message: 'Unauthorized: Token has been revoked' };
      return;
    }
    const result = await verifyToken(token);
    if (!result.valid) {
      ctx.response.status = 401;
      ctx.response.body = { message: 'Unauthorized: Invalid token' };
      return;
    }

    // attach user info to context.state.user for downstream handlers
    ctx.state.user = result.payload;
    await next();
  };
}

// Simple in-memory blacklist for tokens (for demo). In production, persist in DB or cache.
const blacklistedTokens = new Set<string>();

export function blacklistToken(token: string) {
  blacklistedTokens.add(token);
}

export function isTokenBlacklisted(token: string) {
  return blacklistedTokens.has(token);
}
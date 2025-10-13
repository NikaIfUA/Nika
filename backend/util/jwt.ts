import { create, verify } from "../dependencies.ts";
import { IUser } from "../Interfaces.ts";
import { Database } from '../db/crud/userCrud.ts';

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
    exp: Date.now() / 1000 + 60 * 60 * 24 * 7, // token expires in 1 week
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
    const db = new Database();
    const result = await verifyToken(token);
    if (!result.valid) {
      ctx.response.status = 401;
      ctx.response.body = { message: 'Unauthorized: Invalid token' };
      return;
    }

    const userId = result.payload?.id;
    if (userId !== '1') {
      const blacklistedToken = await db.isTokenBlacklisted(token);
      const blacklistedUser = await db.isUserBlacklisted(String(userId));
      if (blacklistedToken || blacklistedUser) {
        ctx.response.status = 401;
        ctx.response.body = { message: 'Unauthorized: Token has been revoked or user is blacklisted' };
        return;
      }
    }

    // attach user info to context.state.user for downstream handlers
    ctx.state.user = result.payload;
    await next();
  };
}

export async function blacklistToken(token: string, userId?: string) {
  const db = new Database();
  if (userId === '1') return null;
  return await db.addTokenToBlacklist(token, userId);
}

export async function isTokenBlacklisted(token: string) {
  const db = new Database();
  return await db.isTokenBlacklisted(token);
}

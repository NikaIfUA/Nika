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
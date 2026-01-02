export const URL = "http://localhost:8000/";
export const STORAGE_PATH = "storage/";
export const API_PREFIX = "api/";

// Email configuration
export const EMAIL_HOST = Deno.env.get("EMAIL_HOST") || "smtp.gmail.com";
export const EMAIL_PORT = parseInt(Deno.env.get("EMAIL_PORT") || "587");
export const EMAIL_USER = Deno.env.get("EMAIL_USER") || "";
export const EMAIL_PASSWORD = Deno.env.get("EMAIL_PASSWORD") || "";
export const EMAIL_TO = Deno.env.get("EMAIL_TO") || "";

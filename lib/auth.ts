import crypto from "crypto";

export const COOKIE_NAME = "yp_auth";
export const PASSWORD = process.env.PASSWORD || "ailem2015";

export const AUTH_TOKEN = crypto
  .createHash("sha256")
  .update("yemek:" + PASSWORD)
  .digest("hex");

export function isValidToken(token: string | undefined): boolean {
  return token === AUTH_TOKEN;
}

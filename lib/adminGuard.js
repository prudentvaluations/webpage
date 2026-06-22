import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_COOKIE } from "./adminAuth";

// True when the request carries a valid admin session cookie.
export function isAdmin() {
  return verifySessionToken(cookies().get(ADMIN_COOKIE)?.value);
}

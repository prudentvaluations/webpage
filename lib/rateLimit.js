// Lightweight in-memory sliding-window rate limiter.
//
// NOTE: on serverless (Vercel) this is per-instance and resets on cold start,
// so it is defence-in-depth against bursts rather than a hard global guarantee.
// For strict limits across instances, back this with a shared store such as
// Upstash Redis. It still meaningfully slows brute-force from a single source.

const hits = new Map(); // key -> number[] (timestamps, ms)

export function rateLimit(key, { max = 10, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map can't grow unbounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < windowMs)) hits.delete(k);
    }
  }

  return {
    ok: recent.length <= max,
    remaining: Math.max(0, max - recent.length),
    retryAfter: Math.ceil(windowMs / 1000),
  };
}

// Best-effort client IP behind Vercel/Cloudflare proxies.
export function clientIp(req) {
  const xff = req.headers.get("x-forwarded-for") || "";
  return xff.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

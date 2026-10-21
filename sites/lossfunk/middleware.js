// Logs every fetch of the page itself, before any script runs: visitors with JavaScript off, and the
// link-preview bots (Slack, WhatsApp, LinkedIn, X, Telegram, iMessage) that fetch a link the moment
// someone shares it. Never blocks or alters the response; a failure here is swallowed.
import { neon } from "@neondatabase/serverless";

export const config = { matcher: ["/", "/index.html", "/index"] };

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|slack|discord|linkedin|twitter|embedly|preview|headless|lighthouse|curl|wget|python|axios|node-fetch|go-http|skype|teams|outlook|iframely|vkshare|pinterest|redditbot|applebot|google/i;
const hdr = (h, k) => { const v = h.get(k); try { return v ? decodeURIComponent(v) : null; } catch { return v; } };

export default function middleware(request, context) {
  try {
    if (request.method !== "GET" && request.method !== "HEAD") return;
    const h = request.headers, url = new URL(request.url), ua = (h.get("user-agent") || "").slice(0, 500);
    const q = url.searchParams;
    const ref = q.get("r") || q.get("ref") || q.get("via") || q.get("utm_source") || null;
    const write = neon(process.env.DATABASE_URL).query(
      `insert into page_hits (path, ip, country, region, city, user_agent, referer, is_bot, ref, query) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [url.pathname, (h.get("x-forwarded-for") || h.get("x-real-ip") || "").split(",")[0].trim().slice(0, 64),
       hdr(h, "x-vercel-ip-country"), hdr(h, "x-vercel-ip-country-region"), hdr(h, "x-vercel-ip-city"), ua,
       (h.get("referer") || "").slice(0, 500), BOT.test(ua), ref ? ref.slice(0, 80) : null, url.search.slice(0, 500) || null],
    ).catch(() => {});
    if (context && context.waitUntil) context.waitUntil(write);
  } catch (e) { /* never affect the page */ }
}

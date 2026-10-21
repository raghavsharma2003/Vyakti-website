// Ingest for the lossfunk.vyakti.ai visit recorder (see /v/s.js). Each POST carries one session's new
// events and, optionally, a chunk of its rrweb replay. The server adds what only it can see: IP and
// Vercel's geo headers. Replay chunks are stored gzipped. Always answers 204 so a fault never shows.
import { neon } from "@neondatabase/serverless";
import { gunzipSync, gzipSync } from "node:zlib";

const sql = neon(process.env.DATABASE_URL);
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|slack|discord|linkedin|twitter|embedly|preview|headless|lighthouse|curl|wget|python|axios|node-fetch|go-http/i;
const id = v => (typeof v === "string" && /^[A-Za-z0-9_-]{6,64}$/.test(v) ? v : null);
const clip = (v, n) => (v == null ? null : String(v).slice(0, n));
const hdr = (h, k) => { const v = h.get(k); try { return v ? decodeURIComponent(v) : null; } catch { return v; } };

export async function POST(request) {
  try {
    const url = new URL(request.url);
    let buf = Buffer.from(await request.arrayBuffer());
    if (buf.length > 6e6) return new Response(null, { status: 413 });
    if (url.searchParams.get("z") === "1") buf = gunzipSync(buf, { maxOutputLength: 40e6 });
    const p = JSON.parse(buf.toString("utf8"));
    const sid = id(p.s), vid = id(p.v);
    if (!sid || !vid) return new Response(null, { status: 204 });

    const h = request.headers;
    const ua = clip(h.get("user-agent"), 500);
    const ip = clip((h.get("x-forwarded-for") || h.get("x-real-ip") || "").split(",")[0].trim(), 64);
    const ctx = p.ctx || null;
    const evs = Array.isArray(p.ev) ? p.ev.slice(0, 2000) : [];
    const n = evs.length;
    const isBot = BOT.test(ua || "") || !!(ctx && ctx.webdriver);

    await sql.query(
      `insert into sessions (id, visitor_id, ref, ip, country, region, city, lat, lon, ip_tz, user_agent, referrer, landing_url, context, active_ms, max_slide, max_scroll, event_count, is_bot, internal)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       on conflict (id) do update set last_seen = now(),
         active_ms = greatest(sessions.active_ms, excluded.active_ms),
         max_slide = greatest(coalesce(sessions.max_slide, 0), coalesce(excluded.max_slide, 0)),
         max_scroll = greatest(coalesce(sessions.max_scroll, 0), coalesce(excluded.max_scroll, 0)),
         event_count = sessions.event_count + excluded.event_count,
         context = coalesce(sessions.context, excluded.context),
         ref = coalesce(nullif(sessions.ref, ''), excluded.ref),
         internal = sessions.internal or excluded.internal`,
      [sid, vid, clip(p.ref, 80), ip, hdr(h, "x-vercel-ip-country"), hdr(h, "x-vercel-ip-country-region"), hdr(h, "x-vercel-ip-city"),
       hdr(h, "x-vercel-ip-latitude"), hdr(h, "x-vercel-ip-longitude"), hdr(h, "x-vercel-ip-timezone"), ua,
       clip(ctx && ctx.referrer, 500), clip(p.url, 500), ctx ? JSON.stringify(ctx) : null,
       Math.max(0, Math.round(+p.act || 0)), Math.round(+p.maxSlide || 0), +p.maxScroll || 0, n, isBot, p.internal === true],
    );

    if (n) {
      await sql.query(
        `insert into events (session_id, visitor_id, at, seq, type, slide, data)
         select $1, $2, to_timestamp((e->>'t')::double precision / 1000), (e->>'q')::int, left(e->>'type', 40), left(e->>'slide', 40), e->'d'
         from jsonb_array_elements($3::jsonb) e`,
        [sid, vid, JSON.stringify(evs)],
      );
    }

    if (Array.isArray(p.rr) && p.rr.length && Number.isInteger(p.rs)) {
      const json = JSON.stringify(p.rr);
      const gz = gzipSync(json);
      await sql.query(
        `insert into replay_chunks (session_id, seq, first_ts, last_ts, n, gz) values ($1, $2, $3, $4, $5, decode($6, 'base64'))
         on conflict (session_id, seq) do nothing`,
        [sid, p.rs, p.rr[0].timestamp || null, p.rr[p.rr.length - 1].timestamp || null, p.rr.length, gz.toString("base64")],
      );
      await sql.query(`update sessions set replay_bytes = replay_bytes + $2 where id = $1`, [sid, gz.length]);
    }
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("ingest", err && err.message);
    return new Response(null, { status: 204 });
  }
}

export function GET() { return new Response(null, { status: 204 }); }

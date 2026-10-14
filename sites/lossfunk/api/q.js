// Read side for /admin: sessions, one session's events, its replay, and raw page fetches.
// Every request needs the x-key header to equal ADMIN_KEY.
import { neon } from "@neondatabase/serverless";
import { gunzipSync } from "node:zlib";
import { timingSafeEqual } from "node:crypto";

const sql = neon(process.env.DATABASE_URL);
const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store", "x-robots-tag": "noindex" } });
const ok = k => { const a = Buffer.from(k || ""), b = Buffer.from(process.env.ADMIN_KEY || "\0none"); return a.length === b.length && timingSafeEqual(a, b); };

export async function GET(request) {
  if (!ok(request.headers.get("x-key"))) return json({ error: "unauthorized" }, 401);
  const u = new URL(request.url), a = u.searchParams.get("a"), sid = u.searchParams.get("id");
  try {
    if (a === "overview") {
      const sessions = await sql.query(
        `select s.id, s.visitor_id, s.ref, s.started_at, s.last_seen, s.ip, s.country, s.region, s.city, s.ip_tz, s.user_agent, s.referrer,
                s.active_ms, s.max_slide, s.max_scroll, s.event_count, s.replay_bytes, s.is_bot, s.internal,
                s.context->'viewport' as viewport, s.context->>'tz' as tz, s.context->'deck' as deck, s.context->>'gpu' as gpu,
                s.context->'visits' as visits, s.context->'firstTouch' as first_touch,
                (select count(*) from events e where e.session_id = s.id and e.type in ('click','dead_click')) as clicks,
                (select count(*) from events e where e.session_id = s.id and e.type in ('copy','select_text')) as copies,
                (select count(*) from sessions s2 where s2.visitor_id = s.visitor_id) as visitor_sessions
         from sessions s order by s.started_at desc limit 500`);
      const slides = await sql.query(
        `select (e.data->>'i')::int as i, e.data->>'name' as name, count(distinct e.session_id) as sessions,
                round(avg((e.data->>'ms')::numeric)) as avg_ms, round(sum((e.data->>'activeMs')::numeric)) as total_active_ms
         from events e join sessions s on s.id = e.session_id
         where e.type = 'slide_leave' and not s.is_bot and not s.internal group by 1, 2 order by 1`);
      const hits = await sql.query(`select * from page_hits order by at desc limit 300`);
      return json({ sessions, slides, hits });
    }
    if (a === "session" && sid) {
      const [session] = await sql.query(`select * from sessions where id = $1`, [sid]);
      const events = await sql.query(`select at, seq, type, slide, data from events where session_id = $1 order by at, seq`, [sid]);
      return json({ session, events });
    }
    if (a === "replay" && sid) {
      const rows = await sql.query(`select encode(gz, 'base64') as b from replay_chunks where session_id = $1 order by seq`, [sid]);
      const all = [];
      for (const r of rows) { try { all.push(...JSON.parse(gunzipSync(Buffer.from(r.b, "base64")).toString("utf8"))); } catch { /* skip a bad chunk */ } }
      all.sort((x, y) => x.timestamp - y.timestamp);
      return json(all);
    }
    return json({ error: "bad request" }, 400);
  } catch (err) {
    return json({ error: String(err && err.message) }, 500);
  }
}

/* Leaderboard van Ongeslagen. Cloudflare Pages Function met D1 (binding: DB).
   GET  /api/scores?modus=normaal|hardcore&periode=all|week  geeft de top 50, per speler de beste score.
   POST /api/scores  slaat een afgeronde carrière op. */
const MAX_PTS = 90000, DOEL = 40, MAX_TITELS = 8, WACHT_MS = 20000;
const VERBODEN = ["kanker", "tering", "tyfus", "nigger", "neger", "hitler", "fuck", "homo", "kut", "hoer"];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function weekVan(ms) {
  const d = new Date(ms), dag = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dag);
  return d.toISOString().slice(0, 10);
}
function schoon(naam) {
  const n = String(naam || "").replace(/[<>&"'`\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim().slice(0, 22);
  if (n.length < 2) return null;
  const klein = n.toLowerCase().replace(/[^a-z]/g, "");
  return VERBODEN.some(w => klein.includes(w)) ? null : n;
}
function modusVan(m) { return m === "hardcore" ? "hardcore" : "normaal"; }

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ fout: "geen database" }, 503);
  const u = new URL(request.url), modus = modusVan(u.searchParams.get("modus")), week = u.searchParams.get("periode") === "week";
  const waar = week ? "modus = ?1 AND week = ?2" : "modus = ?1";
  const sql = `SELECT naam, pts, w, l, d, titels FROM (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY speler_id ORDER BY pts DESC, gemaakt ASC) AS rn FROM scores WHERE ${waar}
    ) WHERE rn = 1 ORDER BY pts DESC, gemaakt ASC LIMIT 50`;
  const st = week ? env.DB.prepare(sql).bind(modus, weekVan(Date.now())) : env.DB.prepare(sql).bind(modus);
  const { results } = await st.all();
  return json({ modus, periode: week ? "week" : "all", scores: results });
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ fout: "geen database" }, 503);
  let b; try { b = await request.json(); } catch { return json({ fout: "ongeldige gegevens" }, 400); }
  const id = String(b.spelerId || "");
  if (!/^[a-zA-Z0-9-]{16,64}$/.test(id)) return json({ fout: "ongeldige speler" }, 400);
  const naam = schoon(b.naam);
  if (!naam) return json({ fout: "Deze naam kan niet op het leaderboard." }, 422);
  const modus = modusVan(b.modus), w = b.w | 0, l = b.l | 0, d = b.d | 0, titels = b.titels | 0, pts = b.pts | 0;
  /* Controle op onmogelijke uitslagen. Dit houdt niet al het valsspelen tegen. */
  if (w < 0 || l < 0 || d < 0 || w + l + d > DOEL || w + l + d < 1) return json({ fout: "ongeldig record" }, 422);
  if (titels < 0 || titels > MAX_TITELS || titels > w) return json({ fout: "ongeldige titels" }, 422);
  if (pts < 0 || pts > MAX_PTS) return json({ fout: "ongeldige score" }, 422);
  if (modus === "hardcore" && l > 1) return json({ fout: "ongeldig record" }, 422);
  const nu = Date.now(), week = weekVan(nu);
  const laatste = await env.DB.prepare("SELECT gemaakt FROM scores WHERE speler_id = ?1 ORDER BY gemaakt DESC LIMIT 1").bind(id).first();
  if (laatste && nu - laatste.gemaakt < WACHT_MS) return json({ fout: "Te snel, probeer het zo opnieuw." }, 429);
  await env.DB.prepare("INSERT INTO scores (speler_id, naam, modus, pts, w, l, d, titels, week, gemaakt) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)")
    .bind(id, naam, modus, pts, w, l, d, titels, week, nu).run();
  const plek = async (waar, ...p) => {
    const r = await env.DB.prepare(`SELECT COUNT(DISTINCT speler_id) AS n FROM scores WHERE ${waar}`).bind(...p).first();
    return (r ? r.n : 0) + 1;
  };
  return json({ ok: true, allTime: await plek("modus = ?1 AND pts > ?2", modus, pts), week: await plek("modus = ?1 AND week = ?2 AND pts > ?3", modus, week, pts) });
}

/* ==========================================================================
   ONGESLAGEN: schermen, tekeningen en opslag.
   ========================================================================== */
(function () {
  var C = CONFIG, app = document.getElementById("app"), run = null, timers = [];
  var rustig = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var Op = {
    lees: function (k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    zet: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* speel gewoon door */ } },
    wis: function (k) { try { localStorage.removeItem(k); } catch (e) { /* niets te wissen */ } }
  };
  function bewaar() { Op.zet(C.opslagSleutel, run); }
  function $(s) { return app.querySelector(s); }
  function bij(s, fn) { var e = $(s); if (e) e.addEventListener("click", fn); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function later(fn, ms) { var t = setTimeout(fn, rustig ? 1 : ms); timers.push(t); }
  function stop() { timers.forEach(clearTimeout); timers = []; }
  /* Spelerprofiel: coins en upgrades blijven bewaard tussen carrières. */
  var meta = Op.lees(C.metaSleutel) || {};
  if (!meta.coins) meta.coins = 0;
  if (!meta.perks) meta.perks = {};
  if (!meta.spelerId) meta.spelerId = "s-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 8);
  if (!meta.wachtrij) meta.wachtrij = [];
  function bewaarMeta() { Op.zet(C.metaSleutel, meta); }
  bewaarMeta();
  function geld(n) { return "$" + Math.round(n).toLocaleString("nl-NL"); }
  function getal(n) { return Math.round(n).toLocaleString("nl-NL"); }
  /* Online verstuurd, of bewaard om het later opnieuw te proberen. */
  function verstuur(item) {
    return fetch(C.apiUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(item) }).then(function (r) {
      if (r.status === 429 || r.status >= 500) throw new Error("later");
      return r.json().then(function (d) { d.status = r.status; return d; });
    });
  }
  function verwerkWachtrij() {
    var w = meta.wachtrij.slice(); if (!w.length) return Promise.resolve();
    return verstuur(w[0]).then(function () { meta.wachtrij.shift(); bewaarMeta(); }).catch(function () { /* later opnieuw */ });
  }
  function rec(r) { return r.w + "-" + r.l + "-" + r.d; }
  function bovenaan() { var p = $(".pagina"); if (p) p.scrollTop = 0; }
  function hash(s) { var n = 7; for (var i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0; return n; }

  /* ---------- Tekeningen ---------- */
  /* De prijzenkast: elke riem die je kunt winnen. */
  function kast(titels) {
    return '<section class="kast"><p class="kast-t">Prijzenkast: ' + titels.length + ' van ' + C.titels.length + ' riemen</p><div class="kast-rij">' + C.titels.map(function (F) {
      var heeft = titels.indexOf(F.titel) >= 0;
      return '<div class="vak' + (heeft ? " vol" : "") + '">' + Belt.teken(F.titel, { dicht: !heeft }) + '<small>' + F.titel + '</small></div>';
    }).join("") + '</div></section>';
  }
  /* Spinnenweb van je zeven eigenschappen. */
  function web(run) {
    var n = Sim.KEYS.length, cx = 100, cy = 100, R = 66;
    function p(i, f) { var h = i / n * 6.283 - 1.571; return [cx + Math.cos(h) * R * f, cy + Math.sin(h) * R * f]; }
    function vorm(f) { var o = []; for (var i = 0; i < n; i++) { var q = p(i, typeof f === "function" ? f(i) : f); o.push(q[0].toFixed(1) + "," + q[1].toFixed(1)); } return o.join(" "); }
    var ring = [.25, .5, .75, 1].map(function (f) { return '<polygon points="' + vorm(f) + '" fill="none" stroke="#4b272c" stroke-width="1"/>'; }).join("");
    var waarden = Sim.KEYS.map(function (k) { return Math.round(Sim.effectief(run, k)); });
    var labels = Sim.KEYS.map(function (k, i) {
      var q = p(i, 1.27), w = waarden[i];
      return '<text x="' + q[0].toFixed(1) + '" y="' + (q[1] - 3).toFixed(1) + '" text-anchor="middle" class="w-l">' + C.stats[k].kort + '</text><text x="' + q[0].toFixed(1) + '" y="' + (q[1] + 10).toFixed(1) + '" text-anchor="middle" class="w-w">' + w + '</text>';
    }).join("");
    return '<svg class="web" viewBox="0 0 200 200" role="img" aria-label="Eigenschappen">' + ring +
      '<polygon points="' + vorm(function (i) { return Math.max(.08, (waarden[i] - 30) / 69); }) + '" fill="rgba(216,31,46,.32)" stroke="#ff5a5f" stroke-width="2.5" stroke-linejoin="round"/>' + labels + '</svg>';
  }
  function balken(run) {
    return '<div class="stats">' + Sim.KEYS.map(function (k) {
      var bezet = run.stats[k] !== undefined, w = bezet ? Math.round(Sim.effectief(run, k)) : 0;
      return '<div class="stat ' + (bezet ? "" : "leeg") + '"><span>' + C.stats[k].naam + '</span><div class="bar"><i style="transform:scaleX(' + w / 99 + ')"></i></div><b>' + (bezet ? w : "–") + '</b></div>';
    }).join("") + '</div>';
  }
  /* Vergelijking van jou en je tegenstander per eigenschap. */
  function vergelijk(run, stats) {
    return '<div class="tape"><div class="trij tkop"><b>Jij</b><span></span><b>Hij</b></div>' + Sim.KEYS.map(function (k) {
      var a = Math.round(Sim.effectief(run, k)), b = stats[k], kl = a > b ? "beter" : a < b ? "slechter" : "";
      return '<div class="trij ' + kl + '"><b class="ik">' + a + '</b><span>' + C.stats[k].naam + '</span><b class="hij">' + b + '</b></div>';
    }).join("") + '</div>';
  }
  function scout(run, t) {
    var iq = run.stats.iq, G = C.groei;
    if (iq >= G.scoutVolledig) return '<p class="kop-scout">Jouw Fight-IQ leest hem helemaal</p>' + vergelijk(run, t.stats);
    if (iq >= G.scoutVanaf) {
      var zwak = Sim.KEYS.slice().sort(function (a, b) { return t.stats[a] - t.stats[b]; })[0];
      return '<p class="scout">Jouw Fight-IQ ziet zijn zwakke plek: <b>' + C.stats[zwak].naam + ' ' + t.stats[zwak] + '</b></p>';
    }
    return '<p class="scout dicht">Train Fight-IQ tot ' + G.scoutVanaf + ' om zijn zwakke plek te zien</p>';
  }

  /* ---------- Start ---------- */
  function toonStart(bevestig) {
    stop(); run = null;
    var s = Op.lees(C.opslagSleutel), kan = s && s.versie === 4 && s.fase !== "einde", r = Op.lees(C.recordSleutel);
    var knoppen = bevestig
      ? '<div class="bevestig"><p>Je huidige carrière wordt gewist.</p><div class="rij"><button class="knop" id="nee">Annuleren</button><button class="knop rood" id="ja">Begin opnieuw</button></div></div>'
      : (kan ? '<button class="knop hoofd" id="verder">Ga verder (' + rec(s) + ')</button><button class="knop" id="speel">Nieuwe carrière</button>'
             : '<button class="knop hoofd" id="speel">Speel</button>') +
        '<div class="rij2"><button class="knop" id="lb">Leaderboard</button><button class="knop" id="tc">Coins: ' + getal(meta.coins) + '</button></div>';
    app.innerHTML = '<section class="start"><p class="hier">The Road to the Crown</p>' +
      '<h1 class="record-groot">40-0-0</h1><p class="titel-spel">Ongeslagen</p>' +
      '<div class="start-riem">' + Belt.teken("World Title") + '</div>' +
      '<p class="sub">Een bokscarrière van het clubzaaltje tot de wereldtitel. Kies je boksscholen, bouw je bokser en blijf ongeslagen.</p>' +
      (r ? '<p class="best">Jouw beste carrière: ' + r.record + ', ' + getal(r.score) + ' pts</p>' : "") +
      '<div class="knoppen">' + knoppen + '</div></section>';
    bij("#speel", function () { if (kan) toonStart(true); else begin(); });
    bij("#verder", function () { run = s; route(); });
    bij("#lb", function () { toonLeaderboard("normaal", "all"); });
    bij("#tc", toonCentrum);
    bij("#ja", begin);
    bij("#nee", function () { toonStart(); });
  }
  function begin() {
    var modus = "normaal";
    app.innerHTML = '<section class="pagina"><p class="hier">Je eerste contract</p><h2>Hoe heet je bokser?</h2><label class="veld" for="naam">Naam op de poster en het leaderboard</label><input id="naam" maxlength="22" autocomplete="off" placeholder="The Rookie" value="' + esc(meta.naam || "") + '">' +
      '<div class="modi" role="radiogroup" aria-label="Modus"><button class="modus aan" data-m="normaal" role="radio" aria-checked="true"><b>Normaal</b><span>Je carrière gaat door na een verlies. Jaag op riemen en wraak.</span></button><button class="modus" data-m="hardcore" role="radio" aria-checked="false"><b>Hardcore</b><span>Eén verlies en je carrière is voorbij. Een eigen leaderboard.</span></button></div></section>' +
      '<div class="voet"><button class="knop hoofd" id="ok">Teken het contract</button></div>';
    app.querySelectorAll(".modus").forEach(function (b) {
      b.addEventListener("click", function () {
        modus = b.getAttribute("data-m");
        app.querySelectorAll(".modus").forEach(function (x) { var aan = x === b; x.classList.toggle("aan", aan); x.setAttribute("aria-checked", aan ? "true" : "false"); });
      });
    });
    bij("#ok", function () {
      var n = ($("#naam").value || "").trim();
      if (n) { meta.naam = n; bewaarMeta(); }
      run = Sim.nieuweRun(n || "The Rookie", modus, meta.perks); bewaar(); route();
    });
  }
  function route() {
    stop();
    ({ draft: toonDraft, kiesTegen: toonCarriere, uitslag: toonUitslag, training: toonTraining, gebeurtenis: toonGebeurtenis, contract: toonContract, einde: toonEinde }[run.fase] || toonCarriere)();
  }

  /* ---------- Draft ---------- */
  function toonDraft() {
    var klaar = Object.keys(run.stats).length;
    if (!run.rad) Sim.draai(run);
    bewaar();
    var pips = ""; for (var i = 0; i < Sim.KEYS.length; i++) pips += "<i" + (i < klaar ? ' class="aan"' : i === klaar ? ' class="nu"' : "") + "></i>";
    app.innerHTML = '<section class="pagina"><div class="koprij"><h2>Waar train je?</h2><div class="pips" aria-label="Keuze ' + (klaar + 1) + ' van ' + Sim.KEYS.length + '">' + pips + '</div></div>' +
      '<div class="rad" id="rad" aria-live="polite"><small>Je reist naar</small><b id="zaal">' + esc(run.rad.zaal) + '</b><p class="rad-stad" id="stad">' + esc(run.rad.stad) + ', ' + esc(run.rad.coach) + '</p></div>' +
      '<p class="lead klein-t">Wat wil je hier leren? Elke eigenschap leer je maar één keer.</p>' +
      '<div class="kaarten" id="kaarten"></div>' + balken(run) + '</section>' +
      '<div class="voet"><button class="knop zacht" id="herdraai"' + (run.herdraai > 0 ? "" : " disabled") + '>Reis ergens anders heen (' + run.herdraai + ' over)</button></div>';
    bij("#herdraai", function () { if (Sim.herdraai(run)) { bewaar(); toonDraft(); } });
    if (rustig) return kaarten();
    var zaalEl = $("#zaal"), n = 0, doel = run.rad.zaal; $("#stad").style.visibility = "hidden";
    (function rol() {
      if (!$("#zaal")) return;
      if (n++ < 12) { zaalEl.textContent = C.zalen[Math.floor(Math.random() * C.zalen.length)].naam; later(rol, 45 + n * 8); }
      else { zaalEl.textContent = doel; $("#stad").style.visibility = ""; $("#rad").classList.add("stop"); kaarten(); }
    })();
  }
  function kaarten() {
    var el = $("#kaarten"); if (!el) return;
    el.innerHTML = run.rad.kaarten.map(function (k, i) {
      return '<button class="kaart" data-i="' + i + '"><span class="waarde">' + k.waarde + '</span><span class="kt"><b>' + C.stats[k.stat].naam + '</b><small>' + C.stats[k.stat].les + '</small></span></button>';
    }).join("");
    el.querySelectorAll(".kaart").forEach(function (b) {
      b.addEventListener("click", function () { Sim.kiesKaart(run, +b.getAttribute("data-i")); bewaar(); run.fase === "draft" ? toonDraft() : toonKlaarGedraft(); });
    });
  }
  function toonKlaarGedraft() {
    app.innerHTML = '<section class="pagina"><div class="naambord"><p class="klein-l">Jouw bokser, 18 jaar</p><h2 class="naam">' + esc(run.naam) + '</h2><p class="lead">' + Sim.stijl(run.stats) + ', totaal ' + Sim.totaal(run.stats) + '</p></div>' + web(run) +
      '<div class="afkomst">' + run.draftLog.map(function (d) { return '<p><b>' + C.stats[d.stat].naam + ' ' + d.waarde + '</b> bij ' + esc(d.coach) + ', ' + esc(d.zaal) + ', ' + esc(d.stad) + '</p>'; }).join("") + '</div></section>' +
      '<div class="voet"><button class="knop hoofd" id="ok">Start je carrière</button></div>';
    bij("#ok", route);
  }

  /* ---------- Hoofdscherm carrière ---------- */
  function kop() {
    var F = Sim.fase(run.gevecht + 1);
    return '<header class="kop"><div class="rec">' + rec(run) + '</div><div class="meta"><b>' + esc(run.naam) + (run.modus === "hardcore" ? ' <em class="hc">Hardcore</em>' : "") + '</b><span>' + Sim.leeftijd(run) + ' jaar, gevecht ' + Math.min(C.doel, run.gevecht + 1) + ' van ' + C.doel + '</span><span class="saldi">' + getal(run.pts) + ' pts, ' + geld(run.geld) + ', ' + getal(meta.coins) + ' coins</span></div></header>' +
      '<div class="streep" aria-hidden="true">' + streep() + '</div>';
  }
  function streep() {
    var h = "", tel = C.fases.map(function (f) { return f.tot; });
    for (var i = 0; i < C.doel; i++) { var g = run.geschiedenis[i], t = tel.indexOf(i + 1) >= 0; h += "<i" + ' class="' + (g ? g.res : "") + (t ? " tit" : "") + '"' + "></i>"; }
    return h;
  }
  function toonCarriere() {
    var riemen = kast(run.titels);
    var hoofdstuk = C.fases[run.hoofdstuk], nieuw = false, ct = Sim.contract(run);
    var hsHtml = '<section class="hoofdstuk' + (nieuw ? " nieuw" : "") + '"><p class="klein-l">Hoofdstuk ' + (run.hoofdstuk + 1) + ' van ' + C.fases.length + '</p><h2>' + hoofdstuk.naam + '</h2><p class="lead klein-t">Promotor: ' + esc(ct.naam || "") + '</p></section>';
    var teamHtml = '<section class="team"><p class="kast-t">Je team</p>' + C.team.map(function (T) {
      var kan = T.munt === "geld" ? run.geld >= T.prijs : meta.coins >= T.prijs;
      return '<button class="teamknop" data-id="' + T.id + '"' + (kan ? "" : " disabled") + '><span><b>' + T.naam + '</b><small>' + T.uitleg + '</small></span><em>' + (T.munt === "geld" ? geld(T.prijs) : T.prijs + " coins") + '</em></button>';
    }).join("") + '</section>';
    var sl = run.slijtage, slKl = sl > 12 ? "rood" : sl > 6 ? "oranje" : "";
    var conditieBlok = '<section class="lichaam ' + slKl + '"><div class="meters">' +
      '<div><span>Slijtage</span><div class="bar slijt"><i style="transform:scaleX(' + Math.min(1, sl / 25) + ')"></i></div><small>Kin ' + (sl ? "−" + Math.round(sl) : "0") + '</small></div>' +
      '<div><span>Vorm</span><b class="vorm">' + (run.vorm > 0 ? "+" : "") + run.vorm + '</b></div>' +
      '<div><span>Roem</span><b class="vorm">' + run.roem + '</b></div></div>' +
      '<button class="knop rust" id="rust"' + (run.gerust || sl <= 0 ? " disabled" : "") + '>' + (run.gerust ? "Je hebt al gerust" : sl <= 0 ? "Je bent volledig fit" : "Neem rust: slijtage −" + C.groei.rustHerstel + ", vorm " + C.groei.rustVorm) + '</button></section>';
    var kaartenHtml = run.opties.map(function (o, i) {
      var t = o.tegen, verschil = Sim.totaal(run.stats) - t.totaal;
      var insch = verschil > 8 ? "Je bent duidelijk beter" : verschil > 2 ? "Je bent iets beter" : verschil > -3 ? "Gelijkwaardig" : verschil > -8 ? "Hij is iets beter" : "Hij is duidelijk beter";
      var kl = verschil > 2 ? "pos" : verschil > -3 ? "" : "neg";
      return '<article class="optie ' + o.soort + '"><p class="lbl">' + esc(o.naam) + '</p><div class="optie-kop"><div><h3>' + esc(t.naam) + '</h3><p class="bij">"' + esc(t.bijnaam) + '", ' + t.land + '</p><p class="bij">' + t.stijl + ', ' + t.w + '-' + t.l + '</p></div><div class="tot"><b>' + t.totaal + '</b><small>totaal</small></div></div>' +
        (o.tekst ? '<p class="verhaal">' + esc(o.tekst) + '</p>' : "") + (o.soort === "titel" ? '<div class="prijs">' + Belt.teken(o.naam) + '</div>' : "") + '<p class="insch ' + kl + '">' + insch + '</p>' + scout(run, t) +
        '<p class="bel">Beloning: ' + o.training + (o.training === 1 ? " trainingspunt" : " trainingspunten") + (o.soort === "uitdaging" ? " en meer roem" : "") + (o.soort === "titel" ? " en de riem" : "") + '</p>' +
        '<button class="knop' + (i === 0 ? " hoofd" : "") + ' vecht" data-i="' + i + '">' + (o.soort === "titel" ? "Vecht om de titel" : "Vecht tegen " + esc(t.kort)) + '</button></article>';
    }).join("");
    app.innerHTML = kop() + '<section class="pagina">' + hsHtml + '<p class="locatie">Volgend gevecht: ' + esc(run.zaal) + '</p>' + kaartenHtml + conditieBlok + teamHtml + '<div class="profiel">' + web(run) + '</div>' + riemen +
      '<button class="knop zacht" id="menu">Naar startscherm</button></section>';
    app.querySelectorAll(".vecht").forEach(function (b) { b.addEventListener("click", function () { speel(+b.getAttribute("data-i")); }); });
    bij("#rust", function () { if (Sim.rust(run)) { bewaar(); var y = $(".pagina").scrollTop; toonCarriere(); $(".pagina").scrollTop = y; } });
    app.querySelectorAll(".teamknop").forEach(function (b) {
      b.addEventListener("click", function () {
        if (Sim.koopTeam(run, b.getAttribute("data-id"), meta)) { bewaar(); bewaarMeta(); var y = $(".pagina").scrollTop; toonCarriere(); $(".pagina").scrollTop = y; }
      });
    });
    bij("#menu", function () { bewaar(); toonStart(); });
  }

  /* ---------- Gevecht afspelen. De uitslag staat vast en is al bewaard. ---------- */
  function ringKop(t, r) {
    return '<header class="ringkop"><p class="ronde-tekst" id="rondeT">Ronde 1</p><p class="locatie">' + esc(r.zaal) + '</p><div class="hp blauw"><span>Jij</span><div><i id="hp-a"></i></div></div><div class="hp rood"><span>' + esc(t.kort) + '</span><div><i id="hp-b"></i></div></div><p class="jury" id="jury">Jury: 0-0</p></header>';
  }
  function speel(i) {
    var tg = run.opties[i].tegen, r = Sim.vecht(run, i);
    meta.coins += run.coinsTegoed || 0; run.coinsTegoed = 0; bewaarMeta(); bewaar();
    app.innerHTML = ringKop(tg, r) + '<div class="legenda"><span class="p">▲ goed voor jou</span><span class="m">▼ slecht voor jou</span></div>' +
      '<section class="pagina log" id="log" aria-live="polite"></section><div class="voet"><button class="knop" id="skip">Sla over</button></div>';
    var el = $("#log"), n = 0;
    function klaar() { stop(); toonUitslag(); }
    bij("#skip", klaar);
    (function stap() {
      if (n >= r.log.length) { $("#skip").textContent = "Naar de uitslag"; $("#skip").classList.add("hoofd"); return; }
      var l = r.log[n++], d = document.createElement("p");
      d.className = "regel " + l.s + (l.e ? " " + l.e : "");
      if (l.s === "ronde") $("#rondeT").textContent = l.t;
      d.innerHTML = (l.e === "plus" ? '<span class="pijl" aria-label="Goed voor jou">▲</span>' : l.e === "min" ? '<span class="pijl" aria-label="Slecht voor jou">▼</span>' : "") + "<span>" + esc(l.t) + "</span>";
      el.appendChild(d); el.scrollTop = el.scrollHeight;
      if (l.st) {
        $("#hp-a").style.transform = "scaleX(" + l.st.hpA + ")";
        $("#hp-b").style.transform = "scaleX(" + l.st.hpB + ")";
        
      }
      if (l.sc) $("#jury").textContent = "Jury: " + l.sc[0] + "-" + l.sc[1];
      later(stap, l.s === "ronde" ? 500 : l.s === "einde-ronde" ? 1300 : 1300);
    })();
  }

  /* ---------- Uitslag ---------- */
  function toonUitslag() {
    var r = run.laatste, woord = { w: "Gewonnen", l: "Verloren", d: "Gelijk" }[r.res];
    var knak = r.res !== "w" && run.ongeslagenTot === run.gevecht - 1;
    var kaart = '<div class="scorekaart"><table><thead><tr><th>Ronde</th>' + r.kaart.map(function (k) { return "<th>" + k.r + "</th>"; }).join("") + '<th>Totaal</th></tr></thead><tbody>' +
      '<tr class="ik"><td>Jij</td>' + r.kaart.map(function (k) { return '<td class="' + (k.a > k.b ? "win" : "") + '">' + k.a + "</td>"; }).join("") + '<td><b>' + r.scA + '</b></td></tr>' +
      '<tr class="hij"><td>' + esc(r.kort) + '</td>' + r.kaart.map(function (k) { return '<td class="' + (k.b > k.a ? "win" : "") + '">' + k.b + "</td>"; }).join("") + '<td><b>' + r.scB + '</b></td></tr></tbody></table></div>';
    app.innerHTML = '<section class="pagina uit ' + r.res + '"><div class="uit-kop"><p class="hier">Gevecht ' + r.nr + ', ' + esc(r.zaal) + ', tegen ' + esc(r.tegen) + ' "' + esc(r.bijnaam) + '"</p>' +
      '<div class="rec reuze">' + rec(run) + '</div></div><h2>' + woord + '</h2><p class="lead">' + r.manier + '</p>' +
      '<div class="loon"><div><b>' + (r.loon.pts >= 0 ? "+" : "") + getal(r.loon.pts) + '</b>pts</div><div><b>+' + geld(r.loon.geld) + '</b>beurs</div><div><b>+' + r.loon.coins + '</b>coins</div></div>' + kaart +
      (r.titel ? '<div class="prijs groot">' + Belt.teken(r.titel) + '</div><p class="kader goud">' + r.titel + ' gewonnen!</p>' : "") +
      (r.gemistTitel ? '<p class="kader">De ' + r.gemistTitel + ' gaat aan je neus voorbij.</p>' : "") +
      (knak ? '<p class="kader rood">Daar gaat je ongeslagen status, na ' + run.ongeslagenTot + ' gevechten.' + (run.modus === "hardcore" ? " In hardcore is dit het einde." : " De carrière gaat door.") + '</p>' : "") +
      (run.reeks >= 5 ? '<p class="kader">' + run.reeks + ' overwinningen op rij.</p>' : "") +
      '<p class="kop-scout">Jij tegen ' + esc(r.kort) + '</p>' + vergelijk(run, r.tegenStats) + '</section>' +
      '<div class="voet"><button class="knop hoofd" id="ok">' + (run.gevecht >= C.doel || (run.modus === "hardcore" && run.l > 0) ? "Bekijk je carrière" : "Door") + '</button></div>';
    bij("#ok", function () { Sim.naUitslag(run); bewaar(); route(); });
  }

  /* ---------- Training ---------- */
  function toonTraining() {
    var rij = Sim.KEYS.map(function (k) {
      return '<button class="trn" data-k="' + k + '"><span>' + C.stats[k].naam + '</span><b>' + Math.round(run.stats[k]) + ' <em>+1</em></b></button>';
    }).join("");
    app.innerHTML = kop() + '<section class="pagina"><h2>Trainingskamp</h2><p class="lead">Nog ' + run.trainPunten + (run.trainPunten === 1 ? " punt" : " punten") + ' te verdelen.</p>' +
      '<button class="trn rust" data-k="rust"><span>Rust in plaats van trainen</span><b>Slijtage ' + Math.round(run.slijtage) + ' <em>−' + C.groei.rustHerstel + '</em></b></button>' +
      '<div class="trn-rij">' + rij + '</div></section>';
    app.querySelectorAll(".trn").forEach(function (b) {
      b.addEventListener("click", function () { Sim.train(run, b.getAttribute("data-k")); bewaar(); route(); });
    });
    bovenaan();
  }

  /* ---------- Gebeurtenis ---------- */
  function toonGebeurtenis() {
    var g = run.gebeurtenis;
    app.innerHTML = kop() + '<section class="pagina midden"><div class="krant"><p class="hier">Tussendoor</p><h2 class="vraag">' + esc(g.t) + '</h2></div></section>' +
      '<div class="voet">' + g.a.map(function (a, i) { return '<button class="knop' + (i === 0 ? " hoofd" : "") + ' ev" data-i="' + i + '">' + esc(a.t) + '</button>'; }).join("") + '</div>';
    app.querySelectorAll(".ev").forEach(function (b) {
      b.addEventListener("click", function () {
        var tekst = Sim.kiesGebeurtenis(run, +b.getAttribute("data-i")); bewaar();
        app.innerHTML = kop() + '<section class="pagina midden"><div class="krant"><h2 class="vraag">' + esc(tekst) + '</h2></div></section><div class="voet"><button class="knop hoofd" id="ok">Door</button></div>';
        bij("#ok", route);
      });
    });
  }

  /* ---------- Einde ---------- */
  function toonEinde() {
    var bonus = Sim.rondAf(run); if (bonus) { meta.coins += bonus; bewaarMeta(); }
    var score = Sim.legende(run), b = Op.lees(C.recordSleutel);
    if (!b || score > b.score) Op.zet(C.recordSleutel, { record: rec(run), score: score });
    if (!run.ingezonden) {
      run.ingezonden = true; bewaar();
      var eigen = Op.lees(C.eigenSleutel) || [];
      eigen.push({ naam: run.naam, pts: score, w: run.w, l: run.l, d: run.d, titels: run.titels.length, modus: run.modus, t: Date.now() });
      eigen.sort(function (x, y) { return y.pts - x.pts; }); Op.zet(C.eigenSleutel, eigen.slice(0, 50));
      var item = { spelerId: meta.spelerId, naam: run.naam, modus: run.modus, pts: score, w: run.w, l: run.l, d: run.d, titels: run.titels.length };
      meta.wachtrij.push(item); bewaarMeta();
      verstuur(item).then(function (d) {
        meta.wachtrij.splice(meta.wachtrij.indexOf(item), 1); bewaarMeta();
        var e = $("#plek"); if (!e) return;
        e.textContent = d.ok ? "Leaderboard: #" + d.week + " deze week, #" + d.allTime + " all-time" : (d.fout || "Niet op het leaderboard gezet.");
      }).catch(function () { var e = $("#plek"); if (e) e.textContent = "Online leaderboard niet bereikbaar. Je score wordt later opnieuw verstuurd."; });
    }
    var deel = run.naam + ": " + rec(run) + (run.modus === "hardcore" ? " (Hardcore)" : "") + ", " + run.ko + " KO, " + run.titels.length + " riemen, " + getal(score) + " pts. Ongeslagen tot gevecht " + run.ongeslagenTot + ".";
    app.innerHTML = '<section class="pagina eind"><div class="naambord"><p class="klein-l">Carrière voorbij, ' + Sim.leeftijd(run) + ' jaar' + (run.modus === "hardcore" ? ", Hardcore" : "") + '</p><h2 class="naam">' + esc(run.naam) + '</h2></div><div class="rec reuze">' + rec(run) + '</div><p class="lead">' + Sim.oordeel(run) + '</p>' +
      '<div class="cijfers"><div><b>' + getal(score) + '</b>pts</div><div><b>' + run.titels.length + '</b>Riemen</div><div><b>' + run.ko + '</b>KO</div><div><b>' + run.ongeslagenTot + '</b>Ongeslagen</div></div>' +
      '<p class="plek" id="plek" aria-live="polite">Score versturen naar het leaderboard…</p>' +
      '<div class="streep groot" aria-hidden="true">' + streep() + '</div>' + kast(run.titels) + '</section>' +
      '<div class="voet"><div class="rij2"><button class="knop" id="lb">Leaderboard</button><button class="knop" id="kopie">Kopieer</button></div><button class="knop hoofd" id="nw">Nieuwe carrière</button></div>';
    bij("#lb", function () { toonLeaderboard(run.modus, "week"); });
    bij("#kopie", function () {
      var k = $("#kopie");
      function ok() { k.textContent = "Gekopieerd"; }
      function nee() { k.textContent = "Lukt hier niet"; }
      try { navigator.clipboard.writeText(deel).then(ok, nee); } catch (e) { nee(); }
    });
    bij("#nw", function () { Op.wis(C.opslagSleutel); begin(); });
  }

  /* ---------- Contract bij elk nieuw hoofdstuk ---------- */
  function toonContract() {
    var F = C.fases[run.hoofdstuk];
    app.innerHTML = kop() + '<section class="pagina"><div class="naambord"><p class="klein-l">Hoofdstuk ' + (run.hoofdstuk + 1) + ' van ' + C.fases.length + '</p><h2>' + F.naam + '</h2></div><p class="lead">' + F.intro + '</p><h3 class="tussenkop">Bij welke promotor teken je?</h3>' +
      C.contracten.map(function (c, i) { return '<button class="contract" data-i="' + i + '"><b>' + c.naam + '</b><span>' + c.uitleg + '</span></button>'; }).join("") + '</section>';
    app.querySelectorAll(".contract").forEach(function (b) {
      b.addEventListener("click", function () { Sim.kiesContract(run, +b.getAttribute("data-i")); bewaar(); route(); });
    });
  }

  /* ---------- Trainingscentrum: blijvende upgrades voor coins ---------- */
  function toonCentrum() {
    app.innerHTML = '<section class="pagina"><div class="koprij"><h2>Trainings&shy;centrum</h2></div><div class="loon enkel"><div><b>' + getal(meta.coins) + '</b>coins</div></div><p class="lead klein-t">Coins verdien je met elk gevecht. Upgrades gelden vanaf je volgende carrière.</p>' +
      C.upgrades.map(function (u) {
        var lvl = meta.perks[u.id] || 0, vol = lvl >= u.max, prijs = u.prijs * (lvl + 1), pips = "";
        for (var i = 0; i < u.max; i++) pips += "<i" + (i < lvl ? ' class="aan"' : "") + "></i>";
        return '<article class="upgrade"><div><h3>' + u.naam + '</h3><p>' + u.uitleg + '</p><div class="pips">' + pips + '</div></div><button class="knop koop" data-id="' + u.id + '"' + (vol || meta.coins < prijs ? " disabled" : "") + '>' + (vol ? "Maximaal" : getal(prijs) + " coins") + '</button></article>';
      }).join("") + '</section><div class="voet"><button class="knop" id="terug">Terug</button></div>';
    app.querySelectorAll(".koop").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-id"), u = C.upgrades.filter(function (x) { return x.id === id; })[0], lvl = meta.perks[id] || 0, prijs = u.prijs * (lvl + 1);
        if (lvl < u.max && meta.coins >= prijs) { meta.coins -= prijs; meta.perks[id] = lvl + 1; bewaarMeta(); var y = $(".pagina").scrollTop; toonCentrum(); $(".pagina").scrollTop = y; }
      });
    });
    bij("#terug", function () { toonStart(); });
  }

  /* ---------- Leaderboard ---------- */
  function toonLeaderboard(modus, periode) {
    function tab(id, tekst, aan) { return '<button class="tab' + (aan ? " aan" : "") + '" id="' + id + '" aria-pressed="' + (aan ? "true" : "false") + '">' + tekst + '</button>'; }
    app.innerHTML = '<section class="pagina"><h2>Leaderboard</h2><div class="tabs">' + tab("t-n", "Normaal", modus === "normaal") + tab("t-h", "Hardcore", modus === "hardcore") + '</div><div class="tabs">' + tab("t-w", "Deze week", periode === "week") + tab("t-a", "All-time", periode === "all") + '</div>' +
      '<div id="lijst" aria-live="polite"><p class="lead">Laden…</p></div></section><div class="voet"><button class="knop" id="terug">Terug</button></div>';
    bij("#t-n", function () { toonLeaderboard("normaal", periode); });
    bij("#t-h", function () { toonLeaderboard("hardcore", periode); });
    bij("#t-w", function () { toonLeaderboard(modus, "week"); });
    bij("#t-a", function () { toonLeaderboard(modus, "all"); });
    bij("#terug", function () { if (run && run.fase === "einde") route(); else toonStart(); });
    function rijen(lijst, plekken) {
      return '<ol class="lb">' + lijst.map(function (x, i) {
        var mij = x.naam === meta.naam;
        return '<li class="' + (mij ? "mij" : "") + '"><span class="pl">' + (i + 1) + '</span><span class="nm"><b>' + esc(x.naam) + '</b><small>' + x.w + '-' + x.l + '-' + x.d + ', ' + x.titels + (x.titels === 1 ? " riem" : " riemen") + '</small></span><span class="pt">' + getal(x.pts) + '<small>pts</small></span></li>';
      }).join("") + '</ol>';
    }
    verwerkWachtrij().then(function () {
      return fetch(C.apiUrl + "?modus=" + modus + "&periode=" + periode).then(function (r) { if (!r.ok) throw new Error(); return r.json(); });
    }).then(function (d) {
      var el = $("#lijst"); if (!el) return;
      el.innerHTML = d.scores.length ? rijen(d.scores) : '<p class="lead">Nog geen scores in deze lijst. Rond een carrière af om de eerste te zijn.</p>';
    }).catch(function () {
      var el = $("#lijst"); if (!el) return;
      var eigen = (Op.lees(C.eigenSleutel) || []).filter(function (x) { return x.modus === modus; });
      if (periode === "week") { var nu = new Date(), dag = (nu.getUTCDay() + 6) % 7, ma = Date.UTC(nu.getUTCFullYear(), nu.getUTCMonth(), nu.getUTCDate() - dag); eigen = eigen.filter(function (x) { return x.t >= ma; }); }
      el.innerHTML = '<p class="kader">Online leaderboard is hier niet bereikbaar. Dit zijn je eigen scores op dit apparaat.</p>' + (eigen.length ? rijen(eigen) : '<p class="lead">Nog geen afgeronde carrières in deze lijst.</p>');
    });
    bovenaan();
  }

  document.addEventListener("gesturestart", function (e) { e.preventDefault(); });
  toonStart();
})();

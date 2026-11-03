/* ==========================================================================
   ONGESLAGEN: de draft en de gesimuleerde carrière, zonder schermcode.
   ========================================================================== */
var Sim = (function () {
  var C = CONFIG, KEYS = Object.keys(C.stats);
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pak(l) { return l[Math.floor(Math.random() * l.length)]; }
  function klem(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function clamp01(x) { return klem(x, 0, 1); }

  function perk(run, id) { return (run.perks && run.perks[id]) || 0; }
  function titelVan(nr) { return C.titels.filter(function (t) { return t.nr === nr; })[0] || null; }
  function contract(run) { return C.contracten.filter(function (c) { return c.id === run.contract; })[0] || { beurs: 1, sterkte: 0, pts: 1 }; }

  function nieuweRun(naam, modus, perks) {
    var pk = perks || {};
    return { versie: 4, modus: modus || "normaal", perks: pk, pts: 0, geld: (pk.kapitaal || 0) * 3000, contract: null, uitbetaald: false,
             fase: "draft", naam: naam || "Rookie", stats: {}, herdraai: C.herdraaien + (pk.reis || 0), rad: null, draftLog: [], hoofdstuk: -1,
             w: 0, l: 0, d: 0, ko: 0, gevecht: 0, reeks: 0, ongeslagenTot: 0, titels: [], roem: 0, slijtage: 0, vorm: 0,
             opties: null, laatste: null, trainPunten: 0, gebeurtenis: null, geschiedenis: [], gezien: {}, wraak: null, gerust: false };
  }
  function draai(run) {
    var open = KEYS.filter(function (k) { return run.stats[k] === undefined; });
    var zaal = pak(C.zalen), D = C.draft, kaarten = [], rest = open.slice();
    while (kaarten.length < 3 && rest.length) {
      var kies = rest.filter(function (k) { return zaal.sterk.indexOf(k) >= 0; });
      var k = kies.length ? pak(kies) : pak(rest);
      rest.splice(rest.indexOf(k), 1);
      var w = rnd(D.min, D.max) + perk(run, "netwerk") + zaal.kwaliteit + (zaal.sterk.indexOf(k) >= 0 ? D.sterkBonus : 0);
      kaarten.push({ stat: k, waarde: Math.round(klem(w, 40, 96)) });
    }
    run.rad = { zaal: zaal.naam, stad: zaal.stad, coach: zaal.coach, kaarten: kaarten };
    return run.rad;
  }
  function kiesKaart(run, i) {
    var kaart = run.rad.kaarten[i];
    run.stats[kaart.stat] = Math.min(99, kaart.waarde + perk(run, "basis"));
    run.draftLog.push({ zaal: run.rad.zaal, stad: run.rad.stad, coach: run.rad.coach, stat: kaart.stat, waarde: kaart.waarde });
    run.rad = null;
    if (Object.keys(run.stats).length === KEYS.length) { run.fase = "kiesTegen"; maakOpties(run); }
  }
  function herdraai(run) { if (run.herdraai > 0) { run.herdraai--; draai(run); return true; } return false; }
  function totaal(s) { return Math.round(KEYS.reduce(function (a, k) { return a + s[k]; }, 0) / KEYS.length); }
  function stijl(s) {
    if (s.kracht - s.snelheid >= 8) return "Slugger";
    if (s.snelheid - s.kracht >= 8) return "Speedster";
    if (s.verdediging >= s.kracht && s.verdediging >= s.snelheid) return "Counterpuncher";
    return "Allrounder";
  }

  /* ---------- Carrière ---------- */
  function faseIndex(nr) { for (var i = 0; i < C.fases.length; i++) if (nr <= C.fases[i].tot) return i; return C.fases.length - 1; }
  function fase(nr) { return C.fases[faseIndex(nr)]; }
  function leeftijd(run) { return C.startLeeftijd + Math.floor(run.gevecht / C.gevechtenPerJaar); }

  var BIAS = { Slugger: ["kracht", "kin"], Speedster: ["snelheid", "conditie"], Counterpuncher: ["verdediging", "iq"], Technicus: ["iq", "verdediging"], Allrounder: [] };
  function bouw(per, nr, delta) {
    var i = faseIndex(nr), F = C.fases[i], start = i ? C.fases[i - 1].tot : 0;
    var basis = F.sterkte + (nr - start - 1) * F.stap + delta, s = {}, bias = BIAS[per.stijl] || [];
    KEYS.forEach(function (k) { s[k] = Math.round(klem(basis + rnd(-6, 6) + (bias.indexOf(k) >= 0 ? 6 : 0), 30, 99)); });
    return { naam: per.naam, kort: per.naam.split(" ").slice(-1)[0], bijnaam: per.bijnaam, land: per.land, stijl: per.stijl, stats: s, totaal: totaal(s), w: Math.round(rnd(6, 12) + nr * .6), l: Math.round(rnd(0, 4)) };
  }
  function uitRoster(run, nr) {
    var i = faseIndex(nr), lijst = C.roster[i].filter(function (p) { return !run.gezien[p[0]]; });
    if (!lijst.length) lijst = C.roster[i];
    var p = pak(lijst); run.gezien[p[0]] = 1;
    return { naam: p[0], bijnaam: p[1], land: p[2], stijl: pak(["Slugger", "Speedster", "Counterpuncher", "Allrounder"]) };
  }
  function kiesContract(run, i) { run.contract = C.contracten[i].id; maakOpties(run); }
  function maakOpties(run) {
    var nr = run.gevecht + 1, idx = faseIndex(nr), F = C.fases[idx], R = C.rivaal, T = titelVan(nr), cs = contract(run).sterkte;
    if (idx !== run.hoofdstuk) { run.hoofdstuk = idx; run.fase = "contract"; return; }
    run.fase = "kiesTegen"; run.gerust = false;
    run.zaal = pak(F.zalen);
    if (T) {
      run.opties = [{ soort: "titel", naam: T.titel, tegen: bouw(T.kampioen, nr, 3 + cs), training: 2 }];
      return;
    }
    var rivaalNr = R.gevechten.indexOf(nr);
    if (rivaalNr >= 0) {
      var t = bouw(R, nr, R.plus - 2 + rivaalNr + cs);
      run.opties = [{ soort: "rivaal", naam: "Aartsrivaal", tekst: R.teksten[rivaalNr], tegen: t, training: 3 }];
      return;
    }
    var veilig = { soort: "veilig", naam: C.opties.veilig.naam, tegen: bouw(uitRoster(run, nr), nr, C.opties.veilig.sterkte + cs), training: C.opties.veilig.training };
    if (run.wraak) {
      var w = bouw(run.wraak, nr, 2 + cs);
      run.opties = [veilig, { soort: "wraak", naam: "Rematch", tekst: run.wraak.naam + " versloeg je. Nu kun je het rechtzetten.", tegen: w, training: 2 }];
    } else {
      run.opties = [veilig, { soort: "uitdaging", naam: C.opties.uitdaging.naam, tegen: bouw(uitRoster(run, nr), nr, C.opties.uitdaging.sterkte + cs), training: C.opties.uitdaging.training }];
    }
  }
  function effectief(run, k) {
    var w = run.stats[k], l = leeftijd(run), G = C.groei;
    if (l > G.verouderVanaf) w -= (l - G.verouderVanaf) * G.verouderPerJaar;
    if (k === "kin") w -= run.slijtage;
    return klem(w, 20, 99);
  }

  /* Het gevecht wordt in één keer uitgerekend en daarna afgespeeld. */
  function vecht(run, keuze) {
    var opt = run.opties[keuze], t = opt.tegen, F = fase(run.gevecht + 1), S = C.sim, CM = COMMENTAAR;
    var me = {}; KEYS.forEach(function (k) { me[k] = effectief(run, k) + (k === "kin" ? 0 : run.vorm); });
    var ronden = opt.soort === "titel" ? F.titelRonden : F.ronden, b = t.kort, schaal = S.standaardRonden / ronden, lang = ronden > 6;
    var hpA0 = S.hpBasis + me.kin * S.hpPerKin, hpB0 = S.hpBasis + t.stats.kin * S.hpPerKin, hpA = hpA0, hpB = hpB0;
    var ptA = 0, ptB = 0, log = [], uitkomst = null, zwaar = 0, kaart = [], scA = 0, scB = 0, gebruikt = {};
    function z(x) { return x.replace(/\{b\}/g, b); }
    function zin(l) { var o = l.filter(function (x) { return !gebruikt[x]; }); var w = pak(o.length ? o : l); gebruikt[w] = 1; return z(w); }
    function aanval(a) { return Math.max(a.kracht, a.snelheid) * .6 + Math.min(a.kracht, a.snelheid) * .4; }
    function eigenschap(plus, r) {
      var o = [], a = me, c = t.stats, sterk = plus ? a : c, f = r / ronden;
      function g(k, n) { for (var i = 0; i < n; i++) o.push(k); }
      g(sterk.kracht >= sterk.snelheid ? "kracht" : "snelheid", 4);
      g(sterk.kracht >= sterk.snelheid ? "snelheid" : "kracht", 2);
      g("verdediging", 2);
      if (plus ? a.kin > c.kracht - 6 : a.kin < c.kracht) g("kin", 1);
      if (f > .3 && (plus ? a.conditie >= c.conditie : a.conditie < c.conditie)) g("conditie", 3);
      if (f > .5 && (plus ? a.hart >= c.hart : a.hart < c.hart)) g("hart", 2);
      if (f > .25 && (plus ? a.iq >= c.iq : a.iq < c.iq)) g("iq", 3);
      return pak(o);
    }
    function stand() { return { hpA: Math.max(0, hpA / hpA0), hpB: Math.max(0, hpB / hpB0) }; }
    for (var r = 1; r <= ronden && !uitkomst; r++) {
      var f = (r - 1) / (ronden - 1 || 1) * 4;
      var moeA = 1 - Math.max(0, f * S.conditieFade * .2 * (1.6 - me.conditie / 100));
      var moeB = 1 - Math.max(0, f * S.conditieFade * .2 * (1.6 - t.stats.conditie / 100));
      var laatA = f >= 2 ? (me.hart - t.stats.hart) * S.hartLaat : 0;
      var iqA = (me.iq - t.stats.iq) * S.iqPerRonde * .2 * (f + 1);
      var kantA = aanval(me) * moeA - t.stats.verdediging * .95 + laatA + iqA + rnd(-S.ruis, S.ruis);
      var kantB = aanval(t.stats) * moeB - me.verdediging * .95 - laatA - iqA + rnd(-S.ruis, S.ruis);
      var dA = Math.max(0, S.schadeBasis + kantA * S.schadeFactor * 2) * schaal, dB = Math.max(0, S.schadeBasis + kantB * S.schadeFactor * 2) * schaal;
      log.push({ s: "ronde", t: "Ronde " + r, r: r });
      if (!lang || r === 1) log.push({ s: "gelijk", t: zin(r === 1 ? CM.opening.r1 : scA > scB ? CM.opening.voor : scB > scA ? CM.opening.achter : CM.opening.gelijk) });
      var verschil = (dA - dB) / schaal, delen = lang ? 2 : 3 + (Math.abs(verschil) > 12 ? 1 : 0), nPlus = Math.round(delen * clamp01(.5 + verschil / 44));
      var volg = [], i;
      for (i = 0; i < delen; i++) volg.push(i < nPlus ? "plus" : "min");
      if (Math.abs(verschil) < 4) volg[delen - 1] = "neutraal";
      volg.sort(function () { return Math.random() - .5; });
      var nA = volg.filter(function (v) { return v === "plus"; }).length, nB = volg.filter(function (v) { return v === "min"; }).length;
      for (i = 0; i < delen && !uitkomst; i++) {
        if (volg[i] === "plus") { hpB -= dA / nA; log.push({ s: "goed", e: "plus", t: zin(CM.plus[eigenschap(true, r)]), st: stand() }); }
        else if (volg[i] === "min") { hpA -= dB / nB; log.push({ s: "slecht", e: "min", t: zin(CM.min[eigenschap(false, r)]), st: stand() }); }
        else log.push({ s: "gelijk", t: zin(CM.neutraal), st: stand() });
        if (hpB <= 0 && (hpA > 0 || hpB < hpA)) uitkomst = "ko"; else if (hpA <= 0) uitkomst = "koTegen";
      }
      if (!uitkomst) { if (!nA) hpB -= dA; if (!nB) hpA -= dB; if (hpB <= 0 && (hpA > 0 || hpB < hpA)) uitkomst = "ko"; else if (hpA <= 0) uitkomst = "koTegen"; }
      ptA += dA; ptB += dB; zwaar += dB;
      var sa = 10, sb = 10;
      if (verschil > 18) sb = 8; else if (verschil > 4) sb = 9; else if (verschil < -18) sa = 8; else if (verschil < -4) sa = 9;
      kaart.push({ r: r, a: sa, b: sb }); scA += sa; scB += sb;
      if (!uitkomst) log.push({ s: "einde-ronde", e: sa > sb ? "plus" : sb > sa ? "min" : "", t: zin(sa > sb ? CM.rondeEinde.plus : sb > sa ? CM.rondeEinde.min : CM.rondeEinde.gelijk) + " Jury: " + sa + "-" + sb + " " + (sa > sb ? "voor jou." : sb > sa ? "voor " + b + "." : "gelijk."), st: stand(), sc: [scA, scB] });
    }
    var res, manier;
    if (uitkomst === "ko") { res = "w"; manier = "Knock-out in ronde " + (r - 1); log.push({ s: "ko", e: "plus", t: z(pak(CM.ko)), st: stand() }); }
    else if (uitkomst === "koTegen") { res = "l"; manier = "Knock-out in ronde " + (r - 1); log.push({ s: "koTegen", e: "min", t: z(pak(CM.koTegen)), st: stand() }); }
    else {
      var vs = scA - scB;
      if (vs === 0) vs = Math.abs(ptA - ptB) <= S.gelijkMarge * 3 ? 0 : ptA - ptB;
      if (vs === 0) { res = "d"; manier = "Gelijkspel, " + scA + "-" + scB; log.push({ s: "gelijk", t: "De jury komt er niet uit: " + scA + "-" + scB + ". Dit gevecht eindigt gelijk." }); }
      else if (vs > 0) { res = "w"; manier = "Op punten, " + scA + "-" + scB; log.push({ s: "ko", e: "plus", t: "De jury is klaar: " + scA + "-" + scB + ". De scheidsrechter steekt jouw hand omhoog. Je hebt gewonnen!" }); }
      else { res = "l"; manier = "Op punten, " + scA + "-" + scB; log.push({ s: "koTegen", e: "min", t: "De jury is klaar: " + scA + "-" + scB + ". De scheidsrechter steekt de hand van " + b + " omhoog. Je hebt verloren." }); }
    }
    run.gevecht++;
    if (res === "w") { run.w++; run.reeks++; if (uitkomst === "ko") run.ko++; run.roem += 2; }
    if (res === "l") { run.l++; run.reeks = 0; run.roem -= 1; }
    if (res === "d") run.d++;
    if (run.l === 0 && run.d === 0) run.ongeslagenTot = run.w;
    run.wraak = res === "l" && opt.soort !== "titel" && opt.soort !== "rivaal" ? { naam: t.naam, bijnaam: t.bijnaam, land: t.land, stijl: t.stijl } : (res === "w" && opt.soort === "wraak" ? null : run.wraak);
    var G = C.groei;
    run.slijtage += (G.slijtagePerGevecht + (zwaar > 55 ? G.slijtageZwaar : 0) + (uitkomst === "koTegen" ? G.slijtageKO : 0)) * (1 - perk(run, "herstel") * .1);
    run.roem += C.opties[opt.soort] ? C.opties[opt.soort].roem : 6;
    var titel = null;
    if (opt.soort === "titel" && res === "w") { titel = opt.naam; run.titels.push(titel); }
    var V = C.verdienen, idxF = faseIndex(run.gevecht), Ct = contract(run), loon = { pts: 0, coins: 0, geld: 0 };
    if (res === "w") {
      loon.pts = V.pts.winst + V.pts.perHoofdstuk * idxF + (uitkomst === "ko" ? V.pts.ko : 0) + run.reeks * V.pts.perReeks;
      if (opt.soort !== "veilig") loon.pts *= V.pts.zwaarFactor;
      loon.coins = V.coins.winst + V.coins.perHoofdstuk * idxF + (uitkomst === "ko" ? V.coins.ko : 0);
      loon.geld = V.beurs[idxF];
    } else if (res === "l") { loon.pts = V.pts.verlies; loon.geld = V.beurs[idxF] * V.beursVerlies; }
    else { loon.pts = V.pts.winst / 2; loon.geld = V.beurs[idxF] * V.beursVerlies; }
    if (titel) { loon.pts += V.pts.titelBasis + V.pts.titelPerStuk * run.titels.length; loon.coins += V.coins.titel; }
    if (loon.pts > 0) loon.pts *= Ct.pts;
    loon.pts = Math.round(loon.pts); loon.geld = Math.round(loon.geld * Ct.beurs);
    run.pts = Math.max(0, run.pts + loon.pts); run.geld += loon.geld;
    run.vorm = 0; run.gerust = false; run.trainPunten = opt.training;
    run.laatste = { res: res, manier: manier, log: log, kaart: kaart, scA: scA, scB: scB, tegenStats: t.stats, tegen: t.naam, kort: t.kort, bijnaam: t.bijnaam, titel: titel, nr: run.gevecht, zaal: run.zaal, soort: opt.soort, gemistTitel: opt.soort === "titel" && res !== "w" ? opt.naam : null, loon: loon };
    run.coinsTegoed = (run.coinsTegoed || 0) + loon.coins;
    run.geschiedenis.push({ nr: run.gevecht, res: res, tegen: t.naam, manier: manier, titel: titel });
    run.fase = "uitslag";
    return run.laatste;
  }

  function naUitslag(run) {
    if (run.gevecht >= C.doel || (run.modus === "hardcore" && run.l > 0)) { rondAf(run); run.fase = "einde"; return; }
    run.fase = run.trainPunten > 0 ? "training" : "kiesTegen";
    if (run.fase === "kiesTegen") volgende(run);
  }
  function train(run, k) {
    if (run.trainPunten < 1) return;
    run.trainPunten--;
    if (k === "rust") run.slijtage = Math.max(0, run.slijtage - C.groei.rustHerstel);
    else run.stats[k] = klem(run.stats[k] + C.groei.perPunt, 20, C.groei.maxStat);
    if (run.trainPunten === 0) volgende(run);
  }
  /* Laatste bonus, maar één keer. Geeft de coins van de eindbonus terug. */
  function rondAf(run) {
    if (run.uitbetaald) return 0;
    run.uitbetaald = true;
    if (run.l === 0 && run.d === 0 && run.gevecht >= C.doel) { run.pts += C.verdienen.pts.perfect; return C.verdienen.coins.perfect; }
    return 0;
  }
  function koopTeam(run, id, meta) {
    var T = C.team.filter(function (x) { return x.id === id; })[0]; if (!T) return false;
    if (T.munt === "geld") { if (run.geld < T.prijs) return false; run.geld -= T.prijs; }
    else { if (!meta || meta.coins < T.prijs) return false; meta.coins -= T.prijs; }
    var e = T.effect;
    if (e.slijtage) run.slijtage = Math.max(0, run.slijtage + e.slijtage);
    if (e.vorm) run.vorm += e.vorm;
    if (e.zwakste) { var k = KEYS.slice().sort(function (a, b) { return run.stats[a] - run.stats[b]; })[0]; run.stats[k] = klem(run.stats[k] + e.zwakste, 20, C.groei.maxStat); }
    return true;
  }
  function rust(run) {
    if (run.gerust || run.slijtage <= 0) return false;
    run.gerust = true;
    run.slijtage = Math.max(0, run.slijtage - C.groei.rustHerstel);
    run.vorm += C.groei.rustVorm;
    return true;
  }
  function volgende(run) {
    if (run.gevecht % 3 === 2 && !run.gebeurtenis) {
      run.gebeurtenis = pak(C.gebeurtenissen.filter(function (g) { return g.t !== run.laatsteEv; }));
      run.laatsteEv = run.gebeurtenis.t;
      run.fase = "gebeurtenis";
      return;
    }
    run.gebeurtenis = null;
    maakOpties(run);
  }
  function kiesGebeurtenis(run, i) {
    var a = run.gebeurtenis.a[i], e = a.e;
    Object.keys(e).forEach(function (k) {
      if (k === "roem") run.roem += e.roem;
      else if (k === "slijtage") run.slijtage = Math.max(0, run.slijtage + e.slijtage);
      else if (k === "vorm") run.vorm += e.vorm;
      else run.stats[k] = klem(run.stats[k] + e[k], 20, C.groei.maxStat);
    });
    run.gebeurtenis = null;
    maakOpties(run);
    return a.r;
  }
  function legende(run) {
    return run.pts;
  }
  function oordeel(run) {
    if (run.modus === "hardcore" && run.l > 0) return "Hardcore kent geen tweede kans. Je strijd eindigt hier, in de ring.";
    if (run.l === 0 && run.d === 0 && run.gevecht >= C.doel) return "Perfect. 40-0-0. Hier gaan ze boeken over schrijven.";
    var p = legende(run), wt = run.titels.indexOf("World Title") >= 0;
    if (wt && run.l <= 3) return "Een van de grootsten ooit. Ze noemen zalen naar je.";
    if (wt) return "Wereldkampioen. De gouden riem hangt boven je open haard.";
    if (p > 7000) return "Een topcarrière, net zonder de wereldtitel. In de boksschool hangt je foto nog.";
    if (p > 3500) return "Sterk internationaal niveau. Kenners weten precies wie je bent.";
    return "Een eerlijke carrière. Je hebt mooie verhalen en een rare neus.";
  }
  return { rondAf: rondAf, koopTeam: koopTeam, kiesContract: kiesContract, titelVan: titelVan, contract: contract, rust: rust, nieuweRun: nieuweRun, draai: draai, kiesKaart: kiesKaart, herdraai: herdraai, totaal: totaal, stijl: stijl, fase: fase, faseIndex: faseIndex, leeftijd: leeftijd,
           vecht: vecht, naUitslag: naUitslag, train: train, kiesGebeurtenis: kiesGebeurtenis, legende: legende, oordeel: oordeel, maakOpties: maakOpties, KEYS: KEYS, effectief: effectief };
})();

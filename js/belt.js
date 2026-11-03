/* ==========================================================================
   ONGESLAGEN: de gouden riemen, volledig getekend in SVG.
   Elke riem heeft een eigen lederkleur, edelsteen en embleem.
   ========================================================================== */
var Belt = (function () {
  var teller = 0;
  var SOORTEN = {
    "City Title": { band: ["#4b1a12", "#26090a"], steen: ["#ffb27a", "#a84a12"], tekst: "CITY CHAMPION", embleem: "schild", metaal: "brons" },
    "Challenger Belt": { band: ["#343a46", "#14171d"], steen: ["#9fd0ff", "#2a5fa8"], tekst: "CHALLENGER", embleem: "ster", metaal: "zilver" },
    "Continental Silver": { band: ["#3d1a5c", "#1a0a2c"], steen: ["#d3a6ff", "#6a22b0"], tekst: "CONTINENTAL SILVER", embleem: "kaart", metaal: "zilver" },
    "World Silver": { band: ["#26262c", "#08080a"], steen: ["#ffffff", "#8fa9c2"], tekst: "WORLD SILVER", embleem: "wereld", metaal: "zilver" },
    "Regional Title": { band: ["#6d1016", "#3c0609"], steen: ["#ff6a5e", "#a30f1c"], tekst: "REGIONAL CHAMPION", embleem: "schild" },
    "National Title": { band: ["#14306e", "#081637"], steen: ["#7fb1ff", "#123aa6"], tekst: "NATIONAL CHAMPION", embleem: "ster" },
    "Continental Title": { band: ["#0f5236", "#052b1b"], steen: ["#6ff0ad", "#0b7a4c"], tekst: "CONTINENTAL CHAMPION", embleem: "kaart" },
    "World Title": { band: ["#201a14", "#050403"], steen: ["#ffffff", "#9fc6e6"], tekst: "WORLD CHAMPION", embleem: "wereld" }
  };
  function stops(m) {
    var c = m === "zilver" ? ["#ffffff", "#d3d8de", "#7f8791", "#eef1f4", "#646b75"] : m === "brons" ? ["#ffdcae", "#d89a58", "#8a5426", "#efbd83", "#6b3d17"] : ["#fff0b0", "#f1c24b", "#b57c17", "#f7d873", "#8d5c0e"], o = [0, .22, .48, .7, 1];
    return c.map(function (k, i) { return '<stop offset="' + o[i] + '" stop-color="' + k + '"/>'; }).join("");
  }
  function sc(x, y) { return "translate(" + x + " " + y + ")"; }

  function laurier(cx, cy, rx, ry, id) {
    var h = "";
    for (var kant = -1; kant <= 1; kant += 2) {
      for (var i = 0; i < 15; i++) {
        var a = (108 + i * 11) * Math.PI / 180;
        var x = cx + kant * Math.cos(a) * -rx, y = cy - Math.sin(a) * ry;
        var rot = kant * (i * 11 - 22);
        h += '<ellipse cx="' + (x + kant * 5).toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="9.5" ry="3.6" fill="url(#' + id + 'g)" stroke="#3d2706" stroke-width=".9" transform="rotate(' + rot.toFixed(0) + " " + (x + kant * 5).toFixed(1) + " " + y.toFixed(1) + ')"/>';
        h += '<ellipse cx="' + (x - kant * 5).toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="8" ry="3.1" fill="url(#' + id + 'g)" stroke="#3d2706" stroke-width=".9" transform="rotate(' + (-rot).toFixed(0) + " " + (x - kant * 5).toFixed(1) + " " + y.toFixed(1) + ')"/>';
      }
    }
    return h;
  }
  /* Golvende rand van de hoofdplaat. */
  function golfrand(cx, cy, rx, ry, n, diep) {
    var p = "";
    for (var i = 0; i < n; i++) {
      var a = i / n * 6.2832, b = (i + .5) / n * 6.2832;
      var x1 = cx + Math.cos(a) * rx, y1 = cy + Math.sin(a) * ry;
      var mx = cx + Math.cos(b) * (rx + diep), my = cy + Math.sin(b) * (ry + diep);
      var a2 = (i + 1) / n * 6.2832, x2 = cx + Math.cos(a2) * rx, y2 = cy + Math.sin(a2) * ry;
      p += (i ? "" : "M" + x1.toFixed(1) + " " + y1.toFixed(1)) + "Q" + mx.toFixed(1) + " " + my.toFixed(1) + " " + x2.toFixed(1) + " " + y2.toFixed(1);
    }
    return p + "Z";
  }
  function steen(x, y, r, id) {
    return '<g>' + '<circle cx="' + x + '" cy="' + y + '" r="' + (r + 1.6) + '" fill="url(#' + id + 'g)" stroke="#3d2706" stroke-width=".9"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#' + id + 's)" stroke="#2b1a04" stroke-width=".6"/>' +
      '<circle cx="' + (x - r * .35) + '" cy="' + (y - r * .35) + '" r="' + r * .28 + '" fill="#fff" opacity=".85"/></g>';
  }
  function kroon(x, y, s, id) {
    return '<g transform="' + sc(x, y) + " scale(" + s + ')"><path d="M-30 12L-36-16-18-3-9-22 0-5 9-22 18-3 36-16 30 12Z" fill="url(#' + id + 'g)" stroke="#3d2706" stroke-width="1.8" stroke-linejoin="round"/><path d="M-30 12H30V19H-30Z" fill="url(#' + id + 'd)" stroke="#3d2706" stroke-width="1.6"/>' +
      steen(-36, -18, 3.2, id) + steen(-9, -24, 3.2, id) + steen(9, -24, 3.2, id) + steen(36, -18, 3.2, id) + steen(0, 15.5, 2.4, id) + steen(-17, 15.5, 2, id) + steen(17, 15.5, 2, id) + '</g>';
  }
  function handschoen(x, y, s, spiegel) {
    return '<g transform="' + sc(x, y) + " scale(" + (spiegel ? -s : s) + " " + s + ')" fill="#3d2706"><path d="M-12 12c-6-8-7-20 2-26 8-5 19-3 23 5 3 7 1 13-3 16l-1 6H-12z"/><path d="M-13 14h21v7h-21z"/><path d="M-5-3c3-4 9-5 12-2" stroke="#e8c666" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M-11 17h17" stroke="#e8c666" stroke-width="1.3"/></g>';
  }
  function ster(x, y, r, fill) {
    var p = "";
    for (var i = 0; i < 10; i++) { var a = i / 10 * 6.283 - 1.571, q = i % 2 ? r * .42 : r; p += (i ? "L" : "M") + (x + Math.cos(a) * q).toFixed(1) + " " + (y + Math.sin(a) * q).toFixed(1); }
    return '<path d="' + p + 'Z" fill="' + fill + '"/>';
  }
  function embleem(soort, id) {
    var cx = 200, cy = 96;
    if (soort === "wereld") {
      return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="36" ry="33" fill="url(#' + id + 'zee)" stroke="#3d2706" stroke-width="1.5"/>' +
        '<g fill="none" stroke="#e8c666" stroke-width="1.1" opacity=".95"><ellipse cx="' + cx + '" cy="' + cy + '" rx="36" ry="33"/><ellipse cx="' + cx + '" cy="' + cy + '" rx="18" ry="33"/><path d="M200 63v66M164 96h72M168 80c20 6 44 6 64 0M168 112c20-6 44-6 64 0"/></g>' +
        '<path d="M178 76c6-5 15-4 20 0 2 4-1 8-6 8-3 4-1 8-5 12-5-2-7-8-9-12-2-3-2-5 0-8zM205 88c7-3 15-1 18 4 0 6-5 8-6 14-3 5-7 7-9 3-1-5-4-7-5-11 0-4 0-8 2-10z" fill="url(#' + id + 'g)" stroke="#3d2706" stroke-width=".7"/>';
    }
    if (soort === "ster") return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="35" ry="32" fill="url(#' + id + 'zee)" stroke="#3d2706" stroke-width="1.5"/>' + ster(cx, cy - 1, 26, "url(#" + id + "g)") + ster(cx, cy - 1, 13, "#3d2706") + ster(cx, cy - 1, 9, "#e8c666");
    if (soort === "kaart") return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="35" ry="32" fill="url(#' + id + 'zee)" stroke="#3d2706" stroke-width="1.5"/>' +
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (i) { var a = i / 12 * 6.283; return ster((cx + Math.cos(a) * 25).toFixed(1) * 1, (cy + Math.sin(a) * 23).toFixed(1) * 1, 4.5, "url(#" + id + "g)"); }).join("") + handschoen(cx - 1, cy - 2, .9);
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="35" ry="32" fill="url(#' + id + 'zee)" stroke="#3d2706" stroke-width="1.5"/><path d="M178 72h44v28c0 14-14 22-22 25-8-3-22-11-22-25z" fill="url(#' + id + 'g)" stroke="#3d2706" stroke-width="1.6"/><path d="M200 72v53M178 94h44" stroke="#3d2706" stroke-width="1.4"/>' + handschoen(189, 83, .36) + handschoen(211, 108, .36) + ster(211, 83, 6, "#3d2706") + ster(189, 108, 6, "#3d2706");
  }
  function zijplaat(x, breed, hoog, id, inhoud) {
    var y = 96, b = breed / 2, h = hoog / 2;
    var d = "M" + (x - b + 10) + " " + (y - h) + "H" + (x + b - 10) + "Q" + (x + b) + " " + (y - h) + " " + (x + b) + " " + (y - h + 12) + "V" + (y + h - 12) + "Q" + (x + b) + " " + (y + h) + " " + (x + b - 10) + " " + (y + h) + "H" + (x - b + 10) + "Q" + (x - b) + " " + (y + h) + " " + (x - b) + " " + (y + h - 12) + "V" + (y - h + 12) + "Q" + (x - b) + " " + (y - h) + " " + (x - b + 10) + " " + (y - h) + "Z";
    return '<path d="' + d + '" fill="url(#' + id + 'g)" stroke="#2b1a04" stroke-width="2"/><path d="' + d + '" fill="none" stroke="#fff3bf" stroke-width="1" transform="translate(' + x + " " + y + ") scale(.9) translate(" + (-x) + " " + (-y) + ')" opacity=".65"/>' +
      '<path d="' + d + '" fill="url(#' + id + 'd)" transform="translate(' + x + " " + y + ") scale(.8) translate(" + (-x) + " " + (-y) + ')" opacity=".55"/>' + inhoud +
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(function (o) { return steen(x + o[0] * (b - 6), y + o[1] * (h - 7), 1.8, id); }).join("");
  }

  function teken(titel, opties) {
    opties = opties || {};
    var S = SOORTEN[titel] || SOORTEN["World Title"], id = "b" + (++teller);
    var kl = "belt" + (opties.dicht ? " dicht" : "");
    var defs = '<defs>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2=".4" y2="1">' + stops(S.metaal) + '</linearGradient>' +
      '<linearGradient id="' + id + 'd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (S.metaal === "zilver" ? "#dfe3e8" : S.metaal === "brons" ? "#e0a868" : "#f6d365") + '"/><stop offset="1" stop-color="' + (S.metaal === "zilver" ? "#6d747e" : S.metaal === "brons" ? "#7a4a1f" : "#8a5a0d") + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + S.band[0] + '"/><stop offset="1" stop-color="' + S.band[1] + '"/></linearGradient>' +
      '<radialGradient id="' + id + 's" cx=".35" cy=".3"><stop offset="0" stop-color="' + S.steen[0] + '"/><stop offset="1" stop-color="' + S.steen[1] + '"/></radialGradient>' +
      '<radialGradient id="' + id + 'zee" cx=".4" cy=".3"><stop offset="0" stop-color="' + S.band[0] + '"/><stop offset="1" stop-color="' + S.band[1] + '"/></radialGradient>' +
      '</defs>';
    var band = "M6 66C52 44 108 40 200 42C292 40 348 44 394 66V126C348 148 292 152 200 150C108 152 52 148 6 126Z";
    var stiksel = '<path d="M12 72C56 51 110 47 200 49C290 47 344 51 388 72" fill="none" stroke="#e8c666" stroke-width="1.1" stroke-dasharray="4 3"/><path d="M12 120C56 141 110 145 200 143C290 145 344 141 388 120" fill="none" stroke="#e8c666" stroke-width="1.1" stroke-dasharray="4 3"/>';
    var knopen = [14, 22, 30].map(function (x) { return steen(x, 96, 3, id) + steen(400 - x, 96, 3, id); }).join("");
    var zij = zijplaat(58, 42, 66, id, handschoen(58, 95, .8)) + zijplaat(342, 42, 66, id, handschoen(342, 95, .8, true)) +
      zijplaat(97, 30, 50, id, ster(97, 96, 11, "#3d2706") + ster(97, 96, 5, "#e8c666")) + zijplaat(303, 30, 50, id, ster(303, 96, 11, "#3d2706") + ster(303, 96, 5, "#e8c666"));
    var cx = 200, cy = 96, stenen = "";
    for (var i = 0; i < 18; i++) { var a = i / 18 * 6.2832; stenen += steen((cx + Math.cos(a) * 80).toFixed(1) * 1, (cy + Math.sin(a) * 74).toFixed(1) * 1, 2.3, id); }
    var banier = '<path d="M146 136L132 132 140 146 128 156H272L260 146 268 132 254 136Z" fill="url(#' + id + 'g)" stroke="#2b1a04" stroke-width="1.6"/><path d="M144 134H256V154H144Z" fill="#160d04" stroke="url(#' + id + 'g)" stroke-width="1.6"/>' +
      '<text x="200" y="149" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-weight="700" font-size="' + (S.tekst.length > 17 ? 8.4 : 10) + '" fill="#f7d873" textLength="' + (S.tekst.length > 17 ? 104 : 94) + '" lengthAdjust="spacingAndGlyphs">' + S.tekst + '</text>';
    var midden = '<path d="' + golfrand(cx, cy, 89, 82, 22, 9) + '" fill="url(#' + id + 'g)" stroke="#2b1a04" stroke-width="2.4"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="84" ry="77" fill="none" stroke="#fff3bf" stroke-width="1.2" opacity=".75"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="72" ry="66" fill="#1a0f05" stroke="#2b1a04" stroke-width="1.5"/><ellipse cx="' + cx + '" cy="' + cy + '" rx="72" ry="66" fill="url(#' + id + 'd)" opacity=".28"/>' + stenen + laurier(cx, cy + 2, 54, 54, id) + embleem(S.embleem, id) + kroon(cx, 28, .82, id) + banier;
    return '<svg class="' + kl + '" viewBox="0 0 400 190" role="img" aria-label="' + S.tekst + ' belt">' + defs +
      '<path d="' + band + '" fill="url(#' + id + 'l)" stroke="#000" stroke-width="2"/>' + stiksel + knopen + zij + '<g transform="translate(200 96) scale(.92) translate(-200 -96)">' + midden + '</g></svg>';
  }
  return { teken: teken };
})();

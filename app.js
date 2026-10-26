/* Contrast Check — WCAG 2 contrast ratio, AA/AAA results and nearest passing colour. All local. */
(function () {
  "use strict";
  var $ = S3.$, h = S3.h;

  // Colour parsing + sRGB/OKLab maths: same code as the S3eidat Color Convert tool (checked there against the browser's parser).
  var NAMED_SRC = "aliceblue f0f8ff antiquewhite faebd7 aqua 00ffff aquamarine 7fffd4 azure f0ffff beige f5f5dc bisque ffe4c4 black 000000 " +
    "blanchedalmond ffebcd blue 0000ff blueviolet 8a2be2 brown a52a2a burlywood deb887 cadetblue 5f9ea0 chartreuse 7fff00 chocolate d2691e " +
    "coral ff7f50 cornflowerblue 6495ed cornsilk fff8dc crimson dc143c cyan 00ffff darkblue 00008b darkcyan 008b8b darkgoldenrod b8860b " +
    "darkgray a9a9a9 darkgreen 006400 darkgrey a9a9a9 darkkhaki bdb76b darkmagenta 8b008b darkolivegreen 556b2f darkorange ff8c00 " +
    "darkorchid 9932cc darkred 8b0000 darksalmon e9967a darkseagreen 8fbc8f darkslateblue 483d8b darkslategray 2f4f4f darkslategrey 2f4f4f " +
    "darkturquoise 00ced1 darkviolet 9400d3 deeppink ff1493 deepskyblue 00bfff dimgray 696969 dimgrey 696969 dodgerblue 1e90ff " +
    "firebrick b22222 floralwhite fffaf0 forestgreen 228b22 fuchsia ff00ff gainsboro dcdcdc ghostwhite f8f8ff gold ffd700 goldenrod daa520 " +
    "gray 808080 green 008000 greenyellow adff2f grey 808080 honeydew f0fff0 hotpink ff69b4 indianred cd5c5c indigo 4b0082 ivory fffff0 " +
    "khaki f0e68c lavender e6e6fa lavenderblush fff0f5 lawngreen 7cfc00 lemonchiffon fffacd lightblue add8e6 lightcoral f08080 " +
    "lightcyan e0ffff lightgoldenrodyellow fafad2 lightgray d3d3d3 lightgreen 90ee90 lightgrey d3d3d3 lightpink ffb6c1 lightsalmon ffa07a " +
    "lightseagreen 20b2aa lightskyblue 87cefa lightslategray 778899 lightslategrey 778899 lightsteelblue b0c4de lightyellow ffffe0 " +
    "lime 00ff00 limegreen 32cd32 linen faf0e6 magenta ff00ff maroon 800000 mediumaquamarine 66cdaa mediumblue 0000cd mediumorchid ba55d3 " +
    "mediumpurple 9370db mediumseagreen 3cb371 mediumslateblue 7b68ee mediumspringgreen 00fa9a mediumturquoise 48d1cc " +
    "mediumvioletred c71585 midnightblue 191970 mintcream f5fffa mistyrose ffe4e1 moccasin ffe4b5 navajowhite ffdead navy 000080 " +
    "oldlace fdf5e6 olive 808000 olivedrab 6b8e23 orange ffa500 orangered ff4500 orchid da70d6 palegoldenrod eee8aa palegreen 98fb98 " +
    "paleturquoise afeeee palevioletred db7093 papayawhip ffefd5 peachpuff ffdab9 peru cd853f pink ffc0cb plum dda0dd powderblue b0e0e6 " +
    "purple 800080 rebeccapurple 663399 red ff0000 rosybrown bc8f8f royalblue 4169e1 saddlebrown 8b4513 salmon fa8072 sandybrown f4a460 " +
    "seagreen 2e8b57 seashell fff5ee sienna a0522d silver c0c0c0 skyblue 87ceeb slateblue 6a5acd slategray 708090 slategrey 708090 " +
    "snow fffafa springgreen 00ff7f steelblue 4682b4 tan d2b48c teal 008080 thistle d8bfd8 tomato ff6347 turquoise 40e0d0 violet ee82ee " +
    "wheat f5deb3 white ffffff whitesmoke f5f5f5 yellow ffff00 yellowgreen 9acd32";
  var NAMED = {};
  (function () { var a = NAMED_SRC.split(" "); for (var i = 0; i < a.length; i += 2) NAMED[a[i]] = a[i + 1]; })();

  // ---------- maths (r, g, b in 0..1 gamma-encoded sRGB; may exceed 0..1 for out-of-gamut OKLCH input) ----------
  function toLin(c) { var a = Math.abs(c); return (a <= 0.04045 ? a / 12.92 : Math.pow((a + 0.055) / 1.055, 2.4)) * (c < 0 ? -1 : 1); }
  function toGam(c) { var a = Math.abs(c); return (a <= 0.0031308 ? 12.92 * a : 1.055 * Math.pow(a, 1 / 2.4) - 0.055) * (c < 0 ? -1 : 1); }
  // Björn Ottosson's OKLab (2020) matrices
  function rgbToOklab(c) {
    var r = toLin(c.r), g = toLin(c.g), b = toLin(c.b);
    var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    var m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    var s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return { L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s };
  }
  function oklabToRgb(o) {
    var l = Math.pow(o.L + 0.3963377774 * o.a + 0.2158037573 * o.b, 3);
    var m = Math.pow(o.L - 0.1055613458 * o.a - 0.0638541728 * o.b, 3);
    var s = Math.pow(o.L - 0.0894841775 * o.a - 1.2914855480 * o.b, 3);
    return { r: toGam(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), g: toGam(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), b: toGam(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s) };
  }
  function oklabToOklch(o) { var C = Math.hypot(o.a, o.b), H = Math.atan2(o.b, o.a) * 180 / Math.PI; return { L: o.L, C: C, h: C < 1e-4 ? 0 : (H + 360) % 360 }; }
  function oklchToOklab(o) { var r = o.h * Math.PI / 180; return { L: o.L, a: o.C * Math.cos(r), b: o.C * Math.sin(r) }; }
  function hslToRgb(hh, s, l) {
    function f(n) { var k = (n + hh / 30) % 12, a = s * Math.min(l, 1 - l); return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }
    return { r: f(0), g: f(8), b: f(4) };
  }
  function hwbToRgb(hh, w, bl) {
    if (w + bl >= 1) { var g = w / (w + bl); return { r: g, g: g, b: g }; }
    var c = hslToRgb(hh, 1, 0.5);
    return { r: c.r * (1 - w - bl) + w, g: c.g * (1 - w - bl) + w, b: c.b * (1 - w - bl) + w };
  }
  function clamp01(x) { return Math.min(1, Math.max(0, x)); }
  function clip(c) { return { r: clamp01(c.r), g: clamp01(c.g), b: clamp01(c.b), a: c.a }; }
  function inGamut(c) { var e = 1e-4; return [c.r, c.g, c.b].every(function (v) { return v >= -e && v <= 1 + e; }); }
  function luminance(c) { return 0.2126 * toLin(c.r) + 0.7152 * toLin(c.g) + 0.0722 * toLin(c.b); }
  function contrast(c1, c2) { var a = luminance(clip(c1)), b = luminance(clip(c2)); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }
  function over(c, bg) { return { r: c.r * c.a + bg.r * (1 - c.a), g: c.g * c.a + bg.g * (1 - c.a), b: c.b * c.a + bg.b * (1 - c.a), a: 1 }; }

  // ---------- parsing ----------
  function num(tok, ref) { // "50%" -> .5*ref ; "0.5" -> 0.5
    if (tok == null) return NaN;
    if (/%$/.test(tok)) return parseFloat(tok) / 100 * ref;
    return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(tok) ? parseFloat(tok) : NaN;
  }
  function hue(tok) {
    var m = /^([-+]?(?:\d+\.?\d*|\.\d+))(deg|rad|grad|turn)?$/i.exec(tok || "");
    if (!m) return NaN;
    var v = parseFloat(m[1]), u = (m[2] || "deg").toLowerCase();
    v = u === "rad" ? v * 180 / Math.PI : u === "grad" ? v * 0.9 : u === "turn" ? v * 360 : v;
    return ((v % 360) + 360) % 360;
  }
  function alphaTok(t) { if (t == null) return 1; var a = num(t, 1); return isNaN(a) ? NaN : clamp01(a); }
  function parseColor(input) {
    var s = String(input || "").trim().toLowerCase();
    if (!s) return null;
    if (s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
    if (NAMED[s]) s = "#" + NAMED[s];
    var hx = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s);
    if (hx) {
      var x = hx[1];
      if (x.length <= 4) x = x.split("").map(function (ch) { return ch + ch; }).join("");
      return { r: parseInt(x.slice(0, 2), 16) / 255, g: parseInt(x.slice(2, 4), 16) / 255, b: parseInt(x.slice(4, 6), 16) / 255, a: x.length === 8 ? parseInt(x.slice(6, 8), 16) / 255 : 1 };
    }
    var fm = /^([a-z]+)\((.*)\)$/.exec(s);
    if (!fm) return null;
    var fn = fm[1], toks = fm[2].replace(/\//g, " / ").split(/[\s,]+/).filter(Boolean), al = 1, si = toks.indexOf("/");
    if (si >= 0) { al = alphaTok(toks[si + 1]); toks = toks.slice(0, si); }
    else if (toks.length === 4) { al = alphaTok(toks[3]); toks = toks.slice(0, 3); }
    if (toks.length !== 3 || isNaN(al)) return null;
    var c;
    if (fn === "rgb" || fn === "rgba") c = { r: num(toks[0], 255) / 255, g: num(toks[1], 255) / 255, b: num(toks[2], 255) / 255 };
    else if (fn === "hsl" || fn === "hsla") { var S = num(toks[1].replace(/%?$/, "%"), 1), L = num(toks[2].replace(/%?$/, "%"), 1); c = hslToRgb(hue(toks[0]), clamp01(S), clamp01(L)); }
    else if (fn === "hwb") c = hwbToRgb(hue(toks[0]), clamp01(num(toks[1].replace(/%?$/, "%"), 1)), clamp01(num(toks[2].replace(/%?$/, "%"), 1)));
    else if (fn === "oklch") c = oklabToRgb(oklchToOklab({ L: clamp01(num(toks[0], 1)), C: Math.max(0, num(toks[1], 0.4)), h: hue(toks[2]) }));
    else if (fn === "oklab") c = oklabToRgb({ L: clamp01(num(toks[0], 1)), a: num(toks[1], 0.4), b: num(toks[2], 0.4) });
    else return null;
    if ([c.r, c.g, c.b].some(isNaN)) return null;
    if (fn === "rgb" || fn === "rgba") c = clip(c);
    c.a = al;
    return c;
  }

  // ---------- contrast ----------
  function b255(x) { return Math.round(clamp01(x) * 255); }
  function toHex(c) { return "#" + [c.r, c.g, c.b].map(function (v) { return b255(v).toString(16).padStart(2, "0"); }).join(""); }
  var WHITE = { r: 1, g: 1, b: 1, a: 1 };
  // Effective colours: a semi-transparent background sits on white; semi-transparent text is blended over the background.
  function effective(fg, bg) { var b = bg.a < 1 ? over(clip(bg), WHITE) : clip(bg); return { fg: fg.a < 1 ? over(clip(fg), b) : clip(fg), bg: b }; }
  var LEVELS = [
    ["AA", "Normal text", 4.5, "1.4.3"], ["AA", "Large text", 3, "1.4.3"], ["AAA", "Normal text", 7, "1.4.6"], ["AAA", "Large text", 4.5, "1.4.6"], ["AA", "UI & graphics", 3, "1.4.11"]
  ];
  // WCAG compares the ratio itself, not a rounded one: 4.499 fails 4.5.
  function results(ratio) { return LEVELS.map(function (l) { return { level: l[0], what: l[1], need: l[2], sc: l[3], pass: ratio >= l[2] }; }); }
  function grade(ratio) { return ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA Large" : "Fail"; }
  function fmtRatio(r) { var t = Math.floor(r * 100) / 100; return (t % 1 ? t.toFixed(2).replace(/0$/, "") : String(t)) + ":1"; }

  function gamutFit(L, C, hh) {
    var rgb = oklabToRgb(oklchToOklab({ L: L, C: C, h: hh }));
    if (inGamut(rgb)) return rgb;
    var lo = 0, hi = C;
    for (var i = 0; i < 24; i++) { var mid = (lo + hi) / 2; if (inGamut(oklabToRgb(oklchToOklab({ L: L, C: mid, h: hh })))) lo = mid; else hi = mid; }
    return oklabToRgb(oklchToOklab({ L: L, C: lo, h: hh }));
  }
  // Nearest colour (same OKLCH hue, chroma kept where the gamut allows) whose 8-bit hex reaches `target` against `other`.
  function suggest(color, other, target) {
    var lch = oklabToOklch(rgbToOklab(clip(color))), best = null;
    [-1, 1].forEach(function (dir) {
      for (var L = lch.L; L >= 0 && L <= 1; L += dir * 0.002) {
        var c = clip(gamutFit(L, lch.C, lch.h)); c.a = 1;
        var hx = toHex(c), cc = parseColor(hx);
        if (contrast(cc, other) >= target) {
          if (!best || Math.abs(L - lch.L) < best.d) best = { hex: hx, d: Math.abs(L - lch.L), ratio: contrast(cc, other) };
          return;
        }
      }
      var end = dir < 0 ? { r: 0, g: 0, b: 0, a: 1 } : { r: 1, g: 1, b: 1, a: 1 }; // pure black/white is the last resort
      if (!best && contrast(end, other) >= target) best = { hex: toHex(end), d: 1, ratio: contrast(end, other) };
    });
    return best;
  }

  // ---------- UI ----------
  var fgIn = $("#fg"), bgIn = $("#bg"), state = { fg: null, bg: null };
  var saved = S3.store("contrast.pair") || ["#6d7581", "#ffffff"];
  fgIn.value = saved[0]; bgIn.value = saved[1];

  function render() {
    var fg = parseColor(fgIn.value), bg = parseColor(bgIn.value);
    fgIn.setAttribute("aria-invalid", String(!fg)); bgIn.setAttribute("aria-invalid", String(!bg));
    $("#err").textContent = fg && bg ? "" : "Couldn't read the " + (!fg ? "text" : "background") + " color. Try #333, rgb(51 51 51), hsl(0 0% 20%), oklch(40% 0 0) or a name.";
    if (!fg || !bg) return;
    state.fg = fg; state.bg = bg;
    var e = effective(fg, bg), ratio = contrast(e.fg, e.bg), g = grade(ratio);
    $("#ratio").textContent = fmtRatio(ratio);
    var gc = $("#grade"); gc.textContent = g === "Fail" ? "Fails" : "Passes " + g; gc.className = "chip big-chip " + (g === "Fail" ? "bad" : g === "AA Large" ? "warn" : "ok");
    var box = $("#results"); box.textContent = "";
    results(ratio).forEach(function (r) {
      box.appendChild(h("div", { "class": "res " + (r.pass ? "pass" : "fail") }, [
        h("span", { "class": "mark", text: r.pass ? "✓" : "✗", "aria-hidden": "true" }),
        h("span", { "class": "what" }, [h("b", { text: r.level + " · " + r.what }), h("span", { "class": "faint", text: "needs " + r.need + ":1 · WCAG " + r.sc })]),
        h("span", { "class": "sr", text: r.pass ? "passes" : "fails" })
      ]));
    });
    $("#alpha-note").hidden = fg.a >= 1 && bg.a >= 1;
    var sample = $("#sample"), fgCss = "rgba(" + [b255(fg.r), b255(fg.g), b255(fg.b), fg.a].join(",") + ")";
    sample.style.background = toHex(e.bg); sample.style.color = fgCss;
    $("#fg-pick").value = toHex(fg); $("#bg-pick").value = toHex(bg);
    S3.store("contrast.pair", [fgIn.value, bgIn.value]);
  }
  function renderSample() { var t = $("#sample-text").value || "The quick brown fox"; $("#s-large").textContent = t; $("#s-normal").textContent = t + ". Body text at 16px needs the most contrast of all."; }

  fgIn.addEventListener("input", S3.debounce(render, 100));
  bgIn.addEventListener("input", S3.debounce(render, 100));
  $("#fg-pick").addEventListener("input", function () { fgIn.value = this.value; render(); });
  $("#bg-pick").addEventListener("input", function () { bgIn.value = this.value; render(); });
  $("#swap").addEventListener("click", function () { var t = fgIn.value; fgIn.value = bgIn.value; bgIn.value = t; render(); });
  $("#sample-text").addEventListener("input", renderSample);
  function fix(which) {
    if (!state.fg || !state.bg) return;
    var target = +$("#target").value, e = effective(state.fg, state.bg), msg = $("#fix-msg");
    var res = which === "fg" ? suggest(e.fg, e.bg, target) : suggest(e.bg, e.fg, target);
    if (!res) { msg.textContent = "No color with this hue reaches " + target + ":1 here. Try changing the other color."; return; }
    if (which === "fg") fgIn.value = res.hex; else bgIn.value = res.hex;
    msg.textContent = (which === "fg" ? "Text" : "Background") + " → " + res.hex + " (" + fmtRatio(res.ratio) + ")";
    render(); S3.done();
  }
  $("#fix-fg").addEventListener("click", function () { fix("fg"); });
  $("#fix-bg").addEventListener("click", function () { fix("bg"); });

  renderSample(); render();

  window.S3_DEMO = function () { fgIn.value = "#3dd6d0"; bgIn.value = "#ffffff"; render(); fix("fg"); };

  window.S3_SELFTEST = function () {
    function near(a, b, t) { return Math.abs(a - b) <= (t || 1e-6); }
    var W = parseColor("#fff"), K = parseColor("black");
    var gray = suggest(parseColor("#999999"), W, 4.5), aaa = suggest(parseColor("#3dd6d0"), W, 7), up = suggest(parseColor("#333333"), parseColor("#000"), 7);
    var half = effective(parseColor("rgba(0, 0, 0, 0.5)"), W);
    var red = oklabToOklch(rgbToOklab(parseColor("#ff0000")));
    var checks = [
      near(contrast(K, W), 21), near(contrast(W, K), 21), near(contrast(W, W), 1),
      fmtRatio(contrast(parseColor("#777"), W)) === "4.47:1", contrast(parseColor("#777"), W) < 4.5, contrast(parseColor("#767676"), W) >= 4.5,
      near(luminance(parseColor("#ff0000")), 0.2126), near(luminance(parseColor("#808080")), 0.21586, 1e-5),
      near(contrast(half.fg, half.bg), 3.977, 0.002),
      near(red.L, 0.627955, 1e-5) && near(red.C, 0.257683, 1e-5),
      grade(4.5) === "AA" && grade(4.49) === "AA Large" && grade(2.9) === "Fail" && grade(7) === "AAA",
      results(4.6).filter(function (r) { return r.pass; }).length === 4, results(3).filter(function (r) { return r.pass; }).length === 2,
      gray && gray.hex === "#767676",
      aaa && contrast(parseColor(aaa.hex), W) >= 7, up && contrast(parseColor(up.hex), parseColor("#000")) >= 7 && luminance(parseColor(up.hex)) > luminance(parseColor("#333333")),
      parseColor("tomato") && toHex(parseColor("tomato")) === "#ff6347", parseColor("nope") === null,
      fmtRatio(21) === "21:1" && fmtRatio(4.5) === "4.5:1"
    ];
    var bad = checks.findIndex(function (c) { return !c; });
    return bad < 0 ? true : "check #" + bad;
  };
})();

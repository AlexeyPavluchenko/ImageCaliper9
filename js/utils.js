/* ============================================================
   ImageCaliper — Utility functions (units, geometry, formatting)
   ============================================================ */
window.IC = window.IC || {};
IC.utils = (function() {

  // ---- Rich text parsing ----

  var GREEK = {
    alpha: '\u03b1', beta: '\u03b2', gamma: '\u03b3', delta: '\u03b4',
    epsilon: '\u03b5', varepsilon: '\u03b5', zeta: '\u03b6', eta: '\u03b7',
    theta: '\u03b8', vartheta: '\u03d1', iota: '\u03b9', kappa: '\u03ba', lambda: '\u03bb',
    mu: '\u03bc', nu: '\u03bd', xi: '\u03be', omicron: '\u03bf',
    pi: '\u03c0', rho: '\u03c1', sigma: '\u03c3', tau: '\u03c4',
    upsilon: '\u03c5', phi: '\u03c6', varphi: '\u03d5', chi: '\u03c7', psi: '\u03c8',
    omega: '\u03c9',
    Alpha: '\u0391', Beta: '\u0392', Gamma: '\u0393', Delta: '\u0394',
    Epsilon: '\u0395', Zeta: '\u0396', Eta: '\u0397', Theta: '\u0398',
    Iota: '\u0399', Kappa: '\u039a', Lambda: '\u039b', Mu: '\u039c',
    Nu: '\u039d', Xi: '\u039e', Omicron: '\u039f', Pi: '\u03a0',
    Rho: '\u03a1', Sigma: '\u03a3', Tau: '\u03a4', Upsilon: '\u03a5',
    Phi: '\u03a6', Chi: '\u03a7', Psi: '\u03a8', Omega: '\u03a9'
  };

  var MATH = {
    cdot: '\u00b7', degree: '\u00b0', pm: '\u00b1', times: '\u00d7',
    div: '\u00f7', infty: '\u221e', approx: '\u2248', neq: '\u2260',
    leq: '\u2264', geq: '\u2265', rightarrow: '\u2192', leftarrow: '\u2190',
    mu: '\u00b5',
    angle: '\u2220', ell: '\u2113', angstrom: '\u212b'
  };

  /** Pass 1: replace \command → Unicode via lookup tables.
   *  LaTeX rule: a \command eats one following space character. */
  function parseCommands(text) {
    if (!text) return '';
    return text.replace(/\\([a-zA-Z]+)( ?)/g, function(match, cmd, space) {
      var replacement = GREEK[cmd] || MATH[cmd];
      if (replacement) return replacement + (space ? '' : '');
      return match; // unknown command — keep as-is
    });
  }

  /**
   * Pass 2: extract \it{...} and \italic{...} blocks.
   * Returns array of {text: string, italic: boolean}.
   */
  function extractItalic(text) {
    if (!text) return [];
    var result = [];
    var re = /\\(?:it|italic)\{([^}]*)\}/g;
    var lastIdx = 0, match;
    while ((match = re.exec(text)) !== null) {
      if (match.index > lastIdx) {
        result.push({ text: text.slice(lastIdx, match.index), italic: false });
      }
      result.push({ text: parseCommands(match[1]), italic: true });
      lastIdx = re.lastIndex;
    }
    if (lastIdx < text.length) {
      result.push({ text: text.slice(lastIdx), italic: false });
    }
    return result.length ? result : [{ text: text, italic: false }];
  }

  /**
   * Pass 3: parse sub/superscript within a segment.
   * Returns array of {text, size, italic}.
   */
  function parseSubSuper(seg) {
    var parts = [];
    var re = /_(?:([a-zA-Z0-9\u00c0-\u024f\u0370-\u03ff\u0400-\u04ff])|{([^}]*)})|\^(?:([a-zA-Z0-9\u00c0-\u024f\u0370-\u03ff\u0400-\u04ff])|{([^}]*)})/g;
    var lastIdx = 0, match;
    while ((match = re.exec(seg.text)) !== null) {
      if (match.index > lastIdx) {
        parts.push({ text: seg.text.slice(lastIdx, match.index), size: 'normal', italic: seg.italic });
      }
      if (match[0][0] === '_') {
        parts.push({ text: match[2] !== undefined ? match[2] : match[1], size: 'sub', italic: false }); // sub/super never italic
      } else {
        parts.push({ text: match[4] !== undefined ? match[4] : match[3], size: 'super', italic: false });
      }
      lastIdx = re.lastIndex;
    }
    if (lastIdx < seg.text.length) {
      parts.push({ text: seg.text.slice(lastIdx), size: 'normal', italic: seg.italic });
    }
    return parts.length ? parts : [{ text: seg.text, size: 'normal', italic: seg.italic }];
  }

  /**
   * Post-processing: merge adjacent super+sub segments into a stack.
   * E.g. [2(super), 1(sub)] → [{size:'stack', super:'2', sub:'1'}]
   * Handles both orderings: super+sub and sub+super.
   */
  function mergeStack(segs) {
    if (segs.length < 2) return segs;
    var out = [];
    for (var i = 0; i < segs.length; i++) {
      var cur = segs[i];
      var next = segs[i + 1];
      if (next && ((cur.size === 'super' && next.size === 'sub') || (cur.size === 'sub' && next.size === 'super'))) {
        out.push({
          size: 'stack',
          super: cur.size === 'super' ? cur.text : next.text,
          sub: cur.size === 'sub' ? cur.text : next.text,
          italic: false
        });
        i++; // skip next
      } else {
        out.push(cur);
      }
    }
    return out;
  }

  /**
   * Full pipeline: parseCommands → extractItalic → parseSubSuper → mergeStack.
   * Returns array of segments.
   */
  function parseRichText(text) {
    var s = parseCommands(text);
    var italicSegs = extractItalic(s);
    var result = [];
    for (var i = 0; i < italicSegs.length; i++) {
      var sub = parseSubSuper(italicSegs[i]);
      for (var j = 0; j < sub.length; j++) {
        result.push(sub[j]);
      }
    }
    return mergeStack(result);
  }

  // ---- DPI validation ----
  function validDpi(ndpi) {
    return (isFinite(ndpi) && ndpi > 0) ? ndpi : null;
  }
  function calcDpi(ppmm) {
    return validDpi(ppmm * 25.4);
  }

  // ---- Unit conversion (internal: mm) ----
  function pixelsToMM(px, mmPerPx) { return px * mmPerPx; }
  function mmToPixels(mm, mmPerPx) { return mm / mmPerPx; }
  function pxPerMm(mmPerPx) { return 1 / mmPerPx; }

  function mmToDisplay(mm, u) {
    switch(u) {
      case 'km': return mm / 1e6;
      case 'm':  return mm / 1e3;
      case 'cm': return mm / 10;
      case 'mm': return mm;
      case 'um': return mm * 1e3;
      case 'nm': return mm * 1e6;
      case 'A':  return mm * 1e7;
      case 'in': return mm / 25.4;
      default:   return mm;
    }
  }

  function displayToMm(v, u) {
    switch(u) {
      case 'km': return v * 1e6;
      case 'm':  return v * 1e3;
      case 'cm': return v * 10;
      case 'mm': return v;
      case 'um': return v / 1e3;
      case 'nm': return v / 1e6;
      case 'A':  return v / 1e7;
      case 'in': return v * 25.4;
      default:   return v;
    }
  }

  function unitDisplay(u) {
    if (u === 'um') return '\u00B5m';
    if (u === 'A') return '\u00C5';
    return u;
  }

  // ---- Formatting ----
  function formatValue(mm, u, d) {
    d = d || 2;
    return mmToDisplay(mm, u).toFixed(d) + ' ' + unitDisplay(u);
  }

  function formatArea(mm2, u, d) {
    d = d || 2;
    const conv = u === 'km' ? 1e12 : u === 'm' ? 1e6 : u === 'cm' ? 100 : u === 'mm' ? 1 : u === 'um' ? 1e-6 : u === 'nm' ? 1e-12 : u === 'A' ? 1e-14 : 645.16;
    return (mm2 / conv).toFixed(d) + ' ' + unitDisplay(u) + '\u00B2';
  }

  // Round to N significant figures, then format.
  // If decimals specified, use it (for {vN.M} template).
  // Otherwise show only the digits needed for sigFigs, max 3 decimal places.
  function fmtVal(value, sigFigs, decimals) {
    if (value === 0) return (0).toFixed(decimals !== undefined ? decimals : 0);
    const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(value))));
    const rounded = Math.round(value / mag * Math.pow(10, sigFigs - 1)) / Math.pow(10, sigFigs - 1) * mag;
    const dec = decimals !== undefined ? decimals : Math.min(3, Math.max(0, sigFigs - Math.floor(Math.log10(Math.abs(rounded))) - 1));
    return rounded.toFixed(dec);
  }

  function computeValue(valueMm, unit, type, sigFigs, decimals) {
    if (type === 'polygon') {
      const conv = unit === 'km' ? 1e12 : unit === 'm' ? 1e6 : unit === 'cm' ? 100 : unit === 'mm' ? 1 : unit === 'um' ? 1e-6 : unit === 'nm' ? 1e-12 : unit === 'A' ? 1e-14 : 645.16;
      const v = valueMm / conv;
      const s = sigFigs !== undefined ? sigFigs : 3;
      return fmtVal(v, s, decimals) + ' ' + unitDisplay(unit) + '\u00B2';
    }
    if (type === 'angle') {
      const dA = (decimals !== undefined) ? decimals : 1;
      return valueMm.toFixed(dA) + '\u00B0';
    }
    const v = mmToDisplay(valueMm, unit);
    const s = sigFigs !== undefined ? sigFigs : 3;
    return fmtVal(v, s, decimals) + ' ' + unitDisplay(unit);
  }

  // Format label from template: {vN.M} or {v}
  function formatLabel(template, valueMm, unit, type) {
    const t = template || '{v}';
    const m = t.match(/\{v(\d+)\.(\d+)\}/);
    if (m) {
      const val = computeValue(valueMm, unit, type, parseInt(m[1]), parseInt(m[2]));
      return t.replace(m[0], val);
    }
    const val = computeValue(valueMm, unit, type);
    return t.replace('{v}', val);
  }

  // ---- Geometry ----
  function distance(ax, ay, bx, by) {
    return Math.hypot(bx - ax, by - ay);
  }

  function angleBetween(vx, vy, p1x, p1y, p2x, p2y) {
    const a1 = Math.atan2(p1y - vy, p1x - vx);
    const a2 = Math.atan2(p2y - vy, p2x - vx);
    let deg = (a2 - a1) * 180 / Math.PI;
    if (deg < 0) deg += 360;
    return Math.min(deg, 360 - deg);
  }

  function snapAngle(deg, snap) {
    return Math.round(deg / snap) * snap;
  }

  function pointToLineDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  function circumcenter(ax, ay, bx, by, cx, cy) {
    const D = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    if (Math.abs(D) < 1e-10) return null;
    return {
      x: ((ax*ax+ay*ay)*(by-cy) + (bx*bx+by*by)*(cy-ay) + (cx*cx+cy*cy)*(ay-by)) / D,
      y: ((ax*ax+ay*ay)*(cx-bx) + (bx*bx+by*by)*(ax-cx) + (cx*cx+cy*cy)*(bx-ax)) / D
    };
  }

  function polygonArea(pts) {
    if (pts.length < 3) return 0;
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    }
    return Math.abs(a) / 2;
  }

  // ---- Color ----
  function hexToRgba(hex, opacity) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0,2), 16);
    const g = parseInt(hex.substring(2,4), 16);
    const b = parseInt(hex.substring(4,6), 16);
    const a = (opacity === 0 || opacity) ? opacity : 1;
    return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
  }

  return {
    validDpi, calcDpi,
    pixelsToMM, mmToPixels, pxPerMm, mmToDisplay, displayToMm, unitDisplay,
    formatValue, formatArea, fmtVal, computeValue, formatLabel,
    distance, angleBetween, snapAngle, pointToLineDist, circumcenter, polygonArea,
    hexToRgba,
    parseRichText, parseCommands
  };
})();

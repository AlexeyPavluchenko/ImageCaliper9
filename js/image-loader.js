/* ============================================================
   ImageCaliper — Image file loading and decoding
   ============================================================ */
window.IC = window.IC || {};
IC.imageLoader = (function() {

  const U = IC.utils;
  const D = IC.dpi;

  /**
   * Main entry point: load a File into the app.
   * Calls back with { img, url, dpi, status } or { error }.
   */
  function loadImageFile(file, state, callbacks) {
    const n = file.name.toLowerCase();
    const isTiff = n.endsWith('.tif') || n.endsWith('.tiff');
    const isRaw = n.endsWith('.dng') || n.endsWith('.cr2') || n.endsWith('.nef') || n.endsWith('.arw');
    if (isRaw) {
      callbacks.onStatus(IC.i18n.t('status.rawNotSupported'));
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      const buf = e.target.result;
      const firstBytes = new Uint8Array(buf, 0, 2);
      const hdr = new TextDecoder().decode(firstBytes);
      const isPnm = hdr === 'P1' || hdr === 'P2' || hdr === 'P3' || hdr === 'P4' || hdr === 'P5' || hdr === 'P6';
      if (isPnm) loadPnmImage(buf, file, state, callbacks);
      else if (isTiff) loadTiffWithFallback(buf, file, state, callbacks);
      else loadStandardImage(buf, file, state, callbacks);
    };
    reader.onerror = function() {
      callbacks.onStatus(IC.i18n.t('status.readError'));
    };
    reader.readAsArrayBuffer(file);
  }

  // ---- Standard images (JPEG, PNG, etc.) ----
  function loadStandardImage(buf, file, state, callbacks) {
    const dpi = D.parseExifDpi(buf);
    callbacks.onDpiDetected(dpi);
    const url = URL.createObjectURL(new Blob([buf], { type: file.type }));
    const img = new Image();
    img.onload = function() {
      callbacks.onFinalize(img, url);
    };
    img.onerror = function() {
      URL.revokeObjectURL(url);
      callbacks.onStatus(IC.i18n.t('status.loadFailed'));
    };
    img.src = url;
  }

  // ---- TIFF loading with fallback ----
  function loadTiffWithFallback(buf, file, state, callbacks) {
    const blob = new Blob([buf], { type: 'image/tiff' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = function() {
      callbacks.onDpiDetected(D.parseExifDpi(buf));
      callbacks.onFinalize(img, url);
    };
    img.onerror = function() {
      URL.revokeObjectURL(url);
      // Try simple TIFF decoder
      try {
        const r = decodeSimpleTiff(buf);
        if (r) {
          renderDecodedTiff(r.rgba, r.w, r.h, r.dpi, state, callbacks);
          return;
        }
      } catch(e) {}
      // Try UTIF.js (loaded globally)
      if (typeof UTIF !== 'undefined') {
        try {
          const ifds = UTIF.decode(buf);
          if (ifds && ifds[0]) {
            UTIF.decodeImage(buf, ifds[0]);
            const rgba = UTIF.toRGBA8(ifds[0]);
            if (rgba && rgba.length > 0 && ifds[0].width && ifds[0].height) {
              renderDecodedTiff(rgba, ifds[0].width, ifds[0].height, null, state, callbacks);
              return;
            }
          }
        } catch(e) {}
      }
      callbacks.onStatus(IC.i18n.t('status.tiffNotSupported'));
    };
    img.src = url;
  }

  // ---- Simple TIFF decoder (baseline) ----
  function decodeSimpleTiff(buf) {
    const dv = new DataView(buf);
    const f = dv.getUint16(0, true);
    const le = f === 0x4949, be = f === 0x4D4D;
    if (!le && !be) return null;
    if (dv.getUint16(2, le) !== 42) return null;
    const r16 = o => dv.getUint16(o, le), r32 = o => dv.getUint32(o, le);
    const ifdOff = r32(4);
    if (!ifdOff || ifdOff + 2 > buf.byteLength) return null;
    const num = r16(ifdOff);
    const tags = {};
    for (let i = 0; i < num; i++) {
      const o = ifdOff + 2 + i * 12;
      if (o + 12 > buf.byteLength) break;
      tags[r16(o)] = { t: r16(o+2), c: r32(o+4), v: r32(o+8) };
    }
    function gt(tag) {
      const x = tags[tag]; if (!x) return undefined;
      if (x.t === 3 && x.c === 1) return x.v;
      if (x.t === 4 && x.c === 1) return x.v;
      if (x.t === 5 && x.c >= 1) { const o = x.v; if (o + 8 <= buf.byteLength) return [r32(o), r32(o+4)]; return undefined; }
      if (x.t === 3) { const a = []; for (let j = 0; j < x.c; j++) a.push(r16(x.v + j*2)); return a; }
      if (x.t === 4) { const a = []; for (let j = 0; j < x.c; j++) a.push(r32(x.v + j*4)); return a; }
      return x.v;
    }
    const w = gt(256), h = gt(257), bps = gt(258), photo = gt(262);
    const so = gt(273), sbc = gt(279);
    if (!w || !h || w < 1 || h < 1) return null;
    let dpi = null;
    const xr = gt(282);
    if (xr && Array.isArray(xr)) { dpi = xr[0] / xr[1]; if (gt(296) === 3) dpi *= 25.4; }
    let ds = 0, dl = 0;
    if (typeof so === 'number') { ds = so; dl = typeof sbc === 'number' ? sbc : buf.byteLength - ds; }
    else if (Array.isArray(so)) { ds = so[0]; dl = Array.isArray(sbc) ? sbc.reduce((a,b)=>a+b,0) : buf.byteLength - ds; }
    else { ds = ifdOff + 2 + num * 12 + 4; dl = buf.byteLength - ds; }
    if (ds >= buf.byteLength) return null;
    dl = Math.min(dl, buf.byteLength - ds);
    const raw = new Uint8Array(buf, ds, dl);
    const total = w * h;
    const rgba = new Uint8ClampedArray(total * 4);
    const wiz = (photo === 0);
    if (bps === 1 || !bps) {
      const rb = Math.ceil(w / 8);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const bi = y * rb + Math.floor(x / 8);
        const bit = bi < raw.length ? (raw[bi] >> (7 - (x % 8))) & 1 : 0;
        const val = wiz ? (bit ? 0 : 255) : (bit ? 255 : 0);
        const pi = (y * w + x) * 4; rgba[pi] = val; rgba[pi+1] = val; rgba[pi+2] = val; rgba[pi+3] = 255;
      }
    } else if (bps === 8) {
      for (let i = 0; i < total && i < raw.length; i++) {
        const val = wiz ? 255 - raw[i] : raw[i];
        const pi = i * 4; rgba[pi] = val; rgba[pi+1] = val; rgba[pi+2] = val; rgba[pi+3] = 255;
      }
    } else if (bps === 24 || bps === 32) {
      const bpp = Math.ceil(bps / 8);
      for (let i = 0; i < total && i * bpp < raw.length; i++) {
        const si = i * bpp, pi = i * 4;
        rgba[pi] = raw[si]; rgba[pi+1] = raw[si+1]; rgba[pi+2] = raw[si+2]; rgba[pi+3] = bpp >= 4 ? raw[si+3] : 255;
      }
    } else return null;
    return { rgba, w, h, dpi };
  }

  // ---- PNM decoder ----
  function loadPnmImage(buf, file, state, callbacks) {
    try {
      const text = new TextDecoder('ascii').decode(buf);
      const m = text.match(/^(P[1-6])\s+#?[^\n]*\n(\d+)\s+(\d+)\n(\d+)\n/);
      if (!m) {
        const m2 = text.match(/^(P[1-6])\s+(\d+)\s+(\d+)\n(\d+)\n/);
        if (!m2) { callbacks.onStatus(IC.i18n.t('status.pnmDecodeFailed')); return; }
        renderPnm(m2[1], +m2[2], +m2[3], +m2[4], m2[0].length, buf, state, callbacks);
        return;
      }
      renderPnm(m[1], +m[2], +m[3], +m[4], m[0].length, buf, state, callbacks);
    } catch(e) {
      callbacks.onStatus(IC.i18n.t('status.pnmError') + e.message);
    }
  }

  function renderPnm(magic, w, h, maxv, hlen, buf, state, callbacks) {
    const total = w * h;
    const rgba = new Uint8ClampedArray(total * 4);
    if (magic === 'P6') {
      const data = new Uint8Array(buf, hlen);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const si = y * w * 3 + x * 3, pi = (y * w + x) * 4;
        rgba[pi] = data[si]; rgba[pi+1] = data[si+1]; rgba[pi+2] = data[si+2]; rgba[pi+3] = 255;
      }
    } else if (magic === 'P5') {
      const data = new Uint8Array(buf, hlen);
      for (let i = 0; i < total; i++) { const v = data[i]; const pi = i * 4; rgba[pi] = v; rgba[pi+1] = v; rgba[pi+2] = v; rgba[pi+3] = 255; }
    } else if (magic === 'P4') {
      const data = new Uint8Array(buf, hlen);
      const rb = Math.ceil(w / 8);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const bi = y * rb + Math.floor(x / 8);
        const bit = (data[bi] >> (7 - (x % 8))) & 1;
        const val = bit ? 0 : 255;
        const pi = (y * w + x) * 4; rgba[pi] = val; rgba[pi+1] = val; rgba[pi+2] = val; rgba[pi+3] = 255;
      }
    } else { callbacks.onStatus(IC.i18n.t('status.pnmNotSupported')); return; }
    renderDecodedTiff(rgba, w, h, null, state, callbacks);
  }

  // ---- Render decoded pixel data to canvas ----
  function renderDecodedTiff(rgba, w, h, dpi, state, callbacks) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const cx = c.getContext('2d');
    const id = cx.createImageData(w, h);
    id.data.set(rgba);
    cx.putImageData(id, 0, 0);
    const url = c.toDataURL('image/png');
    const img = new Image();
    img.onload = function() {
      callbacks.onFinalize(img, url, dpi);
      if (dpi) {
        callbacks.onStatus(IC.i18n.t('status.tiffLoaded') + w + 'x' + h + ', DPI: ' + Math.round(dpi));
      } else {
        callbacks.onStatus(IC.i18n.t('status.tiffLoaded') + w + 'x' + h);
      }
    };
    img.onerror = function() {
      callbacks.onStatus(IC.i18n.t('status.tiffDisplayError'));
    };
    img.src = url;
  }

  return { loadImageFile };
})();

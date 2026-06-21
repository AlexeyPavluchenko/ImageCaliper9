/* ============================================================
   ImageCaliper — EXIF DPI extraction from JPEG binary data
   ============================================================ */
window.IC = window.IC || {};
IC.dpi = (function() {

  /**
   * Parse EXIF DPI from a JPEG file buffer.
   * Returns DPI as a number, or null if not found / not valid.
   */
  function parseExifDpi(buf) {
    try {
      const dv = new DataView(buf);
      if (dv.getUint16(0) !== 0xFFD8) return null;
      let off = 2;
      while (off < dv.byteLength - 1) {
        if (dv.getUint8(off) !== 0xFF) { off++; continue; }
        const m = dv.getUint8(off + 1);
        if (m === 0xD9) break;
        if (m === 0x00 || m === 0xFF || (m >= 0xD0 && m <= 0xD7)) { off += 2; continue; }
        const len = dv.getUint16(off + 2);
        if (len < 2) { off += 2; continue; }
        if (m === 0xE1) {
          const s = off + 2, e2 = s + len;
          const id = String.fromCharCode(dv.getUint8(s),dv.getUint8(s+1),dv.getUint8(s+2),dv.getUint8(s+3),dv.getUint8(s+4),dv.getUint8(s+5));
          if (id === 'Exif\0\0') {
            const ts = s + 6;
            const bo = dv.getUint16(ts);
            const le = bo === 0x4949;
            const g16 = o => dv.getUint16(o, le);
            const g32 = o => dv.getUint32(o, le);
            if (g16(ts + 2) === 42) {
              const ifd0 = ts + g32(ts + 4);
              const n = g16(ifd0);
              let xr = null, yr = null, ru = null;
              for (let i = 0; i < n; i++) {
                const e3 = ifd0 + 2 + i * 12;
                const tag = g16(e3), tp = g16(e3 + 2), cnt = g32(e3 + 4), vo = g32(e3 + 8);
                if (tag === 0x011A && tp === 5 && cnt >= 1) { const o2 = ts + vo; xr = g32(o2) / g32(o2 + 4); }
                if (tag === 0x011B && tp === 5 && cnt >= 1) { const o2 = ts + vo; yr = g32(o2) / g32(o2 + 4); }
                if (tag === 0x0128) ru = vo;
              }
              if (xr && yr) { const d = (xr + yr) / 2; return ru === 3 ? d * 25.4 : d; }
            }
          }
        }
        off += 2 + len;
      }
    } catch(e) {}
    return null;
  }

  return { parseExifDpi };
})();

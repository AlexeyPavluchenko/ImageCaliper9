/* ============================================================
   ImageCaliper — Measurement CRUD and recalculation
   ============================================================ */
window.IC = window.IC || {};
IC.measurements = (function() {

  const C = IC.constants;
  const U = IC.utils;

  /**
   * Default style for a measurement type.
   */
  function defaultStyle(color, type) {
    const fmt = type === 'circle3' || type === 'circle1' ? 'D = {v}' :
                type === 'polygon' ? 'S = {v}' :
                type === 'polyline' ? 'L = {v}' :
                type === 'angle' ? '{v}' : '{v}';
    const sb = type === 'scalebar';
    const an = type === 'annotation';
    return {
      color, lineWidth: an ? 2.5 : 2, lineDash: 'solid',
      fillColor: color, fillOpacity: sb ? 0.7 : 0.13,
      fontFamily: 'sans-serif', fontSize: 13, fontColor: '#ffffff',
      labelBg: '#000000', labelBgOpacity: 0.7,
      labelPos: 'center', labelOffX: 0, labelOffY: 0,
      labelFormat: fmt, pointStyle: an ? 'none' : 'circle', pointSize: 5,
      barHeight: 20, fontWeight: 'bold', fontStyle: 'normal',
      barBorderWidth: 1, barBorderColor: color, barBorderOpacity: 1
    };
  }

  /**
   * Add a new measurement to state.
   */
  function addMeasurement(state, type, points, valueMm, label, subtype) {
    const c = C.getColor(state.measurements.length);
    // For annotations, use saved default style per subtype
    var style = defaultStyle(c, type);
    if (type === 'annotation') {
      var defKey = 'annotation:' + (subtype || 'line');
      if (state.defaultStyles && state.defaultStyles[defKey]) {
        Object.assign(style, state.defaultStyles[defKey]);
        style.color = c;
      }
    } else {
      if (state.defaultStyles && state.defaultStyles[type]) {
        Object.assign(style, state.defaultStyles[type]);
        style.color = c;
      }
    }
    // For annotations, 'label' param is the raw display string (e.g. '→ Стрелка')
    // For other types, always format from the template
    var fmtLabel = type === 'annotation' ? (label || '') : U.formatLabel(style.labelFormat || '{v}', valueMm, state.unit, type);
    const m = {
      id: state.nextId++,
      type,
      subtype: subtype || null,
      points: points.map(p => ({...p})),
      valueMm: valueMm || 0,
      label: fmtLabel,
      labelVisible: true,
      color: c,
      unit: state.unit,
      unitOverride: false,
      doubleEnded: false,
      style
    };
    state.measurements.push(m);
    return m;
  }

  /**
   * Delete a measurement by id.
   */
  function deleteMeasurement(state, id) {
    state.measurements = state.measurements.filter(m => m.id !== id);
    if (state.selectedMeasurementId === id) {
      state.selectedMeasurementId = null;
    }
  }

  /**
   * Recalculate a single measurement's value and label.
   */
  function recalcMeasurement(state, m) {
    if (m.type === 'distance' && m.points.length >= 2) {
      const d = U.distance(m.points[0].x,m.points[0].y,m.points[1].x,m.points[1].y);
      m.valueMm = U.pixelsToMM(d, state.mmPerPx);
    } else if (m.type === 'circle3' && m.points.length >= 3) {
      const c = U.circumcenter(m.points[0].x,m.points[0].y,m.points[1].x,m.points[1].y,m.points[2].x,m.points[2].y);
      if (c) { const r = U.distance(c.x,c.y,m.points[0].x,m.points[0].y); m.valueMm = U.pixelsToMM(r*2, state.mmPerPx); }
    } else if (m.type === 'circle1' && m.points.length >= 2) {
      const r = U.distance(m.points[0].x,m.points[0].y,m.points[1].x,m.points[1].y);
      m.valueMm = U.pixelsToMM(r*2, state.mmPerPx);
    } else if (m.type === 'polyline' && m.points.length >= 2) {
      var totalPx = 0;
      for (var i = 1; i < m.points.length; i++) {
        totalPx += U.distance(m.points[i-1].x, m.points[i-1].y, m.points[i].x, m.points[i].y);
      }
      if (m.closed && m.points.length >= 3) {
        totalPx += U.distance(m.points[0].x, m.points[0].y, m.points[m.points.length-1].x, m.points[m.points.length-1].y);
      }
      m.valueMm = U.pixelsToMM(totalPx, state.mmPerPx);
    } else if (m.type === 'polygon' && m.points.length >= 3) {
      const a = U.polygonArea(m.points);
      m.valueMm = a / (U.pxPerMm(state.mmPerPx) ** 2);
    } else if (m.type === 'angle' && m.points.length >= 3) {
      const [p1, v, p2] = m.points;
      m.valueMm = U.angleBetween(v.x, v.y, p1.x, p1.y, p2.x, p2.y);
    }
    // Rect/ellipse: update _rectCenter/_rectSize (canvas-space coords, see coords.js)
    if (m.type === 'annotation' && (m.subtype === 'rect' || m.subtype === 'ellipse') && m.points.length >= 2) {
      var cs = IC.coords.rectCenterSizeFromPoints(state, m);
      m._rectCenter = cs.center;
      m._rectSize = cs.size;
    }
    // Determine effective unit (per-measurement override or global)
    var effUnit = (m.unitOverride && m.unit) ? m.unit : state.unit;
    // Update label
    // Annotations: use typeLabel for display, but don't overwrite m.label
    // (text content is user-editable; non-text annotation labels should stay custom)
    if (m.type === 'annotation') {
      // Don't overwrite — annotations don't have computed values
    } else if (m.type === 'scalebar') {
      if (m.style && m.style.labelFormat) {
        m.label = U.formatLabel(m.style.labelFormat, m.valueMm, effUnit, m.type);
      } else {
        m.label = U.formatValue(m.valueMm, effUnit);
      }
    } else if (m.style && m.style.labelFormat) {
      m.label = U.formatLabel(m.style.labelFormat, m.valueMm, effUnit, m.type);
    } else {
      m.label = typeLabel(m, state);
    }
  }

  function typeLabel(m, state) {
    var u = (m.unitOverride && m.unit) ? m.unit : state.unit;
    if (m.type === 'distance') return U.formatValue(m.valueMm, u);
    if (m.type === 'circle3' || m.type === 'circle1') return 'D = ' + U.formatValue(m.valueMm, u);
    if (m.type === 'polyline') return 'L = ' + U.formatValue(m.valueMm, u);
    if (m.type === 'polygon') return 'S = ' + U.formatArea(m.valueMm, u);
    if (m.type === 'annotation') {
      const icons = { line: '—', arrow: '→', rect: '□', ellipse: '⬭', text: '🔤' };
      const names = { line: IC.i18n.t('anno.line'), arrow: IC.i18n.t('anno.arrow'), rect: IC.i18n.t('anno.rect'), ellipse: IC.i18n.t('anno.ellipse'), text: IC.i18n.t('anno.text') };
      if (m.subtype === 'text') return '🔤 ' + U.parseCommands(m.label || IC.i18n.t('anno.text'));
      return (icons[m.subtype] || '?') + ' ' + (names[m.subtype] || m.subtype);
    }
    return '';
  }

  /**
   * Recalculate all measurements (e.g. after DPI change).
   */
  function recomputeAll(state) {
    state.measurements.forEach(m => recalcMeasurement(state, m));
  }

  /**
   * Get the "base" label position for a measurement in image coordinates.
   */
  function getLabelBasePos(state, m) {
    if (m.type === 'distance') {
      const cx = (m.points[0].x + m.points[1].x) / 2;
      const cy = (m.points[0].y + m.points[1].y) / 2;
      return { x: cx, y: cy };
    }
    if (m.type === 'circle3') {
      const c = U.circumcenter(m.points[0].x,m.points[0].y,m.points[1].x,m.points[1].y,m.points[2].x,m.points[2].y);
      if (c) return { x: c.x, y: c.y - U.distance(c.x,c.y,m.points[0].x,m.points[0].y) - 16 };
      return { x: m.points[0].x, y: m.points[0].y };
    }
    if (m.type === 'circle1') {
      const r = U.distance(m.points[0].x,m.points[0].y,m.points[1].x,m.points[1].y);
      return { x: m.points[0].x, y: m.points[0].y - r - 16 };
    }
    if (m.type === 'polyline' && m.points.length >= 2) {
      // Label on the last segment midpoint
      var lp = m.points[m.points.length - 1];
      var lp2 = m.points[m.points.length - 2];
      return { x: (lp.x + lp2.x) / 2, y: (lp.y + lp2.y) / 2 };
    }
    if (m.type === 'polygon') {
      let cx = 0, cy = 0;
      m.points.forEach(p => { cx += p.x; cy += p.y; });
      return { x: cx / m.points.length, y: cy / m.points.length };
    }
    if (m.type === 'angle' && m.points.length >= 3) {
      const [p1, v, p2] = m.points;
      const r = Math.min(U.distance(v.x,v.y,p1.x,p1.y), U.distance(v.x,v.y,p2.x,p2.y)) * 0.4;
      const a1 = Math.atan2(p1.y - v.y, p1.x - v.x);
      const a2 = Math.atan2(p2.y - v.y, p2.x - v.x);
      const s = Math.min(a1, a2), e = Math.max(a1, a2);
      const mA = (s + e) / 2;
      return { x: v.x + (r + 20) * Math.cos(mA), y: v.y + (r + 20) * Math.sin(mA) };
    }
    if (m.type === 'scalebar' && m.points.length >= 1) {
      const s = m.style || defaultStyle(m.color);
      const halfW = (m.valueMm * U.pxPerMm(state.mmPerPx) / 2);
      const gap = 10;
      return { x: m.points[0].x - halfW - gap, y: m.points[0].y };
    }
    if (m.type === 'annotation') {
      if (m.subtype === 'text' && m.points.length >= 1) {
        return { x: m.points[0].x, y: m.points[0].y };
      }
      if (m.points.length >= 2) {
        return { x: (m.points[0].x + m.points[1].x) / 2, y: (m.points[0].y + m.points[1].y) / 2 };
      }
    }
    return { x: 0, y: 0 };
  }

  /**
   * Get label position in canvas coordinates.
   */
  function getLabelCanvasPos(state, m, ctx) {
    const s = m.style || defaultStyle(m.color);
    const offX = (s.labelOffX || 0) * state.scale;
    const offY = (s.labelOffY || 0) * state.scale;
    // Scalebar: label position in canvas space (axis-aligned relative to bar center)
    if (m.type === 'scalebar' && m.points.length >= 1) {
      const center = IC.coords.imageToCanvas(state, m.points[0].x, m.points[0].y);
      const halfW = (m.valueMm * U.pxPerMm(state.mmPerPx) / 2) * state.scale;
      var sbGap = 10 * state.scale; // proportional gap (image-px → canvas-px)
      var tw = 60; // fallback
      if (ctx) {
        var fw = (s.fontWeight || 'bold') === 'bold' ? 'bold ' : '';
        var fs = (s.fontStyle || 'normal') === 'italic' ? 'italic ' : '';
        ctx.font = fs + fw + (s.fontSize || 13) + 'px ' + (s.fontFamily || 'sans-serif');
        tw = ctx.measureText(m.label || '').width + 12;
      }
      return { lx: center.x - halfW - sbGap - tw / 2 + offX, ly: center.y + offY };
    }
    // Other types: apply offset in image-space (before rotation), so label
    // offset stays fixed relative to the image, not the canvas
    const base = getLabelBasePos(state, m);
    const bc = IC.coords.imageToCanvas(state, base.x + (s.labelOffX || 0), base.y + (s.labelOffY || 0));
    return { lx: bc.x, ly: bc.y };
  }

  /**
   * Get the bounding rectangle of a label in canvas coordinates.
   */
  function getLabelRect(x, y, text, style, ctx) {
    if (!style) style = defaultStyle('#ffffff');
    const fw = (style.fontWeight || 'bold') === 'bold' ? 'bold ' : '';
    const fs = (style.fontStyle || 'normal') === 'italic' ? 'italic ' : '';
    const font = fs + fw + style.fontSize + 'px ' + style.fontFamily;
    ctx.font = font;
    const m = ctx.measureText(text);
    var pad = Math.max(3, Math.round(style.fontSize * 0.35));
    const tw = m.width + pad * 2;
    const th = style.fontSize + pad * 2;
    return { x: x - tw / 2, y: y - th / 2, w: tw, h: th };
  }

  /**
   * Check if a canvas point is inside the scalebar rectangle.
   * Scalebar is horizontal in canvas space (axis-aligned), not rotated with image.
   */
  function isInScalebarRect(state, cx, cy, m) {
    if (m.type !== 'scalebar' || m.points.length < 1) return false;
    const center = IC.coords.imageToCanvas(state, m.points[0].x, m.points[0].y);
    const s = m.style || defaultStyle(m.color);
    const halfW = (m.valueMm * U.pxPerMm(state.mmPerPx) / 2) * state.scale;
    const halfH = (s.barHeight || 20) / 2;
    return Math.abs(cx - center.x) <= halfW && Math.abs(cy - center.y) <= halfH;
  }

  return {
    defaultStyle, addMeasurement, deleteMeasurement,
    recalcMeasurement, recomputeAll, typeLabel,
    getLabelBasePos, getLabelCanvasPos, getLabelRect, isInScalebarRect
  };
})();

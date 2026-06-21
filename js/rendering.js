/* ============================================================
   ImageCaliper — Canvas rendering (drawing functions)
   ============================================================ */
window.IC = window.IC || {};
IC.rendering = (function() {

  const C = IC.constants;
  const U = IC.utils;
  const M = IC.measurements;

  // ======================== Main render ========================
  function render(ctx, canvas, state, dom) {
    if (!state.image) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // In rotation mode: dimming overlay instead of hard clip
    // (so user can see what's outside the crop while rotating)
    var rotationMode = dom.rotationPanel && !dom.rotationPanel.classList.contains('hidden');
    // Apply canvas-space clip when crop is active (not in edit mode, not in rotation mode)
    var useHardClip = state.cropRect && state.mode !== 'crop' && !rotationMode;
    if (useHardClip) {
      const r = state.cropRect;
      ctx.save();
      ctx.beginPath();
      ctx.rect(r.x, r.y, r.w, r.h);
      ctx.clip();
    }

    // Draw full image with rotation
    const cx = state.offset.x + state.imgNaturalW * state.scale / 2;
    const cy = state.offset.y + state.imgNaturalH * state.scale / 2;
    const rad = state.rotation * Math.PI / 180;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(cx, cy);
    ctx.rotate(rad);
    ctx.drawImage(state.image, -state.imgNaturalW * state.scale / 2, -state.imgNaturalH * state.scale / 2,
      state.imgNaturalW * state.scale, state.imgNaturalH * state.scale);
    ctx.restore();

    if (useHardClip) ctx.restore();

    // Draw guide lines — only in rotation mode
    if (state.image && dom.rotationPanel && !dom.rotationPanel.classList.contains('hidden')) {
      const gv = state.guideV !== null ? state.guideV : canvas.width / 2;
      const gh = state.guideH !== null ? state.guideH : canvas.height / 2;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(gv, 0); ctx.lineTo(gv, canvas.height);
      ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 2; ctx.setLineDash([10, 5]); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, gh); ctx.lineTo(canvas.width, gh);
      ctx.strokeStyle = '#4488ff'; ctx.lineWidth = 2; ctx.setLineDash([10, 5]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '13px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('\u21BB ' + state.rotation.toFixed(1) + '\u00B0', 10, 10);
      ctx.restore();
    }

    // Optional clip measurements to crop rect
    const measClip = state.clipMeasurements && state.cropRect && state.mode !== 'crop';
    if (measClip) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(state.cropRect.x, state.cropRect.y, state.cropRect.w, state.cropRect.h);
      ctx.clip();
    }
    state.measurements.forEach(m => drawMeasurement(ctx, state, m, false));
    if (state.selectedMeasurementId) {
      const sm = state.measurements.find(m => m.id === state.selectedMeasurementId);
      if (sm) drawMeasurement(ctx, state, sm, true);
    }
    if (measClip) ctx.restore();
    drawTempMeasurement(ctx, state);
    drawCalibrationLine(ctx, state);

    // In rotation mode: dimming overlay shows what's outside the crop
    if (state.cropRect && state.mode !== 'crop' && dom.rotationPanel && !dom.rotationPanel.classList.contains('hidden')) {
      const r = state.cropRect;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, canvas.width, r.y);
      ctx.fillRect(0, r.y + r.h, canvas.width, canvas.height - r.y - r.h);
      ctx.fillRect(0, r.y, r.x, r.h);
      ctx.fillRect(r.x + r.w, r.y, canvas.width - r.x - r.w, r.h);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 3]);
      ctx.strokeRect(r.x, r.y, r.w, r.h); ctx.setLineDash([]);
      ctx.restore();
    }

    // Crop overlay (in crop mode)
    if (state.mode === 'crop') {
      const r = state._cropDrawRect;
      if (r && r.w > 0 && r.h > 0) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, r.y);
        ctx.fillRect(0, r.y + r.h, canvas.width, canvas.height - r.y - r.h);
        ctx.fillRect(0, r.y, r.x, r.h);
        ctx.fillRect(r.x + r.w, r.y, canvas.width - r.x - r.w, r.h);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.setLineDash([6, 3]);
        ctx.strokeRect(r.x, r.y, r.w, r.h); ctx.setLineDash([]);
        const hs = 8;
        ctx.fillStyle = '#ffffff';
        [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]].forEach(([hx, hy]) => {
          ctx.fillRect(hx - hs/2, hy - hs/2, hs, hs);
        });
        const asp = r.w / r.h;
        const imgX = Math.round(r.w / state.scale);
        const imgY = Math.round(r.h / state.scale);
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '12px sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(imgX + ' \u00D7 ' + imgY + ' px  (' + asp.toFixed(2) + ')', r.x + 4, r.y + 4);
        ctx.restore();
      }
    }
  }

  // ======================== Draw measurement ========================
  function drawMeasurement(ctx, state, m, emphasized) {
    const pts = m.points;
    if (m.type !== 'scalebar' && pts.length < 2 && !(m.type === 'annotation' && m.subtype === 'text')) return;
    if (m.type === 'scalebar' && pts.length < 1) return;
    const s = m.style || M.defaultStyle(m.color);
    const ptSize = s.pointSize || 5;
    const lw = s.lineWidth;
    const lc = s.color;
    // Keep 'none' for scalebar even when emphasized
    const pointStyle = (emphasized && s.pointStyle === 'none' && m.type !== 'scalebar') ? 'circle' : s.pointStyle;
    // Per-measurement label toggle
    var showLabel = m.labelVisible !== false;

    ctx.save();
    if (emphasized) {
      ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 18;
    }

    if (s.lineDash === 'dashed') ctx.setLineDash([8, 4]);
    else if (s.lineDash === 'dotted') ctx.setLineDash([3, 3]);
    else ctx.setLineDash([]);

    if (m.type === 'distance') {
      const p1 = IC.coords.imageToCanvas(state, pts[0].x, pts[0].y);
      const p2 = IC.coords.imageToCanvas(state, pts[1].x, pts[1].y);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = lc; ctx.lineWidth = lw; ctx.stroke();
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      drawPoint(ctx, p1.x, p1.y, lc, ptSize, pointStyle, angle, lw);
      drawPoint(ctx, p2.x, p2.y, lc, ptSize, pointStyle, angle, lw);
      if (showLabel) {
        var lp = M.getLabelCanvasPos(state, m, ctx);
        drawLabel(ctx, m.label, lp.lx, lp.ly, s);
      }
    } else if (m.type === 'circle3' && pts.length >= 3) {
      const c = U.circumcenter(pts[0].x,pts[0].y,pts[1].x,pts[1].y,pts[2].x,pts[2].y);
      if (!c) { ctx.restore(); return; }
      const r = U.distance(c.x,c.y,pts[0].x,pts[0].y);
      const cp = IC.coords.imageToCanvas(state, c.x,c.y);
      const cr = r * state.scale;
      ctx.beginPath(); ctx.arc(cp.x, cp.y, cr, 0, Math.PI * 2);
      ctx.strokeStyle = lc; ctx.lineWidth = lw; ctx.stroke();
      pts.forEach(p => { const sp = IC.coords.imageToCanvas(state, p.x,p.y); drawPoint(ctx, sp.x, sp.y, lc, ptSize, pointStyle); });
      drawPoint(ctx, cp.x, cp.y, lc, 4, pointStyle);
      if (showLabel) {
        var lp = M.getLabelCanvasPos(state, m, ctx);
        drawLabel(ctx, m.label, lp.lx, lp.ly, s);
      }
    } else if (m.type === 'circle1' && pts.length >= 2) {
      const r = U.distance(pts[0].x,pts[0].y,pts[1].x,pts[1].y);
      const cp = IC.coords.imageToCanvas(state, pts[0].x,pts[0].y);
      const cr = r * state.scale;
      ctx.beginPath(); ctx.arc(cp.x, cp.y, cr, 0, Math.PI * 2);
      ctx.strokeStyle = lc; ctx.lineWidth = lw; ctx.stroke();
      drawPoint(ctx, cp.x, cp.y, lc, 4, pointStyle);
      const sp = IC.coords.imageToCanvas(state, pts[1].x,pts[1].y);
      drawPoint(ctx, sp.x, sp.y, lc, ptSize, pointStyle);
      if (showLabel) {
        var lp = M.getLabelCanvasPos(state, m, ctx);
        drawLabel(ctx, m.label, lp.lx, lp.ly, s);
      }
    } else if (m.type === 'polyline' && pts.length >= 2) {
      // Draw polyline segments
      ctx.beginPath();
      var fp = IC.coords.imageToCanvas(state, pts[0].x, pts[0].y);
      ctx.moveTo(fp.x, fp.y);
      for (var pi = 1; pi < pts.length; pi++) {
        var pp = IC.coords.imageToCanvas(state, pts[pi].x, pts[pi].y);
        ctx.lineTo(pp.x, pp.y);
      }
      if (m.closed) ctx.closePath();
      ctx.strokeStyle = lc; ctx.lineWidth = lw; ctx.stroke();
      // Points at each vertex
      pts.forEach(function(p) {
        var sp = IC.coords.imageToCanvas(state, p.x, p.y);
        drawPoint(ctx, sp.x, sp.y, lc, ptSize, pointStyle);
      });
      if (showLabel) {
        var lp = M.getLabelCanvasPos(state, m, ctx);
        drawLabel(ctx, m.label, lp.lx, lp.ly, s);
      }
    } else if (m.type === 'polygon' && pts.length >= 3) {
      ctx.beginPath();
      const f = IC.coords.imageToCanvas(state, pts[0].x,pts[0].y);
      ctx.moveTo(f.x, f.y);
      for (let i = 1; i < pts.length; i++) {
        const p = IC.coords.imageToCanvas(state, pts[i].x,pts[i].y);
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fillStyle = U.hexToRgba(s.fillColor, s.fillOpacity);
      ctx.fill();
      ctx.strokeStyle = lc; ctx.lineWidth = lw; ctx.stroke();
      pts.forEach(p => { const sp = IC.coords.imageToCanvas(state, p.x,p.y); drawPoint(ctx, sp.x, sp.y, lc, ptSize, pointStyle); });
      let cx = 0, cy = 0;
      pts.forEach(p => { cx += p.x; cy += p.y; });
      cx /= pts.length; cy /= pts.length;
      if (showLabel) {
        var lp = M.getLabelCanvasPos(state, m, ctx);
        drawLabel(ctx, m.label, lp.lx, lp.ly, s);
      }
    } else if (m.type === 'scalebar' && pts.length >= 1) {
      const center = IC.coords.imageToCanvas(state, pts[0].x, pts[0].y);
      const halfW = (m.valueMm * U.pxPerMm(state.mmPerPx) / 2) * state.scale;
      const barH = s.barHeight || 20;
      const halfH = barH / 2;
      // Border first (drawn underneath)
      const bw = s.barBorderWidth || 0;
      if (bw > 0) {
        ctx.save();
        ctx.globalAlpha = s.barBorderOpacity !== undefined ? s.barBorderOpacity : 1;
        ctx.strokeStyle = s.barBorderColor || s.color;
        ctx.lineWidth = bw;
        ctx.strokeRect(center.x - halfW, center.y - halfH, halfW * 2, barH);
        ctx.restore();
      }
      // Fill on top of border so the bar dimensions aren't eaten by stroke overlap
      ctx.save();
      ctx.fillStyle = U.hexToRgba(s.fillColor, s.fillOpacity);
      ctx.fillRect(center.x - halfW, center.y - halfH, halfW * 2, barH);
      ctx.restore();
      if (emphasized) drawPoint(ctx, center.x, center.y, lc, 5, pointStyle);
      if (showLabel) {
        var lp = M.getLabelCanvasPos(state, m, ctx);
        drawLabel(ctx, m.label, lp.lx, lp.ly, s);
      }
    } else if (m.type === 'angle' && pts.length >= 3) {
      const [p1, v, p2] = pts;
      const vc = IC.coords.imageToCanvas(state, v.x, v.y);
      const p1c = IC.coords.imageToCanvas(state, p1.x, p1.y);
      const p2c = IC.coords.imageToCanvas(state, p2.x, p2.y);
      const av = U.angleBetween(v.x, v.y, p1.x, p1.y, p2.x, p2.y);
      const rArc = Math.min(U.distance(vc.x,vc.y,p1c.x,p1c.y), U.distance(vc.x,vc.y,p2c.x,p2c.y)) * 0.4;
      const a1 = Math.atan2(p1c.y-vc.y, p1c.x-vc.x);
      const a2 = Math.atan2(p2c.y-vc.y, p2c.x-vc.x);
      const sAng = Math.min(a1,a2), eAng = Math.max(a1,a2);
      ctx.beginPath();
      if (eAng - sAng > Math.PI) ctx.arc(vc.x, vc.y, rArc, eAng, sAng + Math.PI*2);
      else ctx.arc(vc.x, vc.y, rArc, sAng, eAng);
      ctx.strokeStyle = lc; ctx.lineWidth = lw; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(vc.x, vc.y); ctx.lineTo(p1c.x, p1c.y);
      ctx.moveTo(vc.x, vc.y); ctx.lineTo(p2c.x, p2c.y);
      ctx.stroke();
      drawPoint(ctx, vc.x, vc.y, lc, ptSize+2, pointStyle);
      drawPoint(ctx, p1c.x, p1c.y, lc, ptSize, pointStyle);
      drawPoint(ctx, p2c.x, p2c.y, lc, ptSize, pointStyle);
      if (showLabel) {
        var lp = M.getLabelCanvasPos(state, m, ctx);
        drawLabel(ctx, m.label, lp.lx, lp.ly, s);
      }
    } else if (m.type === 'annotation') {
      if (m.subtype === 'text' && pts.length >= 1) {
        // Text annotation with independent rotation
        var center = IC.coords.imageToCanvas(state, pts[0].x, pts[0].y);
        var textRot = (m._textRotation || 0) * Math.PI / 180;
        ctx.save();
        // Text anchor = position; labelOffX/labelOffY always 0 (see label drag handler)
        ctx.translate(center.x, center.y);
        ctx.rotate(textRot);
        if (showLabel) drawLabel(ctx, m.label, 0, 0, s);
        // Selection ring around label (inside rotated space = follows text rotation)
        if (emphasized && showLabel) {
          ctx.save();
          // Measure rendered text the same way drawLabel does
          var segs = U.parseRichText(m.label || '');
          var baseSize = s.fontSize || 13;
          var subSize = Math.max(8, Math.round(baseSize * 0.6));
          var fw = (s.fontWeight || 'bold') === 'bold' ? 'bold ' : '';
          var globalItalic = (s.fontStyle || 'normal') === 'italic';
          function segW(seg) {
            if (seg.size === 'stack') {
              ctx.font = fw + subSize + 'px ' + (s.fontFamily || 'sans-serif');
              return Math.max(ctx.measureText(seg.super || '').width, ctx.measureText(seg.sub || '').width);
            }
            var sz = seg.size === 'normal' ? baseSize : subSize;
            var italic = (seg.size === 'normal') ? (globalItalic || seg.italic) : false;
            ctx.font = (italic ? 'italic ' : '') + fw + sz + 'px ' + (s.fontFamily || 'sans-serif');
            return ctx.measureText(seg.text || '').width;
          }
          var totalW = 0;
          for (var si = 0; si < segs.length; si++) totalW += segW(segs[si]);
          var pd = Math.max(3, Math.round(baseSize * 0.35));
          var rw = totalW + pd * 2, rh = baseSize + pd * 2;
          ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5;
          ctx.setLineDash([3,3]);
          ctx.strokeRect(-rw/2, -rh/2, rw, rh);
          ctx.setLineDash([]);
          ctx.restore();
        }
        ctx.restore(); // restore outer translate/rotate
      } else if (pts.length >= 2) {
        const p1 = IC.coords.imageToCanvas(state, pts[0].x, pts[0].y);
        const p2 = IC.coords.imageToCanvas(state, pts[1].x, pts[1].y);
        const isRect = m.subtype === 'rect' || m.subtype === 'ellipse';
        if (isRect) {
          // Rect/ellipse with creation-rotation
          var rc = m._rectCenter, rs = m._rectSize, cr = m._createdAtRotation;
          if (!rc || !rs) { ctx.restore(); return; }
          var center = IC.coords.imageToCanvas(state, rc.x, rc.y);
          var w = rs.w * state.scale, h = rs.h * state.scale;
          var netRot = (state.rotation - (cr || 0)) * Math.PI / 180;
          ctx.save();
          ctx.translate(center.x, center.y);
          ctx.rotate(netRot);
          if (s.fillOpacity > 0) {
            ctx.fillStyle = U.hexToRgba(s.fillColor, s.fillOpacity);
            if (m.subtype === 'rect') ctx.fillRect(-w/2, -h/2, w, h);
            else { ctx.beginPath(); ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI*2); ctx.fill(); }
          }
          ctx.strokeStyle = lc; ctx.lineWidth = lw;
          ctx.setLineDash(s.lineDash === 'dashed' ? [8,4] : s.lineDash === 'dotted' ? [3,3] : []);
          if (m.subtype === 'rect') ctx.strokeRect(-w/2, -h/2, w, h);
          else { ctx.beginPath(); ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI*2); ctx.stroke(); }
          ctx.setLineDash([]);
          ctx.restore();
          // Selection rings on the 2 diagonal corners (computed from center/size/netRot)
          if (emphasized && rs && rc) {
            var hw = rs.w * state.scale / 2, hh = rs.h * state.scale / 2;
            var cos_nr = Math.cos(netRot), sin_nr = Math.sin(netRot);
            // Ring at (-hw, -hh) corner — matches rendered rect corner
            var r1x = center.x + (-hw) * cos_nr - (-hh) * sin_nr;
            var r1y = center.y + (-hw) * sin_nr + (-hh) * cos_nr;
            ctx.beginPath(); ctx.arc(r1x, r1y, 6, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5;
            ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
            // Ring at (hw, hh) corner
            var r2x = center.x + hw * cos_nr - hh * sin_nr;
            var r2y = center.y + hw * sin_nr + hh * cos_nr;
            ctx.beginPath(); ctx.arc(r2x, r2y, 6, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5;
            ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
          }
        } else {
          // Line / Arrow
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = lc; ctx.lineWidth = lw; ctx.stroke();
          if (m.subtype === 'arrow') {
            const hs = Math.max(10, Math.min(20, lw * 5));
            drawAnnotationArrowhead(ctx, p2.x, p2.y, angle, hs);
            if (m.doubleEnded) drawAnnotationArrowhead(ctx, p1.x, p1.y, angle + Math.PI, hs);
          }
          if (emphasized) {
            drawPoint(ctx, p1.x, p1.y, lc, ptSize, pointStyle, angle, lw);
            drawPoint(ctx, p2.x, p2.y, lc, ptSize, pointStyle, angle, lw);
            // Rings
            [p1, p2].forEach(function(p) {
              ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
              ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5;
              ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
            });
          }
        }
      }
    }
    // Draw selection rings around all points when emphasized
    // Exclude annotation (we draw our own when emphasized) and scalebar
    if (emphasized && m.type !== 'scalebar' && m.type !== 'annotation') {
      pts.forEach(function(p) {
        const cp = IC.coords.imageToCanvas(state, p.x, p.y);
        drawSelectionRing(ctx, cp.x, cp.y, ptSize);
      });
    }
    ctx.restore();
  }

  // ======================== Drawing helpers ========================
  /** Draw a dashed selection ring around a point (for emphasized measurements) */
  function drawSelectionRing(context, x, y, radius) {
    context.beginPath();
    context.arc(x, y, radius + 5, 0, Math.PI * 2);
    context.strokeStyle = 'rgba(255,255,255,0.6)';
    context.lineWidth = 1.5;
    context.setLineDash([3, 3]);
    context.stroke();
    context.setLineDash([]);
  }

  function drawPoint(context, x, y, color, size, style, angleRad, lineW) {
    if (style === 'none') return;
    if (style === 'tick') {
      const perpAngle = (angleRad || 0) + Math.PI / 2;
      const halfLen = size * 2;
      const dx = Math.cos(perpAngle) * halfLen;
      const dy = Math.sin(perpAngle) * halfLen;
      context.beginPath();
      context.moveTo(x - dx, y - dy);
      context.lineTo(x + dx, y + dy);
      context.strokeStyle = color;
      context.lineWidth = lineW || 2;
      context.stroke();
      return;
    }
    context.beginPath(); context.arc(x, y, size, 0, Math.PI * 2);
    context.fillStyle = color; context.fill();
    context.strokeStyle = '#fff'; context.lineWidth = 1.5; context.stroke();
  }

  function drawAnnotationArrowhead(ctx, x, y, angle, size) {
    const a1 = angle + 150 * Math.PI / 180;
    const a2 = angle - 150 * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size * Math.cos(a1), y + size * Math.sin(a1));
    ctx.moveTo(x, y);
    ctx.lineTo(x + size * Math.cos(a2), y + size * Math.sin(a2));
    ctx.stroke();
  }

  function drawLabel(context, text, x, y, style) {
    if (!style) style = M.defaultStyle('#ffffff');
    // Global italic: style.fontStyle === 'italic' overrides all (sub/super excluded)
    var globalItalic = (style.fontStyle || 'normal') === 'italic';
    // Parse rich text into segments
    var segs = U.parseRichText(text);
    if (!segs || segs.length === 0) segs = [{ text: text || '', size: 'normal', italic: false }];
    var baseSize = style.fontSize || 13;
    var subSize = Math.max(8, Math.round(baseSize * 0.6));
    var fw = (style.fontWeight || 'bold') === 'bold' ? 'bold ' : '';
    // Build font: if global italic is ON, normal segments are italic; sub/super are never italic
    function isItalic(seg) {
      if (seg.size !== 'normal') return false;
      return globalItalic || seg.italic;
    }
    function makeFont(seg, size) {
      return (isItalic(seg) ? 'italic ' : '') + fw + size + 'px ' + style.fontFamily;
    }
    // Helper: get segment width
    function segWidth(seg) {
      if (seg.size === 'stack') {
        context.font = subFont;
        var sw = 0;
        if (seg.super) sw = Math.max(sw, context.measureText(seg.super).width);
        if (seg.sub) sw = Math.max(sw, context.measureText(seg.sub).width);
        return sw;
      }
      var sz = seg.size === 'normal' ? baseSize : subSize;
      context.font = makeFont(seg, sz);
      return context.measureText(seg.text).width;
    }
    var subFont = makeFont({ size: 'sub', italic: false, text: '' }, subSize);
    // Measure total width
    var totalW = 0;
    for (var si = 0; si < segs.length; si++) {
      totalW += segWidth(segs[si]);
    }
    var pad = Math.max(3, Math.round(baseSize * 0.35));
    var tw = totalW + pad * 2;
    var th = baseSize + pad * 2;
    var lx = Math.round(x - tw / 2);
    var ly = Math.round(y - th / 2);
    // Draw background
    var bgOp = (style.labelBgOpacity === 0 || style.labelBgOpacity) ? style.labelBgOpacity : 0.7;
    var labelAlpha = Math.max(0, Math.min(1, bgOp));
    context.fillStyle = U.hexToRgba(style.labelBg, labelAlpha);
    context.beginPath();
    if (context.roundRect) context.roundRect(lx, ly, tw, th, 4);
    else { context.rect(lx, ly, tw, th); }
    context.fill();
    // Draw segments
    context.fillStyle = style.fontColor;
    var cursorX = lx + pad;
    var baseline = y + baseSize * 0.35;
    for (var si = 0; si < segs.length; si++) {
      var seg = segs[si];
      if (seg.size === 'stack') {
        // Stack: super above, sub below — sub-size font
        context.font = subFont;
        context.textAlign = 'left';
        context.textBaseline = 'alphabetic';
        var sw = segWidth(seg);
        if (seg.super) {
          context.fillText(seg.super, cursorX, baseline - baseSize * 0.45);
        }
        if (seg.sub) {
          context.fillText(seg.sub, cursorX, baseline + baseSize * 0.25);
        }
        cursorX += sw;
      } else {
        var segSize = seg.size === 'normal' ? baseSize : subSize;
        context.font = makeFont(seg, segSize);
        context.textAlign = 'left';
        context.textBaseline = 'alphabetic';
        var dy = 0;
        if (seg.size === 'super') dy = -baseSize * 0.35;
        else if (seg.size === 'sub') dy = baseSize * 0.15;
        context.fillText(seg.text, cursorX, baseline + dy);
        cursorX += context.measureText(seg.text).width;
      }
    }
  }

  // ======================== Temp measurement preview ========================
  function drawTempMeasurement(ctx, state) {
    const pts = state.tempPoints;
    if (pts.length === 0) return;
    ctx.save();
    const mp = IC.events ? IC.events.getLastMousePos() : { x: 0, y: 0 };
    const pp = state.snapPreviewPos || { x: mp.x, y: mp.y };
    const ic = IC.coords.canvasToImage(state, pp.x, pp.y);
    if (state.mode === 'distance' && pts.length === 1) {
      const p = IC.coords.imageToCanvas(state, pts[0].x, pts[0].y);
      drawPoint(ctx, p.x, p.y, C.TEMP_COLOR);
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pp.x, pp.y);
      ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
      const d = U.pixelsToMM(U.distance(pts[0].x,pts[0].y,ic.x,ic.y), state.mmPerPx);
      drawLabel(ctx, U.formatValue(d, state.unit), (p.x+pp.x)/2, (p.y+pp.y)/2, M.defaultStyle(C.TEMP_COLOR));
    } else if (state.mode === 'circle3') {
      pts.forEach(p => { const sp = IC.coords.imageToCanvas(state, p.x,p.y); drawPoint(ctx, sp.x, sp.y, C.TEMP_COLOR, 6, 'circle'); });
      if (pts.length === 1) {
        // Preview: circle with P1 and mouse as diameter endpoints
        var cx = (pts[0].x + ic.x) / 2;
        var cy = (pts[0].y + ic.y) / 2;
        var r = U.distance(pts[0].x, pts[0].y, ic.x, ic.y) / 2;
        var cp = IC.coords.imageToCanvas(state, cx, cy);
        var cr = r * state.scale;
        ctx.beginPath(); ctx.arc(cp.x, cp.y, cr, 0, Math.PI*2);
        ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
        drawLabel(ctx, 'D = ' + U.formatValue(U.pixelsToMM(r*2, state.mmPerPx), state.unit), cp.x, cp.y - cr - 16, M.defaultStyle(C.TEMP_COLOR));
      } else if (pts.length === 2) {
        // Preview: circumcenter of P1, P2 and mouse
        const c = U.circumcenter(pts[0].x,pts[0].y,pts[1].x,pts[1].y,ic.x,ic.y);
        if (c) {
          var r = U.distance(c.x,c.y,pts[0].x,pts[0].y);
          var cp = IC.coords.imageToCanvas(state, c.x,c.y);
          var cr = r * state.scale;
          ctx.beginPath(); ctx.arc(cp.x, cp.y, cr, 0, Math.PI*2);
          ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
          drawLabel(ctx, 'D = ' + U.formatValue(U.pixelsToMM(r*2, state.mmPerPx), state.unit), cp.x, cp.y - cr - 16, M.defaultStyle(C.TEMP_COLOR));
        }
      }
    } else if (state.mode === 'circle1' && pts.length === 1) {
      const p = IC.coords.imageToCanvas(state, pts[0].x, pts[0].y);
      drawPoint(ctx, p.x, p.y, C.TEMP_COLOR, 4);
      const ic2 = IC.coords.canvasToImage(state, pp.x, pp.y);
      const r = U.distance(pts[0].x,pts[0].y,ic2.x,ic2.y);
      const cr = r * state.scale;
      ctx.beginPath(); ctx.arc(p.x, p.y, cr, 0, Math.PI*2);
      ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
      drawLabel(ctx, 'D = ' + U.formatValue(U.pixelsToMM(r*2, state.mmPerPx), state.unit), p.x, p.y - cr - 16, M.defaultStyle(C.TEMP_COLOR));
    } else if (state.mode === 'polyline' && pts.length > 0) {
      // Polyline preview
      pts.forEach(function(p) { var sp = IC.coords.imageToCanvas(state, p.x,p.y); drawPoint(ctx, sp.x, sp.y, C.TEMP_COLOR); });
      if (pts.length === 1) {
        var p0 = IC.coords.imageToCanvas(state, pts[0].x, pts[0].y);
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(pp.x, pp.y);
        ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
      }
      if (pts.length >= 2) {
        ctx.beginPath();
        var f = IC.coords.imageToCanvas(state, pts[0].x,pts[0].y);
        ctx.moveTo(f.x, f.y);
        for (var pi = 1; pi < pts.length; pi++) {
          var p = IC.coords.imageToCanvas(state, pts[pi].x,pts[pi].y);
          ctx.lineTo(p.x, p.y);
        }
        ctx.lineTo(pp.x, pp.y);
        ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
        // Show running total length on last segment midpoint
        var totalPx = 0;
        for (var pi2 = 1; pi2 < pts.length; pi2++) {
          totalPx += U.distance(pts[pi2-1].x, pts[pi2-1].y, pts[pi2].x, pts[pi2].y);
        }
        totalPx += U.distance(pts[pts.length-1].x, pts[pts.length-1].y, ic.x, ic.y);
        var totalMm = U.pixelsToMM(totalPx, state.mmPerPx);
        var lastSegMid = {
          x: (pts[pts.length-1].x + ic.x) / 2,
          y: (pts[pts.length-1].y + ic.y) / 2
        };
        var labelPos = IC.coords.imageToCanvas(state, lastSegMid.x, lastSegMid.y);
        drawLabel(ctx, 'L = ' + U.formatValue(totalMm, state.unit), labelPos.x, labelPos.y, M.defaultStyle(C.TEMP_COLOR));
      }
    } else if (state.mode === 'polygon' && pts.length > 0) {
      pts.forEach(p => { const sp = IC.coords.imageToCanvas(state, p.x,p.y); drawPoint(ctx, sp.x, sp.y, C.TEMP_COLOR); });
      if (pts.length === 1) {
        const p0 = IC.coords.imageToCanvas(state, pts[0].x, pts[0].y);
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(pp.x, pp.y);
        ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
      }
      if (pts.length >= 2) {
        ctx.beginPath(); const f = IC.coords.imageToCanvas(state, pts[0].x,pts[0].y); ctx.moveTo(f.x, f.y);
        for (let i = 1; i < pts.length; i++) { const p = IC.coords.imageToCanvas(state, pts[i].x,pts[i].y); ctx.lineTo(p.x, p.y); }
        ctx.lineTo(pp.x, pp.y);
        ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
        if (pts.length >= 3) {
          const all = [...pts, {x: ic.x, y: ic.y}];
          const a = U.polygonArea(all);
          const am = a / (U.pxPerMm(state.mmPerPx) ** 2);
          let cx = 0, cy = 0;
          all.forEach(p => { cx += p.x; cy += p.y; });
          cx /= all.length; cy /= all.length;
          drawLabel(ctx, 'S = ' + U.formatArea(am, state.unit), IC.coords.imageToCanvas(state, cx,cy).x, IC.coords.imageToCanvas(state, cx,cy).y, M.defaultStyle(C.TEMP_COLOR));
        }
      }
      if (pts.length >= 3) {
        const f = IC.coords.imageToCanvas(state, pts[0].x,pts[0].y);
        ctx.beginPath(); ctx.arc(f.x, f.y, 12, 0, Math.PI*2);
        ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1; ctx.setLineDash([2,3]); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = C.TEMP_COLOR; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(IC.i18n.t('polygon.close'), f.x, f.y + 22);
      }
    } else if (state.mode === 'angle' && pts.length >= 1) {
      pts.forEach(p => { const sp = IC.coords.imageToCanvas(state, p.x,p.y); drawPoint(ctx, sp.x, sp.y, C.TEMP_COLOR); });
      if (pts.length === 1) {
        const p1 = IC.coords.imageToCanvas(state, pts[0].x, pts[0].y);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(pp.x, pp.y);
        ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
      } else if (pts.length === 2) {
        const p1 = IC.coords.imageToCanvas(state, pts[0].x, pts[0].y);
        const v = IC.coords.imageToCanvas(state, pts[1].x, pts[1].y);
        ctx.beginPath(); ctx.moveTo(v.x, v.y); ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(v.x, v.y); ctx.lineTo(pp.x, pp.y);
        ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
        drawPoint(ctx, v.x, v.y, C.TEMP_COLOR, 7);
        const rArc = Math.min(U.distance(v.x,v.y,p1.x,p1.y), U.distance(v.x,v.y,pp.x,pp.y)) * 0.4;
        const a1 = Math.atan2(pp.y-v.y, pp.x-v.x);
        const a2 = Math.atan2(p1.y-v.y, p1.x-v.x);
        // Actually use proper angle calculation with canvas coords
        const icAng = IC.coords.canvasToImage(state, pp.x, pp.y);
        const ang = U.angleBetween(pts[1].x, pts[1].y, pts[0].x, pts[0].y, icAng.x, icAng.y);
        const p1cAng = IC.coords.imageToCanvas(state, pts[0].x, pts[0].y);
        const vcAng = IC.coords.imageToCanvas(state, pts[1].x, pts[1].y);
        const ppcAng = pp;
        const rArc2 = Math.min(U.distance(vcAng.x,vcAng.y,p1cAng.x,p1cAng.y), U.distance(vcAng.x,vcAng.y,ppcAng.x,ppcAng.y)) * 0.4;
        const aa1 = Math.atan2(p1cAng.y-vcAng.y, p1cAng.x-vcAng.x);
        const aa2 = Math.atan2(ppcAng.y-vcAng.y, ppcAng.x-vcAng.x);
        const sA = Math.min(aa1,aa2), eA = Math.max(aa1,aa2);
        ctx.beginPath();
        if (eA - sA > Math.PI) ctx.arc(vcAng.x, vcAng.y, rArc2, eA, sA + Math.PI*2);
        else ctx.arc(vcAng.x, vcAng.y, rArc2, sA, eA);
        ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1.5; ctx.stroke();
        const mA = (sA + eA) / 2;
        const lxA = vcAng.x + (rArc2+20) * Math.cos(mA);
        const lyA = vcAng.y + (rArc2+20) * Math.sin(mA);
        drawLabel(ctx, ang.toFixed(1) + '\u00B0', lxA, lyA, M.defaultStyle(C.TEMP_COLOR));
      }
    } else if (state.mode === 'annotation' && pts.length === 1) {
      const p = IC.coords.imageToCanvas(state, pts[0].x, pts[0].y);
      const preview = state.snapPreviewPos || { x: mp.x, y: mp.y };
      // First point
      ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = C.TEMP_COLOR; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      var st = state.annotationSubtype;
      if (st === 'rect' || st === 'ellipse') {
        // Rect/ellipse preview: use canvas-space coords (follows mouse directly)
        var pbx = Math.min(p.x, preview.x), pby = Math.min(p.y, preview.y);
        var pbw = Math.abs(preview.x - p.x), pbh = Math.abs(preview.y - p.y);
        ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]);
        if (st === 'rect') ctx.strokeRect(pbx, pby, pbw, pbh);
        else { ctx.beginPath(); ctx.ellipse(pbx+pbw/2, pby+pbh/2, pbw/2, pbh/2, 0, 0, Math.PI*2); ctx.stroke(); }
        ctx.setLineDash([]);
        ctx.fillStyle = C.TEMP_COLOR; ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(Math.round(pbw) + ' × ' + Math.round(pbh), pbx + 4, pby - 6);
      } else {
        // Line/Arrow preview: dashed line + arrowhead
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(preview.x, preview.y);
        ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1.5;
        ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
        if (st === 'arrow') {
          const angle = Math.atan2(preview.y - p.y, preview.x - p.x);
          ctx.strokeStyle = C.TEMP_COLOR; ctx.lineWidth = 1.5;
          drawAnnotationArrowhead(ctx, preview.x, preview.y, angle, 12);
          var deCheck = document.getElementById('propDoubleEnded');
          if (deCheck && deCheck.checked) {
            drawAnnotationArrowhead(ctx, p.x, p.y, angle + Math.PI, 12);
          }
        }
      }
    }
    ctx.restore();
  }

  // ======================== Calibration line ========================
  function drawCalibrationLine(ctx, state) {
    if (state.mode !== 'calibrate' || !state.calibPoint1) return;
    ctx.save();
    const p1 = IC.coords.imageToCanvas(state, state.calibPoint1.x, state.calibPoint1.y);
    drawPoint(ctx, p1.x, p1.y, C.CALIB_COLOR, 6);
    const mousePos = IC.events ? IC.events.getLastMousePos() : { x: 0, y: 0 };
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(mousePos.x, mousePos.y);
    ctx.strokeStyle = C.CALIB_COLOR; ctx.lineWidth = 2; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
    const ic = IC.coords.canvasToImage(state, mousePos.x, mousePos.y);
    const d = U.distance(state.calibPoint1.x, state.calibPoint1.y, ic.x, ic.y);
    drawLabel(ctx, d.toFixed(0) + ' px', (p1.x+mousePos.x)/2, (p1.y+mousePos.y)/2 - 22, M.defaultStyle(C.CALIB_COLOR));
    ctx.restore();
  }

  // ======================== Magnifier ========================
  function updateMagnifier(ctx, canvas, state, dom, clientX, clientY) {
    if (!state.image || (!state.mode && !state.selectedMeasurementId)) {
      dom.magnifier.classList.add('hidden');
      return;
    }
    const r = canvas.getBoundingClientRect();
    if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) {
      dom.magnifier.classList.add('hidden');
      return;
    }
    const mx = clientX - r.left, my = clientY - r.top;
    const half = C.MAG_SIZE / 2;
    const margin = 10;
    let mxPos = clientX + 100;
    let myPos = clientY - C.MAG_SIZE - 10;
    if (mxPos + half > window.innerWidth - margin) mxPos = window.innerWidth - half - margin;
    if (mxPos - half < margin) mxPos = half + margin;
    if (myPos + half > window.innerHeight - margin) myPos = window.innerHeight - half - margin;
    if (myPos - half < margin) myPos = margin + half;
    dom.magnifier.style.left = mxPos + 'px';
    dom.magnifier.style.top = myPos + 'px';
    const ip = IC.coords.canvasToImage(state, mx, my);
    const hs = C.MAG_RADIUS / C.MAG_ZOOM / Math.max(0.05, state.scale);
    const magCtx = dom.magnifierCtx;
    const magSize = C.MAG_SIZE;
    const magRadius = magSize / 2;
    magCtx.canvas.width = magSize;
    magCtx.canvas.height = magSize;
    magCtx.imageSmoothingEnabled = false;
    magCtx.save();
    magCtx.beginPath();
    magCtx.arc(magRadius, magRadius, magRadius, 0, Math.PI * 2);
    magCtx.clip();
    // Draw image with rotation, without measurements/labels
    magCtx.save();
    magCtx.translate(magRadius, magRadius);
    magCtx.rotate(state.rotation * Math.PI / 180);
    magCtx.drawImage(state.image, ip.x - hs, ip.y - hs, hs * 2, hs * 2, -magRadius, -magRadius, magSize, magSize);
    magCtx.restore();
    // Pixel grid
    magCtx.strokeStyle = 'rgba(255,255,255,0.08)'; magCtx.lineWidth = 0.5;
    for (var i = 0; i <= magSize; i += C.MAG_ZOOM) {
      magCtx.beginPath(); magCtx.moveTo(i, 0); magCtx.lineTo(i, magSize); magCtx.stroke();
      magCtx.beginPath(); magCtx.moveTo(0, i); magCtx.lineTo(magSize, i); magCtx.stroke();
    }
    // Crosshair
    magCtx.strokeStyle = 'rgba(255,60,60,0.7)'; magCtx.lineWidth = 1;
    magCtx.beginPath(); magCtx.moveTo(magRadius, 0); magCtx.lineTo(magRadius, magSize);
    magCtx.moveTo(0, magRadius); magCtx.lineTo(magSize, magRadius); magCtx.stroke();
    magCtx.beginPath(); magCtx.arc(magRadius, magRadius, 2, 0, Math.PI * 2);
    magCtx.fillStyle = '#ff3c3c'; magCtx.fill();
    // Calibration line
    if (state.mode === 'calibrate' && state.calibPoint1) {
      const viewCx = ip.x, viewCy = ip.y;
      const viewHs = hs;
      const p1x = (state.calibPoint1.x - (viewCx - viewHs)) / (viewHs * 2) * magSize;
      const p1y = (state.calibPoint1.y - (viewCy - viewHs)) / (viewHs * 2) * magSize;
      const mouseImg = IC.coords.canvasToImage(state, mx, my);
      const p2x = (mouseImg.x - (viewCx - viewHs)) / (viewHs * 2) * magSize;
      const p2y = (mouseImg.y - (viewCy - viewHs)) / (viewHs * 2) * magSize;
      magCtx.beginPath(); magCtx.moveTo(p1x, p1y); magCtx.lineTo(p2x, p2y);
      magCtx.strokeStyle = C.CALIB_COLOR; magCtx.lineWidth = 2; magCtx.setLineDash([3,3]);
      magCtx.stroke(); magCtx.setLineDash([]);
    }
    magCtx.restore();
    const el = dom.magnifier.querySelector('.magnifier-coords');
    if (el) el.textContent = Math.round(ip.x) + ', ' + Math.round(ip.y);
    dom.magnifier.classList.remove('hidden');
  }

  return {
    render, drawMeasurement, drawPoint, drawAnnotationArrowhead, drawLabel,
    drawTempMeasurement, drawCalibrationLine, updateMagnifier
  };
})();

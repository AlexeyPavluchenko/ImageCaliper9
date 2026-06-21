/* ============================================================
   ImageCaliper — Mouse, touch, keyboard interaction handlers
   ============================================================ */
window.IC = window.IC || {};
IC.events = (function() {

  const C = IC.constants;
  const U = IC.utils;
  const M = IC.measurements;

  // Shared mutable state for event handlers
  let dragState = null;
  let _lastMousePos = { x: 0, y: 0 };
  let touches = [];
  let highlightTimer = null;

  // Expose for rendering.js (temp measurement preview, calibration line)
  // We expose via IC.events but rendering can't import directly due to IIFE order
  // Instead we set a reference

  // ======================== Setup ========================
  function setupEventHandlers(state, dom) {
    const canvas = dom.canvas;

    canvas.addEventListener('mousedown', function(e) { onMouseDown(e, state, dom); });
    canvas.addEventListener('mousemove', function(e) { onMouseMove(e, state, dom); });
    canvas.addEventListener('mouseup', function(e) { onMouseUp(e, state, dom); });
    canvas.addEventListener('wheel', function(e) { onWheel(e, state, dom); }, { passive: false });
    canvas.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    // Calibration click (separate 'click' event to avoid interfering with drag start)
    canvas.addEventListener('click', function(e) {
      if (!state.image || state.mode !== 'calibrate') return;
      const r = dom.canvas.getBoundingClientRect();
      const ip = IC.coords.canvasToImage(state, e.clientX - r.left, e.clientY - r.top);
      handleCalibrationClick(ip.x, ip.y, null, null, state, dom);
    });
    canvas.addEventListener('mouseleave', function() { dom.magnifier.classList.add('hidden'); });
    canvas.addEventListener('touchstart', function(e) { onTouchStart(e, state, dom); }, { passive: false });
    canvas.addEventListener('touchmove', function(e) { onTouchMove(e, state, dom); }, { passive: false });
    canvas.addEventListener('touchend', function(e) { onTouchEnd(e, state, dom); }, { passive: false });

    // Global keyboard
    document.addEventListener('keydown', function(e) {
      onKeyDown(e, state, dom);
    });

    // Special startup modal key handler (separate because it needs stopImmediatePropagation)
    document.addEventListener('keydown', function startupKeyHandler(e) {
      if (!dom.calibWizard.classList.contains('hidden')) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          const step = e.shiftKey ? 0.1 : 1.0;
          state.rotation += e.key === 'ArrowLeft' ? -step : step;
          if (dom.calibWizAngle) dom.calibWizAngle.textContent = state.rotation.toFixed(1);
          IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        }
        if (e.key === 'Enter' || e.key === 'Escape') { dom.calibWizOk.click(); }
        e.stopImmediatePropagation();
      }
    }, true);

    return function cleanup() {
      // Return cleanup function if needed
    };
  }

  // ======================== Mouse ========================
  function onMouseDown(e, state, dom) {
    if (!state.image) return;
    const r = dom.canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    _lastMousePos = { x: mx, y: my };
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle-click / Alt+click: pan everything (image + crop together)
      state.isPanning = true;
      state.panStart = { x: mx, y: my };
      state.panOffsetStart = { ...state.offset };
      state._panMovesCrop = true;
      dom.canvas.style.cursor = 'grabbing';
      return;
    }
    // In rotation mode, left-click drag pans only the image (crop stays fixed)
    if (e.button === 0 && dom.rotationPanel && !dom.rotationPanel.classList.contains('hidden')) {
      const gv = state.guideV !== null ? state.guideV : dom.canvas.width / 2;
      const gh = state.guideH !== null ? state.guideH : dom.canvas.height / 2;
      if (Math.abs(mx - gv) >= 10 && Math.abs(my - gh) >= 10) {
        e.preventDefault();
        state.isPanning = true;
        state.panStart = { x: mx, y: my };
        state.panOffsetStart = { ...state.offset };
        state._panMovesCrop = false;
        dom.canvas.style.cursor = 'grabbing';
        return;
      }
    }
    if (e.button === 2) {
      if (state.selectedMeasurementId) IC.ui.deselectMeasurement(state, dom);
      else cancelTempMeasurement(state, dom);
      return;
    }
    // Guide dragging — only in rotation mode
    if (e.button === 0 && state.image && dom.rotationPanel && !dom.rotationPanel.classList.contains('hidden')) {
      const gv = state.guideV !== null ? state.guideV : dom.canvas.width / 2;
      const gh = state.guideH !== null ? state.guideH : dom.canvas.height / 2;
      if (Math.abs(mx - gv) < 10) { state.draggingGuide = 'v'; return; }
      if (Math.abs(my - gh) < 10) { state.draggingGuide = 'h'; return; }
    }
    if (e.button === 0) {
      const ip = IC.coords.canvasToImage(state, mx, my);
      // Selected measurement editing
      if (state.selectedMeasurementId) {
        const sm = state.measurements.find(function(m) { return m.id === state.selectedMeasurementId; });
        if (sm) {
          const labelCanvas = M.getLabelCanvasPos(state, sm, dom.canvasCtx);
          // For rotated text annotation, unrotate mouse before hit check
          var hitLabel = false;
          if (sm.type === 'annotation' && sm.subtype === 'text' && sm._textRotation) {
            var rot = sm._textRotation * Math.PI / 180;
            var dx = mx - labelCanvas.lx, dy = my - labelCanvas.ly;
            var cos_r = Math.cos(-rot), sin_r = Math.sin(-rot);
            var ux = dx * cos_r - dy * sin_r, uy = dx * sin_r + dy * cos_r;
            var rect = M.getLabelRect(0, 0, sm.label, sm.style, dom.canvasCtx);
            hitLabel = Math.abs(ux) <= rect.w / 2 && Math.abs(uy) <= rect.h / 2;
          } else {
            var rect = M.getLabelRect(labelCanvas.lx, labelCanvas.ly, sm.label, sm.style, dom.canvasCtx);
            hitLabel = mx >= rect.x && mx <= rect.x + rect.w && my >= rect.y && my <= rect.y + rect.h;
          }
          if (hitLabel) {
            state.draggingLabel = true;
            state.dragLabelMeasId = sm.id;
            state._dragLabelOffset = { x: mx - labelCanvas.lx, y: my - labelCanvas.ly };
            dom.canvas.style.cursor = 'move';
            return;
          }
          if (sm.type === 'scalebar' && M.isInScalebarRect(state, mx, my, sm)) {
            // Save offset between click and scalebar center (canvas coords)
            var centerCanvas = IC.coords.imageToCanvas(state, sm.points[0].x, sm.points[0].y);
            var offsetCanvas = { x: centerCanvas.x - mx, y: centerCanvas.y - my };
            dragState = { measId: sm.id, ptIdx: 0, offsetCanvas: offsetCanvas };
            dom.canvas.style.cursor = 'grabbing';
            return;
          }
          // Rect/ellipse: check hit against rendered corner positions (canvas coords)
          // to match where selection rings are actually drawn
          var isRectOrEllipse = sm.type === 'annotation' && (sm.subtype === 'rect' || sm.subtype === 'ellipse');
          if (isRectOrEllipse && sm._rectCenter && sm._rectSize) {
            var rc = sm._rectCenter, rs = sm._rectSize, cr = sm._createdAtRotation || 0;
            var ctr = IC.coords.imageToCanvas(state, rc.x, rc.y);
            var hw = rs.w * state.scale / 2, hh = rs.h * state.scale / 2;
            var nr = (state.rotation - cr) * Math.PI / 180;
            var cos_nr = Math.cos(nr), sin_nr = Math.sin(nr);
            // Two diagonal corners (same positions as selection rings)
            var corners = [
              { x: ctr.x + (-hw) * cos_nr - (-hh) * sin_nr, y: ctr.y + (-hw) * sin_nr + (-hh) * cos_nr },
              { x: ctr.x + hw * cos_nr - hh * sin_nr, y: ctr.y + hw * sin_nr + hh * cos_nr }
            ];
            for (var ci = 0; ci < corners.length; ci++) {
              if (Math.abs(mx - corners[ci].x) < 12 && Math.abs(my - corners[ci].y) < 12) {
                dragState = { measId: sm.id, ptIdx: ci };
                if (e.shiftKey) {
                  dragState._allPts = sm.points.map(function(p) { return { x: p.x, y: p.y }; });
                  if (sm._rectCenter) dragState._savedRC = { x: sm._rectCenter.x, y: sm._rectCenter.y };
                }
                dom.canvas.style.cursor = 'grabbing';
                return;
              }
            }
          } else {
            for (let i = 0; i < sm.points.length; i++) {
              if (U.distance(ip.x, ip.y, sm.points[i].x, sm.points[i].y) < 20 / state.scale) {
                dragState = { measId: sm.id, ptIdx: i };
                // Ctrl+drag: save all points positions to translate the whole measurement
                if (e.shiftKey) {
                  dragState._allPts = sm.points.map(function(p) { return { x: p.x, y: p.y }; });
                  if (sm._rectCenter) dragState._savedRC = { x: sm._rectCenter.x, y: sm._rectCenter.y };
                }
                dom.canvas.style.cursor = 'grabbing';
                return;
              }
            }
          }
        }
        IC.ui.deselectMeasurement(state, dom);
        return;
      }
      // Crop mode — handle resize/move/draw
      if (state.mode === 'crop') {
        // If already dragging (drawing new rect)
        if (state._cropDragging && state._cropDrawRect) {
          let x = Math.min(state._cropDrawRect.x, mx);
          let y = Math.min(state._cropDrawRect.y, my);
          let w = Math.abs(mx - state._cropDrawRect.x);
          let h = Math.abs(my - state._cropDrawRect.y);
          const asp = parseFloat(dom.cropAspect.value);
          if (dom.cropAspect.value !== 'free' && !isNaN(asp) && asp > 0) {
            h = w / asp;
          }
          state._cropDrawRect = { x, y, w, h };
          state._cropDragging = false;
          IC.ui.updateCropPanel(state, dom);
          IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
          return;
        }
        // If rect exists, check for corner/edge resize or move
        const r = state._cropDrawRect;
        if (r && r.w > 0 && r.h > 0) {
          // Check corners
          const m = 10;
          if (Math.abs(mx - r.x) < m && Math.abs(my - r.y) < m) {
            state._cropResizing = true; state._cropResizeHandle = 'tl';
            state._cropStartRect = { ...r }; state._cropStartMouse = { x: mx, y: my };
            IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); return;
          }
          if (Math.abs(mx - (r.x+r.w)) < m && Math.abs(my - r.y) < m) {
            state._cropResizing = true; state._cropResizeHandle = 'tr';
            state._cropStartRect = { ...r }; state._cropStartMouse = { x: mx, y: my };
            IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); return;
          }
          if (Math.abs(mx - r.x) < m && Math.abs(my - (r.y+r.h)) < m) {
            state._cropResizing = true; state._cropResizeHandle = 'bl';
            state._cropStartRect = { ...r }; state._cropStartMouse = { x: mx, y: my };
            IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); return;
          }
          if (Math.abs(mx - (r.x+r.w)) < m && Math.abs(my - (r.y+r.h)) < m) {
            state._cropResizing = true; state._cropResizeHandle = 'br';
            state._cropStartRect = { ...r }; state._cropStartMouse = { x: mx, y: my };
            IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); return;
          }
          // Check edges (exclude corners)
          const em = 8, cx = 20;
          if (Math.abs(my - r.y) < em && mx > r.x+cx && mx < r.x+r.w-cx) {
            state._cropResizing = true; state._cropResizeHandle = 't';
            state._cropStartRect = { ...r }; state._cropStartMouse = { x: mx, y: my };
            IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); return;
          }
          if (Math.abs(my - (r.y+r.h)) < em && mx > r.x+cx && mx < r.x+r.w-cx) {
            state._cropResizing = true; state._cropResizeHandle = 'b';
            state._cropStartRect = { ...r }; state._cropStartMouse = { x: mx, y: my };
            IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); return;
          }
          if (Math.abs(mx - r.x) < em && my > r.y+cx && my < r.y+r.h-cx) {
            state._cropResizing = true; state._cropResizeHandle = 'l';
            state._cropStartRect = { ...r }; state._cropStartMouse = { x: mx, y: my };
            IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); return;
          }
          if (Math.abs(mx - (r.x+r.w)) < em && my > r.y+cx && my < r.y+r.h-cx) {
            state._cropResizing = true; state._cropResizeHandle = 'r';
            state._cropStartRect = { ...r }; state._cropStartMouse = { x: mx, y: my };
            IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); return;
          }
          // Inside → move
          if (mx >= r.x && mx <= r.x+r.w && my >= r.y && my <= r.y+r.h) {
            state._cropMoving = true;
            state._cropMoveStart = { mx, my, rect: { ...r } };
            dom.canvas.style.cursor = 'grabbing';
            IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); return;
          }
        }
        // Click outside → start new rect
        state._cropDrawRect = { x: mx, y: my, w: 0, h: 0 };
        state._cropDragging = true;
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        return;
      }
      // Tool-specific
      if (state.mode) {
        if (state.mode === 'polyline' && state.tempPoints.length >= 2) {
          var closePoly = U.distance(ip.x, ip.y, state.tempPoints[0].x, state.tempPoints[0].y) < 15 / state.scale;
          if (closePoly) {
            var totalPx = 0;
            for (var pi = 1; pi < state.tempPoints.length; pi++) {
              totalPx += U.distance(state.tempPoints[pi-1].x, state.tempPoints[pi-1].y, state.tempPoints[pi].x, state.tempPoints[pi].y);
            }
            totalPx += U.distance(state.tempPoints[0].x, state.tempPoints[0].y, state.tempPoints[state.tempPoints.length-1].x, state.tempPoints[state.tempPoints.length-1].y);
            var totalMm = U.pixelsToMM(totalPx, state.mmPerPx);
            var m = M.addMeasurement(state, 'polyline', [...state.tempPoints], totalMm, 'L = ' + U.formatValue(totalMm, state.unit));
            m.closed = true;
            state.tempPoints = [];
            IC.ui.updatePointCount(state, dom);
            IC.ui.setStatus(IC.i18n.t('status.closedPolyline') + ': ' + m.label, dom);
            IC.ui.selectMeasurement(state, m.id, dom);
            IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
            return;
          }
        }
        if (state.mode === 'polygon' && state.tempPoints.length >= 3) {
          const d = U.distance(ip.x, ip.y, state.tempPoints[0].x, state.tempPoints[0].y);
          if (d < 15 / state.scale) {
            const a = U.polygonArea(state.tempPoints);
            const am = a / (U.pxPerMm(state.mmPerPx) ** 2);
            var pm = M.addMeasurement(state, 'polygon', [...state.tempPoints], am, 'S = ' + U.formatArea(am, state.unit));
            state.tempPoints = [];
            IC.ui.updatePointCount(state, dom);
            IC.ui.selectMeasurement(state, pm.id, dom);
            IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
            return;
          }
        }
        handleMeasurementClick(ip.x, ip.y, mx, my, e.shiftKey, state, dom);
      }
    }
  }

  function onMouseMove(e, state, dom) {
    if (!state.image) return;
    const r = dom.canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    _lastMousePos = { x: mx, y: my };

    // Snapped preview
    state.snapPreviewPos = null;
    if (e.shiftKey && state.mode && state.tempPoints.length >= 1) {
      const prev = state.tempPoints[state.tempPoints.length - 1];
      const pc = IC.coords.imageToCanvas(state, prev.x, prev.y);
      const dx = mx - pc.x, dy = my - pc.y;
      const ang = Math.atan2(dy, dx) * 180 / Math.PI;
      const snapped = U.snapAngle(ang, 15);
      const len = Math.hypot(dx, dy);
      const rad = snapped * Math.PI / 180;
      state.snapPreviewPos = { x: pc.x + len * Math.cos(rad), y: pc.y + len * Math.sin(rad) };
    }

    IC.rendering.updateMagnifier(dom.canvasCtx, dom.canvas, state, dom, e.clientX, e.clientY);

    // Panning
    if (state.isPanning) {
      const dx = mx - state.panStart.x;
      const dy = my - state.panStart.y;
      const newOx = state.panOffsetStart.x + dx;
      const newOy = state.panOffsetStart.y + dy;
      if (state.cropRect && state._panMovesCrop !== false) {
        state.cropRect.x += newOx - state.offset.x;
        state.cropRect.y += newOy - state.offset.y;
      }
      state.offset.x = newOx;
      state.offset.y = newOy;
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      return;
    }
    // Crop: draw preview
    if (state.mode === 'crop' && state._cropDragging && state._cropDrawRect) {
      let x = Math.min(state._cropDrawRect.x, mx);
      let y = Math.min(state._cropDrawRect.y, my);
      let w = Math.abs(mx - state._cropDrawRect.x);
      let h = Math.abs(my - state._cropDrawRect.y);
      const asp = parseFloat(dom.cropAspect.value);
      if (dom.cropAspect.value !== 'free' && !isNaN(asp) && asp > 0) {
        h = w / asp;
      }
      state._cropDrawRect = { x, y, w, h };
      IC.ui.updateCropPanel(state, dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      return;
    }
    // Crop: resize
    if (state.mode === 'crop' && state._cropResizing && state._cropDrawRect && state._cropStartRect) {
      const sr = state._cropStartRect;
      const dx = mx - state._cropStartMouse.x;
      const dy = my - state._cropStartMouse.y;
      const asp = parseFloat(dom.cropAspect.value);
      const locked = dom.cropAspect.value !== 'free' && !isNaN(asp) && asp > 0;
      let nx = sr.x, ny = sr.y, nw = sr.w, nh = sr.h;
      switch (state._cropResizeHandle) {
        case 'tl': nx = sr.x + dx; ny = sr.y + dy; nw = sr.w - dx; nh = sr.h - dy; break;
        case 'tr': ny = sr.y + dy; nw = sr.w + dx; nh = sr.h - dy; break;
        case 'bl': nx = sr.x + dx; nw = sr.w - dx; nh = sr.h + dy; break;
        case 'br': nw = sr.w + dx; nh = sr.h + dy; break;
        case 't': ny = sr.y + dy; nh = sr.h - dy; break;
        case 'b': nh = sr.h + dy; break;
        case 'l': nx = sr.x + dx; nw = sr.w - dx; break;
        case 'r': nw = sr.w + dx; break;
      }
      if (locked) {
        if (state._cropResizeHandle === 't' || state._cropResizeHandle === 'b') {
          nw = nh * asp; // horizontal edge: adjust width from height change
        } else {
          nh = nw / asp; // corner or vertical edge: adjust height from width
        }
      }
      // Fix negative sizes
      if (nw < 20) { nw = 20; if (state._cropResizeHandle === 'tl' || state._cropResizeHandle === 'l') nx = sr.x + sr.w - 20; }
      if (nh < 20) { nh = 20; if (state._cropResizeHandle === 'tl' || state._cropResizeHandle === 't') ny = sr.y + sr.h - 20; }
      state._cropDrawRect = { x: Math.max(0, nx), y: Math.max(0, ny), w: Math.max(20, nw), h: Math.max(20, nh) };
      IC.ui.updateCropPanel(state, dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      return;
    }
    // Crop: move
    if (state.mode === 'crop' && state._cropMoving && state._cropMoveStart) {
      const ms = state._cropMoveStart;
      const dx = mx - ms.mx, dy = my - ms.my;
      const nr = { x: Math.max(0, ms.rect.x + dx), y: Math.max(0, ms.rect.y + dy), w: ms.rect.w, h: ms.rect.h };
      state._cropDrawRect = nr;
      IC.ui.updateCropPanel(state, dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      return;
    }
    // Guide drag
    if (state.draggingGuide) {
      if (state.draggingGuide === 'v') state.guideV = mx;
      else state.guideH = my;
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      return;
    }
    // Label drag — preserves grab offset so text doesn't snap to cursor center
    if (state.draggingLabel && state.dragLabelMeasId) {
      const sm = state.measurements.find(function(m) { return m.id === state.dragLabelMeasId; });
      if (sm) {
        if (!sm.style) sm.style = M.defaultStyle(sm.color);
        var grabOff = state._dragLabelOffset || { x: 0, y: 0 };
        // Text annotation: move the anchor point itself (point + text stay together)
        if (sm.type === 'annotation' && sm.subtype === 'text') {
          var newCanvas = { x: mx - grabOff.x, y: my - grabOff.y };
          var newImage = IC.coords.canvasToImage(state, newCanvas.x, newCanvas.y);
          sm.points[0] = { x: newImage.x, y: newImage.y };
          sm.style.labelOffX = 0;
          sm.style.labelOffY = 0;
        } else if (sm.type === 'scalebar') {
          // Scalebar: compute offset delta from current rendered label position.
          // getLabelCanvasPos for scalebar includes tw/2 in the layout, so we
          // must compute delta relative to that position, NOT from getLabelBasePos
          // (which omits tw/2 and causes a leftward jump on first drag).
          var currentLp = M.getLabelCanvasPos(state, sm, dom.canvasCtx);
          var currentImage = IC.coords.canvasToImage(state, currentLp.lx, currentLp.ly);
          var targetCanvas = { x: mx - grabOff.x, y: my - grabOff.y };
          var targetImage = IC.coords.canvasToImage(state, targetCanvas.x, targetCanvas.y);
          sm.style.labelOffX = (sm.style.labelOffX || 0) + (targetImage.x - currentImage.x);
          sm.style.labelOffY = (sm.style.labelOffY || 0) + (targetImage.y - currentImage.y);
        } else {
          // Other measurements: offset in image-space (rotates with image)
          var basePos = M.getLabelBasePos(state, sm);
          var targetCanvas = { x: mx - grabOff.x, y: my - grabOff.y };
          var targetImage = IC.coords.canvasToImage(state, targetCanvas.x, targetCanvas.y);
          sm.style.labelOffX = targetImage.x - basePos.x;
          sm.style.labelOffY = targetImage.y - basePos.y;
        }
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      }
      return;
    }
    // Point drag
    if (dragState) {
      updateDraggedPoint(state, dom);
      return;
    }
    // Cursor updates
    if (state.selectedMeasurementId) {
      const sm = state.measurements.find(function(m) { return m.id === state.selectedMeasurementId; });
      let cursor = 'default';
      if (sm) {
        // Rect/ellipse: check hover against rendered corner positions (canvas coords)
        var isRectOrEllipse = sm.type === 'annotation' && (sm.subtype === 'rect' || sm.subtype === 'ellipse');
        if (isRectOrEllipse && sm._rectCenter && sm._rectSize) {
          var rc = sm._rectCenter, rs = sm._rectSize, cr = sm._createdAtRotation || 0;
          var ctr = IC.coords.imageToCanvas(state, rc.x, rc.y);
          var hw = rs.w * state.scale / 2, hh = rs.h * state.scale / 2;
          var nr = (state.rotation - cr) * Math.PI / 180;
          var cos_nr = Math.cos(nr), sin_nr = Math.sin(nr);
          var corners = [
            { x: ctr.x + (-hw) * cos_nr - (-hh) * sin_nr, y: ctr.y + (-hw) * sin_nr + (-hh) * cos_nr },
            { x: ctr.x + hw * cos_nr - hh * sin_nr, y: ctr.y + hw * sin_nr + hh * cos_nr }
          ];
          for (var ci = 0; ci < corners.length; ci++) {
            if (Math.abs(mx - corners[ci].x) < 12 && Math.abs(my - corners[ci].y) < 12) { cursor = 'grab'; break; }
          }
        } else {
          const ip = IC.coords.canvasToImage(state, mx, my);
          const th = 15 / state.scale;
          for (const p of sm.points) {
            if (U.distance(ip.x, ip.y, p.x, p.y) < th) { cursor = 'grab'; break; }
          }
        }
        if (cursor === 'default') {
          const lp = M.getLabelCanvasPos(state, sm, dom.canvasCtx);
          if (sm.type === 'annotation' && sm.subtype === 'text' && sm._textRotation) {
            var rot2 = sm._textRotation * Math.PI / 180;
            var dx2 = mx - lp.lx, dy2 = my - lp.ly;
            var cr2 = Math.cos(-rot2), sr2 = Math.sin(-rot2);
            var ux2 = dx2 * cr2 - dy2 * sr2, uy2 = dx2 * sr2 + dy2 * cr2;
            var rect2 = M.getLabelRect(0, 0, sm.label, sm.style, dom.canvasCtx);
            if (Math.abs(ux2) <= rect2.w / 2 && Math.abs(uy2) <= rect2.h / 2) cursor = 'move';
          } else {
            var rect2 = M.getLabelRect(lp.lx, lp.ly, sm.label, sm.style, dom.canvasCtx);
            if (mx >= rect2.x && mx <= rect2.x + rect2.w && my >= rect2.y && my <= rect2.y + rect2.h) cursor = 'move';
          }
        }
        if (cursor === 'default' && sm.type === 'scalebar' && M.isInScalebarRect(state, mx, my, sm)) {
          cursor = 'grab';
        }
      }
      dom.canvas.style.cursor = cursor;
    }
    if (state.mode === 'crop' && state._cropDrawRect && state._cropDrawRect.w > 0) {
      // Crop mode cursor: resize/move on rect, crosshair outside
      const r = state._cropDrawRect;
      const m = 10, em = 8, cx = 20;
      if (Math.abs(mx - r.x) < m && Math.abs(my - r.y) < m) dom.canvas.style.cursor = 'nwse-resize';
      else if (Math.abs(mx - (r.x+r.w)) < m && Math.abs(my - r.y) < m) dom.canvas.style.cursor = 'nesw-resize';
      else if (Math.abs(mx - r.x) < m && Math.abs(my - (r.y+r.h)) < m) dom.canvas.style.cursor = 'nesw-resize';
      else if (Math.abs(mx - (r.x+r.w)) < m && Math.abs(my - (r.y+r.h)) < m) dom.canvas.style.cursor = 'nwse-resize';
      else if (Math.abs(my - r.y) < em && mx > r.x+cx && mx < r.x+r.w-cx) dom.canvas.style.cursor = 'ns-resize';
      else if (Math.abs(my - (r.y+r.h)) < em && mx > r.x+cx && mx < r.x+r.w-cx) dom.canvas.style.cursor = 'ns-resize';
      else if (Math.abs(mx - r.x) < em && my > r.y+cx && my < r.y+r.h-cx) dom.canvas.style.cursor = 'ew-resize';
      else if (Math.abs(mx - (r.x+r.w)) < em && my > r.y+cx && my < r.y+r.h-cx) dom.canvas.style.cursor = 'ew-resize';
      else if (mx >= r.x && mx <= r.x+r.w && my >= r.y && my <= r.y+r.h) dom.canvas.style.cursor = 'move';
      else dom.canvas.style.cursor = 'crosshair';
    } else if (state.mode) dom.canvas.style.cursor = 'crosshair';
    else dom.canvas.style.cursor = 'grab';
    // Re-render on mouse move when there's temp preview or calibration line
    if (state.mode && state.tempPoints.length > 0) IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    else if (state.mode === 'calibrate' && state.calibPoint1) IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
  }

  function onMouseUp(e, state, dom) {
    if (state.isPanning) {
      state.isPanning = false;
      state._panMovesCrop = null;
      dom.canvas.style.cursor = state.mode ? 'crosshair' : 'grab';
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    }
    state.draggingGuide = null;
    if (state.draggingLabel) {
      state.draggingLabel = false;
      dom.canvas.style.cursor = state.mode ? 'crosshair' : 'grab';
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    }
    if (dragState) {
      dragState = null;
      dom.canvas.style.cursor = state.mode ? 'crosshair' : 'grab';
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    }
    if (state._cropResizing) {
      state._cropResizing = false;
      state._cropResizeHandle = null;
      state._cropStartRect = null;
      state._cropStartMouse = null;
    }
    if (state._cropMoving) {
      state._cropMoving = false;
      state._cropMoveStart = null;
    }
  }

  // ======================== Wheel (zoom) ========================
  function onWheel(e, state, dom) {
    if (!state.image) return;
    e.preventDefault();
    const r = dom.canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const z = e.deltaY < 0 ? 1.1 : 0.9;
    const ns = Math.max(0.05, Math.min(50, state.scale * z));
    const ip = IC.coords.canvasToImage(state, mx, my);
    const oldScale = state.scale;
    state.scale = ns;
    const ns2 = IC.coords.imageToCanvas(state, ip.x, ip.y);
    state.offset.x += mx - ns2.x;
    state.offset.y += my - ns2.y;
    if (state.cropRect) {
      const factor = ns / oldScale;
      state.cropRect.x = mx + (state.cropRect.x - mx) * factor;
      state.cropRect.y = my + (state.cropRect.y - my) * factor;
      state.cropRect.w *= factor;
      state.cropRect.h *= factor;
    }
    IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
  }

  // ======================== Touch ========================
  function onTouchStart(e, state, dom) {
    e.preventDefault();
    if (!state.image) return;
    const r = dom.canvas.getBoundingClientRect();
    touches = Array.from(e.touches).map(function(t) {
      return { id: t.identifier, x: t.clientX - r.left, y: t.clientY - r.top };
    });
    if (touches.length === 1) {
      const t = touches[0];
      const ip = IC.coords.canvasToImage(state, t.x, t.y);
      if (state.mode === 'calibrate') handleCalibrationClick(ip.x, ip.y, t.x, t.y, state, dom);
      else if (state.mode) handleMeasurementClick(ip.x, ip.y, t.x, t.y, false, state, dom);
    }
  }

  function onTouchMove(e, state, dom) {
    e.preventDefault();
    if (!state.image) return;
    const r = dom.canvas.getBoundingClientRect();
    const nt = Array.from(e.touches).map(function(t) {
      return { id: t.identifier, x: t.clientX - r.left, y: t.clientY - r.top };
    });
    if (nt.length === 2 && touches.length === 2) {
      const od = U.distance(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
      const nd = U.distance(nt[0].x, nt[0].y, nt[1].x, nt[1].y);
      if (od > 0) {
        const cx = (nt[0].x + nt[1].x) / 2, cy = (nt[0].y + nt[1].y) / 2;
        const ip = IC.coords.canvasToImage(state, cx, cy);
        state.scale = Math.max(0.05, Math.min(50, state.scale * (nd / od)));
        const ns = IC.coords.imageToCanvas(state, ip.x, ip.y);
        state.offset.x += cx - ns.x;
        state.offset.y += cy - ns.y;
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      }
    } else if (nt.length === 1 && touches.length === 1) {
      state.offset.x += nt[0].x - touches[0].x;
      state.offset.y += nt[0].y - touches[0].y;
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    }
    touches = nt;
  }

  function onTouchEnd(e, state, dom) {
    e.preventDefault();
    if (!state.image) return;
    const r = dom.canvas.getBoundingClientRect();
    touches = Array.from(e.touches).map(function(t) {
      return { id: t.identifier, x: t.clientX - r.left, y: t.clientY - r.top };
    });
  }

  // ======================== Keyboard ========================
  function onKeyDown(e, state, dom) {
    if (e.key === 'Enter' && state.mode === 'crop' && dom.cropApplyBtn) {
      e.preventDefault();
      dom.cropApplyBtn.click();
      return;
    }
    if (e.key === 'Enter' && state.mode === 'polyline' && state.tempPoints.length >= 2) {
      e.preventDefault();
      // Finish open polyline
      var totalPx = 0;
      for (var pi = 1; pi < state.tempPoints.length; pi++) {
        totalPx += U.distance(state.tempPoints[pi-1].x, state.tempPoints[pi-1].y, state.tempPoints[pi].x, state.tempPoints[pi].y);
      }
      var totalMm = U.pixelsToMM(totalPx, state.mmPerPx);
      var pm = M.addMeasurement(state, 'polyline', [...state.tempPoints], totalMm, 'L = {v}');
      state.tempPoints = [];
      IC.ui.updatePointCount(state, dom);
      IC.ui.selectMeasurement(state, pm.id, dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      IC.ui.setStatus('Polyline: ' + pm.label, dom);
      return;
    }
    if (e.key === 'Enter' && dom.rotateDoneBtn && dom.rotateDoneBtn.offsetParent !== null) {
      e.preventDefault();
      dom.rotateDoneBtn.click();
      return;
    }
    if (e.key === 'Escape') {
      // Polyline: remove last point instead of cancel
      if (state.mode === 'polyline' && state.tempPoints.length > 0) {
        state.tempPoints.pop();
        IC.ui.updatePointCount(state, dom);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        if (state.tempPoints.length === 0) IC.ui.setStatus(IC.i18n.t('status.polylineMode'), dom);
        return;
      }
      if (dom.exportModal && !dom.exportModal.classList.contains('hidden')) { dom.exportModal.classList.add('hidden'); state._exportCanvas = null; }
      else if (!dom.scalebarModal.classList.contains('hidden')) dom.scalebarModal.classList.add('hidden');
      else if (dom.calDialog && !dom.calDialog.classList.contains('hidden')) { dom.calDialog.classList.add('hidden'); }
      else if (!dom.calibrationModal.classList.contains('hidden')) dom.calibrationModal.classList.add('hidden');
      else if (state.mode === 'crop') { dom.cropCancelBtn.click(); }
      else if (!dom.rotationPanel.classList.contains('hidden') && dom.rotateCancelBtn) { dom.rotateCancelBtn.click(); }
      else if (state.mode === 'annotation' && state.tempPoints.length > 0) {
        // Cancel temp point without exiting annotation mode
        state.tempPoints = [];
        state._annoCanvasPts = null;
        IC.ui.updatePointCount(state, dom);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        IC.ui.setStatus(IC.i18n.t('status.annoCancelled'), dom);
      }
      else if (state.selectedMeasurementId) IC.ui.deselectMeasurement(state, dom);
      else {
        cancelTempMeasurement(state, dom);
        state.mode = null;
        document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });
        dom.activeMode.textContent = '\u2014';
        dom.calibrationBar.classList.add('hidden');
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        IC.ui.setStatus('', dom);
      }
    }
    // Arrow key rotation
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && state.image && dom.rotationPanel && !dom.rotationPanel.classList.contains('hidden')) {
      const step = e.shiftKey ? 0.1 : 1.0;
      state.rotation += e.key === 'ArrowLeft' ? -step : step;
      if (dom.rotateAngleInput) dom.rotateAngleInput.value = state.rotation.toFixed(1);
      IC.ui.setStatus(IC.i18n.t('rotate.status') + ': ' + state.rotation.toFixed(1) + '\u00B0', dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    }
    // Text annotation rotation with arrow keys (when text is selected)
    // Skip if user is typing in an input/textarea (cursor navigation)
    if (state.selectedMeasurementId && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      var activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
      var textSel = state.measurements.find(function(m) { return m.id === state.selectedMeasurementId; });
      if (textSel && textSel.type === 'annotation' && textSel.subtype === 'text') {
        e.preventDefault();
        var step = e.shiftKey ? 0.1 : 1.0;
        textSel._textRotation = (textSel._textRotation || 0) + (e.key === 'ArrowLeft' ? -step : step);
        var rotInput = document.getElementById('propTextRotation');
        if (rotInput) rotInput.value = textSel._textRotation.toFixed(1);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        IC.ui.updateMeasurementList(state, dom);
        return;
      }
    }
    // Single-key shortcuts — skip when typing in inputs
    if (e.key === 'r' && state.image) {
      var activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') IC.ui.setMode('rotate', state, dom);
    }
    if (e.key === 'z' && (e.metaKey || e.shiftKey)) { e.preventDefault(); dom.undoBtn.click(); }
  }

  // ======================== Measurement click ========================
  function handleMeasurementClick(ix, iy, cx, cy, shiftKey, state, dom) {
    const mode = state.mode;
    if (!mode || mode === 'calibrate') return;

    // Scalebar: show modal
    if (mode === 'scalebar') {
      state._scalebarClick = { x: ix, y: iy };
      const approxPxInMM = U.pixelsToMM(state.imgNaturalW * 0.3, state.mmPerPx);
      const unit = state.unit;
      const displayVal = U.mmToDisplay(approxPxInMM, unit);
      const magnitude = Math.pow(10, Math.floor(Math.log10(displayVal)));
      dom.scalebarLength.value = (Math.round(displayVal / magnitude) * magnitude).toFixed(Math.max(0, -Math.floor(Math.log10(magnitude))));
      dom.scalebarUnit.value = unit;
      dom.scalebarModal.classList.remove('hidden');
      return;
    }

    let pt = { x: ix, y: iy };

    // Shift-snap
    if (shiftKey && state.tempPoints.length >= 1) {
      const prev = state.tempPoints[state.tempPoints.length - 1];
      const pc = IC.coords.imageToCanvas(state, prev.x, prev.y);
      const cc = IC.coords.imageToCanvas(state, ix, iy);
      const dx = cc.x - pc.x, dy = cc.y - pc.y;
      const ang = Math.atan2(dy, dx) * 180 / Math.PI;
      const snapped = U.snapAngle(ang, 15);
      const len = Math.hypot(dx, dy);
      const rad = snapped * Math.PI / 180;
      const sc = { x: pc.x + len * Math.cos(rad), y: pc.y + len * Math.sin(rad) };
      pt = IC.coords.canvasToImage(state, sc.x, sc.y);
    }

    state.tempPoints.push(pt);
    IC.ui.updatePointCount(state, dom);

    // Save canvas-space coords for rect/ellipse annotation creation
    // (image-space bounding box is wrong when image is rotated)
    if (mode === 'annotation') {
      var annoSt = state.annotationSubtype || 'line';
      if (annoSt === 'rect' || annoSt === 'ellipse') {
        if (!state._annoCanvasPts) state._annoCanvasPts = [];
        state._annoCanvasPts.push(IC.coords.imageToCanvas(state, pt.x, pt.y));
      }
    }

    let done = false;

    if (mode === 'distance' && state.tempPoints.length === 2) {
      const [p1, p2] = state.tempPoints;
      const d = U.distance(p1.x, p1.y, p2.x, p2.y);
      const m = U.pixelsToMM(d, state.mmPerPx);
      M.addMeasurement(state, 'distance', [...state.tempPoints], m, '{v}');
      done = true;
    } else if (mode === 'circle3' && state.tempPoints.length === 3) {
      const [p1, p2, p3] = state.tempPoints;
      const c = U.circumcenter(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      if (c) {
        const r = U.distance(c.x, c.y, p1.x, p1.y);
        const d = U.pixelsToMM(r * 2, state.mmPerPx);
        M.addMeasurement(state, 'circle3', [...state.tempPoints], d, 'D = {v}');
        done = true;
      } else {
        IC.ui.setStatus(IC.i18n.t('status.colinear'), dom);
        state.tempPoints = [];
        IC.ui.updatePointCount(state, dom);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        return;
      }
    } else if (mode === 'circle1' && state.tempPoints.length === 2) {
      const [c, p] = state.tempPoints;
      const r = U.distance(c.x, c.y, p.x, p.y);
      const d = U.pixelsToMM(r * 2, state.mmPerPx);
      M.addMeasurement(state, 'circle1', [...state.tempPoints], d, 'D = {v}');
      done = true;
    } else if (mode === 'angle' && state.tempPoints.length === 3) {
      const [p1, v, p2] = state.tempPoints;
      const ang = U.angleBetween(v.x, v.y, p1.x, p1.y, p2.x, p2.y);
      M.addMeasurement(state, 'angle', [...state.tempPoints], ang, '{v}');
      done = true;
    } else if (mode === 'polyline' && state.tempPoints.length >= 2) {
      var dClose = U.distance(pt.x, pt.y, state.tempPoints[0].x, state.tempPoints[0].y);
      if (dClose < 10 / state.scale) {
        var totalPx = 0;
        for (var pi = 1; pi < state.tempPoints.length; pi++) {
          totalPx += U.distance(state.tempPoints[pi-1].x, state.tempPoints[pi-1].y, state.tempPoints[pi].x, state.tempPoints[pi].y);
        }
        totalPx += U.distance(state.tempPoints[0].x, state.tempPoints[0].y, state.tempPoints[state.tempPoints.length-1].x, state.tempPoints[state.tempPoints.length-1].y);
        var totalMm = U.pixelsToMM(totalPx, state.mmPerPx);
        var pm = M.addMeasurement(state, 'polyline', [...state.tempPoints], totalMm, 'L = {v}');
        pm.closed = true;
        done = true;
      }
    } else if (mode === 'polygon' && state.tempPoints.length >= 3) {
      const d = U.distance(pt.x, pt.y, state.tempPoints[0].x, state.tempPoints[0].y);
      if (d < 10 / state.scale) {
        const a = U.polygonArea(state.tempPoints);
        const am = a / (U.pxPerMm(state.mmPerPx) ** 2);
        M.addMeasurement(state, 'polygon', [...state.tempPoints], am, 'S = {v}');
        done = true;
      }
    } else if (mode === 'annotation') {
      const st = state.annotationSubtype || 'line';
      if (st === 'text' && state.tempPoints.length === 1) {
        // 1-click text
        var am = M.addMeasurement(state, 'annotation', [...state.tempPoints], 0, '', st);
        am._textRotation = 0;
        am.label = '\\it{T}_{m} = 114.4 \\degree F';
        done = true;
      } else if (state.tempPoints.length === 2) {
        if (st === 'rect' || st === 'ellipse') {
          var am = M.addMeasurement(state, 'annotation', [...state.tempPoints], 0, '', st);
          // Compute _rectCenter and _rectSize from canvas-space coordinates
          // (image-space bounding box is wrong when image is rotated)
          if (state._annoCanvasPts && state._annoCanvasPts.length >= 2) {
            var cp1 = state._annoCanvasPts[0], cp2 = state._annoCanvasPts[1];
            var ccx = (cp1.x + cp2.x) / 2, ccy = (cp1.y + cp2.y) / 2;
            var cw = Math.abs(cp2.x - cp1.x), ch = Math.abs(cp2.y - cp1.y);
            // Convert canvas-space center to image-space for stable storage
            var imgCenter = IC.coords.canvasToImage(state, ccx, ccy);
            am._rectCenter = { x: imgCenter.x, y: imgCenter.y };
            am._rectSize = { w: cw / state.scale, h: ch / state.scale };
          } else {
            M.recalcMeasurement(state, am);
          }
          am._createdAtRotation = state.rotation;
          state._annoCanvasPts = null;
        } else {
          var am = M.addMeasurement(state, 'annotation', [...state.tempPoints], 0, '', st);
        }
        am.doubleEnded = st === 'arrow' && dom.propDoubleEnded && dom.propDoubleEnded.checked;
        am.label = M.typeLabel(am, state);
        done = true;
      }
    }

    if (done) {
      state.tempPoints = [];
      IC.ui.updatePointCount(state, dom);
      // Select the newly created measurement for editing
      var lastMeas = state.measurements[state.measurements.length - 1];
      if (lastMeas) {
        IC.ui.selectMeasurement(state, lastMeas.id, dom);
      } else {
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        IC.ui.updateMeasurementList(state, dom);
      }
    } else {
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    }
  }

  // ======================== Calibration click ========================
  function handleCalibrationClick(ix, iy, cx, cy, state, dom) {
    if (!state.image || state.mode !== 'calibrate') return;
    if (!state.calibPoint1) {
      state.calibPoint1 = { x: ix, y: iy };
      dom.calibrationBar.innerHTML = IC.i18n.t('calib.secondClick');
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    } else {
      const d = U.distance(state.calibPoint1.x, state.calibPoint1.y, ix, iy);
      const expectedLen = state._calibExpectedLen;
      const expectedUnit = state._calibExpectedUnit;
      if (expectedLen && expectedUnit) {
        const mmPerPx = U.displayToMm(expectedLen, expectedUnit) / d;
        if (IC.state.setScale(state, mmPerPx)) {
          state.mode = null;
          state.unit = expectedUnit;
          dom.unitSelect.value = expectedUnit;
          dom.calibrationBar.classList.add('hidden');
          document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });
          dom.activeMode.textContent = '\u2014';
          state._calibrationDone = true;
          const U = IC.utils;
          const ppmm = U.pxPerMm(state.mmPerPx);
          const mpu = U.displayToMm(1, state.unit);
          IC.ui.setStatus(state.imgNaturalW + '\u00D7' + state.imgNaturalH + ' px  |  DPI: ' + state.dpi + '  |  ' + (ppmm * mpu).toFixed(2) + ' px/' + U.unitDisplay(state.unit), dom);
          M.recomputeAll(state);
          IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
          IC.ui.updateMeasurementList(state, dom);
          state._calibExpectedLen = null;
          state._calibExpectedUnit = null;
          if (dom.calibWizSegDone) dom.calibWizSegDone.style.display = '';
          IC.ui.enableSavePreset(dom);
          IC.ui.enableActionButtons(dom);
          IC.storage.saveToStorage(state, dom);
          // Sync startup modal fields before showing
          if (dom.calibWizDpi) dom.calibWizDpi.value = state.dpi;
          if (dom.calibWizUnit) dom.calibWizUnit.value = state.unit;
          if (dom.calibWizSegUnit) dom.calibWizSegUnit.value = state.unit;
          dom.calibWizard.classList.remove('hidden');
          return;
        }
      }
      state._calibData = { p1: state.calibPoint1, p2: { x: ix, y: iy }, distPx: d };
      dom.calibrationModal.classList.remove('hidden');
      dom.calibrationBar.classList.add('hidden');
      state.calibPoint1 = null;
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    }
  }

  // Canvas click for calibration
  document.addEventListener('click', function(e) {
    // This handles the calibration click on canvas via delegated event
    // The actual logic is in handleCalibrationClick called from onMouseDown
    // But there's also a direct canvas click listener in the original code
    // We handle it via the mousedown above already
  });

  // ======================== Helpers ========================
  function cancelTempMeasurement(state, dom) {
    if (state.tempPoints.length > 0) {
      state.tempPoints = [];
      state._annoCanvasPts = null;
      IC.ui.updatePointCount(state, dom);
      IC.ui.setStatus(IC.i18n.t('status.undo'), dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    }
  }

  function updateDraggedPoint(state, dom) {
    if (!dragState) return;
    const m = state.measurements.find(function(x) { return x.id === dragState.measId; });
    if (!m) return;
    // Ctrl+drag: translate all points by the same delta
    if (dragState._allPts) {
      var ip2 = IC.coords.canvasToImage(state, _lastMousePos.x, _lastMousePos.y);
      var dx = ip2.x - dragState._allPts[dragState.ptIdx].x;
      var dy = ip2.y - dragState._allPts[dragState.ptIdx].y;
      for (var pi = 0; pi < m.points.length; pi++) {
        m.points[pi] = { x: dragState._allPts[pi].x + dx, y: dragState._allPts[pi].y + dy };
      }
      if (dragState._savedRC) {
        m._rectCenter = { x: dragState._savedRC.x + dx, y: dragState._savedRC.y + dy };
      }
      M.recalcMeasurement(state, m);
    } else if (dragState.offsetCanvas) {
      var newCenterCanvas = { x: _lastMousePos.x + dragState.offsetCanvas.x, y: _lastMousePos.y + dragState.offsetCanvas.y };
      var newPoint = IC.coords.canvasToImage(state, newCenterCanvas.x, newCenterCanvas.y);
      m.points[dragState.ptIdx] = { x: newPoint.x, y: newPoint.y };
      // For rect/ellipse: recompute _rectCenter/_rectSize via shared function
      if (m.type === 'annotation' && (m.subtype === 'rect' || m.subtype === 'ellipse') && m.points.length >= 2) {
        var cs = IC.coords.rectCenterSizeFromPoints(state, m);
        m._rectCenter = cs.center;
        m._rectSize = cs.size;
      } else {
        M.recalcMeasurement(state, m);
      }
    } else {
      var ip = IC.coords.canvasToImage(state, _lastMousePos.x, _lastMousePos.y);
      m.points[dragState.ptIdx] = { x: ip.x, y: ip.y };
      // For rect/ellipse: recompute _rectCenter/_rectSize via shared function
      if (m.type === 'annotation' && (m.subtype === 'rect' || m.subtype === 'ellipse') && m.points.length >= 2) {
        var cs = IC.coords.rectCenterSizeFromPoints(state, m);
        m._rectCenter = cs.center;
        m._rectSize = cs.size;
      } else {
        M.recalcMeasurement(state, m);
      }
    }
    IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    IC.ui.updateMeasurementList(state, dom);
  }

  // Expose _lastMousePos for rendering.js (temp measurement, calibration line)
  // We'll use a simple getter pattern
  function getLastMousePos() {
    return _lastMousePos;
  }

  return {
    setupEventHandlers,
    getLastMousePos,
    // For testing
    _handleMeasurementClick: handleMeasurementClick,
    _handleCalibrationClick: handleCalibrationClick
  };
})();

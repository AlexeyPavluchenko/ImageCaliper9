/* ============================================================
   ImageCaliper — Project save/load (.icp files) & PNG export
   ============================================================ */
window.IC = window.IC || {};
IC.project = (function() {

  /**
   * Generate next available filename using localStorage counter.
   * First call returns base as-is, subsequent calls add _v01, _v02, etc.
   */
  function nextFileName(base) {
    var key = 'fn_' + base;
    var n = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(n + 1));
    if (n === 0) return base;
    var dot = base.lastIndexOf('.');
    if (dot < 0) return base + '_v' + String(n).padStart(2, '0');
    return base.substring(0, dot) + '_v' + String(n).padStart(2, '0') + base.substring(dot);
  }

  /**
   * Save current project to a .icp file.
   */
  function saveProject(state, dom) {
    if (!state.image) { IC.ui.setStatus(IC.i18n.t('status.saveImage'), dom); return; }

    const c = document.createElement('canvas');
    c.width = state.imgNaturalW;
    c.height = state.imgNaturalH;
    const cx = c.getContext('2d');
    cx.drawImage(state.image, 0, 0);
    const imageData = c.toDataURL('image/png');

    const baseName = state.imageName || 'project';
    const project = {
      version: 1,
      imageName: baseName + '.png',
      imageData: imageData,
      state: {
        dpi: state.dpi,
        mmPerPx: state.mmPerPx,
        dpiAutoDetected: state.dpiAutoDetected,
        unit: state.unit,
        rotation: state.rotation,
        cropRect: state.cropRect ? { ...state.cropRect } : null,
        measurements: state.measurements.map(function(m) {
          var obj = {
            id: m.id,
            type: m.type,
            points: m.points.map(function(p) { return { x: p.x, y: p.y }; }),
            valueMm: m.valueMm,
            label: m.label,
            color: m.color,
            unit: m.unit,
            unitOverride: m.unitOverride || false,
            labelVisible: m.labelVisible !== false,
            style: m.style ? JSON.parse(JSON.stringify(m.style)) : null
          };
          if (m.closed) obj.closed = true;
          if (m.subtype) obj.subtype = m.subtype;
          if (m.doubleEnded) obj.doubleEnded = true;
          if (m._rectCenter) obj._rectCenter = { x: m._rectCenter.x, y: m._rectCenter.y };
          if (m._rectSize) obj._rectSize = { w: m._rectSize.w, h: m._rectSize.h };
          if (m._createdAtRotation !== undefined) obj._createdAtRotation = m._createdAtRotation;
          if (m._textRotation !== undefined) obj._textRotation = m._textRotation;
          return obj;
        }),
        clipMeasurements: state.clipMeasurements,
        selectionId: state.selectedMeasurementId,
        _calibrationDone: state._calibrationDone,
        nextId: state.nextId
      }
    };

    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nextFileName(baseName + '.icp');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    IC.ui.setStatus(IC.i18n.t('status.saved'), dom);
  }

  /**
   * Load a .icp project file and restore all state.
   */
  function loadProject(file, state, dom, callbacks) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const project = JSON.parse(e.target.result);
        if (!project || project.version !== 1) {
          IC.ui.setStatus(IC.i18n.t('status.invalidFormat'), dom);
          return;
        }

        const img = new Image();
        img.onload = function() {
          state.image = img;
          if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
          state.imageUrl = project.imageData;
          state.imgNaturalW = img.naturalWidth || img.width;
          state.imgNaturalH = img.naturalHeight || img.height;
          state.imageName = (project.imageName || 'project').replace(/\.[^.]+$/, '');
          state._calibrationDone = project.state._calibrationDone || false;

          if (project.state.dpi) {
            state.dpi = project.state.dpi;
            state.mmPerPx = project.state.mmPerPx || (25.4 / project.state.dpi);
            state.dpiAutoDetected = project.state.dpiAutoDetected || false;
          }
          if (project.state.unit) {
            state.unit = project.state.unit;
            dom.unitSelect.value = state.unit;
          }

          state.rotation = project.state.rotation || 0;
          if (project.state.clipMeasurements !== undefined) {
            state.clipMeasurements = project.state.clipMeasurements;
            if (dom.clipToggle) dom.clipToggle.checked = project.state.clipMeasurements;
          }
          state.guideV = null;
          state.guideH = null;
          state.cropRect = project.state.cropRect ? { ...project.state.cropRect } : null;
          state.measurements = (project.state.measurements || []).map(function(m) {
            var restored = {
              id: m.id,
              type: m.type,
              points: m.points.map(function(p) { return { x: p.x, y: p.y }; }),
              valueMm: m.valueMm,
              label: m.label,
              color: m.color,
              unit: m.unit || 'mm',
              unitOverride: m.unitOverride || false,
              labelVisible: m.labelVisible !== false,
              style: m.style ? JSON.parse(JSON.stringify(m.style)) : null
            };
            if (m.closed) restored.closed = true;
            if (m.subtype) restored.subtype = m.subtype;
            if (m.doubleEnded) restored.doubleEnded = true;
            if (m._rectCenter) restored._rectCenter = { x: m._rectCenter.x, y: m._rectCenter.y };
            if (m._rectSize) restored._rectSize = { w: m._rectSize.w, h: m._rectSize.h };
            if (m._createdAtRotation !== undefined) restored._createdAtRotation = m._createdAtRotation;
            if (m._textRotation !== undefined) restored._textRotation = m._textRotation;
            return restored;
          });
          state.nextId = project.state.nextId || state.measurements.length + 1;
          state.selectedMeasurementId = project.state.selectionId || null;

          IC.ui.resetView(state, dom);
          IC.ui.updateInfoPanel(state, dom);
          IC.ui.updateMeasurementList(state, dom);
          IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
          IC.ui.setStatus(IC.i18n.t('status.loaded') + ': ' + state.imgNaturalW + '\u00D7' + state.imgNaturalH + ' px  |  ' + state.measurements.length + ' ' + (state.measurements.length === 1 ? 'measurement' : 'measurements'), dom);
        };
        img.onerror = function() {
          IC.ui.setStatus(IC.i18n.t('status.loadError'), dom);
        };
        img.src = project.imageData;
      } catch(err) {
        IC.ui.setStatus(IC.i18n.t('status.readError') + ': ' + err.message, dom);
      }
    };
    reader.onerror = function() {
      IC.ui.setStatus(IC.i18n.t('status.readError'), dom);
    };
    reader.readAsText(file);
  }

  // ======================== PNG Export ========================

  /** Minimum print width in pixels (6 inches @ 300 DPI) */
  var MIN_PRINT_PX = 1800;

  /** Compute render parameters for a given export mode */
  function getRenderParams(state, dom, mode) {
    if (mode === 'full') {
      var factor = Math.max(1, MIN_PRINT_PX / state.imgNaturalW);
      return {
        w: Math.round(state.imgNaturalW * factor),
        h: Math.round(state.imgNaturalH * factor),
        scale: factor,
        offset: { x: 0, y: 0 },
        setDpi: true
      };
    }
    // screen
    return {
      w: dom.canvas.width,
      h: dom.canvas.height,
      scale: state.scale,
      offset: { x: state.offset.x, y: state.offset.y },
      setDpi: false
    };
  }

  /**
   * Render current view to a canvas at given size, with background.
   */
  function renderToCanvas(state, dom, width, height) {
    var bgColor = dom.bgColor ? dom.bgColor.value : '#000000';

    var c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    var ctx = c.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    IC.rendering.render(ctx, c, state, dom);

    // Overlay on solid background (fill clearRect transparency)
    var result = document.createElement('canvas');
    result.width = width;
    result.height = height;
    var rctx = result.getContext('2d');
    rctx.fillStyle = bgColor;
    rctx.fillRect(0, 0, width, height);
    rctx.drawImage(c, 0, 0);

    return result;
  }

  /**
   * Inject 300 DPI metadata (pHYs chunk) into a PNG blob.
   */
  function setPngDpi300(blob) {
    return new Promise(function(resolve) {
      var reader = new FileReader();
      reader.onload = function() {
        var bytes = new Uint8Array(reader.result);
        var ppm = Math.round(300 / 0.0254); // 11811 px per meter

        // pHYs chunk: len(4) + type(4) + X(4) + Y(4) + unit(1) + CRC(4) = 21 bytes
        var pHYs = new Uint8Array(21);
        pHYs[0]=0; pHYs[1]=0; pHYs[2]=0; pHYs[3]=9;      // length
        pHYs[4]=0x70; pHYs[5]=0x48; pHYs[6]=0x59; pHYs[7]=0x73; // 'pHYs'
        pHYs[8]=(ppm>>24)&255; pHYs[9]=(ppm>>16)&255; pHYs[10]=(ppm>>8)&255; pHYs[11]=ppm&255; // X
        pHYs[12]=(ppm>>24)&255; pHYs[13]=(ppm>>16)&255; pHYs[14]=(ppm>>8)&255; pHYs[15]=ppm&255; // Y
        pHYs[16]=1; // unit: meter
        // CRC over type + data (bytes 4..16, length 13)
        var crcVal = crc32(pHYs.subarray(4, 17));
        pHYs[17] = (crcVal >> 24) & 255;
        pHYs[18] = (crcVal >> 16) & 255;
        pHYs[19] = (crcVal >> 8) & 255;
        pHYs[20] = crcVal & 255;

        // Insert pHYs after IHDR (pos 33 = 8 sig + 25 IHDR)
        var result = new Uint8Array(bytes.length + pHYs.length);
        result.set(bytes.subarray(0, 33), 0);
        result.set(pHYs, 33);
        result.set(bytes.subarray(33), 33 + pHYs.length);

        resolve(new Blob([result], { type: 'image/png' }));
      };
      reader.readAsArrayBuffer(blob);
    });
  }

  function crc32(data) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < data.length; i++) {
      c ^= data[i];
      for (var j = 0; j < 8; j++) c = (c >>> 1) ^ (c & 1 ? 0xEDB88320 : 0);
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  /** Compute the minimal canvas-space bounding box that contains all visible content */
  function computeContentBounds(state, dom, ctx) {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // Helper to expand bounds with a point
    function expand(x, y) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }

    // 1. Image bounds: use cropRect if present, else full image corners
    if (state.cropRect) {
      expand(state.cropRect.x, state.cropRect.y);
      expand(state.cropRect.x + state.cropRect.w, state.cropRect.y + state.cropRect.h);
    } else {
      var a = state.rotation * Math.PI / 180;
      var cos = Math.cos(a), sin = Math.sin(a);
      var iw = state.imgNaturalW, ih = state.imgNaturalH;
      var cx = state.offset.x + iw * state.scale / 2;
      var cy = state.offset.y + ih * state.scale / 2;
      var hw = iw / 2 * state.scale, hh = ih / 2 * state.scale;
      expand(cx + (-hw) * cos - (-hh) * sin, cy + (-hw) * sin + (-hh) * cos);
      expand(cx + ( hw) * cos - (-hh) * sin, cy + ( hw) * sin + (-hh) * cos);
      expand(cx + ( hw) * cos - ( hh) * sin, cy + ( hw) * sin + ( hh) * cos);
      expand(cx + (-hw) * cos - ( hh) * sin, cy + (-hw) * sin + ( hh) * cos);
    }

    // 2. Measurement points + labels + visual extent
    state.measurements.forEach(function(m) {
      var s = m.style || IC.measurements.defaultStyle(m.color);

      m.points.forEach(function(p) {
        var cp = IC.coords.imageToCanvas(state, p.x, p.y);
        // Point position
        expand(cp.x, cp.y);
        // Tick extent: extends size*2 perpendicular to line
        if (s.pointStyle === 'tick') {
          var half = (s.pointSize || 5) * 2;
          expand(cp.x - half, cp.y - half);
          expand(cp.x + half, cp.y + half);
        } else if (s.pointStyle !== 'none') {
          // Circle style: radius = pointSize
          var r = (s.pointSize || 5);
          expand(cp.x - r, cp.y - r);
          expand(cp.x + r, cp.y + r);
        }
      });

      // Scalebar: include the filled rectangle
      if (m.type === 'scalebar') {
        var cp0 = IC.coords.imageToCanvas(state, m.points[0].x, m.points[0].y);
        var halfW = (m.valueMm * IC.utils.pxPerMm(state.mmPerPx) / 2) * state.scale;
        var halfH = (s.barHeight || 20) / 2;
        expand(cp0.x - halfW, cp0.y - halfH);
        expand(cp0.x + halfW, cp0.y + halfH);
      }
      // Circle measurements: include full circle extent
      if (m.type === 'circle3' && m.points.length >= 3) {
        var c3 = IC.utils.circumcenter(m.points[0].x,m.points[0].y,m.points[1].x,m.points[1].y,m.points[2].x,m.points[2].y);
        if (c3) {
          var r3 = IC.utils.distance(c3.x,c3.y,m.points[0].x,m.points[0].y) * state.scale;
          var cc3 = IC.coords.imageToCanvas(state, c3.x, c3.y);
          expand(cc3.x - r3, cc3.y - r3);
          expand(cc3.x + r3, cc3.y + r3);
        }
      }
      if (m.type === 'circle1' && m.points.length >= 2) {
        var r1 = IC.utils.distance(m.points[0].x,m.points[0].y,m.points[1].x,m.points[1].y) * state.scale;
        var cc1 = IC.coords.imageToCanvas(state, m.points[0].x, m.points[0].y);
        expand(cc1.x - r1, cc1.y - r1);
        expand(cc1.x + r1, cc1.y + r1);
      }

      // Label rectangle
      var lp = IC.measurements.getLabelCanvasPos(state, m, ctx);
      var lr = IC.measurements.getLabelRect(lp.lx, lp.ly, m.label, m.style, ctx);
      expand(lr.x, lr.y);
      expand(lr.x + lr.w, lr.y + lr.h);
    });

    // Safe floor/ceil with bounds check
    if (minX === Infinity) return null;
    return {
      x: Math.floor(minX),
      y: Math.floor(minY),
      w: Math.ceil(maxX) - Math.floor(minX),
      h: Math.ceil(maxY) - Math.floor(minY)
    };
  }

  /** Crop a canvas to a rectangle (source coords within canvas) */
  function cropCanvas(src, r) {
    var c = document.createElement('canvas');
    c.width = Math.round(r.w);
    c.height = Math.round(r.h);
    c.getContext('2d').drawImage(src, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
    return c;
  }

  /**
   * Generate export canvas — single pipeline for all 4 modes.
   * Does NOT mutate state — saves/restores everything.
   * Returns a canvas element ready for download.
   */
  function generateExport(state, dom, mode) {
    if (!state.image) return null;
    var p = getRenderParams(state, dom, mode);
    if (!p || p.w === 0 || p.h === 0) return null;

    // Save original state
    var saved = {
      scale: state.scale,
      offset: { x: state.offset.x, y: state.offset.y },
      cropRect: state.cropRect ? { ...state.cropRect } : null
    };
    var ratio = p.scale / saved.scale;

    // Save and scale styles (for print mode)
    var savedStyles = [];
    if (ratio !== 1) {
      state.measurements.forEach(function(m) {
        if (!m.style) return;
        var orig = {};
        ['fontSize','lineWidth','pointSize','barHeight'].forEach(function(k) {
          orig[k] = m.style[k];
          if (typeof orig[k] === 'number') m.style[k] = orig[k] * ratio;
        });
        savedStyles.push({ meas: m, orig: orig });
      });
    }

    // Set export state
    state.scale = p.scale;
    state.offset = { x: p.offset.x, y: p.offset.y };

    // Determine render dimensions and final crop
    var renderW = p.w, renderH = p.h;
    var finalCropRect = null;

    if (state.cropRect) {
      var exportCropRect;
      if (mode !== 'full') {
        // Screen mode: cropRect is already in canvas coords, use directly
        exportCropRect = { ...saved.cropRect };
      } else {
        // Print mode: map cropRect from display → export coordinates
        var cx1 = saved.offset.x + state.imgNaturalW * saved.scale / 2;
        var cy1 = saved.offset.y + state.imgNaturalH * saved.scale / 2;
        var cx2 = p.offset.x + state.imgNaturalW * p.scale / 2;
        var cy2 = p.offset.y + state.imgNaturalH * p.scale / 2;
        function toExport(dx, dy) {
          return { x: cx2 + (dx - cx1) * ratio, y: cy2 + (dy - cy1) * ratio };
        }
        var cr = saved.cropRect;
        var eTL = toExport(cr.x, cr.y);
        var eBR = toExport(cr.x + cr.w, cr.y + cr.h);
        exportCropRect = {
          x: Math.max(0, Math.min(eTL.x, eBR.x)),
          y: Math.max(0, Math.min(eTL.y, eBR.y)),
          w: Math.min(p.w, Math.abs(eBR.x - eTL.x)),
          h: Math.min(p.h, Math.abs(eBR.y - eTL.y))
        };
        exportCropRect.w = Math.min(p.w - exportCropRect.x, exportCropRect.w);
        exportCropRect.h = Math.min(p.h - exportCropRect.y, exportCropRect.h);
      }

      if (state.clipMeasurements) {
        // Clip ON: render with hard crop — round to int to prevent 1px aliasing
        var rx = Math.round(exportCropRect.x), ry = Math.round(exportCropRect.y);
        state.cropRect = { x: rx, y: ry, w: Math.round(exportCropRect.w), h: Math.round(exportCropRect.h) };
        finalCropRect = state.cropRect;
      } else {
        // Clip OFF: compute bounding box of (crop rect + measurements + labels)
        state.cropRect = exportCropRect;
        var measCtx = document.createElement('canvas').getContext('2d');
        var bounds = computeContentBounds(state, dom, measCtx);
        state.cropRect = null; // Don't hard-clip in render (we'll crop after)
        if (bounds && bounds.w > 10 && bounds.h > 10) {
          renderW = Math.ceil(bounds.w);
          renderH = Math.ceil(bounds.h);
          state.offset.x -= bounds.x;
          state.offset.y -= bounds.y;
          finalCropRect = { x: 0, y: 0, w: renderW, h: renderH };
        }
      }
    } else {
      // No crop: same behavior for clip ON and OFF — expand to all content
      // (user spec: "если кропа нет, то фактически повторяем вариант без клиппинга")
      state.cropRect = null;
      var measCtx2 = document.createElement('canvas').getContext('2d');
      var bounds2 = computeContentBounds(state, dom, measCtx2);
      if (bounds2 && bounds2.w > 10 && bounds2.h > 10) {
        renderW = Math.ceil(bounds2.w);
        renderH = Math.ceil(bounds2.h);
        state.offset.x -= bounds2.x;
        state.offset.y -= bounds2.y;
        finalCropRect = { x: 0, y: 0, w: renderW, h: renderH };
      }
    }

    // Render
    var canvas = renderToCanvas(state, dom, renderW, renderH);

    // Restore state
    state.scale = saved.scale;
    state.offset = saved.offset;
    state.cropRect = saved.cropRect;
    savedStyles.forEach(function(item) {
      Object.keys(item.orig).forEach(function(k) {
        item.meas.style[k] = item.orig[k];
      });
    });

    // Final crop
    if (finalCropRect && finalCropRect.w > 10 && finalCropRect.h > 10) {
      canvas = cropCanvas(canvas, finalCropRect);
    }

    return canvas;
  }

  /**
   * Export current view as PNG — thin wrapper around generateExport.
   * mode: 'screen' | 'full'
   */
  function exportImage(state, dom, mode) {
    if (!state.image) { IC.ui.setStatus(IC.i18n.t('status.noImage'), dom); return; }

    var canvas = generateExport(state, dom, mode);
    if (!canvas) return;

    var p = getRenderParams(state, dom, mode);
    canvas.toBlob(function(blob) {
      function download(b) {
        var url = URL.createObjectURL(b);
        var a = document.createElement('a');
        a.href = url;
        var suffix = p.setDpi ? '_P' : '_S';
        a.download = nextFileName((state.imageName || 'image') + suffix + '.png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        IC.ui.setStatus(IC.i18n.t('status.exportSaved'), dom);
      }
      if (p.setDpi) {
        setPngDpi300(blob).then(download);
      } else {
        download(blob);
      }
    }, 'image/png');
  }

  return { saveProject, loadProject, exportImage, generateExport, renderToCanvas };
})();

/* ============================================================
   ImageCaliper — UI panels, modals, toolbar, property controls
   ============================================================ */
window.IC = window.IC || {};
IC.ui = (function() {

  const C = IC.constants;
  const U = IC.utils;
  const M = IC.measurements;

  // ======================== DOM refs ========================
  function collectDomRefs() {
    const $ = id => document.getElementById(id);
    return {
      loadBtn: $('loadBtn'),
      canvas: $('imageCanvas'),
      canvasCtx: $('imageCanvas') ? $('imageCanvas').getContext('2d') : null,
      fileInput: $('fileInput'),
      dpiInput: $('dpiInput'),
      unitSelect: $('unitSelect'),
      applyDpiBtn: $('applyDpiBtn'),
      clearBtn: $('clearBtn'),
      undoBtn: $('undoBtn'),
      statusText: $('statusText'),
      measListContainer: $('measListContainer'),
      measurementList: $('measurementList'),
      pointCount: $('pointCount'),
      activeMode: $('activeMode'),
      noImageOverlay: $('noImageOverlay'),
      calibrationModal: $('calibrationModal'),
      magnifier: $('magnifier'),
      magnifierCanvas: $('magnifierCanvas'),
      magnifierCtx: $('magnifierCanvas') ? $('magnifierCanvas').getContext('2d') : null,
      propsPanel: $('propsPanel'),
      propColor: $('propColor'),
      propLineWidth: $('propLineWidth'),
      propLineDash: $('propLineDash'),
      propFillColor: $('propFillColor'),
      propFillOpacity: $('propFillOpacity'),
      propFontFamily: $('propFontFamily'),
      propFontSize: $('propFontSize'),
      propFontColor: $('propFontColor'),
      propLabelBg: $('propLabelBg'),
      propLabelBgOpacity: $('propLabelBgOpacity'),
      propPointStyle: $('propPointStyle'),
      propPointSize: $('propPointSize'),
      propFillRow: $('propFillRow'),
      propLabelFormat: $('propLabelFormat'),
      propColorRow: $('propColorRow'),
      propUnitRow: $('propUnitRow'),
      propUnitOverride: $('propUnitOverride'),
      propUnitSelect: $('propUnitSelect'),
      propBarHeight: $('propBarHeight'),
      propLabelVisible: $('propLabelVisible'),
      propBold: $('propBold'),
      propItalic: $('propItalic'),
      rotationBar: $('rotationBar'),
      doneRotateBtn: $('doneRotateBtn'),
      rotationPanel: $('rotationPanel'),
      rotateAngleInput: $('rotateAngleInput'),
      rotateLeftBtn: $('rotateLeftBtn'),
      rotateRightBtn: $('rotateRightBtn'),
      rotateFineLeftBtn: $('rotateFineLeftBtn'),
      rotateFineRightBtn: $('rotateFineRightBtn'),
      rotateDoneBtn: $('rotateDoneBtn'),
      rotateCancelBtn: $('rotateCancelBtn'),
      rotateResetBtn: $('rotateResetBtn'),
      cropPanel: $('cropPanel'),
      cropAspect: $('cropAspect'),
      cropWidth: $('cropWidth'),
      cropHeight: $('cropHeight'),
      cropUnit: $('cropUnit'),
      cropApplyBtn: $('cropApplyBtn'),
      cropCancelBtn: $('cropCancelBtn'),
      cropResetBtn: $('cropResetBtn'),
      cropInfo: $('cropInfo'),
      calibWizard: $('calibWizard'),
      calibWizAngle: $('calibWizAngle'),
      calibWizMeasure: $('calibWizMeasure'),
      calibWizOk: $('calibWizOk'),
      dpiDoneIndicator: $('dpiDoneIndicator'),
      calibDoneIndicator: $('calibDoneIndicator'),
      infoBtn: $('infoBtn'),
      infoModal: $('infoModal'),
      infoModalBody: $('infoModalBody'),
      closeInfoModal: $('closeInfoModal'),
      bgColor: $('bgColor'),
      clipToggle: $('clipToggle'),
      labelToggle: $('labelToggle'),
      calDialog: $('calibrationDialog'),
      calDpiInput: $('calDpiInput'),
      calDpiBtn: $('calDpiBtn'),
      calDpiDone: $('calDpiDone'),
      calSegBtn: $('calSegBtn'),
      calSegDone: $('calSegDone'),
      calDoneBtn: $('calDoneBtn'),
      bgBlackBtn: $('bgBlackBtn'),
      bgWhiteBtn: $('bgWhiteBtn'),
      scalebarModal: $('scalebarModal'),
      closeScalebarModal: $('closeScalebarModal'),
      scalebarLength: $('scalebarLength'),
      scalebarUnit: $('scalebarUnit'),
      scalebarHeight: $('scalebarHeight'),
      applyScalebarBtn: $('applyScalebarBtn'),
      propBarValue: $('propBarValue'),
      propBarUnit: $('propBarUnit'),
      propBarBorderColor: $('propBarBorderColor'),
      propBarBorderWidth: $('propBarBorderWidth'),
      propBarBorderRow: $('propBarBorderRow'),
      propBarBorderOpacityRow: $('propBarBorderOpacityRow'),
      propBarBorderOpacity: $('propBarBorderOpacity'),
      propBarValueRow: $('propBarValueRow'),
      calibWizDpi: $('calibWizDpi'),
      calibWizDpiBtn: $('calibWizDpiBtn'),
      calibWizDpiDone: $('calibWizDpiDone'),
      calibWizPx: $('calibWizPx'),
      calibWizLen: $('calibWizLen'),
      calibWizUnit: $('calibWizUnit'),
      calibWizRatioBtn: $('calibWizRatioBtn'),
      calibWizRatioDone: $('calibWizRatioDone'),
      calibWizSegLen: $('calibWizSegLen'),
      calibWizSegUnit: $('calibWizSegUnit'),
      calibWizSegBtn: $('calibWizSegBtn'),
      calibWizSegDone: $('calibWizSegDone'),
      calibWizPreset: $('calibWizPreset'),
      calibWizPresetBtn: $('calibWizPresetBtn'),
      calibWizPresetDone: $('calibWizPresetDone'),
      calibWizSavePreset: $('calibWizSavePreset'),
      calibWizDeletePreset: $('calibWizDeletePreset'),
      closeModal: $('closeModal'),
      applyCalibBtn: $('applyCalibBtn'),
      calibLength: $('calibLength'),
      calibUnit: $('calibUnit'),
      calibrationBar: $('calibrationBar'),
      propSaveDefault: $('propSaveDefault'),
      propApplyAll: $('propApplyAll'),
      saveProjectBtn: $('saveProjectBtn'),
      exportBtn: $('exportBtn'),
      exportModal: $('exportModal'),
      exportModalOk: $('exportModalOk'),
      exportModalCancel: $('exportModalCancel'),
      exportCopyBtn: $('exportCopyBtn'),
      canvasWrapper: $('canvasWrapper'),
      toolbar: $('toolbar'),
      annoBtn: $('annoBtn'),
      annoDropdown: $('annoDropdown'),
      annoLabel: $('annoLabel'),
      propDoubleEnded: $('propDoubleEnded'),
      propDoubleEndedRow: $('propDoubleEndedRow'),
      propTextRotation: $('propTextRotation'),
      propTextRotationRow: $('propTextRotationRow'),
      textRotLeftBtn: $('textRotLeftBtn'),
      textRotRightBtn: $('textRotRightBtn'),
      propTextContent: $('propTextContent'),
      propTextContentRow: $('propTextContentRow'),
      langSelect: $('langSelect'),
    };
  }

  // ======================== Status & info ========================
  function setStatus(msg, dom) {
    dom.statusText.textContent = msg;
  }

  function updatePointCount(state, dom) {
    if (dom.pointCount) dom.pointCount.textContent = state.tempPoints.length;
  }

  function updateInfoPanel(state, dom) {
    // Disabled — info shown via modal. Was: dom.infoPanel.innerHTML = ...
  }

  // ======================== Measurement list ========================
  function getTypeIcon(m) {
    if (m.type === 'annotation') {
      if (m.subtype === 'text') return '🔤';
      if (m.subtype === 'rect') return '□';
      if (m.subtype === 'ellipse') return '⬭';
      if (m.subtype === 'line') return '—';
      return m.subtype === 'arrow' ? (m.doubleEnded ? '↔' : '→') : '—';
    }
    if (m.type === 'scalebar') return '▬';
    if (m.type === 'distance') return '📏';
    if (m.type === 'angle') return '∠';
    if (m.type === 'circle3' || m.type === 'circle1') return '⭕';
    if (m.type === 'polygon') return '⬡';
    if (m.type === 'polyline') return '📐';
    return '·';
  }

  function updateMeasurementList(state, dom) {
    dom.measurementList.innerHTML = '';
    if (state.measurements.length === 0) {
      dom.measurementList.innerHTML = '<p class="hint">' + IC.i18n.t('ui.noMeasurements') + '</p>';
      return;
    }
    var dragFromId = null;
    [...state.measurements].reverse().forEach(function(m) {
      const div = document.createElement('div');
      div.className = 'measurement-item' + (m.id === state.selectedMeasurementId ? ' selected' : '');
      div.style.borderLeftColor = m.style ? m.style.color : m.color;
      div.style.borderLeftWidth = '3px';
      div.draggable = true;
      // Annotations: typeLabel already includes icon prefix (→ Стрелка, 🔤 Текст)
      // Non-annotations: show typeIcon separately
      var isAnno = m.type === 'annotation';
      var typeIcon = isAnno ? '' : getTypeIcon(m);
      var displayLabel = isAnno ? IC.measurements.typeLabel(m, state) : m.label;
      div.innerHTML = '<span class="m-type-icon">' + typeIcon + '</span><span class="m-value">' + displayLabel + '</span><span class="m-delete" data-id="' + m.id + '">&times;</span>';
      div.querySelector('.m-delete').addEventListener('click', function(e) {
        e.stopPropagation();
        var wasSelected = state.selectedMeasurementId === m.id;
        M.deleteMeasurement(state, m.id);
        if (wasSelected) {
          dom.propsPanel.classList.add('hidden');
        }
        updateMeasurementList(state, dom);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      });
      div.addEventListener('dragstart', function(e) {
        dragFromId = m.id;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(m.id));
        div.style.opacity = '0.5';
      });
      div.addEventListener('dragend', function() {
        div.style.opacity = '';
        document.querySelectorAll('.measurement-item').forEach(function(el) { el.classList.remove('drag-over'); });
      });
      div.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        document.querySelectorAll('.measurement-item').forEach(function(el) { el.classList.remove('drag-over'); });
        if (m.id !== dragFromId) div.classList.add('drag-over');
      });
      div.addEventListener('dragleave', function() {
        div.classList.remove('drag-over');
      });
      div.addEventListener('drop', function(e) {
        e.preventDefault();
        div.classList.remove('drag-over');
        var fromId = parseInt(e.dataTransfer.getData('text/plain'));
        var toId = m.id;
        if (fromId === toId) return;
        var arr = state.measurements;
        var fromIdx = arr.findIndex(function(x) { return x.id === fromId; });
        var toIdx = arr.findIndex(function(x) { return x.id === toId; });
        if (fromIdx === -1 || toIdx === -1) return;
        var item = arr.splice(fromIdx, 1)[0];
        var newToIdx = arr.findIndex(function(x) { return x.id === toId; });
        arr.splice(newToIdx, 0, item);
        updateMeasurementList(state, dom);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      });
      div.addEventListener('click', function() {
        if (state.selectedMeasurementId === m.id) deselectMeasurement(state, dom);
        else selectMeasurement(state, m.id, dom);
      });
      dom.measurementList.appendChild(div);
    });
  }

  // ======================== Selection ========================
  function selectMeasurement(state, id, dom) {
    state.selectedMeasurementId = id;
    const m = state.measurements.find(function(x) { return x.id === id; });
    if (m) {
      if (!m.style) m.style = M.defaultStyle(m.color);
      const s = m.style;
      dom.propColor.value = s.color;
      dom.propLineWidth.value = s.lineWidth;
      dom.propLineDash.value = s.lineDash;
      dom.propFillColor.value = s.fillColor;
      dom.propFillOpacity.value = Math.round(s.fillOpacity * 100);
      dom.propFontFamily.value = s.fontFamily;
      dom.propFontSize.value = s.fontSize;
      dom.propFontColor.value = s.fontColor;
      dom.propLabelBg.value = s.labelBg;
      dom.propLabelBgOpacity.value = Math.round((s.labelBgOpacity || 0.7) * 100);
      dom.propLabelFormat.value = s.labelFormat || '{v}';
      dom.propPointStyle.value = s.pointStyle || 'none';
      dom.propPointSize.value = s.pointSize || 5;
      if (dom.propBarHeight) dom.propBarHeight.value = s.barHeight || 20;
      if (dom.propLabelVisible) dom.propLabelVisible.checked = m.labelVisible !== false;
      if (dom.propBold) dom.propBold.style.fontWeight = (s.fontWeight || 'bold') === 'bold' ? '900' : '400';
      if (dom.propItalic) dom.propItalic.style.fontStyle = (s.fontStyle || 'normal') === 'italic' ? 'italic' : 'normal';
      dom.propsPanel.classList.remove('hidden');
      // Apply visibility rules from properties module
      if (IC.properties) IC.properties.applyVisibility(m, dom);

      // Scalebar: set values
      if (m.type === 'scalebar') {
        if (dom.propBarValue) dom.propBarValue.value = U.mmToDisplay(m.valueMm, m.unit).toFixed(4);
        if (dom.propBarUnit) dom.propBarUnit.value = m.unit;
        if (dom.propBarBorderColor) dom.propBarBorderColor.value = s.barBorderColor || s.color;
        if (dom.propBarBorderWidth) dom.propBarBorderWidth.value = s.barBorderWidth || 1;
        if (dom.propBarBorderOpacity) dom.propBarBorderOpacity.value = Math.round((s.barBorderOpacity !== undefined ? s.barBorderOpacity : 1) * 100);
        if (dom.propBarBorderOpacityRow) dom.propBarBorderOpacityRow.style.display = '';
      }
      // Annotation: set double-ended
      if (m.type === 'annotation' && dom.propDoubleEnded) {
        dom.propDoubleEnded.checked = m.doubleEnded || false;
      }
      // Text: set rotation and content
      if (m.type === 'annotation' && m.subtype === 'text') {
        if (dom.propTextRotation) dom.propTextRotation.value = (m._textRotation || 0).toFixed(1);
        if (dom.propTextContent) dom.propTextContent.value = m.label || '';
      }
      // Per-measurement unit override
      if (dom.propUnitOverride) dom.propUnitOverride.checked = m.unitOverride || false;
      if (dom.propUnitSelect) {
        dom.propUnitSelect.value = m.unit || state.unit;
        dom.propUnitSelect.disabled = !m.unitOverride;
      }
      var hint = '';
      if (m.points.length > 1 || (m.type === 'annotation' && m.subtype !== 'text')) {
        hint = ' — ' + IC.i18n.t('status.dragHint');
      }
      setStatus(IC.i18n.t('status.selected') + ': ' + (m.label || '') + hint, dom);
    }
    IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    updateMeasurementList(state, dom);
  }

  function deselectMeasurement(state, dom) {
    state.selectedMeasurementId = null;
    dom.propsPanel.classList.add('hidden');
    setStatus(IC.i18n.t('status.deselected'), dom);
    IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    updateMeasurementList(state, dom);
  }

  function setBlockedUI(state, dom, blocked) {
    var sel = blocked ? 'add' : 'remove';
    [dom.loadBtn, dom.saveProjectBtn, dom.exportBtn, dom.clearBtn, dom.undoBtn].forEach(function(el) {
      if (el) el.classList[sel]('blocked');
    });
    document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList[sel]('blocked'); });
  }

  // ======================== Mode ========================
  function setupModeButtons(state, dom) {
    document.querySelectorAll('.mode-btn').forEach(function(btn) {
      if (btn.id === 'annoBtn') return; // handled separately (dropdown + custom toggle)
      btn.addEventListener('click', function() {
        // Block switching modes during rotation or crop
        if (!dom.rotationPanel.classList.contains('hidden') && btn.dataset.mode !== 'rotate') return;
        if (state.mode === 'crop' && btn.dataset.mode !== 'crop') return;
        setMode(btn.dataset.mode, state, dom);
      });
    });
  }

  function setMode(mode, state, dom) {
    document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });
    // Clear selected measurement when switching tools
    if (state.selectedMeasurementId) deselectMeasurement(state, dom);
    // Show measurement list when exiting any mode back to idle
    if (dom.measListContainer) dom.measListContainer.classList.remove('hidden');
    if (mode === state.mode) {
      state.mode = null;
      state.tempPoints = [];
      state.calibPoint1 = null;
      dom.calibrationBar.classList.add('hidden');
      dom.rotationBar.classList.add('hidden');
      dom.rotationPanel.classList.add('hidden');
      dom.activeMode.textContent = '\u2014';
      dom.canvas.style.cursor = 'grab';
      setStatus('', dom);
      setBlockedUI(state, dom, false);
      dom.cropPanel.classList.add('hidden');
      dom.propsPanel.classList.add('hidden');
      if (state._cropRectSaved != null) {
        state.cropRect = state._cropRectSaved;
        state._cropRectSaved = null;
      }
      // Restore saved view (from crop mode entry) instead of resetView
      if (state._cropViewSaved) {
        state.scale = state._cropViewSaved.scale;
        state.offset = { x: state._cropViewSaved.offset.x, y: state._cropViewSaved.offset.y };
        state._cropViewSaved = null;
      }
      state._cropDrawRect = null;
      state._cropDragging = false;
      state._cropMoving = false;
      state._cropResizing = false;
      state._cropResizeHandle = null;
      state._cropStartRect = null;
      state._cropStartMouse = null;
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      return;
    }
    if (mode === 'rotate') {
      state.mode = null;
      state.tempPoints = [];
      state.calibPoint1 = null;
      dom.calibrationBar.classList.add('hidden');
      if (!state.image) { setStatus(IC.i18n.t('status.loadImageFirst'), dom); IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); return; }
      deselectMeasurement(state, dom);
      if (dom.measListContainer) dom.measListContainer.classList.add('hidden');
      state._savedRotation = state.rotation;
      state.guideV = dom.canvas.width / 2;
      state.guideH = dom.canvas.height / 2;
      dom.rotationBar.classList.add('hidden');
      setBlockedUI(state, dom, true);
      dom.rotationPanel.classList.remove('hidden');
      if (dom.rotateAngleInput) dom.rotateAngleInput.value = state.rotation.toFixed(1);
      document.getElementById('toolbar').classList.add('rotating');
      document.querySelector('.mode-btn[data-mode="rotate"]').classList.add('active');
      dom.activeMode.textContent = IC.i18n.t('tool.rotate');
      setStatus(IC.i18n.t('rotate.hint'), dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      return;
    }
    dom.rotationBar.classList.add('hidden');

    if (mode === 'crop') {
      deselectMeasurement(state, dom);
      if (dom.measListContainer) dom.measListContainer.classList.add('hidden');
      setBlockedUI(state, dom, true);
      state.mode = 'crop';
      state.tempPoints = [];
      state.calibPoint1 = null;
      dom.calibrationBar.classList.add('hidden');
      document.querySelector('.mode-btn[data-mode="crop"]').classList.add('active');
      dom.canvas.style.cursor = 'crosshair';
      dom.activeMode.textContent = IC.i18n.t('tool.crop');
      dom.propsPanel.classList.add('hidden');
      dom.cropPanel.classList.remove('hidden');
      state._cropRectSaved = state.cropRect;
      state._cropViewSaved = { scale: state.scale, offset: { ...state.offset } };
      // Keep existing crop rect for editing instead of clearing it
      if (state.cropRect) {
        state._cropDrawRect = { ...state.cropRect };
        state.cropRect = null;
      } else {
        state.cropRect = null;
        state._cropDrawRect = null;
      }
      state._cropDragging = false;
      state._cropMoving = false;
      resetView(state, dom);
      setStatus(IC.i18n.t('status.cropHint'), dom);
      updateCropPanel(state, dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      return;
    }

    dom.cropPanel.classList.add('hidden');
    state.mode = mode;
    state.tempPoints = [];
    state.calibPoint1 = null;
    dom.calibrationBar.classList.add('hidden');
    // annotation button has no data-mode, active class is handled in click handler
    if (mode !== 'annotation') {
      document.querySelector('.mode-btn[data-mode="' + mode + '"]').classList.add('active');
    }
    dom.canvas.style.cursor = 'crosshair';
    const labels = {
      'distance': IC.i18n.t('tool.distance'), 'circle3': IC.i18n.t('tool.circle3'),
      'circle1': IC.i18n.t('tool.circle1'), 'polyline': IC.i18n.t('tool.polyline'),
      'polygon': IC.i18n.t('tool.polygon'),
      'angle': IC.i18n.t('tool.angle'), 'calibrate': IC.i18n.t('tool.calibrate'),
      'scalebar': IC.i18n.t('tool.scalebar'),
      'annotation': IC.i18n.t('tool.annotation')
    };
    dom.activeMode.textContent = labels[mode] || mode;
    if (mode === 'calibrate') {
      // Show startup modal with single "Готово" button instead of old calDialog
      showCalibWizard(state, dom, true);
      return;
    }
    if (mode === 'polyline') {
      setStatus(IC.i18n.t('polyline.hint'), dom);
    } else {
      setStatus(IC.i18n.t('ui.mode') + ': ' + (labels[mode] || mode), dom);
    }
    updatePointCount(state, dom);
    IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
  }

  // ======================== View ========================
  function resetView(state, dom) {
    if (!state.image) return;
    const wrap = dom.canvasWrapper;
    const w = wrap.clientWidth, h = wrap.clientHeight;
    dom.canvas.width = w;
    dom.canvas.height = h;
    const s = Math.min(w / state.imgNaturalW, h / state.imgNaturalH, 1);
    state.fitScale = s;
    state.scale = s;
    state.offset = { x: (w - state.imgNaturalW * s) / 2, y: (h - state.imgNaturalH * s) / 2 };
    dom.noImageOverlay.style.display = 'none';
  }

  // ======================== Properties panel ========================
  function setupPropertiesPanel(state, dom) {
    function setProp(id, fn) {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', fn);
    }
    setProp('propLabelFormat', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { var u = (m.unitOverride && m.unit) ? m.unit : state.unit; m.style.labelFormat = this.value; m.label = U.formatLabel(this.value, m.valueMm, u, m.type); IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); updateMeasurementList(state, dom); }
    });
    setProp('propColor', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) {
        m.style.color = this.value; m.color = this.value;
        // For scalebar, sync bar border color with main color
        if (m.type === 'scalebar') m.style.barBorderColor = this.value;
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); updateMeasurementList(state, dom);
      }
    });
    setProp('propLineWidth', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.style.lineWidth = Number(this.value); IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    setProp('propLineDash', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.style.lineDash = this.value; IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    setProp('propFillColor', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.style.fillColor = this.value; IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    setProp('propFillOpacity', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.style.fillOpacity = Number(this.value) / 100; IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    setProp('propFontFamily', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.style.fontFamily = this.value; IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    setProp('propFontSize', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.style.fontSize = Number(this.value); IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    setProp('propFontColor', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.style.fontColor = this.value; IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    setProp('propLabelBg', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.style.labelBg = this.value; IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    setProp('propLabelBgOpacity', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.style.labelBgOpacity = Number(this.value) / 100; IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    setProp('propPointSize', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.style.pointSize = Number(this.value); IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    setProp('propPointStyle', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.style.pointStyle = this.value; IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    setProp('propBarHeight', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.style.barHeight = Number(this.value); IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    // Per-measurement unit override
    if (dom.propUnitOverride) dom.propUnitOverride.addEventListener('change', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) {
        m.unitOverride = this.checked;
        if (dom.propUnitSelect) dom.propUnitSelect.disabled = !this.checked;
        if (this.checked && dom.propUnitSelect) m.unit = dom.propUnitSelect.value;
        var effectiveUnit = m.unitOverride ? m.unit : state.unit;
        m.label = U.formatLabel(m.style.labelFormat || '{v}', m.valueMm, effectiveUnit, m.type);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        updateMeasurementList(state, dom);
      }
    });
    if (dom.propUnitSelect) dom.propUnitSelect.addEventListener('change', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) {
        m.unit = this.value;
        m.label = U.formatLabel(m.style.labelFormat || '{v}', m.valueMm, m.unit, m.type);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        updateMeasurementList(state, dom);
      }
    });
    setProp('propBarValue', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) {
        var val = parseFloat(this.value);
        if (val > 0) { m.valueMm = U.displayToMm(val, m.unit); m.label = U.formatLabel(m.style.labelFormat || '{v}', m.valueMm, m.unit, m.type); IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); updateMeasurementList(state, dom); }
      }
    });
    setProp('propBarUnit', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) {
        m.unit = this.value;
        dom.propBarValue.value = U.mmToDisplay(m.valueMm, m.unit).toFixed(4);
        m.label = U.formatLabel(m.style.labelFormat || '{v}', m.valueMm, m.unit, m.type);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        updateMeasurementList(state, dom);
      }
    });
    setProp('propBarBorderColor', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.style.barBorderColor = this.value; IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    setProp('propBarBorderWidth', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.style.barBorderWidth = Number(this.value); IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    setProp('propBarBorderOpacity', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.style.barBorderOpacity = Number(this.value) / 100; IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    // Label visible toggle
    if (dom.propLabelVisible) dom.propLabelVisible.addEventListener('change', function() {
      var m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m) { m.labelVisible = this.checked; IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
    });
    // Bold/Italic toggle
    [dom.propBold, dom.propItalic].forEach(function(btn) {
      if (btn) btn.addEventListener('click', function() {
        const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
        if (!m) return;
        if (this === dom.propBold) {
          m.style.fontWeight = (m.style.fontWeight || 'bold') === 'bold' ? 'normal' : 'bold';
          this.style.fontWeight = m.style.fontWeight === 'bold' ? '900' : '400';
        } else {
          m.style.fontStyle = (m.style.fontStyle || 'normal') === 'italic' ? 'normal' : 'italic';
          this.style.fontStyle = m.style.fontStyle === 'italic' ? 'italic' : 'normal';
        }
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      });
    });
    // Save default style
    if (dom.propSaveDefault) dom.propSaveDefault.addEventListener('click', function() {
      const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (!m || !m.style) return;
      if (!state.defaultStyles) state.defaultStyles = {};
      const saved = JSON.parse(JSON.stringify(m.style));
      delete saved.color;
      delete saved.labelOffX;
      delete saved.labelOffY;
      // Use subtype key for annotations: 'annotation:arrow', 'annotation:line'
      var key = m.type === 'annotation' ? 'annotation:' + m.subtype : m.type;
      state.defaultStyles[key] = saved;
      var label = m.type === 'annotation' ? M.typeLabel(m, state) : m.type;
      IC.storage.saveToStorage(state, dom);
      setStatus(IC.i18n.t('status.styleSaved'), dom);
    });
    // Apply to all same type
    if (dom.propApplyAll) dom.propApplyAll.addEventListener('click', function() {
      const src = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (!src || !src.style) return;
      const t = src.type;
      const st = t === 'annotation' ? src.subtype : null;
      state.measurements.forEach(function(m) {
        // For annotations: only apply to same subtype, not all annotations
        if (m.type === t && (st === null || m.subtype === st) && m.id !== src.id) {
          if (!m.style) m.style = M.defaultStyle(m.color);
          Object.keys(src.style).forEach(function(k) {
            if (k !== 'labelOffX' && k !== 'labelOffY') {
              m.style[k] = src.style[k];
            }
          });
          M.recalcMeasurement(state, m);
        }
      });
      updateMeasurementList(state, dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      var label = src.type === 'annotation' ? M.typeLabel(src, state) : t;
      setStatus(IC.i18n.t('status.styleApplied'), dom);
    });
  }

  // ======================== Background color ========================
  function setBgColor(color, dom) {
    dom.canvas.style.background = color;
    dom.canvasWrapper.style.background = color;
    if (dom.bgColor) dom.bgColor.value = color;
  }

  // ======================== Crop panel ========================
  function updateCropPanel(state, dom) {
    const r = state._cropDrawRect;
    if (r && r.w > 0 && r.h > 0) {
      const unit = dom.cropUnit.value;
      let dispW, dispH;
      if (unit === 'px') {
        dispW = Math.round(r.w / state.scale);
        dispH = Math.round(r.h / state.scale);
      } else {
        dispW = U.mmToDisplay(U.pixelsToMM(r.w / state.scale, state.mmPerPx), unit);
        dispH = U.mmToDisplay(U.pixelsToMM(r.h / state.scale, state.mmPerPx), unit);
      }
      dom.cropWidth.value = dispW.toFixed(unit === 'px' ? 0 : 2);
      dom.cropHeight.value = dispH.toFixed(unit === 'px' ? 0 : 2);
      if (dom.cropInfo) dom.cropInfo.textContent = Math.round(r.w / state.scale) + '\u00D7' + Math.round(r.h / state.scale) + ' px';
    }
  }

  function setupCropPanel(state, dom) {
    dom.cropWidth.addEventListener('input', function() {
      if (!state._cropDrawRect) return;
      const val = parseFloat(dom.cropWidth.value);
      if (isNaN(val) || val <= 0) return;
      const unit = dom.cropUnit.value;
      let px;
      if (unit === 'px') px = val * state.scale;
      else px = U.displayToMm(val, unit) * U.pxPerMm(state.mmPerPx) * state.scale;
      state._cropDrawRect.w = px;
      const asp = parseFloat(dom.cropAspect.value);
      if (dom.cropAspect.value !== 'free' && !isNaN(asp) && asp > 0) {
        state._cropDrawRect.h = px / asp;
        const hUnit = unit === 'px' ? px / state.scale : U.mmToDisplay(U.pixelsToMM(px / asp / state.scale, state.mmPerPx), unit);
        dom.cropHeight.value = hUnit.toFixed(unit === 'px' ? 0 : 2);
      }
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    });
    dom.cropHeight.addEventListener('input', function() {
      if (!state._cropDrawRect) return;
      const val = parseFloat(dom.cropHeight.value);
      if (isNaN(val) || val <= 0) return;
      const unit = dom.cropUnit.value;
      let px;
      if (unit === 'px') px = val * state.scale;
      else px = U.displayToMm(val, unit) * U.pxPerMm(state.mmPerPx) * state.scale;
      state._cropDrawRect.h = px;
      const asp = parseFloat(dom.cropAspect.value);
      if (dom.cropAspect.value !== 'free' && !isNaN(asp) && asp > 0) {
        state._cropDrawRect.w = px * asp;
        const wUnit = unit === 'px' ? px * asp / state.scale : U.mmToDisplay(U.pixelsToMM(px * asp / state.scale, state.mmPerPx), unit);
        dom.cropWidth.value = wUnit.toFixed(unit === 'px' ? 0 : 2);
      }
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    });
    dom.cropUnit.addEventListener('change', function() { updateCropPanel(state, dom); });
    dom.cropAspect.addEventListener('change', function() {
      const r = state._cropDrawRect;
      if (!r || r.w <= 0 || r.h <= 0) return;
      const asp = parseFloat(dom.cropAspect.value);
      if (dom.cropAspect.value !== 'free' && !isNaN(asp) && asp > 0) {
        state._cropDrawRect.h = r.w / asp;
        updateCropPanel(state, dom);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      }
    });
    dom.cropApplyBtn.addEventListener('click', function() {
      if (!state._cropDrawRect || state._cropDrawRect.w < 2 || state._cropDrawRect.h < 2) {
        // Nothing drawn — clear crop and exit
        state.cropRect = null;
        state._cropRectSaved = null;
        state._cropDrawRect = null;
        state._cropDragging = false;
        state._cropMoving = false;
        setBlockedUI(state, dom, false);
        state.mode = null;
        if (dom.measListContainer) dom.measListContainer.classList.remove('hidden');
        dom.cropPanel.classList.add('hidden');
        document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });
        dom.activeMode.textContent = '\u2014';
        dom.canvas.style.cursor = 'grab';
        setStatus(IC.i18n.t('status.cropReset'), dom);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        return;
      }
      const r = state._cropDrawRect;
      if (r.w < 5 || r.h < 5) { setStatus(IC.i18n.t('status.cropTooSmall'), dom); return; }
      state.cropRect = { x: r.x, y: r.y, w: r.w, h: r.h };
      state._cropRectSaved = null;
      state._cropDrawRect = null;
      state._cropDragging = false;
      state._cropMoving = false;
      setBlockedUI(state, dom, false);
      state.mode = null;
      if (dom.measListContainer) dom.measListContainer.classList.remove('hidden');
      dom.cropPanel.classList.add('hidden');
      document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });
      dom.activeMode.textContent = '\u2014';
      dom.canvas.style.cursor = 'grab';
      setStatus(IC.i18n.t('status.cropApplied') + ': ' + Math.round(r.w) + '\u00D7' + Math.round(r.h) + ' px', dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    });
    dom.cropCancelBtn.addEventListener('click', function() {
      state.cropRect = state._cropRectSaved;
      state._cropRectSaved = null;
      if (state._cropViewSaved) {
        state.scale = state._cropViewSaved.scale;
        state.offset = state._cropViewSaved.offset;
        state._cropViewSaved = null;
      }
      state._cropDrawRect = null;
      state._cropDragging = false;
      state._cropMoving = false;
      setBlockedUI(state, dom, false);
      state.mode = null;
      if (dom.measListContainer) dom.measListContainer.classList.remove('hidden');
      dom.cropPanel.classList.add('hidden');
      document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });
      dom.activeMode.textContent = '\u2014';
      dom.canvas.style.cursor = 'grab';
      setStatus(IC.i18n.t('status.cropCancelled'), dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    });
    if (dom.cropResetBtn) dom.cropResetBtn.addEventListener('click', function() {
      state.cropRect = null;
      state._cropRectSaved = null;
      state._cropDrawRect = null;
      state._cropDragging = false;
      state._cropMoving = false;
      setBlockedUI(state, dom, false);
      state.mode = null;
      if (dom.measListContainer) dom.measListContainer.classList.remove('hidden');
      dom.cropPanel.classList.add('hidden');
      document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });
      dom.activeMode.textContent = '\u2014';
      dom.canvas.style.cursor = 'grab';
      setStatus(IC.i18n.t('status.cropReset'), dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    });
  }

  // ======================== Rotation panel ========================
  function setupRotationPanel(state, dom) {
    function updateRotatePanel() {
      if (dom.rotateAngleInput) dom.rotateAngleInput.value = state.rotation.toFixed(1);
    }
    [dom.rotateLeftBtn, dom.rotateRightBtn, dom.rotateFineLeftBtn, dom.rotateFineRightBtn].forEach(function(btn) {
      if (btn) btn.addEventListener('click', function() {
        if (!state.image) return;
        const step = btn === dom.rotateLeftBtn ? -10 : btn === dom.rotateRightBtn ? 10 :
                     btn === dom.rotateFineLeftBtn ? -1 : 1;
        state.rotation += step;
        updateRotatePanel();
        setStatus(IC.i18n.t('rotate.status') + ': ' + state.rotation.toFixed(1) + '\u00B0', dom);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      });
    });
    if (dom.rotateAngleInput) {
      dom.rotateAngleInput.addEventListener('change', function() {
        const v = parseFloat(this.value);
        if (!isNaN(v)) { state.rotation = v; IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom); }
      });
      dom.rotateAngleInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && dom.rotateDoneBtn) dom.rotateDoneBtn.click();
      });
    }
    if (dom.rotateDoneBtn) dom.rotateDoneBtn.addEventListener('click', function() {
      state.startupMode = false;
      state.guideV = null;
      state.guideH = null;
      state.calibPoint1 = null;
      setBlockedUI(state, dom, false);
      if (dom.measListContainer) dom.measListContainer.classList.remove('hidden');
      document.getElementById('toolbar').classList.remove('rotating');
      dom.rotationBar.classList.add('hidden');
      dom.rotationPanel.classList.add('hidden');
      document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });
      dom.activeMode.textContent = '\u2014';
      dom.canvas.style.cursor = 'grab';
      setStatus(IC.i18n.t('status.rotationDone'), dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    });
    if (dom.rotateResetBtn) dom.rotateResetBtn.addEventListener('click', function() {
      state.rotation = 0;
      if (dom.rotateAngleInput) dom.rotateAngleInput.value = '0.0';
      setStatus(IC.i18n.t('status.rotationReset'), dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    });
    if (dom.rotateCancelBtn) dom.rotateCancelBtn.addEventListener('click', function() {
      state.rotation = state._savedRotation;
      if (dom.rotateAngleInput) dom.rotateAngleInput.value = state.rotation.toFixed(1);
      state.guideV = null;
      state.guideH = null;
      state.calibPoint1 = null;
      setBlockedUI(state, dom, false);
      if (dom.measListContainer) dom.measListContainer.classList.remove('hidden');
      document.getElementById('toolbar').classList.remove('rotating');
      dom.rotationBar.classList.add('hidden');
      dom.rotationPanel.classList.add('hidden');
      document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });
      dom.activeMode.textContent = '\u2014';
      dom.canvas.style.cursor = 'grab';
      setStatus(IC.i18n.t('status.rotationCancelled'), dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    });
  }

  // ======================== Startup Modal ========================
  function showCalibWizard(state, dom, fromToolbar) {
    if (dom.calibWizPreset) refreshPresetDropdown(state, dom);
    if (dom.calibWizDpi) dom.calibWizDpi.value = state.dpi;
    if (dom.calibWizUnit) dom.calibWizUnit.value = state.unit;
    if (dom.calibWizSegUnit) dom.calibWizSegUnit.value = state.unit;
    if (dom.calibWizDpiDone) dom.calibWizDpiDone.style.display = 'none';
    if (dom.calibWizRatioDone) dom.calibWizRatioDone.style.display = 'none';
    if (dom.calibWizSegDone) dom.calibWizSegDone.style.display = 'none';
    if (dom.calibWizPresetDone) dom.calibWizPresetDone.style.display = 'none';
    if (dom.calibWizSavePreset) dom.calibWizSavePreset.disabled = true;
    // Step 3 (segment calibration) disabled when no image loaded
    if (dom.calibWizSegBtn) {
      dom.calibWizSegBtn.disabled = !state.image;
    }
    if (dom.calibWizOk) {
      dom.calibWizOk.textContent = fromToolbar ? IC.i18n.t('calib.done') : IC.i18n.t('tool.rotate');
      dom.calibWizOk.style.display = '';
      dom.calibWizOk.disabled = false;
    }
    // "К измерениям" only shown when NOT from toolbar calibration
    if (dom.calibWizMeasure) {
      if (fromToolbar) {
        dom.calibWizMeasure.style.display = 'none';
      } else {
        dom.calibWizMeasure.style.display = '';
        dom.calibWizMeasure.disabled = true;
      }
    }
    dom.calibWizard.classList.remove('hidden');
    IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
  }

  function clearCalibWizChecks(dom) {
    ['calibWizDpiDone','calibWizRatioDone','calibWizSegDone','calibWizPresetDone'].forEach(function(id) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    if (dom.calibWizSavePreset) dom.calibWizSavePreset.disabled = true;
  }

  function enableSavePreset(dom) {
    if (dom.calibWizSavePreset) dom.calibWizSavePreset.disabled = false;
  }

  function enableActionButtons(dom) {
    if (dom.calibWizMeasure) dom.calibWizMeasure.disabled = false;
    if (dom.calibWizOk) dom.calibWizOk.disabled = false;
  }

  function refreshPresetDropdown(state, dom) {
    const sel = dom.calibWizPreset;
    if (!sel) return;
    const v = sel.value;
    sel.innerHTML = '<option value="">' + IC.i18n.t('calibWiz.select') + '</option>';
    (state.calibrationPresets || []).forEach(function(p) {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.textContent = p.name + ' (' + p.dpi + ' dpi, ' + p.unit + ')';
      sel.appendChild(opt);
    });
    if (v) {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === v) { sel.value = v; break; }
      }
    }
  }

  function setupCalibWizard(state, dom) {
    // 1. DPI
    if (dom.calibWizDpiBtn) dom.calibWizDpiBtn.addEventListener('click', function() {
      const v = parseInt(dom.calibWizDpi.value);
      if (!v || v < 1) return;
      IC.state.setDpi(state, v);
      dom.dpiInput.value = v;
      clearCalibWizChecks(dom);
      if (dom.calibWizDpiDone) dom.calibWizDpiDone.style.display = '';
      enableSavePreset(dom);
      enableActionButtons(dom);
      IC.storage.saveToStorage(state, dom);
      setStatus('DPI: ' + v, dom);
    });
    // 2. Ratio
    if (dom.calibWizRatioBtn) dom.calibWizRatioBtn.addEventListener('click', function() {
      const px = parseFloat(dom.calibWizPx.value);
      const len = parseFloat(dom.calibWizLen.value);
      if (!px || px <= 0 || !len || len <= 0) return;
      const unit = dom.calibWizUnit.value;
      const mmPerPx = U.displayToMm(len, unit) / px;
      if (!IC.state.setScale(state, mmPerPx)) return;
      state.dpiAutoDetected = false;
      state.unit = unit;
      dom.unitSelect.value = unit;
      clearCalibWizChecks(dom);
      if (dom.calibWizRatioDone) dom.calibWizRatioDone.style.display = '';
      enableSavePreset(dom);
      enableActionButtons(dom);
      IC.storage.saveToStorage(state, dom);
      setStatus('DPI: ' + state.dpi + ' (' + px + ' px = ' + len + ' ' + U.unitDisplay(unit) + ')', dom);
    });
    // 3. Segment calibration
    if (dom.calibWizSegBtn) dom.calibWizSegBtn.addEventListener('click', function() {
      const len = parseFloat(dom.calibWizSegLen.value);
      const unit = dom.calibWizSegUnit.value;
      if (!len || len <= 0) return;
      clearCalibWizChecks(dom);
      state._calibData = null;
      state.mode = 'calibrate';
      state.tempPoints = [];
      state.calibPoint1 = null;
      dom.calibWizard.classList.add('hidden');
      dom.calibrationBar.classList.remove('hidden');
      dom.calibrationBar.innerHTML = IC.i18n.t('calib.hint') + ' (' + len + ' ' + unit + ')';
      document.querySelector('.mode-btn[data-mode="calibrate"]').classList.add('active');
      dom.activeMode.textContent = IC.i18n.t('tool.calibrate');
      dom.canvas.style.cursor = 'crosshair';
      state._calibExpectedLen = len;
      state._calibExpectedUnit = unit;
      setStatus(IC.i18n.t('calib.hint') + ' ' + len + ' ' + unit, dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    });
    // 4. Preset
    if (dom.calibWizPresetBtn) dom.calibWizPresetBtn.addEventListener('click', function() {
      const name = dom.calibWizPreset.value;
      if (!name) return;
      const preset = (state.calibrationPresets || []).find(function(p) { return p.name === name; });
      if (!preset) return;
      state.dpi = preset.dpi;
      state.dpiAutoDetected = false;
      state.mmPerPx = 25.4 / preset.dpi;
      dom.dpiInput.value = preset.dpi;
      state.unit = preset.unit;
      dom.unitSelect.value = preset.unit;
      // Sync startup modal fields
      if (dom.calibWizDpi) dom.calibWizDpi.value = preset.dpi;
      if (dom.calibWizUnit) dom.calibWizUnit.value = preset.unit;
      if (dom.calibWizSegUnit) dom.calibWizSegUnit.value = preset.unit;
      clearCalibWizChecks(dom);
      if (dom.calibWizPresetDone) dom.calibWizPresetDone.style.display = '';
      enableActionButtons(dom);
      IC.storage.saveToStorage(state, dom);
      setStatus(IC.i18n.t('status.presetApplied') + ': ' + name + ' (' + preset.dpi + ' dpi, ' + preset.unit + ')', dom);
    });
    // Preset select change → enable/disable delete button
    if (dom.calibWizPreset) {
      dom.calibWizPreset.addEventListener('change', function() {
        if (dom.calibWizDeletePreset) dom.calibWizDeletePreset.disabled = !this.value;
      });
    }
    // Save preset
    if (dom.calibWizSavePreset) dom.calibWizSavePreset.addEventListener('click', function() {
      const name = prompt(IC.i18n.t('calibWiz.promptName'));
      if (!name || !name.trim()) return;
      if (!state.calibrationPresets) state.calibrationPresets = [];
      state.calibrationPresets.push({ name: name.trim(), dpi: state.dpi, unit: state.unit });
      IC.storage.saveToStorage(state, dom);
      refreshPresetDropdown(state, dom);
      setStatus(IC.i18n.t('status.presetSaved'), dom);
    });
    // Delete preset
    if (dom.calibWizDeletePreset) dom.calibWizDeletePreset.addEventListener('click', function() {
      const name = dom.calibWizPreset ? dom.calibWizPreset.value : '';
      if (!name || !state.calibrationPresets) return;
      state.calibrationPresets = state.calibrationPresets.filter(function(p) { return p.name !== name; });
      IC.storage.saveToStorage(state, dom);
      refreshPresetDropdown(state, dom);
      dom.calibWizDeletePreset.disabled = true;
      setStatus(IC.i18n.t('status.presetDeleted'), dom);
    });
    // OK / Measure buttons
    dom.calibWizOk.addEventListener('click', function() {
      dom.calibWizard.classList.add('hidden');
      // Just close, user activates rotation via toolbar button
      if (state.mode === 'calibrate') {
        state.mode = null;
        document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });
        dom.activeMode.textContent = '\u2014';
        dom.canvas.style.cursor = 'grab';
        setStatus('', dom);
        dom.calibrationBar.classList.add('hidden');
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      }
    });
    if (dom.calibWizMeasure) dom.calibWizMeasure.addEventListener('click', function() {
      dom.calibWizard.classList.add('hidden');
      state.startupMode = false;
      document.getElementById('toolbar').classList.remove('rotating');
      document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });
      dom.activeMode.textContent = '\u2014';
      dom.canvas.style.cursor = 'grab';
      setStatus(IC.i18n.t('status.calibDone'), dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    });
  }

  // ======================== Scalebar modal ========================
  function setupScalebarModal(state, dom) {
    if (dom.closeScalebarModal) dom.closeScalebarModal.addEventListener('click', function() { dom.scalebarModal.classList.add('hidden'); });
    if (dom.applyScalebarBtn) dom.applyScalebarBtn.addEventListener('click', function() {
      const len = parseFloat(dom.scalebarLength.value);
      if (!len || len <= 0) { setStatus(IC.i18n.t('status.scalebarEnterLen'), dom); return; }
      const unit = dom.scalebarUnit.value;
      const height = parseInt(dom.scalebarHeight.value) || 20;
      const pt = state._scalebarClick;
      if (!pt) { setStatus(IC.i18n.t('status.scalebarClick'), dom); return; }
      const valueMm = U.displayToMm(len, unit);
      const c = '#1a237e';
      const style = M.defaultStyle(c, 'scalebar');
      // Apply saved defaults for scalebar (if any)
      if (state.defaultStyles && state.defaultStyles['scalebar']) {
        Object.assign(style, state.defaultStyles['scalebar']);
      }
      style.fillOpacity = 0.7;
      style.barHeight = height;
      const fmtLabel = U.formatLabel(style.labelFormat || '{v}', valueMm, unit, 'scalebar');
      const m = {
        id: state.nextId++,
        type: 'scalebar',
        points: [{ x: pt.x, y: pt.y }],
        valueMm: valueMm,
        label: fmtLabel,
        color: c,
        unit: unit,
        unitOverride: true,
        style: style
      };
      state.measurements.push(m);
      dom.scalebarModal.classList.add('hidden');
      state.mode = null;
      document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });
      dom.activeMode.textContent = '\u2014';
      setStatus(fmtLabel, dom);
      updateMeasurementList(state, dom);
      selectMeasurement(state, m.id, dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    });
  }

  // ======================== Calibration dialog ========================
  function setupCalibrationDialog(state, dom) {
    if (dom.calDpiBtn) dom.calDpiBtn.addEventListener('click', function() {
      const v = parseInt(dom.calDpiInput.value);
      if (!v || v < 1) return;
      state.dpi = v;
      state.dpiAutoDetected = false;
      if (dom.calDpiDone) dom.calDpiDone.style.display = '';
      setStatus('DPI: ' + v, dom);
    });
    if (dom.calSegBtn) dom.calSegBtn.addEventListener('click', function() {
      dom.calDialog.classList.add('hidden');
      state.mode = 'calibrate';
      state.tempPoints = [];
      state.calibPoint1 = null;
      dom.calibrationBar.classList.remove('hidden');
      dom.calibrationBar.innerHTML = IC.i18n.t('status.calibClick');
      document.querySelector('.mode-btn[data-mode="calibrate"]').classList.add('active');
      dom.activeMode.textContent = IC.i18n.t('tool.calibrate');
      dom.canvas.style.cursor = 'crosshair';
      setStatus(IC.i18n.t('status.calibClick'), dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    });
    if (dom.calDoneBtn) dom.calDoneBtn.addEventListener('click', function() {
      dom.calDialog.classList.add('hidden');
      document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });
      dom.activeMode.textContent = '\u2014';
      dom.canvas.style.cursor = 'grab';
      setStatus('', dom);
    });
  }

  // ======================== Calibration Modal ========================
  function setupCalibrationModal(state, dom) {
    dom.applyCalibBtn.addEventListener('click', function() {
      const len = parseFloat(dom.calibLength.value);
      if (!len || len <= 0) { setStatus(IC.i18n.t('status.scalebarEnterLen'), dom); return; }
      const d = state._calibData;
      if (!d) return;
      const ppmm = d.distPx / U.displayToMm(len, dom.calibUnit.value);
      const ndpi = Math.round(ppmm * 25.4);
      if (!U.validDpi(ndpi)) { setStatus(IC.i18n.t('status.invalidDpi'), dom); return; }
      state.dpi = ndpi;
      dom.dpiInput.value = ndpi;
      dom.calibrationModal.classList.add('hidden');
      state.unit = dom.calibUnit.value;
      dom.unitSelect.value = dom.calibUnit.value;
      state.mode = null;
      document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });
      dom.activeMode.textContent = '\u2014';
      state._calibrationDone = true;
      const pxPerMm2 = U.pxPerMm(state.mmPerPx);
      const mpu2 = U.displayToMm(1, state.unit);
      setStatus(state.imgNaturalW + '\u00D7' + state.imgNaturalH + ' px  |  DPI: ' + state.dpi + '  |  ' + (pxPerMm2 * mpu2).toFixed(2) + ' px/' + U.unitDisplay(state.unit), dom);
      M.recomputeAll(state);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      updateMeasurementList(state, dom);
      if (dom.calibWizSegDone) dom.calibWizSegDone.style.display = '';
      enableSavePreset(dom);
      enableActionButtons(dom);
      IC.storage.saveToStorage(state, dom);
      // Sync startup modal fields before showing
      if (dom.calibWizDpi) dom.calibWizDpi.value = state.dpi;
      if (dom.calibWizUnit) dom.calibWizUnit.value = state.unit;
      if (dom.calibWizSegUnit) dom.calibWizSegUnit.value = state.unit;
      dom.calibWizard.classList.remove('hidden');
    });
    if (dom.closeModal) dom.closeModal.addEventListener('click', function() { dom.calibrationModal.classList.add('hidden'); });
  }

  // ======================== Info modal ========================
  function showInfoModal(state, dom) {
    if (!state.image) {
      dom.infoModalBody.innerHTML = '<p class="hint">' + IC.i18n.t('status.loadImage') + '</p>';
    } else {
      var autoLabel = state.dpiAutoDetected ? ' (' + IC.i18n.t('ui.auto') + ')' : ' (' + IC.i18n.t('ui.manual') + ')';
      dom.infoModalBody.innerHTML = '<p><b>' + IC.i18n.t('ui.size') + ':</b> ' + state.imgNaturalW + ' x ' + state.imgNaturalH + ' px</p>' +
        '<p><b>DPI:</b> ' + state.dpi + autoLabel + '</p>' +
        '<p><b>1 px =</b> ' + U.pixelsToMM(1, state.mmPerPx).toFixed(4) + ' mm</p>' +
        '<p><b>' + IC.i18n.t('prop.unit') + ':</b> ' + state.unit + '</p>' +
        '<p><b>' + IC.i18n.t('ui.measurements') + ':</b> ' + state.measurements.length + '</p>';
    }
    dom.infoModal.classList.remove('hidden');
  }

  // ======================== DPI banner ========================
  // DPI banner is no longer shown (startup modal replaces it)
  function setupDpiBanner(state, dom) {
    // no-op
  }

  // ======================== Toolbar buttons ========================
  function setupToolbar(state, dom) {
    dom.applyDpiBtn.addEventListener('click', function() {
      const v = parseInt(dom.dpiInput.value);
      if (!v || v < 1) { setStatus(IC.i18n.t('status.enterDpi'), dom); return; }
      state.dpi = v;
      state.dpiAutoDetected = false;
      state.mmPerPx = 25.4 / v;
      M.recomputeAll(state);
      IC.storage.saveToStorage(state, dom);
      updateInfoPanel(state, dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      updateMeasurementList(state, dom);
      setStatus('DPI: ' + v, dom);
    });
    dom.unitSelect.addEventListener('change', function() {
      state.unit = dom.unitSelect.value;
      M.recomputeAll(state);
      updateMeasurementList(state, dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      IC.storage.saveToStorage(state, dom);
    });
    dom.clearBtn.addEventListener('click', function() {
      if (!dom.rotationPanel.classList.contains('hidden') || state.mode === 'crop') { setStatus(IC.i18n.t('status.finishRotateCrop'), dom); return; }
      state.measurements = [];
      state.tempPoints = [];
      state.calibPoint1 = null;
      state.selectedMeasurementId = null;
      dom.propsPanel.classList.add('hidden');
      state.cropRect = null;
      state._cropDrawRect = null;
      state._cropDragging = false;
      state._cropMoving = false;
      updatePointCount(state, dom);
      updateMeasurementList(state, dom);
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      setStatus(IC.i18n.t('status.clearDone'), dom);
    });
    dom.undoBtn.addEventListener('click', function() {
      if (!dom.rotationPanel.classList.contains('hidden') || state.mode === 'crop') { setStatus(IC.i18n.t('status.finishRotateCrop'), dom); return; }
      if (state.tempPoints.length > 0) {
        state.tempPoints.pop();
        updatePointCount(state, dom);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        setStatus(IC.i18n.t('status.undo'), dom);
      } else if (state.measurements.length > 0) {
        const m = state.measurements.pop();
        if (state.selectedMeasurementId === m.id) deselectMeasurement(state, dom);
        updateMeasurementList(state, dom);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        setStatus(IC.i18n.t('status.undo'), dom);
      } else setStatus(IC.i18n.t('status.nothingToUndo'), dom);
    });
  }

  // ======================== Background / Clip / Swatches ========================
  function setupExtras(state, dom) {
    if (dom.bgColor) dom.bgColor.addEventListener('input', function() { setBgColor(this.value, dom); });
    if (dom.bgBlackBtn) dom.bgBlackBtn.addEventListener('click', function() { setBgColor('#000000', dom); });
    if (dom.bgWhiteBtn) dom.bgWhiteBtn.addEventListener('click', function() { setBgColor('#ffffff', dom); });
    if (dom.clipToggle) dom.clipToggle.addEventListener('change', function() {
      state.clipMeasurements = this.checked;
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    });
    // Black/white swatches in properties panel
    document.querySelectorAll('.bw-swatch').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        const targetId = this.dataset.target;
        const input = document.getElementById(targetId);
        if (!input) return;
        const color = this.style.background === 'rgb(0, 0, 0)' ? '#000000' : '#ffffff';
        input.value = color;
        const m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
        if (m) {
          if (targetId === 'propColor') { m.style.color = color; m.color = color; updateMeasurementList(state, dom); }
          else if (targetId === 'propFillColor') m.style.fillColor = color;
          else if (targetId === 'propFontColor') m.style.fontColor = color;
          else if (targetId === 'propLabelBg') m.style.labelBg = color;
          else if (targetId === 'propBarBorderColor') m.style.barBorderColor = color;
          IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        }
      });
    });
    // Drag-and-drop
    if (dom.canvasWrapper) {
      dom.canvasWrapper.addEventListener('dragover', function(e) { e.preventDefault(); dom.canvasWrapper.style.outline = '2px dashed var(--accent)'; });
      dom.canvasWrapper.addEventListener('dragleave', function() { dom.canvasWrapper.style.outline = ''; });
      dom.canvasWrapper.addEventListener('drop', function(e) {
        e.preventDefault();
        dom.canvasWrapper.style.outline = '';
        const f = e.dataTransfer.files[0];
        if (f && f.type.startsWith('image/')) {
          state.imageName = f.name.replace(/\.[^.]+$/, '');
          if (IC.imageLoader) IC.imageLoader.loadImageFile(f, state, createImageCallbacks(state, dom));
        }
      });
    }
    // No-image overlay click
    if (dom.noImageOverlay) dom.noImageOverlay.addEventListener('click', function() { if (dom.fileInput) dom.fileInput.click(); });
    // Block file dialog in rotation/crop modes
    if (dom.loadBtn) dom.loadBtn.addEventListener('click', function(e) {
      if (state.selectedMeasurementId) deselectMeasurement(state, dom);
      if (!dom.rotationPanel.classList.contains('hidden') || state.mode === 'crop') {
        e.preventDefault();
        setStatus(IC.i18n.t('status.blocked'), dom);
      }
    });
    // Info modal
    if (dom.infoBtn) dom.infoBtn.addEventListener('click', function() { showInfoModal(state, dom); });
    if (dom.closeInfoModal) dom.closeInfoModal.addEventListener('click', function() { dom.infoModal.classList.add('hidden'); });
    // File input — detects .icp vs image by extension
    dom.fileInput.addEventListener('change', function(e) {
      if (!dom.rotationPanel.classList.contains('hidden') || state.mode === 'crop') { setStatus(IC.i18n.t('status.blocked'), dom); return; }
      if (state.selectedMeasurementId) deselectMeasurement(state, dom);
      const f = e.target.files[0];
      if (!f) return;
      const n = f.name.toLowerCase();
      if (n.endsWith('.icp')) {
        IC.project.loadProject(f, state, dom);
      } else {
        state.imageName = f.name.replace(/\.[^.]+$/, '');
        IC.imageLoader.loadImageFile(f, state, createImageCallbacks(state, dom));
      }
    });
    // --- Annotation dropdown + mode toggle ---
    if (dom.annoBtn) {
      dom.annoBtn.addEventListener('click', function(e) {
        if (!dom.rotationPanel.classList.contains('hidden') || state.mode === 'crop') return;
        var ddArrow = dom.annoBtn.querySelector('.dd-arrow');
        if (ddArrow && ddArrow.contains(e.target)) {
          // Arrow: toggle dropdown
          dom.annoDropdown.classList.toggle('open');
          return;
        }
        if (state.mode === 'annotation') {
          // Second click on body → open dropdown (don't deactivate)
          dom.annoDropdown.classList.toggle('open');
        } else {
          // First click → activate
          setMode('annotation', state, dom);
          dom.annoBtn.classList.add('active');
        }
      });
    }
    if (dom.annoDropdown) {
      dom.annoDropdown.querySelectorAll('.anno-dd-item').forEach(function(item) {
        item.addEventListener('click', function() {
          dom.annoDropdown.querySelectorAll('.anno-dd-item').forEach(function(i) { i.classList.remove('active'); });
          item.classList.add('active');
          state.annotationSubtype = item.dataset.subtype;
          if (dom.annoLabel) {
            var al = { line: IC.i18n.t('anno.line'), arrow: IC.i18n.t('anno.arrow'),
                       rect: IC.i18n.t('anno.rect'), ellipse: IC.i18n.t('anno.ellipse'),
                       text: IC.i18n.t('anno.text') };
            dom.annoLabel.textContent = al[item.dataset.subtype] || item.dataset.subtype;
          }
          dom.annoDropdown.classList.remove('open');
          // Activate annotation mode if not active
          if (state.mode !== 'annotation') {
            setMode('annotation', state, dom);
            dom.annoBtn.classList.add('active');
          }
          setStatus(IC.i18n.t('status.subtype') + ': ' + dom.annoLabel.textContent, dom);
        });
      });
      // Close on outside click
      document.addEventListener('click', function(e) {
        if (!dom.annoBtn || !dom.annoDropdown) return;
        if (!dom.annoBtn.contains(e.target) && !dom.annoDropdown.contains(e.target)) {
          dom.annoDropdown.classList.remove('open');
        }
      });
    }
    // --- Annotation double-ended handler ---
    if (dom.propDoubleEnded) {
      dom.propDoubleEnded.addEventListener('change', function() {
        if (!state.selectedMeasurementId) return;
        var m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
        if (m && m.type === 'annotation') {
          m.doubleEnded = this.checked;
          IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
          updateMeasurementList(state, dom);
        }
      });
    }
    // --- Text rotation controls (step = 10°) ---
    if (dom.textRotLeftBtn) dom.textRotLeftBtn.addEventListener('click', function() {
      if (!state.selectedMeasurementId) return;
      var m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m && m.type === 'annotation' && m.subtype === 'text') {
        m._textRotation = (m._textRotation || 0) - 10;
        if (dom.propTextRotation) dom.propTextRotation.value = m._textRotation.toFixed(1);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      }
    });
    if (dom.textRotRightBtn) dom.textRotRightBtn.addEventListener('click', function() {
      if (!state.selectedMeasurementId) return;
      var m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m && m.type === 'annotation' && m.subtype === 'text') {
        m._textRotation = (m._textRotation || 0) + 10;
        if (dom.propTextRotation) dom.propTextRotation.value = m._textRotation.toFixed(1);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      }
    });
    // --- Text content editing ---
    if (dom.propTextContent) dom.propTextContent.addEventListener('input', function() {
      if (!state.selectedMeasurementId) return;
      var m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m && m.type === 'annotation' && m.subtype === 'text') {
        m.label = this.value;
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        updateMeasurementList(state, dom);
      }
    });
    if (dom.propTextRotation) dom.propTextRotation.addEventListener('change', function() {
      if (!state.selectedMeasurementId) return;
      var m = state.measurements.find(function(x) { return x.id === state.selectedMeasurementId; });
      if (m && m.type === 'annotation' && m.subtype === 'text') {
        var v = parseFloat(this.value);
        if (!isNaN(v)) m._textRotation = v;
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      }
    });
    // Save project button
    if (dom.saveProjectBtn) dom.saveProjectBtn.addEventListener('click', function() {
      if (state.selectedMeasurementId) deselectMeasurement(state, dom);
      if (!dom.rotationPanel.classList.contains('hidden') || state.mode === 'crop') { setStatus(IC.i18n.t('status.blockedSave'), dom); return; }
      IC.project.saveProject(state, dom);
    });
    function updateExportPreview(state, dom) {
      var mode = document.querySelector('input[name="exportRes"]:checked');
      state._exportCanvas = IC.project.generateExport(state, dom, mode ? mode.value : 'screen');
      var pv = document.getElementById('exportPreview');
      if (pv && state._exportCanvas) {
        var pw = state._exportCanvas.width, ph = state._exportCanvas.height;
        // Fixed max dims (not layout-dependent, avoids distortion on first open)
        var maxW = 560, maxH = 480;
        var pvScale = Math.min(maxW / pw, maxH / ph, 1);
        pv.width = Math.round(pw * pvScale);
        pv.height = Math.round(ph * pvScale);
        var pvCtx = pv.getContext('2d');
        pvCtx.imageSmoothingEnabled = true;
        pvCtx.imageSmoothingQuality = 'high';
        pvCtx.drawImage(state._exportCanvas, 0, 0, pv.width, pv.height);
      }
    }

    // Export PNG button — show modal to choose resolution
    if (dom.exportBtn) dom.exportBtn.addEventListener('click', function() {
      if (state.selectedMeasurementId) deselectMeasurement(state, dom);
      if (!state.image) { setStatus(IC.i18n.t('status.noImage'), dom); return; }
      if (!dom.rotationPanel.classList.contains('hidden') || state.mode === 'crop') { setStatus(IC.i18n.t('status.blockedExport'), dom); return; }
      const screenRes = document.getElementById('exportResScreen');
      if (screenRes) screenRes.textContent = '(' + dom.canvas.width + '\u00D7' + dom.canvas.height + ' px)';
      const fullRes = document.getElementById('exportResFull');
      if (fullRes) {
        var iw = state.imgNaturalW, ih = state.imgNaturalH;
        var f = Math.max(1, 1800 / iw);
        fullRes.textContent = '(' + Math.round(iw * f) + '\u00D7' + Math.round(ih * f) + ' px, 300 DPI)';
      }
      updateExportPreview(state, dom);
      dom.exportModal.classList.remove('hidden');
    });
    // Update preview when switching resolution mode
    document.querySelectorAll('input[name="exportRes"]').forEach(function(rb) {
      rb.addEventListener('change', function() {
        if (!dom.exportModal.classList.contains('hidden')) updateExportPreview(state, dom);
      });
    });
    if (dom.exportModalOk) dom.exportModalOk.addEventListener('click', function() {
      dom.exportModal.classList.add('hidden');
      var mode = document.querySelector('input[name="exportRes"]:checked');
      IC.project.exportImage(state, dom, mode ? mode.value : 'screen');
      state._exportCanvas = null;
    });
    if (dom.exportModalCancel) dom.exportModalCancel.addEventListener('click', function() {
      dom.exportModal.classList.add('hidden');
      state._exportCanvas = null;
    });
    // Copy to clipboard
    if (dom.exportCopyBtn) dom.exportCopyBtn.addEventListener('click', function() {
      if (!state._exportCanvas) return;
      state._exportCanvas.toBlob(function(blob) {
        try {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setStatus(IC.i18n.t('status.copied'), dom);
        } catch(e) {
          setStatus(IC.i18n.t('status.copyError') + ': ' + e.message, dom);
        }
      }, 'image/png');
    });
    // Language toggle
    if (dom.langSelect) {
      dom.langSelect.value = IC.i18n.getLang();
      dom.langSelect.addEventListener('change', function() {
        IC.i18n.setLang(this.value);
        IC.i18n.applyDOM();
        IC.storage.saveToStorage(state, dom);
        // Update mode label in status
        if (state.mode) {
          var modeLabels = {
            'distance': IC.i18n.t('tool.distance'), 'circle3': IC.i18n.t('tool.circle3'),
            'circle1': IC.i18n.t('tool.circle1'), 'polyline': IC.i18n.t('tool.polyline'),
            'polygon': IC.i18n.t('tool.polygon'), 'angle': IC.i18n.t('tool.angle'),
            'calibrate': IC.i18n.t('tool.calibrate'), 'scalebar': IC.i18n.t('tool.scalebar'),
            'annotation': IC.i18n.t('tool.annotation')
          };
          dom.activeMode.textContent = modeLabels[state.mode] || state.mode;
        }
        // Refresh annotation label
        if (state.annotationSubtype && dom.annoLabel) {
          var al = { line: IC.i18n.t('anno.line'), arrow: IC.i18n.t('anno.arrow'),
                     rect: IC.i18n.t('anno.rect'), ellipse: IC.i18n.t('anno.ellipse'),
                     text: IC.i18n.t('anno.text') };
          dom.annoLabel.textContent = al[state.annotationSubtype] || state.annotationSubtype;
        }
        // Refresh status text in current language
        if (!state.image) {
          setStatus(IC.i18n.t('status.loadImage'), dom);
        }
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
      });
    }
  }

  // ======================== Image callbacks ========================
  function createImageCallbacks(state, dom) {
    return {
      onFinalize: function(img, url, dpi) {
        state.image = img;
        if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
        state.imageUrl = url;
        state.imgNaturalW = img.naturalWidth || img.width;
        state.imgNaturalH = img.naturalHeight || img.height;
        // Reset filename counter for this image name
        try { localStorage.removeItem('fn_' + (state.imageName || 'image') + '.icp'); } catch(e) {}
        try { localStorage.removeItem('fn_' + (state.imageName || 'image') + '_S.png'); } catch(e) {}
        try { localStorage.removeItem('fn_' + (state.imageName || 'image') + '_P.png'); } catch(e) {}
        // Reset measurements, rotation, crop — keep calibration (DPI)
        state.measurements = [];
        state.tempPoints = [];
        state.selectedMeasurementId = null;
        state.nextId = 1;
        state.rotation = 0;
        state.guideV = null;
        state.guideH = null;
        state.cropRect = null;
        state._cropDrawRect = null;
        state._cropDragging = false;
        state._cropMoving = false;
        state._cropRectSaved = null;
        dom.propsPanel.classList.add('hidden');
        if (dpi && dpi > 0 && dpi < 100000000) {
          IC.state.setScale(state, 25.4 / dpi);
          state.dpiAutoDetected = true;
        } else {
          state.dpiAutoDetected = false;
        }
        resetView(state, dom);
        updateInfoPanel(state, dom);
        IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
        // Pixels per selected unit (e.g. px/cm, px/in)
        const pxPerMm = U.pxPerMm(state.mmPerPx);
        const mmPerUnit = U.displayToMm(1, state.unit);
        const pxPerUnit = pxPerMm * mmPerUnit;
        setStatus(state.imgNaturalW + '\u00D7' + state.imgNaturalH + ' px  |  DPI: ' + state.dpi + '  |  ' + pxPerUnit.toFixed(2) + ' px/' + U.unitDisplay(state.unit), dom);
      },
      onDpiDetected: function(dpi) {
        if (dpi && dpi > 0 && dpi < 100000000) {
          IC.state.setScale(state, 25.4 / dpi);
          state.dpiAutoDetected = true;
        } else {
          state.dpiAutoDetected = false;
        }
      },
      onStatus: function(msg) {
        setStatus(msg, dom);
      }
    };
  }

  // ======================== Init UI ========================
  function initUI(state, dom) {
    // Populate unit selects
    populateUnitSelect('calibWizUnit');
    populateUnitSelect('calibWizSegUnit');
    populateUnitSelect('calibUnit');

    // Setup all subsystems
    setupModeButtons(state, dom);
    setupPropertiesPanel(state, dom);
    setupCropPanel(state, dom);
    setupRotationPanel(state, dom);
    setupCalibWizard(state, dom);
    setupScalebarModal(state, dom);
    setupCalibrationDialog(state, dom);
    setupCalibrationModal(state, dom);
    setupDpiBanner(state, dom);
    setupToolbar(state, dom);
    setupExtras(state, dom);

    // Handle resize — shift offset and crop rect together so they stay aligned
    function handleResize() {
      if (!state.image) return;
      const wrap = dom.canvasWrapper;
      const w = wrap.clientWidth, h = wrap.clientHeight;
      const ow = dom.canvas.width, oh = dom.canvas.height;
      dom.canvas.width = w;
      dom.canvas.height = h;
      if (ow > 0) {
        const dx = (w - ow) / 2;
        const dy = (h - oh) / 2;
        state.offset.x += dx;
        state.offset.y += dy;
        if (state.cropRect) { state.cropRect.x += dx; state.cropRect.y += dy; }
        if (state._cropDrawRect) { state._cropDrawRect.x += dx; state._cropDrawRect.y += dy; }
      }
      IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
    }
    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(function() { handleResize(); });
    resizeObserver.observe(dom.canvasWrapper);

    // roundRect polyfill
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
        this.moveTo(x + r.tl, y); this.lineTo(x + w - r.tr, y); this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
        this.lineTo(x + w, y + h - r.br); this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
        this.lineTo(x + r.bl, y + h); this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
        this.lineTo(x, y + r.tl); this.quadraticCurveTo(x, y, x + r.tl, y); this.closePath();
      };
    }
  }

  function populateUnitSelect(id) {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = C.UNITS.map(function(u) { return '<option value="' + u.value + '">' + u.label + '</option>'; }).join('');
  }

  return {
    collectDomRefs, initUI,
    setStatus, updatePointCount, updateInfoPanel, updateMeasurementList,
    selectMeasurement, deselectMeasurement,
    setMode, resetView, showCalibWizard, updateCropPanel, setBgColor,
    enableSavePreset, enableActionButtons, clearCalibWizChecks
  };
})();

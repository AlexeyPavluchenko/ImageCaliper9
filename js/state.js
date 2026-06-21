/* ============================================================
   ImageCaliper — State management
   ============================================================ */
window.IC = window.IC || {};
IC.state = (function() {

  /** Create the initial state object (called once in main.js) */
  function create() {
    return {
      image: null,
      imageUrl: null,
      imageName: '',
      imgNaturalW: 0,
      imgNaturalH: 0,
      dpi: 200,
      mmPerPx: 25.4 / 200,
      dpiAutoDetected: false,
      unit: 'mm',
      mode: null,
      tempPoints: [],
      measurements: [],
      nextId: 1,
      offset: { x: 0, y: 0 },
      scale: 1,
      fitScale: 1,
      isPanning: false,
      panStart: null,
      panOffsetStart: null,
      calibPoint1: null,
      rotation: 0,
      guideV: null,
      guideH: null,
      draggingGuide: null,
      selectedMeasurementId: null,
      draggingLabel: false,
      dragLabelMeasId: null,
      snapPreviewPos: null,
      startupMode: false,
      _calibrationDone: false,
      clipMeasurements: false,
      hideLabels: false,
      calibrationPresets: [],
      defaultStyles: {},
      // Crop (image coordinates — stable under zoom/pan)
      cropRect: null,
      _cropRectSaved: null,
      _cropDrawRect: null,
      _cropDragging: false,
      _cropMoving: false,
      _cropMoveStart: null,
      _cropResizing: false,
      _cropResizeHandle: null,
      _cropStartRect: null,
      _cropStartMouse: null,
      // Saved view state when entering crop mode
      _cropViewSaved: null,
      // Saved rotation when entering rotate mode (for cancel)
      _savedRotation: 0,
      // Calibration data (instead of window globals)
      _calibData: null,
      _calibExpectedLen: null,
      _calibExpectedUnit: null,
      // Scalebar click point (instead of window._scalebarClick)
      _scalebarClick: null,
      // Current annotation subtype
      annotationSubtype: 'arrow',
      // Canvas-space click points for rect/ellipse annotation creation
      _annoCanvasPts: null,
    };
  }

  /** Update mmPerPx and dpi from a new mm-per-pixel value */
  function setScale(state, mmPerPx) {
    if (!isFinite(mmPerPx) || mmPerPx <= 0) return false;
    state.mmPerPx = mmPerPx;
    state.dpi = Math.round(25.4 / mmPerPx);
    return true;
  }

  /** Set DPI directly (convenience) */
  function setDpi(state, dpi) {
    if (!isFinite(dpi) || dpi <= 0) return false;
    return setScale(state, 25.4 / dpi);
  }

  return { create, setScale, setDpi };
})();

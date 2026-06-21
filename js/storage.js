/* ============================================================
   ImageCaliper — localStorage persistence
   ============================================================ */
window.IC = window.IC || {};
IC.storage = (function() {

  function saveToStorage(state, dom) {
    try {
      localStorage.setItem('imageCaliper', JSON.stringify({
        unit: state.unit,
        dpi: state.dpi,
        bgColor: dom.bgColor ? dom.bgColor.value : '#000000',
        clipMeasurements: state.clipMeasurements,
        calibrationPresets: state.calibrationPresets || [],
        defaultStyles: state.defaultStyles || {},
        lang: IC.i18n.getLang()
      }));
    } catch(e) {}
  }

  function loadFromStorage(state, dom) {
    try {
      const data = JSON.parse(localStorage.getItem('imageCaliper') || '{}');
      if (data.unit) state.unit = data.unit;
      if (data.dpi) { state.dpi = data.dpi; state.mmPerPx = 25.4 / data.dpi; }
      if (data.bgColor) IC.ui.setBgColor(data.bgColor, dom);
      if (data.clipMeasurements !== undefined) {
        state.clipMeasurements = data.clipMeasurements;
        if (dom.clipToggle) dom.clipToggle.checked = data.clipMeasurements;
      }
      if (data.calibrationPresets) state.calibrationPresets = data.calibrationPresets;
      if (data.defaultStyles) state.defaultStyles = data.defaultStyles;
      if (data.lang && IC.i18n.setLang(data.lang)) {
        if (dom.langSelect) dom.langSelect.value = data.lang;
      }
    } catch(e) {}
  }

  return { saveToStorage, loadFromStorage };
})();

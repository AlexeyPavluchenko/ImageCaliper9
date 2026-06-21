/* ============================================================
   ImageCaliper — Main entry point, wiring everything together
   ============================================================ */
window.IC = window.IC || {};
IC.main = (function() {

  // Order of initialization:
  // 1. Create state
  // 2. Collect DOM refs
  // 3. Init UI (sets up all button handlers, panels, resize observer)
  // 4. Setup event handlers (canvas mouse/touch/keyboard)
  // 5. Load from storage
  // 6. First render

  function init() {
    const state = IC.state.create();
    const dom = IC.ui.collectDomRefs();

    // Make state and dom available globally for debugging
    // (not required by the app, but helpful for inspection)
    window.__state = state;
    window.__dom = dom;

    // Initialize UI (panels, modals, toolbar, property controls, resize, etc.)
    IC.ui.initUI(state, dom);

    // Setup canvas interaction events
    IC.events.setupEventHandlers(state, dom);

    // Load persisted settings
    IC.storage.loadFromStorage(state, dom);
    // Apply language to data-i18n elements
    IC.i18n.applyDOM();
    // Sync UI controls with loaded values
    if (dom.unitSelect) dom.unitSelect.value = state.unit;
    if (dom.dpiInput) dom.dpiInput.value = state.dpi;

    // Set initial state
    dom.canvas.style.cursor = 'grab';
    IC.ui.setStatus(IC.i18n.t('status.loadImage'), dom);
    IC.ui.updateMeasurementList(state, dom);

    // Initial render
    IC.rendering.render(dom.canvasCtx, dom.canvas, state, dom);
  }

  // Run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init };
})();

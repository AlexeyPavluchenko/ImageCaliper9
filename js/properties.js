/* ============================================================
   ImageCaliper — Properties panel visibility rules per type
   Each type explicitly lists which controls to SHOW.
   All controls are hidden by default.
   ============================================================ */
window.IC = window.IC || {};
IC.properties = (function() {

  /**
   * Controls available in the properties panel.
   * show: array of control keys to display for this type/subtype.
   *
   * Available keys:
   *   Global (shown for most types):
   *     color, lineWidth, lineDash
   *
   *   Per-type:
   *     fill             — fillColor + fillOpacity (polygon, scalebar, rect, ellipse)
   *     pointStyle       — pointStyle + pointSize (most measurements)
   *     labelFormat      — label format template
   *     labelVisible     — show/hide label checkbox
   *     fontFamily       — font family
   *     fontSize         — font size
   *     bold             — bold toggle
   *     italic           — italic toggle
   *     fontColor        — text color
   *     labelBg          — label background color
   *     labelBgOpacity   — label background opacity
   *     unit             — per-measurement unit override
   *
   *   Annotation-specific:
   *     doubleEnded      — double-ended arrow checkbox
   *
   *   Scalebar-specific:
   *     barHeight        — bar height
   *     barBorder        — bar border color + width
   *     barValue         — bar value + unit
   */
  var RULES = {
    distance: {
      show: ['color', 'lineWidth', 'lineDash',
             'pointStyle', 'pointSize',
             'labelFormat', 'labelVisible',
             'fontFamily', 'fontSize', 'bold', 'italic', 'fontColor',
             'labelBg', 'labelBgOpacity',
             'unit']
    },
    circle3: {
      show: ['color', 'lineWidth', 'lineDash',
             'pointStyle', 'pointSize',
             'labelFormat', 'labelVisible',
             'fontFamily', 'fontSize', 'bold', 'italic', 'fontColor',
             'labelBg', 'labelBgOpacity',
             'unit']
    },
    circle1: {
      show: ['color', 'lineWidth', 'lineDash',
             'pointStyle', 'pointSize',
             'labelFormat', 'labelVisible',
             'fontFamily', 'fontSize', 'bold', 'italic', 'fontColor',
             'labelBg', 'labelBgOpacity',
             'unit']
    },
    polyline: {
      show: ['color', 'lineWidth', 'lineDash',
             'pointStyle', 'pointSize',
             'labelFormat', 'labelVisible',
             'fontFamily', 'fontSize', 'bold', 'italic', 'fontColor',
             'labelBg', 'labelBgOpacity',
             'unit']
    },
    polygon: {
      show: ['color', 'lineWidth', 'lineDash',
             'fill',
             'pointStyle', 'pointSize',
             'labelFormat', 'labelVisible',
             'fontFamily', 'fontSize', 'bold', 'italic', 'fontColor',
             'labelBg', 'labelBgOpacity',
             'unit']
    },
    angle: {
      show: ['color', 'lineWidth', 'lineDash',
             'pointStyle', 'pointSize',
             'labelFormat', 'labelVisible',
             'fontFamily', 'fontSize', 'bold', 'italic', 'fontColor',
             'labelBg', 'labelBgOpacity']
    },
    scalebar: {
      show: ['fill',
             'barHeight', 'barBorder', 'barValue',
             'labelFormat', 'labelVisible',
             'fontFamily', 'fontSize', 'bold', 'italic', 'fontColor',
             'labelBg', 'labelBgOpacity']
    },
    'annotation:line': {
      show: ['color', 'lineWidth', 'lineDash']
    },
    'annotation:arrow': {
      show: ['color', 'lineWidth', 'lineDash', 'doubleEnded']
    },
    'annotation:rect': {
      show: ['color', 'lineWidth', 'lineDash', 'fill']
    },
    'annotation:ellipse': {
      show: ['color', 'lineWidth', 'lineDash', 'fill']
    },
    'annotation:text': {
      show: ['fontFamily', 'fontSize', 'bold', 'italic', 'fontColor',
             'labelBg', 'labelBgOpacity', 'textRotation', 'textContent']
    }
  };

  /**
   * Maps control key → DOM element ID for rows that have an ID.
   * Controls without a row ID (e.g., lineWidth input in a shared row)
   * are handled by finding their parent <tr>.
   */
  var KEY_TO_ROW = {
    color:        'propColorRow',
    fill:         'propFillRow',
    unit:         'propUnitRow',
    barHeight:    'propBarHeightRow',
    barBorder:    'propBarBorderRow',
    barValue:     'propBarValueRow',
    doubleEnded:  'propDoubleEndedRow',
    textRotation: 'propTextRotationRow',
    textContent:  'propTextContentRow'
  };

  /**
   * Controls that are inputs inside a table row (not the row itself).
   * We hide/show them by finding their closest <tr>.
   */
  var INPUT_IDS = [
    'propLineWidth', 'propLineDash',
    'propPointStyle', 'propPointSize',
    'propLabelFormat', 'propLabelVisible',
    'propFontFamily', 'propFontSize', 'propBold', 'propItalic',
    'propFontColor', 'propLabelBg', 'propLabelBgOpacity',
    'propFillColor', 'propFillOpacity',
    'propUnitOverride', 'propUnitSelect',
    'propBarBorderColor', 'propBarBorderWidth',
    'propBarValue', 'propBarUnit',
    'propDoubleEnded',
    'propTextRotation', 'textRotLeftBtn', 'textRotRightBtn'
  ];

  /**
   * Get visibility rules for a given type/subtype.
   */
  function getVisibility(type, subtype) {
    var key = subtype ? type + ':' + subtype : type;
    return RULES[key] || { show: [] };
  }

  /**
   * Apply visibility rules to the properties panel.
   */
  function applyVisibility(m, dom) {
    if (!m || !dom || !dom.propsPanel) return;

    var rule = getVisibility(m.type, m.subtype);
    var showSet = {};
    rule.show.forEach(function(k) { showSet[k] = true; });

    // 1. Hide all tracked rows (those with IDs)
    Object.keys(KEY_TO_ROW).forEach(function(key) {
      var id = KEY_TO_ROW[key];
      var el = document.getElementById(id);
      if (el) el.style.display = (showSet[key] ? '' : 'none');
    });

    // 2. Hide/show rows containing specific inputs
    INPUT_IDS.forEach(function(inputId) {
      var input = document.getElementById(inputId);
      if (!input) return;
      var tr = input.closest('tr');
      if (!tr) return;
      // Map input ID → control key
      var key = mapInputToKey(inputId);
      tr.style.display = (showSet[key] ? '' : 'none');
    });
  }

  function mapInputToKey(inputId) {
    var map = {
      propLineWidth:      'lineWidth',
      propLineDash:       'lineDash',
      propPointStyle:     'pointStyle',
      propPointSize:      'pointSize',
      propLabelFormat:    'labelFormat',
      propLabelVisible:   'labelVisible',
      propFontFamily:     'fontFamily',
      propFontSize:       'fontSize',
      propBold:           'bold',
      propItalic:         'italic',
      propFontColor:      'fontColor',
      propLabelBg:        'labelBg',
      propLabelBgOpacity: 'labelBgOpacity',
      propFillColor:      'fill',
      propFillOpacity:    'fill',
      propUnitOverride:   'unit',
      propUnitSelect:     'unit',
      propBarBorderColor: 'barBorder',
      propBarBorderWidth: 'barBorder',
      propBarValue:       'barValue',
      propBarUnit:        'barValue',
      propDoubleEnded:    'doubleEnded',
      propTextRotation:   'textRotation',
      textRotLeftBtn:     'textRotation',
      textRotRightBtn:    'textRotation'
    };
    return map[inputId] || inputId;
  }

  return {
    getVisibility: getVisibility,
    applyVisibility: applyVisibility
  };
})();

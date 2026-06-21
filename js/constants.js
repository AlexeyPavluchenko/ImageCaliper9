/* ============================================================
   ImageCaliper — Constants
   ============================================================ */
window.IC = window.IC || {};
IC.constants = (function() {

  const COLORS = ['#7c6ff0','#5ae08a','#e0c05a','#e07a5a','#5ac0e0','#e05ae0','#5ae0c0','#e0e05a','#c05ae0','#5a7ae0'];

  const TEMP_COLOR = '#ffcc44';
  const CALIB_COLOR = '#ff6644';

  const MAG_SIZE = 160;
  const MAG_ZOOM = 4;
  const MAG_RADIUS = MAG_SIZE / 2;

  const UNITS = [
    { value: 'km', label: 'km' }, { value: 'm', label: 'm' }, { value: 'cm', label: 'cm' },
    { value: 'mm', label: 'mm' }, { value: 'um', label: '\u00B5m' }, { value: 'nm', label: 'nm' },
    { value: 'A', label: '\u00C5' }, { value: 'in', label: 'in' }
  ];

  function getColor(i) {
    return COLORS[i % COLORS.length];
  }

  return { COLORS, TEMP_COLOR, CALIB_COLOR, MAG_SIZE, MAG_ZOOM, MAG_RADIUS, UNITS, getColor };
})();

/* ============================================================
   ImageCaliper — Coordinate transforms (image ↔ canvas)
   Crop is visual-only (canvas clip), so transforms always use
   full image dimensions and no crop offset.
   ============================================================ */
window.IC = window.IC || {};
IC.coords = (function() {

  /**
   * Convert image coordinates (original image pixels) to canvas coordinates.
   * Accounts for: rotation, scale, offset.
   * Crop is handled via canvas clip in render(), not in coordinates.
   */
  function imageToCanvas(state, x, y) {
    const cx = state.offset.x + state.imgNaturalW * state.scale / 2;
    const cy = state.offset.y + state.imgNaturalH * state.scale / 2;
    const a = state.rotation * Math.PI / 180;
    const dx = (x - state.imgNaturalW / 2) * state.scale;
    const dy = (y - state.imgNaturalH / 2) * state.scale;
    const rx = dx * Math.cos(a) - dy * Math.sin(a);
    const ry = dx * Math.sin(a) + dy * Math.cos(a);
    return { x: cx + rx, y: cy + ry };
  }

  /**
   * Convert canvas coordinates to image coordinates (original image pixels).
   */
  function canvasToImage(state, x, y) {
    const cx = state.offset.x + state.imgNaturalW * state.scale / 2;
    const cy = state.offset.y + state.imgNaturalH * state.scale / 2;
    const a = state.rotation * Math.PI / 180;
    const dx = x - cx;
    const dy = y - cy;
    const rx = dx * Math.cos(a) + dy * Math.sin(a);
    const ry = -dx * Math.sin(a) + dy * Math.cos(a);
    return { x: rx / state.scale + state.imgNaturalW / 2, y: ry / state.scale + state.imgNaturalH / 2 };
  }

  /**
   * Compute rect/ellipse center and size in image-space from two diagonal
   * corner points stored in image-space.
   *
   * MATHEMATICAL GUARANTEE:
   *   Given two image-space points P0, P1 that are diagonal corners of a
   *   rectangle axis-aligned in CANVAS space at creation:
   *
   *   1. Convert P0, P1 to canvas space via imageToCanvas (applies rotation)
   *   2. Canvas center = midpoint of the two canvas points (always correct
   *      for a rectangle, since diagonal midpoint = rect center)
   *   3. Canvas delta = C1 - C0 = the diagonal vector in canvas space
   *   4. UNROTATE the delta by -netRot to recover the axis-aligned
   *      width and height in canvas space:
   *        trueW = |dx * cos(netRot) + dy * sin(netRot)|
   *        trueH = |-dx * sin(netRot) + dy * cos(netRot)|
   *   5. Convert center to image space, size to image space (/ scale)
   *
   *   This is the INVERSE of the rendering formula:
   *     corner = center + rotate_by_netRot(±w/2, ±h/2)
   *
   * @param {Object} state - App state (rotation, scale, offset, img dims)
   * @param {Object} m - Measurement with {points, _createdAtRotation}
   * @returns {{ center: {x,y}, size: {w,h} }} Image-space center and size
   */
  function rectCenterSizeFromPoints(state, m) {
    var cp1 = imageToCanvas(state, m.points[0].x, m.points[0].y);
    var cp2 = imageToCanvas(state, m.points[1].x, m.points[1].y);
    var ccx = (cp1.x + cp2.x) / 2, ccy = (cp1.y + cp2.y) / 2;
    var crRot = m._createdAtRotation || 0;
    var nr = (state.rotation - crRot) * Math.PI / 180;
    var cos_nr = Math.cos(nr), sin_nr = Math.sin(nr);
    var dx = cp2.x - cp1.x, dy = cp2.y - cp1.y;
    var trueW = Math.abs(dx * cos_nr + dy * sin_nr);
    var trueH = Math.abs(-dx * sin_nr + dy * cos_nr);
    return {
      center: canvasToImage(state, ccx, ccy),
      size: { w: trueW / state.scale, h: trueH / state.scale }
    };
  }

  return { imageToCanvas, canvasToImage, rectCenterSizeFromPoints };
})();

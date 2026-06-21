# Annotation Behavior During Rotation and Editing

## General Principle

All measurements and annotations store points in **image coordinates** (pixels of the original image).
During rendering, points are converted to canvas coordinates via `imageToCanvas()`, which applies
the current `state.rotation`, `state.scale`, and `state.offset`.

---

## 📏 Distance / 📐 Polyline / ⬡ Polygon / ⭕ Circle / ∠ Angle

### When the image is rotated
- **Points follow the image.** Each point is stored in image coordinates; `imageToCanvas`
  applies rotation during rendering.
- **Behavior:** The shape rotates with the image, maintaining its position relative to
  objects on the image.

### When editing (dragging a point)
- **The point moves in image coordinates.** During a drag, the canvas mouse position is converted to
  image coordinates via `canvasToImage()` and saved in `m.points[i]`.
- **Other points remain unchanged.**
- After changing a point, `M.recalcMeasurement()` is called to recompute `valueMm` and `label`.

### Rendering
- Each point is rendered via `imageToCanvas(state, p.x, p.y)`.
- Selection ring — around the canvas position of the point.

---

## → Arrow / — Line (line/arrow annotations)

### When the image is rotated
- Same as Distance: two points follow the image via `imageToCanvas`.
- The arrow direction (arrowhead angle) is computed in canvas coordinates, so the
  arrow correctly rotates with the image.

### When editing
- Point drag: canvas → image, saved in `m.points[i]`.
- `_createdAtRotation` **does not affect** rendering (no compensation).

---

## □ Rectangle / ⬭ Ellipse (rect/ellipse annotations)

### Storage
- `m.points[0], m.points[1]` — two diagonal corner points in image coordinates.
- `m._rectCenter` — center of the rectangle in image coordinates.
- `m._rectSize` — width and height in image coordinates.
- `m._createdAtRotation` — value of `state.rotation` at creation time.

### When the image is rotated
- **Rectangle follows the image.**
- Center is converted: `imageToCanvas(state, _rectCenter)`.
- Size is scaled: `_rectSize.w * state.scale`.
- `netRot = state.rotation - _createdAtRotation` — rotation compensation since creation.
- Rendering: `translate(center) → rotate(netRot) → rect(-w/2, -h/2, w, h)`.
- **Result:** The rectangle maintains its angle relative to the image (if the image is rotated
  by N degrees after creation, the rectangle also rotates by N).

### When editing (dragging a corner)
- **The dragged corner** is updated in image coordinates via `canvasToImage`.
- **The fixed corner remains in place** (its image coordinates do not change).
- After updating the point, `IC.coords.rectCenterSizeFromPoints(state, m)` is called, which:
  1. Converts both points to canvas coordinates
  2. Computes the canvas center as the midpoint
  3. Unrotates the canvas delta vector by `netRot` to obtain the true width and height (not bounding box):
     ```
     trueW = |dx·cos(netRot) + dy·sin(netRot)|
     trueH = |-dx·sin(netRot) + dy·cos(netRot)|
     ```
  4. Converts the center to image coordinates, divides size by scale
- **Important:** `_createdAtRotation` **does not change** during editing, so
  `netRot` remains the same, and the rectangle maintains its visual angle.

### Hit detection (click on a corner)
- Checks the canvas position of the corners (same as selection rings),
  not `m.points[i]` in image coordinates.
- Corner position formula:
  ```
  corner = imageToCanvas(center) + rotate_by_netRot(±w/2, ±h/2)
  ```

---

## 🔤 Text (text annotations)

### When the image is rotated
- **Text follows the image.** A single point (anchor) is converted via `imageToCanvas`.
- Text has **independent rotation** (`_textRotation`), which does not depend on `state.rotation`.

### When editing (dragging)
- **The point `m.points[0]` moves** (anchor), not `labelOffX`/`labelOffY`.
  - Reason: for text, anchor = text position; they don't need to be separated.
- `canvasToImage(mouse)` → new image position → `m.points[0]`.
- `labelOffX`/`labelOffY` are reset to 0.
- Selection ring — dashed border around the text (in the rotated text space).

### Hit detection
- By label rectangle (via `getLabelCanvasPos` + `getLabelRect`).
- Drag label preserves the grab offset.

---

## ▬ Scalebar

### When the image is rotated
- **Scalebar follows the image.** A single point (center of the scalebar) is converted via `imageToCanvas`.
- The scalebar is always horizontal in canvas space (axis-aligned), does not rotate.
- Scalebar length in canvas: `valueMm * pxPerMm(mmPerPx) * scale`.

### When editing
- Dragging the center via `dragState.offsetCanvas` (scalebar moved as a whole).

---

---

## 🏷️ Labels for Measurements

### Behavior during rotation and zoom
- The label is rendered in canvas coordinates computed via `getLabelCanvasPos(state, m, ctx)`.
- For most types: base position = `getLabelBasePos(state, m)` (image coordinates,
  e.g., the midpoint of a segment), converted to canvas via `imageToCanvas`.
- Exception — **scalebar**: label position is computed directly in canvas coordinates
  (to the left of the scalebar, 10px offset).
- **Font size** is not scaled (always in px), but `labelOffX`/`labelOffY`
  are multiplied by `state.scale`.

### Offset anchoring
- `labelOffX`/`labelOffY` — offset from the anchor (measurement base position)
  to the **center of the label's bounding box** (text + 6px padding).
- Anchor = `getLabelBasePos(state, m)` (image coordinates).
- **For all types except scalebar** — offset in image coordinates, applied
  BEFORE `imageToCanvas`: `imageToCanvas(base.x + labelOffX, base.y + labelOffY)`.
  **Consequence:** offset rotates with the image.
- **For scalebar** — offset in canvas coordinates (axis-aligned, scalebar is always horizontal).
- **For text annotations** — `labelOffX`/`labelOffY = 0` (text always centered on the anchor).
  Moving the text changes `m.points[0]`, not the offset.

### Dragging a label
- During a drag, `m.style.labelOffX`/`labelOffY` are updated.
- The grab offset is preserved (`_dragLabelOffset`) relative to the label center,
  so the label doesn't jump to the cursor.
- Exception — **text annotation**: drag moves `m.points[0]` (anchor),
  `labelOffX`/`labelOffY` are reset to 0 (text always centered on the anchor).

### Rich Text (LaTeX formatting)
Support for labels (via `U.parseRichText`):
- `\it{...}` / `\italic{...}` — italic
- `_{...}` — subscript
- `^{...}` — superscript
- `\alpha`, `\beta`, `\mu`, `\degree`, etc. — Greek letters and symbols
- `\cdot`, `\approx`, `\rightarrow`, etc. — mathematical symbols

### Bounding box dimensions

**Rendering (`drawLabel`):**
```
segs = U.parseRichText(text)  // parse LaTeX → segments with font/italic/size
totalW = Σ segWidth(seg)      // each segment measured with its own font
pad = max(3, round(fontSize * 0.35))
tw = totalW + pad*2
th = fontSize + pad*2
lx = x - tw/2,  ly = y - th/2  // center = (x, y)
```

- `drawLabel` uses `parseRichText`, which accounts for `\it{}` (italic),
  `_{}` (sub — 60% of base size), `^{}` (super — 60% of base size).
- Width = sum of individual segment widths, each with its own font.
- Background is drawn as roundRect or rect with these dimensions.

**Hit detection (`getLabelRect`):**
```
ctx.font = fontWeight + fontStyle + fontSize + fontFamily
m = ctx.measureText(text)       // measures the ENTIRE text (with LaTeX commands)
pad = max(3, round(fontSize * 0.35))
tw = m.width + pad*2
th = fontSize + pad*2
```

- Simplified measurement: does not parse rich text, measures the raw string.
- **Consequence:** the hit area may be slightly wider than the visual label
  (LaTeX commands `\it{}` take up space in measurement, though invisible).
- This is considered acceptable: a larger hit area is easier to click.

### Label styles
- Stored in `m.style`: fontFamily, fontSize, fontColor, fontWeight, fontStyle.
- `labelBg` / `labelBgOpacity` — label background.
- `labelFormat` — formatting template (`{v}`, `{v3.2}`).
- `labelVisible` — show/hide (per-measurement).
- Can be saved as default for a type via the "💾 Remember" button.

---

---

## 🖼 PNG Export — 4 Modes

### Resolution
| Mode | Canvas Size | scale | offset |
|---|---|---|---|
| **Screen** | Current canvas (`dom.canvas.width × height`) | `state.scale` (current) | `state.offset` (current) |
| **Print** | `ceil(imgW × factor) × ceil(imgH × factor)`, where `factor = max(1, 1800 / imgW)` | `factor` | `{x: 0, y: 0}` (top-left) |

- Print mode: uses current `state.rotation`.
- Print mode: `fontSize`, `lineWidth`, `pointSize`, `barHeight`, `labelOffX`/`labelOffY`
  are scaled by `ratio = factor / state.scale`.

### Clipping (clipMeasurements)

**Clip OFF** (default):
```
boundingBox = union(
    cropRect ?? fullImage,          // cropped image or full
    all measurement points,          // pts of each measurement
    all label bounding boxes,        // getLabelRect for each label
    scalebarRect,                    // scalebar rectangle
    circleRings,                     // circle3/circle1 rings
    annotationBounds                 // rect/ellipse/arrow/line
)
// No margins — exact crop to boundingBox
```

**Clip ON**:
```
if cropRect ≠ null  → render only within cropRect (hard clip)
if cropRect = null  → full image + all content (like Clip OFF)
```

### Pipeline
```
1. Determine render params (screen/print) → {w, h, scale, offset, setDpi}
2. Save original state (scale, offset, cropRect, styles)
3. Set export state
4. If Clip OFF: compute boundingBox via computeContentBounds
   and expand canvas + offset to boundingBox
5. Render via renderToCanvas
6. Final crop to target rectangle
7. Restore original state
8. If Print: embed pHYs chunk (300 DPI) into PNG
9. Download blob
```

---

## Important Rules

1. **Image coordinates are stable.** They do not change during zoom/pan/rotate. All points are stored in image coordinates.
2. **Canvas coordinates are temporary.** They are computed at each render via `imageToCanvas`.
3. **netRot = state.rotation - _createdAtRotation**. For shapes with rotation compensation (rect/ellipse).
4. **Single function for recomputation.** `rectCenterSizeFromPoints` in `coords.js` is the only place
   where the center/size of rect/ellipse is computed from points. Do not duplicate the logic!

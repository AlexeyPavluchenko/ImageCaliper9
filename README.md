# ImageCaliper 9

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?logo=github)](https://AlexeyPavluchenko.github.io/ImageCaliper9/)

Image measurement and annotation tool. Runs entirely in the browser, no server or installation required.

[Русская версия](README.ru.md)

## Features

**Measurements:**
- 📏 Distance — click 2 points
- ⭕ Circle diameter — 3 points or center+radius
- 📐 Polyline length — any number of segments
- ⬡ Polygon area — automatic calculation
- ∠ Angle — with degree display

**Annotations:**
- Lines and arrows
- Rectangles and ellipses
- Rich text (Greek letters, sub/superscript, italic)
- Scale bar with adjustable border and opacity

**Tools:**
- 🗜 Calibration — by known-length segment, DPI, or presets
- ↻ Image rotation with guides (10° and 1° steps)
- ✂ Crop with free or fixed aspect ratio
- 🖼 PNG export — screen or print resolution (300 DPI), with or without clipping

**Interface:**
- 🌐 English / Русский — switch language without reload
- Drag-and-drop reorder measurements in draw order
- Edit objects and save default styles
- Shift+drag to move entire shape

## Usage

Open `index.html` in any modern browser:
- Load an image (JPEG, PNG, TIFF, etc.)
- Calibrate — set DPI or draw a known-length segment
- Choose a measurement tool and click on the image

## Supported image formats

JPEG, PNG, BMP, WebP, TIFF, PPM/PGM/PBM

## Instruments

Developed with Zoo Code on DeepSeek V4 Flash engine.
Tiff handling with UTIF.js — MIT License, Copyright (c) Photopea (https://github.com/photopea/UTIF.js)

## License

MIT © 2026 Alexey Pavluchenko. See [LICENSE](LICENSE).

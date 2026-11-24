(() => {
  if (typeof quill === 'undefined') return;

  // 20-Color Palette (includes Orange, Golden Yellow, Normal Yellow, etc.)
  const PALETTE_20 = [
    { name: 'Black', hex: '#111827' },
    { name: 'Dark Gray', hex: '#4b5563' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Brown', hex: '#92400e' },
    { name: 'Crimson', hex: '#991b1b' },
    { name: 'Red', hex: '#ef4444' },
    { name: 'Deep Orange', hex: '#ea580c' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Golden Yellow', hex: '#f59e0b' },
    { name: 'Normal Yellow', hex: '#facc15' },
    { name: 'Lime', hex: '#84cc16' },
    { name: 'Green', hex: '#16a34a' },
    { name: 'Forest Green', hex: '#166534' },
    { name: 'Teal', hex: '#0d9488' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Sky Blue', hex: '#38bdf8' },
    { name: 'Blue', hex: '#2563eb' },
    { name: 'Navy', hex: '#1e3a8a' },
    { name: 'Purple', hex: '#9333ea' },
    { name: 'Pink', hex: '#ec4899' }
  ];

  // 1. Inject Scoped Styles for Full-Screen Paint Studio, 20-Color Controls & Text Overlay
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .paint-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 900;
      background: rgba(15, 23, 42, 0.78);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 12px;
      touch-action: manipulation;
    }

    .paint-modal-backdrop.open {
      display: flex;
    }

    .paint-modal {
      position: relative;
      width: 100%;
      max-width: 1020px;
      height: 94vh;
      max-height: 94vh;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.38);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: "Roboto", -apple-system, BlinkMacSystemFont, Arial, sans-serif;
    }

    /* Full-screen drawing studio on phones & tablets */
    @media (max-width: 768px) {
      .paint-modal-backdrop {
        padding: 0;
      }
      .paint-modal {
        width: 100vw;
        max-width: 100vw;
        height: 100vh;
        height: 100dvh;
        max-height: 100dvh;
        border-radius: 0;
      }
    }

    .paint-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px 10px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;
    }

    .paint-title {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
    }

    .paint-header-actions {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-wrap: wrap;
    }

    .paint-btn {
      padding: 5px 10px;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
    }

    .paint-btn:hover {
      background: #f1f5f9;
    }

    .paint-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .paint-btn.primary {
      background: #2563eb;
      border-color: #2563eb;
      color: #ffffff;
    }

    .paint-btn.primary:hover {
      background: #1d4ed8;
    }

    .paint-btn.danger {
      color: #b91c1c;
      border-color: #fecaca;
      background: #fef2f2;
    }

    .paint-btn.danger:hover {
      background: #fee2e2;
    }

    /* Tools Row */
    .paint-toolbar-row {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 10px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-x;
      flex-shrink: 0;
    }

    .paint-tool-btn {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
    }

    .paint-tool-btn:hover {
      background: #eff6ff;
      border-color: #93c5fd;
    }

    .paint-tool-btn.active {
      background: #2563eb;
      border-color: #2563eb;
      color: #ffffff;
    }

    /* Row 1: Slidable 20-Color Outline / Text Palette */
    .paint-color-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
      color: #334155;
      flex-shrink: 0;
    }

    .paint-row-label {
      font-weight: 700;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .paint-color-input-sm {
      width: 24px;
      height: 24px;
      padding: 1px;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      background: #ffffff;
      cursor: pointer;
      flex-shrink: 0;
    }

    .paint-swatches-scroll {
      display: flex;
      align-items: center;
      gap: 7px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-x;
      padding: 3px 4px;
      flex: 1 1 auto;
      scrollbar-width: thin;
    }

    .paint-swatch {
      flex: 0 0 auto;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 1.5px solid rgba(15, 23, 42, 0.25);
      cursor: pointer;
      padding: 0;
      touch-action: manipulation;
      transition: transform 0.1s ease;
    }

    .paint-swatch.active {
      box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #2563eb;
      transform: scale(1.08);
    }

    /* Row 2 (beneath Outline): Fill Toggle + Small Fill Box + Size Slider + Selected Controls */
    .paint-props-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      padding: 6px 10px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
      color: #334155;
      flex-shrink: 0;
    }

    .paint-prop-group {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .paint-toggle-fill {
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 5px;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      color: #475569;
      cursor: pointer;
      touch-action: manipulation;
    }

    .paint-toggle-fill.on {
      background: #dbeafe;
      border-color: #3b82f6;
      color: #1d4ed8;
    }

    /* Small Square Trigger for the 20-Color Fill Popup */
    .paint-fill-box-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 6px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      cursor: pointer;
      touch-action: manipulation;
    }

    .paint-fill-box-btn:hover {
      border-color: #2563eb;
    }

    .paint-fill-square {
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 3px;
      border: 1px solid rgba(15, 23, 42, 0.28);
    }

    .paint-fill-caret {
      font-size: 10px;
      color: #475569;
      line-height: 1;
    }

    /* Neat 20-Small-Square Fill Color Grid Popup */
    .paint-fill-popover {
      position: fixed;
      z-index: 960;
      display: none;
      width: 214px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.28);
      padding: 10px;
      touch-action: manipulation;
    }

    .paint-fill-popover.open {
      display: block;
    }

    .paint-fill-popover-title {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .paint-fill-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 7px;
      margin-bottom: 9px;
    }

    .paint-fill-cell {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      border: 1.5px solid rgba(15, 23, 42, 0.22);
      cursor: pointer;
      padding: 0;
      margin: 0 auto;
      touch-action: manipulation;
    }

    .paint-fill-cell.active {
      box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #2563eb;
    }

    .paint-fill-popover-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #e2e8f0;
      padding-top: 7px;
      font-size: 11px;
      color: #475569;
    }

    .paint-size-slider {
      width: 78px;
      accent-color: #2563eb;
      cursor: pointer;
    }

    .paint-selected-controls {
      display: none;
      align-items: center;
      gap: 5px;
      flex-wrap: wrap;
      margin-left: auto;
    }

    .paint-selected-controls.visible {
      display: inline-flex;
    }

    /* Maximized Canvas Workspace */
    .paint-canvas-wrap {
      position: relative;
      flex: 1 1 auto;
      min-height: 0;
      background: #cbd5e1;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    #paint-canvas {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      background: #ffffff;
      border-radius: 4px;
      box-shadow: 0 4px 18px rgba(15, 23, 42, 0.22);
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      cursor: crosshair;
      display: block;
    }

    /* Inline Text Box Overlay (stays above mobile keyboard) */
    .paint-text-overlay {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 950;
      width: min(340px, calc(100% - 20px));
      background: #ffffff;
      border: 1px solid #93c5fd;
      border-radius: 10px;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.3);
      padding: 10px;
      display: none;
      flex-direction: column;
      gap: 8px;
    }

    .paint-text-overlay.open {
      display: flex;
    }

    .paint-text-overlay-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
    }

    .paint-text-input {
      width: 100%;
      min-height: 62px;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-family: "Roboto", Arial, sans-serif;
      font-size: 16px;
      line-height: 1.35;
      resize: vertical;
      outline: none;
    }

    .paint-text-input:focus {
      border-color: #2563eb;
    }

    .paint-text-overlay-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 6px;
    }

    .paint-text-bold-btn.active {
      background: #2563eb;
      border-color: #2563eb;
      color: #ffffff;
    }

    .paint-footer-hint {
      padding: 5px 10px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #64748b;
      text-align: center;
      flex-shrink: 0;
    }

    .img-bar-btn.paint-edit-btn {
      background: #1d4ed8;
      border-color: #3b82f6;
      color: #ffffff;
    }

    .img-bar-btn.paint-edit-btn:hover {
      background: #2563eb;
    }
  `;
  document.head.appendChild(styleEl);

  // 2. Add Paint Button to Existing Quill Toolbar (next to Insert Image)
  const pageBreakBtnEl = document.getElementById('page-break-btn');
  const paintOpenBtn = document.createElement('button');
  paintOpenBtn.type = 'button';
  paintOpenBtn.id = 'paint-open-btn';
  paintOpenBtn.className = 'custom-toolbar-btn';
  paintOpenBtn.title = 'Paint & Draw Shapes';
  paintOpenBtn.setAttribute('aria-label', 'Paint & Draw Shapes');
  paintOpenBtn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M18.37 2.63L14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/>
      <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/>
    </svg>
  `;
  if (pageBreakBtnEl && pageBreakBtnEl.parentElement) {
    pageBreakBtnEl.parentElement.insertBefore(paintOpenBtn, pageBreakBtnEl);
  }

  // 3. Add "Edit Paint" Button to Existing Image Resize Bar
  const resizeBarEl = document.getElementById('img-resize-bar');
  let editPaintImgBtn = null;
  if (resizeBarEl) {
    editPaintImgBtn = document.createElement('button');
    editPaintImgBtn.type = 'button';
    editPaintImgBtn.className = 'img-bar-btn paint-edit-btn';
    editPaintImgBtn.textContent = 'Edit Paint';
    editPaintImgBtn.style.display = 'none';
    const firstGroup = resizeBarEl.querySelector('.img-bar-group');
    if (firstGroup) {
      firstGroup.parentElement.insertBefore(editPaintImgBtn, firstGroup);
    } else {
      resizeBarEl.prepend(editPaintImgBtn);
    }
  }

  // Build HTML strings for the 20 Outline/Text swatches and 20 Fill grid cells
  const outlineSwatchesHTML = PALETTE_20.map(
    (c) => `<button type="button" class="paint-swatch" data-color="${c.hex}" style="background:${c.hex}" title="${c.name}" aria-label="${c.name}"></button>`
  ).join('');

  const fillGridCellsHTML = PALETTE_20.map(
    (c) => `<button type="button" class="paint-fill-cell" data-color="${c.hex}" style="background:${c.hex}" title="${c.name}" aria-label="${c.name}"></button>`
  ).join('');

  // 4. Inject Paint Studio Modal & 20-Square Fill Popover HTML
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'paint-modal-backdrop';
  modalBackdrop.id = 'paint-modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="paint-modal" role="dialog" aria-modal="true" aria-label="Paint Studio">
      <div class="paint-header">
        <div class="paint-title">Paint Studio</div>
        <div class="paint-header-actions">
          <button type="button" class="paint-btn" id="paint-undo-btn" title="Undo">Undo</button>
          <button type="button" class="paint-btn" id="paint-redo-btn" title="Redo">Redo</button>
          <button type="button" class="paint-btn danger" id="paint-clear-btn" title="Clear Canvas">Clear</button>
          <button type="button" class="paint-btn" id="paint-cancel-btn">Cancel</button>
          <button type="button" class="paint-btn primary" id="paint-insert-btn">Insert</button>
        </div>
      </div>

      <!-- Tools Row -->
      <div class="paint-toolbar-row" id="paint-tools-row">
        <button type="button" class="paint-tool-btn" data-tool="select">Select / Resize</button>
        <button type="button" class="paint-tool-btn active" data-tool="pencil">Pencil</button>
        <button type="button" class="paint-tool-btn" data-tool="text">Text</button>
        <button type="button" class="paint-tool-btn" data-tool="eraser">Eraser</button>
        <button type="button" class="paint-tool-btn" data-tool="bucket">Fill Bucket</button>
        <button type="button" class="paint-tool-btn" data-tool="line">Line</button>
        <button type="button" class="paint-tool-btn" data-tool="arrow">Arrow</button>
        <button type="button" class="paint-tool-btn" data-tool="rect">Rectangle</button>
        <button type="button" class="paint-tool-btn" data-tool="square">Square</button>
        <button type="button" class="paint-tool-btn" data-tool="circle">Circle</button>
        <button type="button" class="paint-tool-btn" data-tool="oval">Oval</button>
        <button type="button" class="paint-tool-btn" data-tool="triangle">Triangle</button>
        <button type="button" class="paint-tool-btn" data-tool="prism">Prism</button>
        <button type="button" class="paint-tool-btn" data-tool="cube">Cube</button>
        <button type="button" class="paint-tool-btn" data-tool="cylinder">Cylinder</button>
      </div>

      <!-- Row 1: 20 Slidable Outline / Text Colors -->
      <div class="paint-color-row">
        <span class="paint-row-label" id="paint-color-label">Color:</span>
        <input type="color" id="paint-stroke-color" class="paint-color-input-sm" value="#111827" title="Custom Color" />
        <div class="paint-swatches-scroll" id="paint-stroke-swatches">
          ${outlineSwatchesHTML}
        </div>
      </div>

      <!-- Row 2 (beneath Color): Fill On/Off + Small Fill Square + Size + Selected Controls -->
      <div class="paint-props-row">
        <div class="paint-prop-group">
          <button type="button" id="paint-fill-toggle" class="paint-toggle-fill">Fill: Off</button>
          <button type="button" id="paint-fill-box-btn" class="paint-fill-box-btn" title="Choose Fill Color" aria-haspopup="true" aria-expanded="false">
            <span class="paint-fill-square" id="paint-fill-square" style="background:#facc15"></span>
            <span class="paint-fill-caret">&#9662;</span>
          </button>
        </div>

        <div class="paint-prop-group">
          <span><strong id="paint-size-label">Size:</strong> <span id="paint-size-val">3</span>px</span>
          <input type="range" id="paint-size-slider" class="paint-size-slider" min="1" max="22" value="3" />
        </div>

        <div class="paint-selected-controls" id="paint-selected-controls">
          <button type="button" class="paint-btn" id="paint-edit-text-btn" style="display:none;">Edit Text</button>
          <button type="button" class="paint-btn" id="paint-shrink-btn" title="Decrease Size">− Smaller</button>
          <button type="button" class="paint-btn" id="paint-grow-btn" title="Increase Size">+ Larger</button>
          <button type="button" class="paint-btn danger" id="paint-delete-shape-btn" title="Delete Selected">Delete</button>
        </div>
      </div>

      <!-- Maximized Drawing Area -->
      <div class="paint-canvas-wrap" id="paint-canvas-wrap">
        <canvas id="paint-canvas"></canvas>

        <!-- Inline Text Editor Box for typing over shapes -->
        <div class="paint-text-overlay" id="paint-text-overlay">
          <div class="paint-text-overlay-head">
            <span id="paint-text-overlay-title">Type Text on Canvas</span>
            <button type="button" class="paint-btn paint-text-bold-btn" id="paint-text-bold-btn">Bold</button>
          </div>
          <textarea id="paint-text-input" class="paint-text-input" placeholder="Type text here..."></textarea>
          <div class="paint-text-overlay-controls">
            <span style="font-size:11px; color:#64748b;">Pick any color above for text</span>
            <div style="display:flex; gap:6px;">
              <button type="button" class="paint-btn" id="paint-text-cancel-btn">Cancel</button>
              <button type="button" class="paint-btn primary" id="paint-text-apply-btn">Add Text</button>
            </div>
          </div>
        </div>
      </div>

      <div class="paint-footer-hint" id="paint-footer-hint">
        Draw freely with your finger or mouse. Slide colors above or switch tools to add shapes and text.
      </div>
    </div>

    <!-- Neat 20-Small-Square Fill Color Grid Popup -->
    <div class="paint-fill-popover" id="paint-fill-popover" role="dialog" aria-label="Choose Fill Color">
      <div class="paint-fill-popover-title">
        <span>Fill Colors (20)</span>
      </div>
      <div class="paint-fill-grid" id="paint-fill-grid">
        ${fillGridCellsHTML}
      </div>
      <div class="paint-fill-popover-footer">
        <span>Custom shade:</span>
        <input type="color" id="paint-fill-custom-input" class="paint-color-input-sm" value="#facc15" />
      </div>
    </div>
  `;
  document.body.appendChild(modalBackdrop);

  // 5. Canvas & State Initialization (Crisp 2x Hi-DPI Canvas)
  const LOGICAL_W = 760;
  const LOGICAL_H = window.innerWidth <= 768 ? 1120 : 560;
  const SCALE = 2;

  const canvasWrap = document.getElementById('paint-canvas-wrap');
  const canvas = document.getElementById('paint-canvas');
  canvas.width = LOGICAL_W * SCALE;
  canvas.height = LOGICAL_H * SCALE;
  const ctx = canvas.getContext('2d');

  // Offscreen layer lets Eraser erase strokes without affecting custom canvas background colors
  const offCanvas = document.createElement('canvas');
  offCanvas.width = LOGICAL_W * SCALE;
  offCanvas.height = LOGICAL_H * SCALE;
  const offCtx = offCanvas.getContext('2d');

  const toolBtns = document.querySelectorAll('#paint-tools-row .paint-tool-btn');
  const colorLabelEl = document.getElementById('paint-color-label');
  const strokeColorInput = document.getElementById('paint-stroke-color');
  const strokeSwatches = document.querySelectorAll('#paint-stroke-swatches .paint-swatch');
  const fillToggleBtn = document.getElementById('paint-fill-toggle');
  const fillBoxBtn = document.getElementById('paint-fill-box-btn');
  const fillSquareEl = document.getElementById('paint-fill-square');
  const fillPopover = document.getElementById('paint-fill-popover');
  const fillCells = document.querySelectorAll('#paint-fill-grid .paint-fill-cell');
  const fillCustomInput = document.getElementById('paint-fill-custom-input');
  const sizeLabelEl = document.getElementById('paint-size-label');
  const sizeSlider = document.getElementById('paint-size-slider');
  const sizeValEl = document.getElementById('paint-size-val');
  const undoBtn = document.getElementById('paint-undo-btn');
  const redoBtn = document.getElementById('paint-redo-btn');
  const clearBtn = document.getElementById('paint-clear-btn');
  const cancelBtn = document.getElementById('paint-cancel-btn');
  const insertBtn = document.getElementById('paint-insert-btn');
  const selectedControls = document.getElementById('paint-selected-controls');
  const editTextBtn = document.getElementById('paint-edit-text-btn');
  const shrinkBtn = document.getElementById('paint-shrink-btn');
  const growBtn = document.getElementById('paint-grow-btn');
  const deleteShapeBtn = document.getElementById('paint-delete-shape-btn');
  const hintEl = document.getElementById('paint-footer-hint');

  const textOverlay = document.getElementById('paint-text-overlay');
  const textOverlayTitle = document.getElementById('paint-text-overlay-title');
  const textInput = document.getElementById('paint-text-input');
  const textBoldBtn = document.getElementById('paint-text-bold-btn');
  const textCancelBtn = document.getElementById('paint-text-cancel-btn');
  const textApplyBtn = document.getElementById('paint-text-apply-btn');

  const paintStateBySrc = new Map();

  let currentTool = 'pencil';
  let strokeColor = '#111827';
  let fillColor = '#facc15';
  let fillEnabled = false;
  let strokeSize = 3;
  let textFontSize = 24;
  let textBold = false;

  let objects = [];
  let canvasBg = '#ffffff';
  let undoStack = [];
  let redoStack = [];
  let selectedIndex = -1;

  let isPointerDown = false;
  let activeAction = null; // 'draw' | 'move' | 'resize'
  let resizeHandle = null; // 'nw' | 'ne' | 'sw' | 'se'
  let startPt = null;
  let previewObj = null;
  let origObjSnapshot = null;
  let origBoundsSnapshot = null;

  let pendingTextPt = null;
  let editingTextObjIndex = -1;

  let insertTargetIndex = 0;
  let editingImgEl = null;

  const HINTS = {
    select: 'Tap any shape or text to select it. Drag to move, drag corners or use Smaller/Larger to resize, or pick colors above.',
    pencil: 'Move your finger or mouse across the canvas to draw freely.',
    text: 'Tap inside any shape or anywhere on the canvas to place text. Pick any of the 20 colors above for your text.',
    eraser: 'Drag over any area to erase strokes or parts of shapes.',
    bucket: 'Tap inside any shape to fill it with the chosen Fill color, or tap empty space to color the background.',
    line: 'Drag across the canvas to draw a straight line.',
    arrow: 'Drag across the canvas to draw an arrow.',
    rect: 'Drag to draw a rectangle. Turn Fill On and pick from the 20-color box to fill it.',
    square: 'Drag to draw a perfect square.',
    circle: 'Drag to draw a perfect circle.',
    oval: 'Drag to draw an oval or ellipse.',
    triangle: 'Drag to draw a triangle.',
    prism: 'Drag to draw a 3D triangular prism.',
    cube: 'Drag to draw a 3D cube / rectangular prism.',
    cylinder: 'Drag to draw a 3D cylinder.'
  };

  // Fit canvas cleanly inside the full-screen wrap while preserving exact 760:560 aspect ratio
  function fitCanvasToScreen() {
    if (!modalBackdrop.classList.contains('open')) return;
    const availW = Math.max(200, canvasWrap.clientWidth - 16);
    const availH = Math.max(180, canvasWrap.clientHeight - 16);
    const ratio = LOGICAL_W / LOGICAL_H;

    let displayW = availW;
    let displayH = displayW / ratio;
    if (displayH > availH) {
      displayH = availH;
      displayW = displayH * ratio;
    }

    canvas.style.width = `${Math.floor(displayW)}px`;
    canvas.style.height = `${Math.floor(displayH)}px`;
  }

  window.addEventListener('resize', () => {
    fitCanvasToScreen();
    closeFillPopover();
  });

  function cloneState() {
    return JSON.stringify({ objects, canvasBg });
  }

  function restoreState(serialized) {
    const parsed = JSON.parse(serialized);
    objects = parsed.objects || [];
    canvasBg = parsed.canvasBg || '#ffffff';
    if (selectedIndex >= objects.length) selectedIndex = -1;
    updateSelectedControlsUI();
    updateHistoryButtons();
    render();
  }

  function pushHistory() {
    undoStack.push(cloneState());
    if (undoStack.length > 60) undoStack.shift();
    redoStack = [];
    updateHistoryButtons();
  }

  function updateHistoryButtons() {
    undoBtn.disabled = undoStack.length <= 1;
    redoBtn.disabled = redoStack.length === 0;
  }

  function syncStrokeSwatchUI() {
    const lower = strokeColor.toLowerCase();
    strokeColorInput.value = strokeColor;
    strokeSwatches.forEach((sw) => {
      sw.classList.toggle('active', sw.dataset.color.toLowerCase() === lower);
    });
    syncTextInputPreviewStyle();
  }

  function syncFillUI() {
    const lower = fillColor.toLowerCase();
    fillSquareEl.style.background = fillColor;
    fillCustomInput.value = fillColor;
    fillCells.forEach((cell) => {
      cell.classList.toggle('active', cell.dataset.color.toLowerCase() === lower);
    });
  }

  function setFillEnabled(on) {
    fillEnabled = Boolean(on);
    fillToggleBtn.classList.toggle('on', fillEnabled);
    fillToggleBtn.textContent = fillEnabled ? 'Fill: On' : 'Fill: Off';
  }

  function isTextModeActive() {
    if (currentTool === 'text') return true;
    if (textOverlay.classList.contains('open')) return true;
    if (selectedIndex >= 0 && objects[selectedIndex] && objects[selectedIndex].type === 'text') {
      return true;
    }
    return false;
  }

  function syncSizeSlider() {
    if (isTextModeActive()) {
      sizeLabelEl.textContent = 'Text:';
      colorLabelEl.textContent = 'Text Color:';
      sizeSlider.min = '12';
      sizeSlider.max = '64';
      sizeSlider.value = String(textFontSize);
      sizeValEl.textContent = String(textFontSize);
    } else {
      sizeLabelEl.textContent = 'Size:';
      colorLabelEl.textContent = 'Color:';
      sizeSlider.min = '1';
      sizeSlider.max = '22';
      sizeSlider.value = String(strokeSize);
      sizeValEl.textContent = String(strokeSize);
    }
  }

  function setActiveTool(tool) {
    closeFillPopover();
    if (tool !== 'text') closeTextOverlay();

    currentTool = tool;
    toolBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
    if (tool !== 'select') {
      selectedIndex = -1;
      updateSelectedControlsUI();
    }
    canvas.style.cursor =
      tool === 'select'
        ? 'default'
        : tool === 'bucket'
        ? 'cell'
        : tool === 'text'
        ? 'text'
        : 'crosshair';
    hintEl.textContent = HINTS[tool] || '';
    syncSizeSlider();
    render();
  }

  function updateSelectedControlsUI() {
    const hasSelection = selectedIndex >= 0 && selectedIndex < objects.length;
    selectedControls.classList.toggle('visible', hasSelection);
    editTextBtn.style.display = 'none';

    if (hasSelection) {
      const obj = objects[selectedIndex];
      if (obj.color) {
        strokeColor = obj.color;
        syncStrokeSwatchUI();
      }
      if (obj.type === 'text') {
        textFontSize = obj.fontSize || 24;
        textBold = Boolean(obj.bold);
        editTextBtn.style.display = 'inline-block';
      } else {
        if (typeof obj.size === 'number') {
          strokeSize = obj.size;
        }
        if ('fill' in obj) {
          if (obj.fill) {
            setFillEnabled(true);
            fillColor = obj.fill;
            syncFillUI();
          } else {
            setFillEnabled(false);
          }
        }
      }
    }
    syncSizeSlider();
  }

  // 6. Neat 20-Small-Square Fill Color Grid Popover Positioning
  function openFillPopover() {
    const btnRect = fillBoxBtn.getBoundingClientRect();
    const popW = 214;
    const popH = 215;

    let left = btnRect.left;
    if (left + popW > window.innerWidth - 10) {
      left = Math.max(10, window.innerWidth - popW - 10);
    }

    let top = btnRect.bottom + 6;
    if (top + popH > window.innerHeight - 10) {
      top = Math.max(10, btnRect.top - popH - 6);
    }

    fillPopover.style.left = `${Math.round(left)}px`;
    fillPopover.style.top = `${Math.round(top)}px`;
    fillPopover.classList.add('open');
    fillBoxBtn.setAttribute('aria-expanded', 'true');
  }

  function closeFillPopover() {
    fillPopover.classList.remove('open');
    fillBoxBtn.setAttribute('aria-expanded', 'false');
  }

  // 7. Inline Text Box Helpers (for typing text over shapes)
  function syncTextInputPreviewStyle() {
    textInput.style.color = strokeColor;
    textInput.style.fontWeight = textBold ? '700' : '400';
    // Keep white/very light text readable while typing in the box
    const isVeryLight =
      strokeColor.toLowerCase() === '#ffffff' || strokeColor.toLowerCase() === '#facc15';
    textInput.style.background = isVeryLight ? '#334155' : '#ffffff';
    textBoldBtn.classList.toggle('active', textBold);
  }

  function openTextOverlay(pt, existingIdx = -1) {
    closeFillPopover();
    editingTextObjIndex = existingIdx;

    if (existingIdx >= 0 && objects[existingIdx] && objects[existingIdx].type === 'text') {
      const obj = objects[existingIdx];
      pendingTextPt = { x: obj.x, y: obj.y };
      textInput.value = obj.text || '';
      strokeColor = obj.color || '#111827';
      textFontSize = obj.fontSize || 24;
      textBold = Boolean(obj.bold);
      textOverlayTitle.textContent = 'Edit Text';
      textApplyBtn.textContent = 'Save Text';
      syncStrokeSwatchUI();
    } else {
      pendingTextPt = pt;
      textInput.value = '';
      textOverlayTitle.textContent = 'Type Text on Canvas';
      textApplyBtn.textContent = 'Add Text';
    }

    textOverlay.classList.add('open');
    syncSizeSlider();
    syncTextInputPreviewStyle();
    setTimeout(() => textInput.focus(), 30);
  }

  function closeTextOverlay() {
    textOverlay.classList.remove('open');
    pendingTextPt = null;
    editingTextObjIndex = -1;
    syncSizeSlider();
  }

  // 8. Color Shading Helper for 3D Shapes
  function shadeColor(hex, percent) {
    if (!hex || hex[0] !== '#') return hex;
    let clean = hex.slice(1);
    if (clean.length === 3) {
      clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
    }
    const num = parseInt(clean, 16);
    if (Number.isNaN(num)) return hex;
    const amt = Math.round(2.55 * percent);
    const r = Math.max(0, Math.min(255, (num >> 16) + amt));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
    const b = Math.max(0, Math.min(255, (num & 0xff) + amt));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // 9. Geometry, Text Measurement, Bounds & Hit-Testing Helpers
  function measureTextObject(obj) {
    const fontSize = obj.fontSize || 24;
    const lines = String(obj.text || '').split('\n');
    const lineHeight = fontSize * 1.25;

    ctx.save();
    ctx.font = `${obj.bold ? '700' : '400'} ${fontSize}px "Roboto", Arial, sans-serif`;
    let maxW = 24;
    for (const line of lines) {
      const w = ctx.measureText(line).width;
      if (w > maxW) maxW = w;
    }
    ctx.restore();

    return {
      w: Math.max(24, maxW),
      h: Math.max(lineHeight, lines.length * lineHeight)
    };
  }

  function getBounds(obj) {
    if (obj.type === 'text') {
      const m = measureTextObject(obj);
      return { x: obj.x, y: obj.y, w: m.w, h: m.h };
    }
    if (obj.type === 'freehand' || obj.type === 'eraser') {
      if (!obj.points || obj.points.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of obj.points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
      return { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
    }
    if (obj.type === 'line' || obj.type === 'arrow') {
      const minX = Math.min(obj.x1, obj.x2);
      const minY = Math.min(obj.y1, obj.y2);
      const maxX = Math.max(obj.x1, obj.x2);
      const maxY = Math.max(obj.y1, obj.y2);
      return { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
    }
    return { x: obj.x, y: obj.y, w: obj.w, h: obj.h };
  }

  function distToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
    const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
    const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
    const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    return !(hasNeg && hasPos);
  }

  function hitTestObject(obj, px, py, strictInterior = false) {
    if (obj.type === 'eraser') return false;

    if (obj.type === 'text') {
      // Skip text when using Fill Bucket so bucket fills the shape underneath
      if (strictInterior) return false;
      const b = getBounds(obj);
      const pad = 10;
      return px >= b.x - pad && px <= b.x + b.w + pad && py >= b.y - pad && py <= b.y + b.h + pad;
    }

    if (obj.type === 'line' || obj.type === 'arrow') {
      if (strictInterior) return false;
      return distToSegment(px, py, obj.x1, obj.y1, obj.x2, obj.y2) <= Math.max(12, obj.size + 8);
    }

    if (obj.type === 'freehand') {
      if (strictInterior) return false;
      const tol = Math.max(12, obj.size + 8);
      for (let i = 0; i < obj.points.length; i++) {
        const p1 = obj.points[i];
        const p2 = obj.points[Math.min(i + 1, obj.points.length - 1)];
        if (distToSegment(px, py, p1.x, p1.y, p2.x, p2.y) <= tol) return true;
      }
      return false;
    }

    const pad = strictInterior ? 0 : 8;
    const { x, y, w, h } = obj;
    if (px < x - pad || px > x + w + pad || py < y - pad || py > y + h + pad) {
      return false;
    }

    if (strictInterior && (obj.type === 'circle' || obj.type === 'oval')) {
      const rx = w / 2;
      const ry = h / 2;
      if (rx <= 0 || ry <= 0) return false;
      const nx = (px - (x + rx)) / rx;
      const ny = (py - (y + ry)) / ry;
      return nx * nx + ny * ny <= 1;
    }

    if (strictInterior && obj.type === 'triangle') {
      return pointInTriangle(px, py, x + w / 2, y, x, y + h, x + w, y + h);
    }

    return true;
  }

  function findTopObjectAt(px, py, strictInterior = false) {
    for (let i = objects.length - 1; i >= 0; i--) {
      if (hitTestObject(objects[i], px, py, strictInterior)) {
        return i;
      }
    }
    return -1;
  }

  function getHandlePositions(bounds) {
    return {
      nw: { x: bounds.x, y: bounds.y },
      ne: { x: bounds.x + bounds.w, y: bounds.y },
      sw: { x: bounds.x, y: bounds.y + bounds.h },
      se: { x: bounds.x + bounds.w, y: bounds.y + bounds.h }
    };
  }

  function hitTestResizeHandle(px, py) {
    if (selectedIndex < 0 || selectedIndex >= objects.length) return null;
    const handles = getHandlePositions(getBounds(objects[selectedIndex]));
    for (const key of ['nw', 'ne', 'sw', 'se']) {
      if (Math.hypot(px - handles[key].x, py - handles[key].y) <= 18) {
        return key;
      }
    }
    return null;
  }

  function moveObject(baseObj, dx, dy) {
    const copy = JSON.parse(JSON.stringify(baseObj));
    if (copy.type === 'freehand' || copy.type === 'eraser') {
      copy.points = copy.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
    } else if (copy.type === 'line' || copy.type === 'arrow') {
      copy.x1 += dx;
      copy.y1 += dy;
      copy.x2 += dx;
      copy.y2 += dy;
    } else {
      copy.x += dx;
      copy.y += dy;
    }
    return copy;
  }

  function resizeObjectToBounds(baseObj, oldB, newB) {
    const copy = JSON.parse(JSON.stringify(baseObj));
    const safeOldW = Math.max(1, oldB.w);
    const safeOldH = Math.max(1, oldB.h);

    if (copy.type === 'text') {
      const ratio = newB.h / safeOldH;
      const newSize = Math.max(10, Math.min(96, Math.round((copy.fontSize || 24) * ratio)));
      copy.fontSize = newSize;
      copy.x = newB.x;
      copy.y = newB.y;
      return copy;
    }

    if (copy.type === 'freehand' || copy.type === 'eraser') {
      copy.points = copy.points.map((p) => ({
        x: newB.x + ((p.x - oldB.x) / safeOldW) * newB.w,
        y: newB.y + ((p.y - oldB.y) / safeOldH) * newB.h
      }));
    } else if (copy.type === 'line' || copy.type === 'arrow') {
      copy.x1 = newB.x + ((copy.x1 - oldB.x) / safeOldW) * newB.w;
      copy.y1 = newB.y + ((copy.y1 - oldB.y) / safeOldH) * newB.h;
      copy.x2 = newB.x + ((copy.x2 - oldB.x) / safeOldW) * newB.w;
      copy.y2 = newB.y + ((copy.y2 - oldB.y) / safeOldH) * newB.h;
    } else {
      copy.x = newB.x;
      copy.y = newB.y;
      copy.w = newB.w;
      copy.h = newB.h;
    }
    return copy;
  }

  function scaleSelectedObject(factor) {
    if (selectedIndex < 0 || selectedIndex >= objects.length) return;
    const obj = objects[selectedIndex];

    if (obj.type === 'text') {
      const nextSize = Math.max(10, Math.min(96, Math.round((obj.fontSize || 24) * factor)));
      obj.fontSize = nextSize;
      textFontSize = nextSize;
      syncSizeSlider();
      pushHistory();
      render();
      return;
    }

    const b = getBounds(obj);
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    const newW = Math.max(18, Math.min(LOGICAL_W - 20, b.w * factor));
    const newH = Math.max(18, Math.min(LOGICAL_H - 20, b.h * factor));
    const newB = {
      x: Math.max(4, Math.min(LOGICAL_W - newW - 4, cx - newW / 2)),
      y: Math.max(4, Math.min(LOGICAL_H - newH - 4, cy - newH / 2)),
      w: newW,
      h: newH
    };
    objects[selectedIndex] = resizeObjectToBounds(obj, b, newB);
    pushHistory();
    render();
  }

  // 10. Shape, Stroke & Text Drawing Engine
  function drawObject(targetCtx, obj) {
    targetCtx.save();
    targetCtx.lineCap = 'round';
    targetCtx.lineJoin = 'round';
    targetCtx.lineWidth = obj.size || 3;
    targetCtx.strokeStyle = obj.color || '#111827';

    if (obj.type === 'text') {
      const fontSize = obj.fontSize || 24;
      const lineHeight = fontSize * 1.25;
      const lines = String(obj.text || '').split('\n');
      targetCtx.fillStyle = obj.color || '#111827';
      targetCtx.font = `${obj.bold ? '700' : '400'} ${fontSize}px "Roboto", Arial, sans-serif`;
      targetCtx.textBaseline = 'top';
      lines.forEach((line, idx) => {
        targetCtx.fillText(line, obj.x, obj.y + idx * lineHeight);
      });
      targetCtx.restore();
      return;
    }

    if (obj.type === 'eraser') {
      targetCtx.globalCompositeOperation = 'destination-out';
      targetCtx.lineWidth = Math.max(10, (obj.size || 3) * 3.2);
      targetCtx.strokeStyle = '#000000';
      drawFreehandPath(targetCtx, obj.points);
      targetCtx.restore();
      return;
    }

    if (obj.type === 'freehand') {
      drawFreehandPath(targetCtx, obj.points);
      targetCtx.restore();
      return;
    }

    if (obj.type === 'line' || obj.type === 'arrow') {
      targetCtx.beginPath();
      targetCtx.moveTo(obj.x1, obj.y1);
      targetCtx.lineTo(obj.x2, obj.y2);
      targetCtx.stroke();

      if (obj.type === 'arrow') {
        const angle = Math.atan2(obj.y2 - obj.y1, obj.x2 - obj.x1);
        const headLen = Math.max(12, obj.size * 3.8);
        targetCtx.beginPath();
        targetCtx.moveTo(obj.x2, obj.y2);
        targetCtx.lineTo(
          obj.x2 - headLen * Math.cos(angle - Math.PI / 6),
          obj.y2 - headLen * Math.sin(angle - Math.PI / 6)
        );
        targetCtx.moveTo(obj.x2, obj.y2);
        targetCtx.lineTo(
          obj.x2 - headLen * Math.cos(angle + Math.PI / 6),
          obj.y2 - headLen * Math.sin(angle + Math.PI / 6)
        );
        targetCtx.stroke();
      }
      targetCtx.restore();
      return;
    }

    const { x, y, w, h, fill } = obj;
    if (w < 1 || h < 1) {
      targetCtx.restore();
      return;
    }

    if (obj.type === 'rect' || obj.type === 'square') {
      if (fill) {
        targetCtx.fillStyle = fill;
        targetCtx.fillRect(x, y, w, h);
      }
      targetCtx.strokeRect(x, y, w, h);
    } else if (obj.type === 'circle' || obj.type === 'oval') {
      targetCtx.beginPath();
      targetCtx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      if (fill) {
        targetCtx.fillStyle = fill;
        targetCtx.fill();
      }
      targetCtx.stroke();
    } else if (obj.type === 'triangle') {
      targetCtx.beginPath();
      targetCtx.moveTo(x + w / 2, y);
      targetCtx.lineTo(x, y + h);
      targetCtx.lineTo(x + w, y + h);
      targetCtx.closePath();
      if (fill) {
        targetCtx.fillStyle = fill;
        targetCtx.fill();
      }
      targetCtx.stroke();
    } else if (obj.type === 'prism') {
      drawTriangularPrism(targetCtx, x, y, w, h, fill);
    } else if (obj.type === 'cube') {
      drawCube(targetCtx, x, y, w, h, fill);
    } else if (obj.type === 'cylinder') {
      drawCylinder(targetCtx, x, y, w, h, fill);
    }

    targetCtx.restore();
  }

  function drawFreehandPath(targetCtx, points) {
    if (!points || points.length === 0) return;
    targetCtx.beginPath();
    if (points.length === 1) {
      targetCtx.arc(points[0].x, points[0].y, targetCtx.lineWidth / 2, 0, Math.PI * 2);
      targetCtx.fillStyle = targetCtx.strokeStyle;
      targetCtx.fill();
      return;
    }
    targetCtx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      targetCtx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    const last = points[points.length - 1];
    targetCtx.lineTo(last.x, last.y);
    targetCtx.stroke();
  }

  function drawTriangularPrism(c, x, y, w, h, fill) {
    const dx = w * 0.28;
    const dy = h * 0.22;
    const fw = w - dx;

    const A1 = { x: x + fw / 2, y: y + dy };
    const B1 = { x: x, y: y + h };
    const C1 = { x: x + fw, y: y + h };

    const A2 = { x: A1.x + dx, y: y };
    const B2 = { x: x + dx, y: y + h - dy };
    const C2 = { x: x + w, y: y + h - dy };

    if (fill) {
      c.beginPath();
      c.moveTo(A1.x, A1.y);
      c.lineTo(A2.x, A2.y);
      c.lineTo(C2.x, C2.y);
      c.lineTo(C1.x, C1.y);
      c.closePath();
      c.fillStyle = shadeColor(fill, -18);
      c.fill();

      c.beginPath();
      c.moveTo(A1.x, A1.y);
      c.lineTo(B1.x, B1.y);
      c.lineTo(C1.x, C1.y);
      c.closePath();
      c.fillStyle = fill;
      c.fill();
    } else {
      c.save();
      c.setLineDash([5, 5]);
      c.globalAlpha = 0.5;
      c.beginPath();
      c.moveTo(B1.x, B1.y);
      c.lineTo(B2.x, B2.y);
      c.lineTo(A2.x, A2.y);
      c.moveTo(B2.x, B2.y);
      c.lineTo(C2.x, C2.y);
      c.stroke();
      c.restore();
    }

    c.beginPath();
    c.moveTo(A1.x, A1.y);
    c.lineTo(B1.x, B1.y);
    c.lineTo(C1.x, C1.y);
    c.closePath();
    c.moveTo(A1.x, A1.y);
    c.lineTo(A2.x, A2.y);
    c.lineTo(C2.x, C2.y);
    c.lineTo(C1.x, C1.y);
    c.stroke();
  }

  function drawCube(c, x, y, w, h, fill) {
    const dx = w * 0.25;
    const dy = h * 0.22;
    const fw = w - dx;
    const fh = h - dy;

    if (fill) {
      c.beginPath();
      c.moveTo(x, y + dy);
      c.lineTo(x + dx, y);
      c.lineTo(x + w, y);
      c.lineTo(x + fw, y + dy);
      c.closePath();
      c.fillStyle = shadeColor(fill, 18);
      c.fill();

      c.beginPath();
      c.moveTo(x + fw, y + dy);
      c.lineTo(x + w, y);
      c.lineTo(x + w, y + fh);
      c.lineTo(x + fw, y + h);
      c.closePath();
      c.fillStyle = shadeColor(fill, -20);
      c.fill();

      c.fillStyle = fill;
      c.fillRect(x, y + dy, fw, fh);
    } else {
      c.save();
      c.setLineDash([5, 5]);
      c.globalAlpha = 0.5;
      c.beginPath();
      c.moveTo(x + dx, y);
      c.lineTo(x + dx, y + fh);
      c.lineTo(x, y + h);
      c.moveTo(x + dx, y + fh);
      c.lineTo(x + w, y + fh);
      c.stroke();
      c.restore();
    }

    c.strokeRect(x, y + dy, fw, fh);
    c.beginPath();
    c.moveTo(x, y + dy);
    c.lineTo(x + dx, y);
    c.lineTo(x + w, y);
    c.lineTo(x + fw, y + dy);
    c.moveTo(x + w, y);
    c.lineTo(x + w, y + fh);
    c.lineTo(x + fw, y + h);
    c.stroke();
  }

  function drawCylinder(c, x, y, w, h, fill) {
    const rx = w / 2;
    const ry = Math.max(4, Math.min(h * 0.16, w * 0.28));
    const cx = x + rx;
    const topY = y + ry;
    const botY = y + h - ry;

    if (fill) {
      c.beginPath();
      c.moveTo(x, topY);
      c.lineTo(x, botY);
      c.ellipse(cx, botY, rx, ry, 0, Math.PI, 0, true);
      c.lineTo(x + w, topY);
      c.closePath();
      c.fillStyle = fill;
      c.fill();

      c.beginPath();
      c.ellipse(cx, topY, rx, ry, 0, 0, Math.PI * 2);
      c.fillStyle = shadeColor(fill, 16);
      c.fill();
    } else {
      c.save();
      c.setLineDash([5, 5]);
      c.globalAlpha = 0.5;
      c.beginPath();
      c.ellipse(cx, botY, rx, ry, 0, Math.PI, Math.PI * 2);
      c.stroke();
      c.restore();
    }

    c.beginPath();
    c.ellipse(cx, topY, rx, ry, 0, 0, Math.PI * 2);
    c.stroke();

    c.beginPath();
    c.moveTo(x, topY);
    c.lineTo(x, botY);
    c.moveTo(x + w, topY);
    c.lineTo(x + w, botY);
    c.stroke();

    c.beginPath();
    c.ellipse(cx, botY, rx, ry, 0, 0, Math.PI);
    c.stroke();
  }

  function render() {
    offCtx.setTransform(1, 0, 0, 1, 0, 0);
    offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
    offCtx.setTransform(SCALE, 0, 0, SCALE, 0, 0);

    for (const obj of objects) {
      drawObject(offCtx, obj);
    }
    if (previewObj) {
      drawObject(offCtx, previewObj);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);

    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.drawImage(offCanvas, 0, 0, LOGICAL_W, LOGICAL_H);

    // Selection outline & resize handles
    if (selectedIndex >= 0 && selectedIndex < objects.length) {
      const b = getBounds(objects[selectedIndex]);
      ctx.save();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8);
      ctx.setLineDash([]);

      const handles = getHandlePositions(b);
      for (const key of ['nw', 'ne', 'sw', 'se']) {
        const h = handles[key];
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(h.x - 5, h.y - 5, 10, 10);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // 11. Pointer & Finger Interaction on Canvas
  function getCanvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * LOGICAL_W,
      y: ((e.clientY - rect.top) / rect.height) * LOGICAL_H
    };
  }

  function buildShapeFromDrag(tool, p1, p2) {
    if (tool === 'line' || tool === 'arrow') {
      return {
        type: tool,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        color: strokeColor,
        size: strokeSize
      };
    }

    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;

    if (tool === 'square' || tool === 'circle') {
      const side = Math.max(Math.abs(dx), Math.abs(dy));
      dx = dx < 0 ? -side : side;
      dy = dy < 0 ? -side : side;
    }

    const x = Math.min(p1.x, p1.x + dx);
    const y = Math.min(p1.y, p1.y + dy);
    const w = Math.abs(dx);
    const h = Math.abs(dy);

    return {
      type: tool,
      x,
      y,
      w,
      h,
      color: strokeColor,
      fill: fillEnabled ? fillColor : null,
      size: strokeSize
    };
  }

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    closeFillPopover();

    const pt = getCanvasPoint(e);

    // Text Mode: tap anywhere (including inside a shape) to type text
    if (currentTool === 'text') {
      const hitIdx = findTopObjectAt(pt.x, pt.y, false);
      if (hitIdx >= 0 && objects[hitIdx].type === 'text') {
        openTextOverlay(pt, hitIdx);
      } else {
        openTextOverlay(pt, -1);
      }
      return;
    }

    canvas.setPointerCapture(e.pointerId);
    startPt = pt;
    isPointerDown = true;

    // Fill Bucket Mode
    if (currentTool === 'bucket') {
      const hitIdx = findTopObjectAt(pt.x, pt.y, true);
      if (hitIdx >= 0 && 'fill' in objects[hitIdx]) {
        objects[hitIdx].fill = fillColor;
        setFillEnabled(true);
        pushHistory();
        render();
      } else {
        canvasBg = fillColor;
        pushHistory();
        render();
      }
      isPointerDown = false;
      return;
    }

    // Select / Move / Resize Mode
    if (currentTool === 'select') {
      const handle = hitTestResizeHandle(pt.x, pt.y);
      if (handle) {
        activeAction = 'resize';
        resizeHandle = handle;
        origObjSnapshot = JSON.parse(JSON.stringify(objects[selectedIndex]));
        origBoundsSnapshot = getBounds(objects[selectedIndex]);
        return;
      }

      const hitIdx = findTopObjectAt(pt.x, pt.y, false);
      selectedIndex = hitIdx;
      updateSelectedControlsUI();
      render();

      if (hitIdx >= 0) {
        activeAction = 'move';
        origObjSnapshot = JSON.parse(JSON.stringify(objects[hitIdx]));
      } else {
        activeAction = null;
      }
      return;
    }

    // Drawing Mode (Pencil, Eraser, Shapes)
    activeAction = 'draw';
    if (currentTool === 'pencil') {
      previewObj = {
        type: 'freehand',
        points: [pt],
        color: strokeColor,
        size: strokeSize
      };
    } else if (currentTool === 'eraser') {
      previewObj = {
        type: 'eraser',
        points: [pt],
        size: strokeSize
      };
    } else {
      previewObj = buildShapeFromDrag(currentTool, pt, pt);
    }
    render();
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isPointerDown || !startPt) return;
    e.preventDefault();
    const pt = getCanvasPoint(e);

    if (activeAction === 'move' && selectedIndex >= 0 && origObjSnapshot) {
      objects[selectedIndex] = moveObject(origObjSnapshot, pt.x - startPt.x, pt.y - startPt.y);
      render();
      return;
    }

    if (activeAction === 'resize' && selectedIndex >= 0 && origObjSnapshot && origBoundsSnapshot) {
      const b = origBoundsSnapshot;
      let left = b.x;
      let top = b.y;
      let right = b.x + b.w;
      let bottom = b.y + b.h;

      if (resizeHandle === 'nw' || resizeHandle === 'sw') left = pt.x;
      if (resizeHandle === 'ne' || resizeHandle === 'se') right = pt.x;
      if (resizeHandle === 'nw' || resizeHandle === 'ne') top = pt.y;
      if (resizeHandle === 'sw' || resizeHandle === 'se') bottom = pt.y;

      let newX = Math.min(left, right);
      let newY = Math.min(top, bottom);
      let newW = Math.max(14, Math.abs(right - left));
      let newH = Math.max(14, Math.abs(bottom - top));

      if (origObjSnapshot.type === 'square' || origObjSnapshot.type === 'circle') {
        const side = Math.max(newW, newH);
        if (resizeHandle === 'nw' || resizeHandle === 'sw') newX = right - side;
        if (resizeHandle === 'nw' || resizeHandle === 'ne') newY = bottom - side;
        newW = side;
        newH = side;
      }

      objects[selectedIndex] = resizeObjectToBounds(origObjSnapshot, b, {
        x: newX,
        y: newY,
        w: newW,
        h: newH
      });
      if (objects[selectedIndex].type === 'text') {
        textFontSize = objects[selectedIndex].fontSize;
        syncSizeSlider();
      }
      render();
      return;
    }

    if (activeAction === 'draw' && previewObj) {
      if (previewObj.type === 'freehand' || previewObj.type === 'eraser') {
        const last = previewObj.points[previewObj.points.length - 1];
        if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) >= 2) {
          previewObj.points.push(pt);
        }
      } else {
        previewObj = buildShapeFromDrag(currentTool, startPt, pt);
      }
      render();
    }
  });

  function finishPointerGesture() {
    if (!isPointerDown) return;
    isPointerDown = false;

    if (activeAction === 'draw' && previewObj) {
      const validShape =
        previewObj.type === 'freehand' ||
        previewObj.type === 'eraser' ||
        ((previewObj.type === 'line' || previewObj.type === 'arrow') &&
          Math.hypot(previewObj.x2 - previewObj.x1, previewObj.y2 - previewObj.y1) >= 4) ||
        (previewObj.w >= 4 && previewObj.h >= 4);

      if (validShape) {
        objects.push(previewObj);
        pushHistory();
      }
      previewObj = null;
      render();
    } else if (activeAction === 'move' || activeAction === 'resize') {
      pushHistory();
      render();
    }

    activeAction = null;
    resizeHandle = null;
    origObjSnapshot = null;
    origBoundsSnapshot = null;
    startPt = null;
  }

  canvas.addEventListener('pointerup', finishPointerGesture);
  canvas.addEventListener('pointercancel', finishPointerGesture);

  // 12. Toolbar, 20-Color Palettes & Text Controls Events
  toolBtns.forEach((btn) => {
    btn.addEventListener('click', () => setActiveTool(btn.dataset.tool));
  });

  function applyStrokeColor(color) {
    strokeColor = color;
    syncStrokeSwatchUI();
    if (selectedIndex >= 0 && objects[selectedIndex]) {
      objects[selectedIndex].color = color;
      pushHistory();
      render();
    }
  }

  strokeColorInput.addEventListener('input', (e) => applyStrokeColor(e.target.value));
  strokeSwatches.forEach((sw) => {
    sw.addEventListener('click', () => applyStrokeColor(sw.dataset.color));
  });

  function applyFillColor(color) {
    fillColor = color;
    setFillEnabled(true);
    syncFillUI();
    if (selectedIndex >= 0 && objects[selectedIndex] && 'fill' in objects[selectedIndex]) {
      objects[selectedIndex].fill = color;
      pushHistory();
      render();
    }
  }

  fillToggleBtn.addEventListener('click', () => {
    closeFillPopover();
    setFillEnabled(!fillEnabled);
    if (selectedIndex >= 0 && objects[selectedIndex] && 'fill' in objects[selectedIndex]) {
      objects[selectedIndex].fill = fillEnabled ? fillColor : null;
      pushHistory();
      render();
    }
  });

  fillBoxBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (fillPopover.classList.contains('open')) {
      closeFillPopover();
    } else {
      openFillPopover();
    }
  });

  fillCells.forEach((cell) => {
    cell.addEventListener('click', (e) => {
      e.stopPropagation();
      applyFillColor(cell.dataset.color);
      closeFillPopover();
    });
  });

  fillCustomInput.addEventListener('input', (e) => {
    applyFillColor(e.target.value);
  });

  fillCustomInput.addEventListener('change', () => {
    closeFillPopover();
  });

  // Clicking outside the 20-square Fill popover closes only the popover (never the Paint modal)
  document.addEventListener('pointerdown', (e) => {
    if (!fillPopover.classList.contains('open')) return;
    if (fillPopover.contains(e.target) || fillBoxBtn.contains(e.target)) return;
    closeFillPopover();
  });

  sizeSlider.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    sizeValEl.textContent = String(val);

    if (isTextModeActive()) {
      textFontSize = val || 24;
      if (selectedIndex >= 0 && objects[selectedIndex] && objects[selectedIndex].type === 'text') {
        objects[selectedIndex].fontSize = textFontSize;
        render();
      }
    } else {
      strokeSize = val || 3;
      if (selectedIndex >= 0 && objects[selectedIndex] && objects[selectedIndex].type !== 'text') {
        objects[selectedIndex].size = strokeSize;
        render();
      }
    }
  });

  sizeSlider.addEventListener('change', () => {
    if (selectedIndex >= 0 && objects[selectedIndex]) {
      pushHistory();
    }
  });

  textBoldBtn.addEventListener('click', () => {
    textBold = !textBold;
    syncTextInputPreviewStyle();
  });

  textCancelBtn.addEventListener('click', closeTextOverlay);

  textApplyBtn.addEventListener('click', () => {
    const content = textInput.value.trim();
    if (!content) {
      closeTextOverlay();
      return;
    }

    if (editingTextObjIndex >= 0 && objects[editingTextObjIndex]) {
      const target = objects[editingTextObjIndex];
      target.text = content;
      target.color = strokeColor;
      target.fontSize = textFontSize;
      target.bold = textBold;
      selectedIndex = editingTextObjIndex;
    } else if (pendingTextPt) {
      // Center newly tapped text horizontally around the tap point so it sits neatly inside shapes
      const tempObj = {
        type: 'text',
        x: pendingTextPt.x,
        y: pendingTextPt.y,
        text: content,
        color: strokeColor,
        fontSize: textFontSize,
        bold: textBold
      };
      const measured = measureTextObject(tempObj);
      tempObj.x = Math.max(8, Math.min(LOGICAL_W - measured.w - 8, pendingTextPt.x - measured.w / 2));
      tempObj.y = Math.max(8, Math.min(LOGICAL_H - measured.h - 8, pendingTextPt.y - measured.h / 2));

      objects.push(tempObj);
      selectedIndex = objects.length - 1;
    }

    closeTextOverlay();
    pushHistory();
    // Switch to Select / Resize automatically so user can immediately nudge/resize the text
    currentTool = 'select';
    toolBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.tool === 'select'));
    canvas.style.cursor = 'default';
    hintEl.textContent = HINTS.select;
    updateSelectedControlsUI();
    render();
  });

  editTextBtn.addEventListener('click', () => {
    if (selectedIndex >= 0 && objects[selectedIndex] && objects[selectedIndex].type === 'text') {
      openTextOverlay({ x: objects[selectedIndex].x, y: objects[selectedIndex].y }, selectedIndex);
    }
  });

  shrinkBtn.addEventListener('click', () => scaleSelectedObject(0.85));
  growBtn.addEventListener('click', () => scaleSelectedObject(1.18));

  deleteShapeBtn.addEventListener('click', () => {
    if (selectedIndex < 0 || selectedIndex >= objects.length) return;
    objects.splice(selectedIndex, 1);
    selectedIndex = -1;
    updateSelectedControlsUI();
    pushHistory();
    render();
  });

  undoBtn.addEventListener('click', () => {
    if (undoStack.length <= 1) return;
    const current = undoStack.pop();
    redoStack.push(current);
    restoreState(undoStack[undoStack.length - 1]);
  });

  redoBtn.addEventListener('click', () => {
    if (redoStack.length === 0) return;
    const next = redoStack.pop();
    undoStack.push(next);
    restoreState(next);
  });

  clearBtn.addEventListener('click', () => {
    if (objects.length === 0 && canvasBg === '#ffffff') return;
    closeTextOverlay();
    objects = [];
    canvasBg = '#ffffff';
    selectedIndex = -1;
    updateSelectedControlsUI();
    pushHistory();
    render();
  });

  // 13. Export Clean Cropped PNG & Insert / Update Inside Quill Document
  function exportDrawingDataUrl() {
    offCtx.setTransform(1, 0, 0, 1, 0, 0);
    offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
    offCtx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    for (const obj of objects) {
      drawObject(offCtx, obj);
    }

    const w = offCanvas.width;
    const h = offCanvas.height;

    if (canvasBg.toLowerCase() !== '#ffffff') {
      const fullOut = document.createElement('canvas');
      fullOut.width = w;
      fullOut.height = h;
      const fCtx = fullOut.getContext('2d');
      fCtx.fillStyle = canvasBg;
      fCtx.fillRect(0, 0, w, h);
      fCtx.drawImage(offCanvas, 0, 0);
      return fullOut.toDataURL('image/png');
    }

    const imgData = offCtx.getImageData(0, 0, w, h).data;
    let minX = w, minY = h, maxX = -1, maxY = -1;

    for (let y = 0; y < h; y += 2) {
      const rowOffset = y * w * 4;
      for (let x = 0; x < w; x += 2) {
        if (imgData[rowOffset + x * 4 + 3] > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      return null;
    }

    const pad = 28 * SCALE;
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(w - cropX, maxX - minX + pad * 2);
    const cropH = Math.min(h - cropY, maxY - minY + pad * 2);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = Math.max(60, Math.round(cropW));
    outCanvas.height = Math.max(60, Math.round(cropH));
    const outCtx = outCanvas.getContext('2d');

    outCtx.fillStyle = '#ffffff';
    outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);
    outCtx.drawImage(
      offCanvas,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      outCanvas.width,
      outCanvas.height
    );

    return outCanvas.toDataURL('image/png');
  }

  function openPaintModal(existingImg = null) {
    if (typeof deselectImage === 'function') deselectImage();
    closeFillPopover();
    closeTextOverlay();
    editingImgEl = existingImg;

    if (existingImg && paintStateBySrc.has(existingImg.src)) {
      const saved = JSON.parse(paintStateBySrc.get(existingImg.src));
      objects = saved.objects || [];
      canvasBg = saved.canvasBg || '#ffffff';
      insertBtn.textContent = 'Update';
    } else {
      objects = [];
      canvasBg = '#ffffff';
      insertBtn.textContent = 'Insert';
    }

    selectedIndex = -1;
    undoStack = [cloneState()];
    redoStack = [];
    syncStrokeSwatchUI();
    syncFillUI();
    updateSelectedControlsUI();
    updateHistoryButtons();
    setActiveTool(existingImg ? 'select' : 'pencil');

    modalBackdrop.classList.add('open');
    requestAnimationFrame(() => {
      fitCanvasToScreen();
      render();
    });
  }

  function closePaintModal() {
    closeFillPopover();
    closeTextOverlay();
    modalBackdrop.classList.remove('open');
    editingImgEl = null;
    selectedIndex = -1;
    previewObj = null;
  }

  // Capture selection on pointerdown, open cleanly on click (prevents instant mobile self-closing)
  paintOpenBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const sel = quill.getSelection();
    if (sel) {
      insertTargetIndex = sel.index;
    } else if (typeof savedRange !== 'undefined' && savedRange) {
      insertTargetIndex = savedRange.index;
    } else {
      insertTargetIndex = Math.max(0, quill.getLength() - 1);
    }
  });

  paintOpenBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openPaintModal(null);
  });

  // Modal closes ONLY via Cancel or Insert (never accidental backdrop taps)
  cancelBtn.addEventListener('click', closePaintModal);

  insertBtn.addEventListener('click', () => {
    closeFillPopover();
    closeTextOverlay();

    const dataUrl = exportDrawingDataUrl();
    if (!dataUrl) {
      alert('Draw a stroke, shape, or text first before inserting into the page.');
      return;
    }

    const stateSnapshot = cloneState();
    paintStateBySrc.set(dataUrl, stateSnapshot);

    if (editingImgEl) {
      const blot = Quill.find(editingImgEl);
      const prevWidth = editingImgEl.style.width || '';
      const prevAlign = editingImgEl.dataset.align || '';

      if (blot) {
        const idx = quill.getIndex(blot);
        quill.deleteText(idx, 1, 'user');
        quill.insertEmbed(idx, 'image', dataUrl, 'user');

        const [leafA] = quill.getLeaf(idx + 1);
        const [leafB] = quill.getLeaf(idx);
        const imgLeaf =
          leafA && leafA.domNode && leafA.domNode.tagName === 'IMG'
            ? leafA
            : leafB && leafB.domNode && leafB.domNode.tagName === 'IMG'
            ? leafB
            : null;

        if (imgLeaf && typeof imgLeaf.format === 'function') {
          if (prevWidth) imgLeaf.format('width', prevWidth);
          if (prevAlign) imgLeaf.format('align', prevAlign);
        }
        quill.setSelection(idx + 1, 0, 'silent');
      }
    } else {
      const idx = Math.max(0, Math.min(insertTargetIndex, Math.max(0, quill.getLength() - 1)));
      quill.insertEmbed(idx, 'image', dataUrl, 'user');
      quill.setSelection(idx + 1, 0, 'silent');
    }

    closePaintModal();
    if (typeof scheduleLayoutUpdate === 'function') {
      scheduleLayoutUpdate(true);
    }
  });

  // 14. Show "Edit Paint" Button Whenever a Paint Drawing is Selected in the Document
  if (resizeBarEl && editPaintImgBtn && typeof editorEl !== 'undefined') {
    const observer = new MutationObserver(() => {
      if (resizeBarEl.classList.contains('visible')) {
        const currentImg = editorEl.querySelector('img.selected-img');
        const isEditablePaint = Boolean(currentImg && paintStateBySrc.has(currentImg.src));
        editPaintImgBtn.style.display = isEditablePaint ? 'inline-block' : 'none';
      } else {
        editPaintImgBtn.style.display = 'none';
      }
    });
    observer.observe(resizeBarEl, { attributes: true, attributeFilter: ['class'] });

    editPaintImgBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentImg = editorEl.querySelector('img.selected-img');
      if (currentImg && paintStateBySrc.has(currentImg.src)) {
        openPaintModal(currentImg);
      }
    });
  }

  // Initial UI sync
  syncStrokeSwatchUI();
  syncFillUI();
})();

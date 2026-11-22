// 1. Register Inline Style Attributors so PDF exports exact fonts & sizes
const SizeStyle = Quill.import('attributors/style/size');
SizeStyle.whitelist = ['10px', '12px', '14px', '16px', '18px', '22px', '28px', '36px'];
Quill.register(SizeStyle, true);

const FontStyle = Quill.import('attributors/style/font');
FontStyle.whitelist = ['Roboto', 'Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New'];
Quill.register(FontStyle, true);

// 2. Register Custom Resizable Image Blot (preserves width & alignment across Undo/Redo & PDF)
const BaseImage = Quill.import('formats/image');
class ResizableImage extends BaseImage {
  static formats(domNode) {
    const formats = {};
    if (domNode.style.width) formats.width = domNode.style.width;
    if (domNode.dataset.align) formats.align = domNode.dataset.align;
    return formats;
  }

  format(name, value) {
    if (name === 'width') {
      if (value) {
        this.domNode.style.width = value;
        this.domNode.style.height = 'auto';
      } else {
        this.domNode.style.width = '';
      }
    } else if (name === 'align') {
      if (value) {
        this.domNode.dataset.align = value;
        if (value === 'center') {
          this.domNode.style.marginLeft = 'auto';
          this.domNode.style.marginRight = 'auto';
        } else if (value === 'right') {
          this.domNode.style.marginLeft = 'auto';
          this.domNode.style.marginRight = '0';
        } else {
          this.domNode.style.marginLeft = '0';
          this.domNode.style.marginRight = 'auto';
        }
      } else {
        delete this.domNode.dataset.align;
        this.domNode.style.marginLeft = '';
        this.domNode.style.marginRight = '';
      }
    } else {
      super.format(name, value);
    }
  }
}
Quill.register(ResizableImage, true);

// 3. Register Manual Page Break Blot
const BlockEmbed = Quill.import('blots/block/embed');
class PageBreakBlot extends BlockEmbed {
  static create() {
    const node = super.create();
    node.setAttribute('contenteditable', 'false');
    node.innerHTML = '<span class="ql-page-break-pill">Page Break <button type="button" class="ql-page-break-remove" title="Remove Page Break">&times;</button></span>';
    return node;
  }
}
PageBreakBlot.blotName = 'pageBreak';
PageBreakBlot.tagName = 'div';
PageBreakBlot.className = 'ql-page-break';
Quill.register(PageBreakBlot);

// 4. Initialize Rich Text Editor
const quill = new Quill('#editor-container', {
  theme: 'snow',
  placeholder: 'Start typing or paste your text, numbers, and images here...',
  modules: {
    toolbar: '#toolbar-container',
    history: {
      delay: 600,
      maxStack: 100,
      userOnly: true
    }
  }
});

const toolbarEl = document.getElementById('toolbar-container');
const editorEl = document.querySelector('#editor-container .ql-editor');
const workspaceEl = document.getElementById('workspace');
const paperScaler = document.getElementById('paper-scaler');
const paperStage = document.getElementById('paper-stage');
const pageGuides = document.getElementById('page-guides');
const pageCounter = document.getElementById('page-counter');
const authorInput = document.getElementById('author-footer');
const dateInput = document.getElementById('doc-date');
const todayBtn = document.getElementById('today-btn');

// Prevent toolbar taps from stealing focus and clearing blue text highlights
toolbarEl.addEventListener('mousedown', (e) => {
  e.preventDefault();
});

// 5. Undo, Redo & Manual Page Break Buttons
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const pageBreakBtn = document.getElementById('page-break-btn');

undoBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  deselectImage();
  quill.history.undo();
  scheduleLayoutUpdate();
});

redoBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  deselectImage();
  quill.history.redo();
  scheduleLayoutUpdate();
});

pageBreakBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  deselectImage();

  const current = quill.getSelection();
  const target = current ? current : savedRange;
  let index = target ? target.index : Math.max(0, quill.getLength() - 1);

  if (target && target.length > 0) {
    quill.deleteText(index, target.length, 'user');
  }

  if (index > 0) {
    const prevChar = quill.getText(index - 1, 1);
    if (prevChar !== '\n') {
      quill.insertText(index, '\n', 'user');
      index += 1;
    }
  }

  quill.insertEmbed(index, 'pageBreak', true, 'user');

  if (index + 1 >= quill.getLength() - 1) {
    quill.insertText(index + 1, '\n', 'silent');
  }

  quill.setSelection(index + 1, 0, 'silent');
  savedRange = { index: index + 1, length: 0 };
  scheduleLayoutUpdate();
});

// Allow tapping the "×" button on any Page Break bar to delete it
editorEl.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('.ql-page-break-remove');
  if (removeBtn) {
    e.preventDefault();
    e.stopPropagation();
    const breakEl = removeBtn.closest('.ql-page-break');
    if (breakEl) {
      const blot = Quill.find(breakEl);
      if (blot) {
        const idx = quill.getIndex(blot);
        quill.deleteText(idx, 1, 'user');
        scheduleLayoutUpdate();
      }
    }
  }
});

// 6. View Mode Dropdown (Mobile / Full Page / Desktop)
const viewPicker = document.getElementById('view-picker');
const viewTrigger = document.getElementById('view-picker-trigger');
const viewLabel = document.getElementById('view-picker-label');
const viewOptions = document.querySelectorAll('.view-option');

const VIEW_LABELS = {
  mobile: 'Mobile',
  fullpage: 'Full Page',
  desktop: 'Desktop'
};

let currentViewMode = window.innerWidth <= 768 ? 'mobile' : 'desktop';

function closeViewMenu() {
  viewPicker.classList.remove('open');
  viewTrigger.setAttribute('aria-expanded', 'false');
}

function applyViewMode(mode) {
  currentViewMode = mode;
  document.body.classList.remove('view-mobile', 'view-fullpage', 'view-desktop');
  document.body.classList.add(`view-${mode}`);
  viewLabel.textContent = VIEW_LABELS[mode] || 'Desktop';

  viewOptions.forEach((opt) => {
    opt.classList.toggle('active', opt.dataset.view === mode);
  });

  scheduleLayoutUpdate(true);
}

function updateFullPageScale() {
  if (currentViewMode !== 'fullpage') {
    paperStage.style.transform = '';
    paperScaler.style.width = '';
    paperScaler.style.height = '';
    return;
  }

  const availWidth = Math.max(240, workspaceEl.clientWidth - 24);
  const scale = Math.min(1, availWidth / 794);
  const stageHeight = paperStage.offsetHeight || 1123;

  paperStage.style.transform = `scale(${scale})`;
  paperScaler.style.width = `${Math.round(794 * scale)}px`;
  paperScaler.style.height = `${Math.ceil(stageHeight * scale)}px`;
}

viewTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  closeSizeMenu();
  const isOpen = viewPicker.classList.toggle('open');
  viewTrigger.setAttribute('aria-expanded', String(isOpen));
});

viewOptions.forEach((opt) => {
  opt.addEventListener('click', (e) => {
    e.stopPropagation();
    applyViewMode(opt.dataset.view);
    closeViewMenu();
  });
});

// 7. Mobile-Safe Selection Memory + Font Size Dropdown + Gboard Typing Lock
const sizePicker = document.getElementById('custom-size-picker');
const sizeTrigger = document.getElementById('size-picker-trigger');
const sizeLabel = document.getElementById('size-picker-label');
const sizeOptions = document.querySelectorAll('.size-option');

let savedRange = { index: 0, length: 0 };
let activeSize = '16px';
let sizeLocked = false;
let lockedCursorIndex = null;
let isComposing = false;
let compStartIndex = null;
let isFormattingInternally = false;

function updateSizeDropdownUI(size) {
  const displaySize = size || '16px';
  sizeLabel.textContent = displaySize;
  sizeOptions.forEach((opt) => {
    opt.classList.toggle('active', opt.dataset.size === displaySize);
  });
}

function closeSizeMenu() {
  sizePicker.classList.remove('open');
  sizeTrigger.setAttribute('aria-expanded', 'false');
}

quill.on('selection-change', (range, oldRange, source) => {
  if (!range) return;

  savedRange = { index: range.index, length: range.length };

  if (source === 'user') {
    if (sizeLocked && range.length === 0 && range.index === lockedCursorIndex) {
      quill.format('size', activeSize, 'silent');
      updateSizeDropdownUI(activeSize);
      return;
    }

    sizeLocked = false;
    lockedCursorIndex = null;
    const currentFormat = quill.getFormat(range);
    activeSize = currentFormat.size || '16px';
    updateSizeDropdownUI(activeSize);
  }
});

sizeTrigger.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeViewMenu();
  const current = quill.getSelection();
  if (current) {
    savedRange = { index: current.index, length: current.length };
  }
  const isOpen = sizePicker.classList.toggle('open');
  sizeTrigger.setAttribute('aria-expanded', String(isOpen));
});

sizeOptions.forEach((opt) => {
  opt.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const newSize = opt.dataset.size;
    closeSizeMenu();

    const current = quill.getSelection();
    const target = current ? current : savedRange;

    activeSize = newSize;
    updateSizeDropdownUI(newSize);

    if (target && target.length > 0) {
      sizeLocked = false;
      lockedCursorIndex = null;
      isFormattingInternally = true;
      quill.formatText(target.index, target.length, 'size', newSize, 'user');
      quill.setSelection(target.index, target.length, 'silent');
      isFormattingInternally = false;
      savedRange = { index: target.index, length: target.length };
    } else {
      const cursorIdx = target ? target.index : Math.max(0, quill.getLength() - 1);
      sizeLocked = true;
      lockedCursorIndex = cursorIdx;
      isFormattingInternally = true;
      quill.setSelection(cursorIdx, 0, 'silent');
      quill.format('size', newSize, 'silent');
      isFormattingInternally = false;
      savedRange = { index: cursorIdx, length: 0 };
    }
    scheduleLayoutUpdate();
  });
});

// Close open menus when tapping outside
document.addEventListener('pointerdown', (e) => {
  if (!sizePicker.contains(e.target)) {
    closeSizeMenu();
  }
  if (!viewPicker.contains(e.target)) {
    closeViewMenu();
  }
});

// Reset size lock if user clicks Clear Formatting button
const cleanBtn = document.querySelector('.ql-clean');
if (cleanBtn) {
  cleanBtn.addEventListener('click', () => {
    sizeLocked = false;
    lockedCursorIndex = null;
    activeSize = '16px';
    updateSizeDropdownUI('16px');
    scheduleLayoutUpdate();
  });
}

// Handle Android predictive keyboard (IME composition) without breaking words
editorEl.addEventListener('compositionstart', () => {
  isComposing = true;
  const cur = quill.getSelection();
  compStartIndex = cur ? cur.index : savedRange.index;
});

editorEl.addEventListener('compositionend', () => {
  isComposing = false;
  if (!sizeLocked || compStartIndex === null) {
    compStartIndex = null;
    scheduleLayoutUpdate();
    return;
  }

  const startIdx = compStartIndex;
  compStartIndex = null;

  setTimeout(() => {
    const cur = quill.getSelection();
    const endIdx = cur ? cur.index : startIdx;
    if (endIdx > startIdx) {
      isFormattingInternally = true;
      quill.formatText(startIdx, endIdx - startIdx, 'size', activeSize, 'silent');
      quill.format('size', activeSize, 'silent');
      isFormattingInternally = false;
      lockedCursorIndex = endIdx;
      savedRange = { index: endIdx, length: 0 };
    }
    scheduleLayoutUpdate();
  }, 0);
});

// Enforce locked font size on direct character typing
quill.on('text-change', (delta, oldDelta, source) => {
  if (!isComposing) {
    scheduleLayoutUpdate();
  }

  if (source !== 'user' || isFormattingInternally || isComposing || !sizeLocked) {
    return;
  }

  let index = 0;
  const rangesToFormat = [];

  for (const op of delta.ops) {
    if (typeof op.retain === 'number') {
      index += op.retain;
    } else if (typeof op.insert === 'string') {
      const len = op.insert.length;
      if (op.insert !== '\n' && (!op.attributes || op.attributes.size !== activeSize)) {
        rangesToFormat.push({ index, length: len });
      }
      index += len;
    } else if (op.insert) {
      index += 1;
    }
  }

  if (rangesToFormat.length > 0) {
    isFormattingInternally = true;
    rangesToFormat.forEach((r) => {
      quill.formatText(r.index, r.length, 'size', activeSize, 'silent');
    });
    quill.format('size', activeSize, 'silent');
    isFormattingInternally = false;
  } else {
    quill.format('size', activeSize, 'silent');
  }

  const cur = quill.getSelection();
  if (cur) {
    lockedCursorIndex = cur.index;
    savedRange = { index: cur.index, length: cur.length };
  }
});

// 8. Tap-to-Resize Image Controls
const imgResizeBar = document.getElementById('img-resize-bar');
const imgDecBtn = document.getElementById('img-dec-btn');
const imgIncBtn = document.getElementById('img-inc-btn');
const imgSizeReadout = document.getElementById('img-size-readout');
const imgPresetBtns = document.querySelectorAll('.img-preset-btn');
const imgAlignBtns = document.querySelectorAll('.img-align-btn');
const imgDeleteBtn = document.getElementById('img-delete-btn');
const imgDoneBtn = document.getElementById('img-done-btn');

let selectedImg = null;

function getImageWidthPercent(img) {
  if (img.style.width && img.style.width.endsWith('%')) {
    return Math.max(15, Math.min(100, Math.round(parseFloat(img.style.width))));
  }
  const parentWidth = img.parentElement ? img.parentElement.clientWidth : 682;
  if (parentWidth > 0 && img.offsetWidth > 0) {
    return Math.max(15, Math.min(100, Math.round((img.offsetWidth / parentWidth) * 100)));
  }
  return 100;
}

function syncImageBarUI() {
  if (!selectedImg) return;
  const pct = getImageWidthPercent(selectedImg);
  const align = selectedImg.dataset.align || 'left';

  imgSizeReadout.textContent = `${pct}%`;
  imgPresetBtns.forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.pct) === pct);
  });
  imgAlignBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.align === align);
  });
}

function selectImage(img) {
  if (selectedImg && selectedImg !== img) {
    selectedImg.classList.remove('selected-img');
  }
  selectedImg = img;
  selectedImg.classList.add('selected-img');
  imgResizeBar.classList.add('visible');
  syncImageBarUI();
}

function deselectImage() {
  if (selectedImg) {
    selectedImg.classList.remove('selected-img');
    selectedImg = null;
  }
  imgResizeBar.classList.remove('visible');
}

function setSelectedImageSize(pct) {
  if (!selectedImg) return;
  const clamped = Math.max(15, Math.min(100, Math.round(pct)));
  const blot = Quill.find(selectedImg);
  if (blot && typeof blot.format === 'function') {
    blot.format('width', `${clamped}%`);
  } else {
    selectedImg.style.width = `${clamped}%`;
    selectedImg.style.height = 'auto';
  }
  syncImageBarUI();
  scheduleLayoutUpdate(true);
}

function setSelectedImageAlign(align) {
  if (!selectedImg) return;
  const blot = Quill.find(selectedImg);
  if (blot && typeof blot.format === 'function') {
    blot.format('align', align);
  }
  syncImageBarUI();
}

editorEl.addEventListener('click', (e) => {
  if (e.target && e.target.tagName === 'IMG') {
    e.stopPropagation();
    selectImage(e.target);
  } else if (!e.target.closest('.ql-page-break-remove')) {
    deselectImage();
  }
});

document.addEventListener('click', (e) => {
  if (!selectedImg) return;
  if (e.target === selectedImg || imgResizeBar.contains(e.target)) return;
  deselectImage();
});

imgDecBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!selectedImg) return;
  setSelectedImageSize(getImageWidthPercent(selectedImg) - 10);
});

imgIncBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!selectedImg) return;
  setSelectedImageSize(getImageWidthPercent(selectedImg) + 10);
});

imgPresetBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    setSelectedImageSize(Number(btn.dataset.pct));
  });
});

imgAlignBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    setSelectedImageAlign(btn.dataset.align);
  });
});

imgDeleteBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!selectedImg) return;
  const blot = Quill.find(selectedImg);
  deselectImage();
  if (blot) {
    const idx = quill.getIndex(blot);
    quill.deleteText(idx, 1, 'user');
    scheduleLayoutUpdate(true);
  }
});

imgDoneBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  deselectImage();
});

// Catch newly loaded images in capture phase so tall photos fit & auto-push cleanly
editorEl.addEventListener('load', (e) => {
  if (e.target && e.target.tagName === 'IMG') {
    scheduleLayoutUpdate(true);
  }
}, true);

// 9. Visible Page Dividers, Auto-Push Overflowing Images & Footer Preview
const PAGE_HEIGHT = 1123; // A4 height at 96 DPI
const GAP_HEIGHT = 28;    // Visible gray divider band between pages
const SLOT_STRIDE = PAGE_HEIGHT + GAP_HEIGHT;
const BOTTOM_PAD = 88;    // Reserved space for footer + breathing room

let layoutRafId = null;
let isUpdatingLayout = false;
let lastGuidesKey = '';
let lastMeasuredHeight = 0;

function getTopPad() {
  return currentViewMode === 'mobile' ? 40 : 56;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function scheduleLayoutUpdate(forceGuides = false) {
  if (forceGuides) lastGuidesKey = '';
  if (layoutRafId) cancelAnimationFrame(layoutRafId);
  layoutRafId = requestAnimationFrame(() => {
    layoutRafId = null;
    applyPageFlow();
  });
}

function applyPageFlow() {
  if (isUpdatingLayout) return;
  isUpdatingLayout = true;

  try {
    const topPad = getTopPad();
    const printableHeight = PAGE_HEIGHT - topPad - BOTTOM_PAD;
    const children = Array.from(editorEl.children);

    // 1. Reset temporary page pushes to measure natural positions
    for (const child of children) {
      if (child.dataset.pagePush) {
        child.style.marginTop = '';
        delete child.dataset.pagePush;
      }
    }

    // 2. Push manual page breaks, overflowing images, and divider-crossing blocks cleanly to the next page
    let forcedMinPage = 0;
    let maxPageIndex = 0;

    for (const child of children) {
      let top = child.offsetTop;
      const height = child.offsetHeight;
      let pageIdx = Math.floor(top / SLOT_STRIDE);

      // If previous element was a manual Page Break, start on forcedMinPage
      if (pageIdx < forcedMinPage) {
        const targetTop = forcedMinPage * SLOT_STRIDE + topPad;
        const push = Math.max(0, targetTop - top);
        if (push > 0) {
          child.style.marginTop = `${push}px`;
          child.dataset.pagePush = '1';
          top = child.offsetTop;
          pageIdx = Math.floor(top / SLOT_STRIDE);
        }
      }

      const pageStart = pageIdx * SLOT_STRIDE;
      const contentTopLimit = pageStart + topPad;
      const contentBottomLimit = pageStart + PAGE_HEIGHT - BOTTOM_PAD;
      const bottom = top + height;

      const isPageBreak = child.classList.contains('ql-page-break');
      const hasImage = Boolean(child.querySelector('img'));
      const isHeading = /^H[1-6]$/.test(child.tagName);

      // If block starts in footer/divider/top-margin zone, push to clean top of page
      if (top > contentBottomLimit) {
        const targetTop = (pageIdx + 1) * SLOT_STRIDE + topPad;
        const push = targetTop - top;
        if (push > 0) {
          child.style.marginTop = `${push}px`;
          child.dataset.pagePush = '1';
          top = child.offsetTop;
          pageIdx = Math.floor(top / SLOT_STRIDE);
        }
      } else if (pageIdx > 0 && top < contentTopLimit) {
        const push = contentTopLimit - top;
        if (push > 0) {
          child.style.marginTop = `${push}px`;
          child.dataset.pagePush = '1';
          top = child.offsetTop;
          pageIdx = Math.floor(top / SLOT_STRIDE);
        }
      } else if (bottom > contentBottomLimit) {
        // Block crosses into footer/divider:
        // Always push image blocks, headings, or normal short blocks whole to next page
        const shouldKeepTogether =
          (hasImage && height <= printableHeight + 12) ||
          (isHeading && height <= printableHeight) ||
          (!hasImage && height <= 220);

        if (shouldKeepTogether) {
          const targetTop = (pageIdx + 1) * SLOT_STRIDE + topPad;
          const push = targetTop - top;
          if (push > 0) {
            child.style.marginTop = `${push}px`;
            child.dataset.pagePush = '1';
            top = child.offsetTop;
            pageIdx = Math.floor(top / SLOT_STRIDE);
          }
        }
      }

      if (isPageBreak) {
        forcedMinPage = pageIdx + 1;
        maxPageIndex = Math.max(maxPageIndex, forcedMinPage);
      } else {
        const finalBottom = child.offsetTop + child.offsetHeight;
        const endPageIdx = Math.floor(Math.max(0, finalBottom - 1) / SLOT_STRIDE);
        maxPageIndex = Math.max(maxPageIndex, pageIdx, endPageIdx);
      }
    }

    // 3. Render visible white page cards + gray page dividers + footers
    const totalPages = Math.max(1, maxPageIndex + 1);
    const totalStageHeight = totalPages * PAGE_HEIGHT + (totalPages - 1) * GAP_HEIGHT;
    const authorText = authorInput.value.trim();
    const dateText = dateInput.value.trim();

    paperStage.style.minHeight = `${totalStageHeight}px`;
    editorEl.style.minHeight = `${totalStageHeight}px`;
    pageCounter.textContent = totalPages === 1 ? 'Page 1' : `${totalPages} Pages`;

    const guidesKey = `${totalPages}|${dateText}|${authorText}|${currentViewMode}`;
    if (guidesKey !== lastGuidesKey) {
      lastGuidesKey = guidesKey;
      let guidesHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        guidesHTML += `
          <div class="page-sheet-card">
            <div class="page-guide-footer">
              <span class="footer-left">Page ${i}</span>
              <span class="footer-center">${dateText ? 'Date: ' + escapeHtml(dateText) : ''}</span>
              <span class="footer-right">${escapeHtml(authorText)}</span>
            </div>
          </div>
        `;
        if (i < totalPages) {
          guidesHTML += `<div class="page-divider-gap">Page ${i + 1}</div>`;
        }
      }
      pageGuides.innerHTML = guidesHTML;
    }

    lastMeasuredHeight = editorEl.scrollHeight;
    updateFullPageScale();
  } finally {
    requestAnimationFrame(() => {
      isUpdatingLayout = false;
    });
  }
}

todayBtn.addEventListener('click', () => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  dateInput.value = `${dd}/${mm}/${yyyy}`;
  scheduleLayoutUpdate(true);
});

authorInput.addEventListener('input', () => scheduleLayoutUpdate(true));
dateInput.addEventListener('input', () => scheduleLayoutUpdate(true));

const resizeObserver = new ResizeObserver(() => {
  if (isUpdatingLayout || isComposing) return;
  if (Math.abs(editorEl.scrollHeight - lastMeasuredHeight) > 2) {
    scheduleLayoutUpdate();
  }
});
resizeObserver.observe(editorEl);

window.addEventListener('resize', () => {
  if (currentViewMode === 'fullpage') {
    updateFullPageScale();
  } else if (currentViewMode === 'mobile') {
    scheduleLayoutUpdate();
  }
});

// Apply initial view mode (Mobile on phones, Desktop on computers)
applyViewMode(currentViewMode);

// 10. Generate & Download PDF with Page Number, Date, Author & No Split Images
const generateBtn = document.getElementById('generate-pdf-btn');

generateBtn.addEventListener('click', async () => {
  deselectImage();

  const rawTitle = document.getElementById('doc-title').value.trim() || 'yourdoc-document';
  const safeFileName = rawTitle.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'yourdoc-document';
  const authorText = authorInput.value.trim();
  const dateText = dateInput.value.trim();

  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating PDF...';

  const exportWrapper = document.createElement('div');
  exportWrapper.className = 'ql-snow pdf-export-wrapper';

  const exportContent = document.createElement('div');
  exportContent.className = 'ql-editor';
  exportContent.innerHTML = editorEl.innerHTML;

  // Strip live-editor visual push margins & image selection rings before PDF export
  exportContent.querySelectorAll('[data-page-push]').forEach((el) => {
    el.style.marginTop = '';
    el.removeAttribute('data-page-push');
  });

  exportContent.querySelectorAll('img').forEach((img) => {
    img.classList.remove('selected-img');
    const parentBlock = img.closest('p, div');
    if (parentBlock && parentBlock !== exportContent) {
      parentBlock.classList.add('pdf-img-block');
    }
  });

  exportWrapper.appendChild(exportContent);

  const options = {
    margin: [15, 15, 22, 15], // [top, left, bottom, right] in mm
    filename: `${safeFileName}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    pagebreak: {
      mode: ['css', 'legacy'],
      after: '.ql-page-break',
      avoid: ['img', '.pdf-img-block', 'h1', 'h2', 'h3', 'li']
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf()
      .set(options)
      .from(exportWrapper)
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);

          // Subtle horizontal footer divider line
          pdf.setDrawColor(215, 215, 215);
          pdf.setLineWidth(0.25);
          pdf.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

          // Footer typography
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9.5);
          pdf.setTextColor(95, 95, 95);

          // Bottom-Left: Automatic Page Number
          pdf.text(`Page ${i}`, 15, pageHeight - 9);

          // Bottom-Center: Custom Date on Every Page
          if (dateText) {
            pdf.text(`Date: ${dateText}`, pageWidth / 2, pageHeight - 9, { align: 'center' });
          }

          // Bottom-Right: Custom Author Name / Footer Text on Every Page
          if (authorText) {
            pdf.text(authorText, pageWidth - 15, pageHeight - 9, { align: 'right' });
          }
        }
      })
      .save();
  } catch (err) {
    alert('Could not generate PDF. If you pasted an image from another website, try uploading it using the toolbar image button instead.');
    console.error(err);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate PDF';
  }
});

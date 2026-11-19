// Live VexTab notation editors for the homepage and tutorial.
import { CodeJar } from 'codejar';
import Prism from 'prismjs/components/prism-core.js';
import { Artist, Vex, VexTab } from 'vextab';
import featuredScore from '../examples/example.vextab?source';

const { Renderer } = Vex.Flow;
Artist.NOLOGO = true;
Prism.manual = true;
const grammar = {
  keyword: /^\s*(?:tabstave|stave|notes|text|options)\b/m,
  property: /[\w-]+(?==)/,
  number: /\b\d+\b/,
};

// SVG text boxes include the full music font ascent and descent. Measure the
// actual glyphs so even a single TAB clef sits close to the editor below it.
const measure = document.createElement('canvas').getContext('2d');
function engravingBounds(svg) {
  const bounds = svg.getBBox();
  const toScore = svg.getCTM().inverse();
  let top = Infinity;
  let bottom = -Infinity;
  for (const mark of svg.querySelectorAll('path, rect, text')) {
    const box = mark.getBBox();
    if (mark.localName === 'text') {
      if (!mark.textContent.trim()) continue;
      const font = getComputedStyle(mark);
      measure.font = [font.fontStyle, font.fontWeight, font.fontSize, font.fontFamily].join(' ');
      const metrics = measure.measureText(mark.textContent);
      const baseline = Number(mark.getAttribute('y'));
      box.y = baseline - metrics.actualBoundingBoxAscent;
      box.height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    }
    // Rotated annotations have their own coordinate system.
    const matrix = toScore.multiply(mark.getCTM());
    for (const x of [box.x, box.x + box.width]) {
      for (const y of [box.y, box.y + box.height]) {
        const point = new DOMPoint(x, y).matrixTransform(matrix);
        top = Math.min(top, point.y);
        bottom = Math.max(bottom, point.y);
      }
    }
  }
  if (bottom >= top) {
    bounds.y = top;
    bounds.height = bottom - top;
  }
  return bounds;
}

function draw(preview, notation, width, scale) {
  const artist = new Artist(10, 0, width, { scale });
  new VexTab(artist).parse(notation);

  // Measure the new SVG in the document. Keep the last score if engraving fails.
  const draft = document.createElement('div');
  preview.append(draft);
  try {
    artist.render(new Renderer(draft, Renderer.Backends.SVG));
    const svg = draft.querySelector('svg');
    const bounds = engravingBounds(svg);
    const zoom = svg.width.baseVal.value / svg.viewBox.baseVal.width;
    const padding = 7;
    const w = bounds.width + 2 * padding;
    const h = bounds.height + 2 * padding;
    svg.setAttribute('viewBox', [bounds.x - padding, bounds.y - padding, w, h].join(' '));
    svg.setAttribute('width', w * zoom);
    svg.setAttribute('height', h * zoom);
    svg.removeAttribute('style');
    preview.replaceChildren(svg);
  } finally {
    draft.remove();
  }
}

function mount(container, index) {
  const width = Number(container.dataset.width);
  const scale = Number(container.dataset.scale || 1);
  const notation = container.textContent.trim().split('\n').map(line => line.trim()).join('\n') || featuredScore.trim();
  container.style.maxWidth = width + 'px';

  const preview = document.createElement('div');
  preview.className = 'vextab-preview';
  const source = document.createElement('div');
  source.className = 'vextab-source';
  source.setAttribute('role', 'textbox');
  source.setAttribute('aria-multiline', 'true');
  source.setAttribute('aria-label', 'VexTab notation, example ' + (index + 1));
  const error = document.createElement('pre');
  error.className = 'vextab-error';
  error.setAttribute('role', 'status');
  container.replaceChildren(preview, source, error);

  const editor = CodeJar(source, element => {
    element.innerHTML = Prism.highlight(element.textContent, grammar, 'vextab');
  }, { tab: '  ', catchTab: false, addClosing: false });
  editor.updateCode(notation);

  let timer;
  let lastInput;
  function render() {
    const input = editor.toString();
    if (input === lastInput) return;
    lastInput = input;
    try {
      if (input.trim()) draw(preview, input, width, scale);
      else preview.replaceChildren();
      error.textContent = '';
      source.removeAttribute('aria-invalid');
    } catch (cause) {
      error.textContent = cause.message || String(cause);
      source.setAttribute('aria-invalid', 'true');
    }
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(render, 100);
  }
  editor.onUpdate(schedule);
  source.addEventListener('input', schedule);
  render();
}

document.fonts.ready.then(() => document.querySelectorAll('.vextab-live').forEach(mount));

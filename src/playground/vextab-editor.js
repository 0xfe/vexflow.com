// Live VexTab notation editors for the homepage and tutorial.
import { liveSource } from './live-source.js';
import { engravingBounds } from './engraving-bounds.js';
import { Artist, Vex, VexTab } from 'vextab';
import featuredScore from '../examples/example.vextab?source';

const { Renderer } = Vex.Flow;
Artist.NOLOGO = true;
const grammar = {
  keyword: /^\s*(?:tabstave|stave|notes|text|options)\b/m,
  property: /[\w-]+(?==)/,
  number: /\b\d+\b/,
};

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
  source.className = 'live-source';
  source.setAttribute('role', 'textbox');
  source.setAttribute('aria-multiline', 'true');
  source.setAttribute('aria-label', 'VexTab notation, example ' + (index + 1));
  const error = document.createElement('pre');
  error.className = 'live-error';
  error.setAttribute('role', 'status');
  container.replaceChildren(preview, source, error);

  liveSource(source, notation, 'vextab', grammar, input => {
    try {
      if (input.trim()) draw(preview, input, width, scale);
      else preview.replaceChildren();
      error.textContent = '';
      source.removeAttribute('aria-invalid');
    } catch (cause) {
      error.textContent = cause.message || String(cause);
      source.setAttribute('aria-invalid', 'true');
    }
  });
}

document.fonts.ready.then(() => document.querySelectorAll('.vextab-live').forEach(mount));

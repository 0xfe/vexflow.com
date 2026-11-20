// Live VexTab notation editors for the homepage and standalone example.
import { liveSource } from './live-source.js';
import { engravingBounds } from './engraving-bounds.js';
import { parseScore, Player, renderScore } from 'vextab/browser';
import featuredScore from '../examples/example.vextab?source';

const grammar = {
  keyword: /\b(?:play|instrument|meter|guitar|staff|piano|fragment|tuplet|bar|sign|text|repeatStart)\b/,
  string: /"(?:\\.|[^"\\])*"/,
  duration: /:(?:[qhw]|\d+)\.*/,
  number: /\b\d+\b/,
};

/** Compile the same grammar used by the guide before replacing the last valid drawing. */
function draw(preview, notation, width, scale, playback) {
  if (!notation.trim()) {
    preview.replaceChildren();
    return;
  }
  const score = parseScore(notation);

  // Measure the new SVG in the document. Keep the last score if engraving fails.
  const draft = document.createElement('div');
  preview.append(draft);
  try {
    const layout = renderScore(draft, score, { width });
    const svg = draft.querySelector('svg');
    const bounds = engravingBounds(svg);
    const zoom = scale * svg.width.baseVal.value / svg.viewBox.baseVal.width;
    const padding = 7;
    const w = bounds.width + 2 * padding;
    const h = bounds.height + 2 * padding;
    svg.setAttribute('viewBox', [bounds.x - padding, bounds.y - padding, w, h].join(' '));
    svg.setAttribute('width', w * zoom);
    svg.setAttribute('height', h * zoom);
    svg.removeAttribute('style');
    draft.replaceChildren(svg);
    const player = playback ? new Player(layout.score, { playback }) : undefined;
    player?.render(svg);
    preview.replaceChildren(...draft.children);
    return player;
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

  const playback = container.hasAttribute('data-player') ? window.VexTabAudio.scoreOptions(container).playback : undefined;
  let player;
  liveSource(source, notation, 'vextab', grammar, input => {
    try {
      const nextPlayer = draw(preview, input, width, scale, playback);
      player?.dispose();
      player = nextPlayer;
      error.textContent = '';
      source.removeAttribute('aria-invalid');
    } catch (cause) {
      error.textContent = cause.message || String(cause);
      source.setAttribute('aria-invalid', 'true');
    }
  });
}

document.fonts.ready.then(() => document.querySelectorAll('.vextab-live').forEach(mount));

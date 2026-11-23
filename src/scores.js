// The VexTab excerpts retain the authored system breaks in every voice.
import { parseScore, Player, renderScore as engraveVexTab } from 'vextab/browser';
import VexFlow from 'vexflow-gallery';
import ballade from './examples/carousel/chopin-ballade-no3.vextab?source';
import pocketChange from './examples/carousel/pocket-change.vextab?source';
import solea from './examples/carousel/flamenco-tab.vextab?source';
import { minuet } from './minuet.js';
import { editions } from './editions.js';
import { mountEditionPlayer } from './edition-player.js';

const guide = 'https://vexflow.com/vextab/guide/#lesson/';
const viewer = 'https://vexflow.com/tests/assets/4b68b4275f38f4533486a0e5ff79c65d4a5730698700ae8c8be5c45e5164a2ad/scores/index.html?piece=';

export const scores = [
  {
    title: 'Ballade No. 3 in A-flat major', credit: 'Frédéric Chopin · Op. 47 · VexTab',
    notation: ballade, width: 1460, demo: guide + 'chopin-ballade-no3', pdf: 'https://vexflow.com/pdfs/ballade.pdf', pdfLabel: 'Opening page (PDF)',
  },
  {
    title: 'Pocket Change', credit: 'Bebop piano · VexTab',
    notation: pocketChange, width: 1100, demo: guide + 'pocket-change',
  },
  {
    title: 'Soleá', credit: 'Traditional flamenco · Arr. Eugen Sedko · VexTab',
    notation: solea, width: 1100, demo: guide + 'flamenco-tab',
  },
  { ...editions.saints, tempo: 120, engrave: engraveSaints, demo: viewer + 'saints' },
  {
    title: 'Minuet in G major', credit: 'Christian Petzold · Notebook for Anna Magdalena Bach', tempo: 132, engrave: minuet,
    demo: 'https://vexflow.com/tests/all.html?module=Demo%20-%20Petzold', pdf: 'https://vexflow.com/pdfs/minuet.pdf',
  },
];

function engraveSaints(host) {
  const edition = editions.saints;
  VexFlow.setFonts(...(edition.fonts ?? ['Bravura', 'Academico']));
  const width = 1000;
  const score = VexFlow.EasyScore.create({ renderer: { elementId: host.id, width, height: 300 } });
  const { spec, decorate } = edition.create(VexFlow, score, edition.choices[0]);
  spec.sheet = { width, x: 16, y: 42, rowGap: 26, measurePadding: 18 };
  const composition = score.compose(spec);
  decorate(composition);
  composition.sheet.format();
  score.draw();
  return { bars: composition.notes.map(staves => staves[0]), meter: spec.staves[0].time, spans: spec.continuous.spans };
}

export function renderScore(score, host, playback) {
  const layout = score.notation
    ? engraveVexTab(host, parseScore(score.notation), { width: score.width })
    : score.engrave(host);

  // Measure engraved ink, including headings, ossias and lyrics.
  const svg = host.querySelector('svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', score.title);
  host.replaceChildren(svg);
  const { x, y, width, height } = svg.getBBox();
  const pad = 8;
  const top = y - pad;
  const end = y + height + pad;
  svg.setAttribute('viewBox', [x - pad, top, width + 2 * pad, end - top].join(' '));
  svg.removeAttribute('style');
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  host.style.removeProperty('width');

  if (!score.notation) return mountEditionPlayer(layout, score.tempo, playback, svg);
  const player = new Player(layout.score, { playback });
  player.render(svg);
  return player;
}

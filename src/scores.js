// The VexTab excerpts retain the authored system breaks in every voice.
import { parseScore, Player, renderScore as engraveVexTab } from 'vextab/browser';
import VexFlow from 'vexflow-gallery';
import ballade from './examples/carousel/chopin-ballade-no3.vextab?source';
import pocketChange from './examples/carousel/pocket-change.vextab?source';
import solea from './examples/carousel/flamenco-tab.vextab?source';
import { joy } from 'vexflow-demos/joy';
import { editions } from './editions.js';
import { mountEditionPlayer } from './edition-player.js';

const guide = 'https://vexflow.com/vextab/guide/#lesson/';
const viewer = 'https://vexflow.com/tests/assets/4b68b4275f38f4533486a0e5ff79c65d4a5730698700ae8c8be5c45e5164a2ad/scores/index.html?piece=';

export const scores = [
  {
    title: 'Ballade No. 3 in A-flat major', credit: 'Frédéric Chopin · Op. 47 · VexTab',
    notation: ballade, width: 1460, demo: guide + 'chopin-ballade-no3', pdf: 'https://vexflow.com/pdfs/ballade.pdf',
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
    title: 'Ode to Joy', credit: 'Ludwig van Beethoven · Cello duet', tempo: 96, engrave: engraveJoy,
    demo: 'https://vexflow.com/tests/all.html?module=Demo%20-%20Ode%20to%20Joy',
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
  return { parts: [composition.notes.flatMap(staves => staves[0][0])], spans: spec.continuous.spans };
}

function engraveJoy(host) {
  VexFlow.setFonts('Bravura', 'Academico');
  const options = { elementId: host.id, assert: { ok(value, message) { if (!value) throw new Error(message); } } };
  joy(options);
  // Each bar has two pitched voices plus occasional dynamics in a separate voice.
  const parts = [[], []];
  const pitched = options.voices.map(voice => voice.getTickables()).filter(notes => notes[0] instanceof VexFlow.StaveNote);
  pitched.forEach((notes, index) => parts[index % 2].push(...notes));
  return { parts, keySignature: 'D', program: 42 };
}

export function renderScore(score, host, playback, controls) {
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

  if (!score.notation) return mountEditionPlayer(layout, score.tempo, playback, controls);
  const player = new Player(layout.score, { playback });
  player.render(svg);
  return player;
}

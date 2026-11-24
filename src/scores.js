// The VexTab excerpts retain the authored system breaks in every voice.
import { parseScore, Player, renderScore as engraveVexTab } from 'vextab/browser';
import ballade from './examples/carousel/chopin-ballade-no3.vextab?source';
import pocketChange from './examples/carousel/pocket-change.vextab?source';
import solea from './examples/carousel/flamenco-tab.vextab?source';
import thirds from './examples/carousel/chopin-etude-op25-no6.vextab?source';
import rhapsody from './examples/carousel/liszt-hungarian-rhapsody-no2.vextab?source';
import consolation from './examples/carousel/liszt-consolation-no5.vextab?source';
import allOfMe from './examples/carousel/all-of-me.vextab?source';
import { playback } from './playback.js';

const guide = 'https://vexflow.com/vextab/guide/#lesson/';

export const scores = [
  {
    title: 'Ballade No. 3 in A-flat major', credit: 'Frédéric Chopin · Op. 47 · VexTab',
    notation: ballade, width: 1460,
    compactHeading: { align: 'center', title: 'Ballade No. 3', dedication: 'À Mlle Pauline de Noailles.' },
    demo: guide + 'chopin-ballade-no3', pdf: 'https://vexflow.com/pdfs/ballade.pdf', pdfLabel: 'Opening page (PDF)',
  },
  {
    title: 'Pocket Change', credit: 'Bebop piano · VexTab',
    notation: pocketChange, width: 1100, demo: guide + 'pocket-change',
  },
  {
    title: 'Soleá', credit: 'Traditional flamenco · Arr. Eugen Sedko · VexTab',
    notation: solea, width: 1100, demo: guide + 'flamenco-tab',
  },
  {
    title: 'Étude in thirds', credit: 'Frédéric Chopin · Op. 25 No. 6 · VexTab',
    notation: thirds, width: 1680, demo: guide + 'chopin-etude-op25-no6',
  },
  {
    title: 'Hungarian Rhapsody No. 2', credit: 'Franz Liszt · S. 244 No. 2 · VexTab',
    notation: rhapsody, width: 1200, demo: guide + 'liszt-hungarian-rhapsody-no2',
  },
  {
    title: 'Consolation No. 5 in E major', credit: 'Franz Liszt · S. 172 No. 5 · VexTab',
    notation: consolation, width: 1330, demo: guide + 'liszt-consolation-no5',
  },
  {
    title: 'All of Me', credit: 'Gerald Marks and Seymour Simons · Chord-melody guitar · VexTab',
    notation: allOfMe, width: 1100, demo: guide + 'all-of-me',
  },
];

export function renderScore(score, host, compact) {
  const notation = parseScore(score.notation);
  // A narrower engraving width wraps complete measures in every voice together.
  if (compact) {
    notation.layout.firstSystemIndent = 0;
    if (score.compactHeading) Object.assign(notation.layout.heading, score.compactHeading);
  }
  const layout = engraveVexTab(host, notation, { width: compact ? 500 : score.width });

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

  const player = new Player(layout.score, { playback });
  player.render(svg);
  return player;
}

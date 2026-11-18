// Render the arrangements directly from the visual tests in the pinned VexFlow source.
import VexFlow from 'vexflow-gallery';
import { saints } from 'vexflow-demos/saints';
import { greensleeves } from 'vexflow-demos/greensleeves';
import { prelude } from 'vexflow-demos/prelude';
import { kesh } from 'vexflow-demos/kesh';
import { joy } from 'vexflow-demos/joy';
import { electric } from 'vexflow-demos/electric';
import { drums } from 'vexflow-demos/drums';
import { quartertones } from 'vexflow-demos/quartertones';
import { minuet } from './minuet.js';

export const scores = [
  { title: 'Minuet in G major', credit: 'Christian Petzold · Keyboard', render: minuet },
  { title: 'When the Saints Go Marching In', credit: 'Traditional spiritual · Jazz lead sheet', render: saints, fonts: ['Petaluma', 'Petaluma Script'] },
  { title: 'Greensleeves', credit: 'Traditional English air · Guitar tablature', render: greensleeves },
  { title: 'Prelude in C major', credit: 'Johann Sebastian Bach · Keyboard', render: prelude },
  { title: 'The Kesh Jig', credit: 'Traditional Irish jig · Fiddle', render: kesh },
  { title: 'Ode to Joy', credit: 'Ludwig van Beethoven · Cello duet', render: joy },
  { title: 'High Wire', credit: 'Electric guitar · A minor pentatonic', render: electric },
  { title: 'Pocket Change', credit: 'Drum set · Funk', render: drums },
  { title: 'Narrow Steps', credit: 'Solo viola · Quarter tones', render: quartertones },
];

const assert = {
  ok(condition, message) {
    if (!condition) throw new Error(message);
  },
};

export function renderScore(score, host) {
  VexFlow.setFonts(...(score.fonts ?? ['Bravura', 'Academico']));
  score.render({ elementId: host.id, assert });

  // Fit the ink, including annotations outside the original test canvas.
  const svg = host.querySelector('svg');
  const { x, y, width, height } = svg.getBBox();
  const padding = 6;
  svg.setAttribute('viewBox', [x - padding, y - padding, width + 2 * padding, height + 2 * padding].join(' '));
  // SVGContext.resize also sets a fixed pixel width on the host.
  host.style.removeProperty('width');
  svg.style.width = '100%';
  svg.style.height = '100%';
}

// Engrave the visual fixtures and score editions from the pinned VexFlow gallery.
import VexFlow from 'vexflow-gallery';
import 'vexflow-scores/ballade';
import { fugue } from 'vexflow-demos/fugue';
import { greensleeves } from 'vexflow-demos/greensleeves';
import { joy } from 'vexflow-demos/joy';
import { editions } from './editions.js';
import { minuet } from './minuet.js';

function ballade({ elementId }) {
  const { width, height, draw } = globalThis.ChopinBallade;
  draw(VexFlow, new VexFlow.Factory({ renderer: { elementId, width, height } }));
  // Frame the first two complete systems, as in the upstream gallery cover.
  return [0, width * 0.132, width, width * 0.44];
}

function renderEdition(edition, host) {
  const choice = edition.choices?.[0];
  if (edition.publication) {
    const { spec, options } = edition.publication(choice, VexFlow);
    const { pages } = new VexFlow.Publication(spec).render(host, options);
    // Show the opening ensemble system at reading size.
    const firstPage = pages[0].svg;
    host.replaceChildren(firstPage);
    firstPage.replaceChildren(firstPage.querySelector('[data-system]'));
    return;
  }
  const width = 1000;
  const score = VexFlow.EasyScore.create({ renderer: { elementId: host.id, width, height: 300 } });
  const { spec, decorate } = edition.create(VexFlow, score, choice);
  spec.sheet = { width, x: 16, y: 42, rowGap: 26, measurePadding: 18 };
  const composition = score.compose(spec);
  decorate?.(composition);
  composition.sheet.format();
  score.draw();
}

export const scores = [
  { title: 'Ballade No. 3 in A-flat major', credit: 'Frédéric Chopin · Solo piano, Op. 47', render: ballade },
  { title: 'Minuet in G major', credit: 'Christian Petzold · Keyboard', render: minuet },
  editions.saints,
  { title: 'Greensleeves', credit: 'Traditional English air · Guitar tablature', render: greensleeves },
  editions.prelude,
  { title: 'Fugue No. 6 in D minor', credit: 'Johann Sebastian Bach · BWV 851', render: fugue },
  editions.kesh,
  { title: 'Ode to Joy', credit: 'Ludwig van Beethoven · Cello duet', render: joy },
  editions.electric,
  editions.drums,
  editions.quartertones,
  editions.falseta,
  editions.sumer,
];

const assert = {
  ok(condition, message) {
    if (!condition) throw new Error(message);
  },
  equal(actual, expected, message) {
    if (actual !== expected) throw new Error(message);
  },
};

export function renderScore(score, host) {
  VexFlow.setFonts(...(score.fonts ?? ['Bravura', 'Academico']));
  const excerpt = score.render ? score.render({ elementId: host.id, assert }) : renderEdition(score, host);
  const svg = host.querySelector('svg');
  if (excerpt) {
    svg.setAttribute('viewBox', excerpt.join(' '));
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.classList.add('score-excerpt');
    svg.style.height = 'auto';
  } else {
    // Fit the ink, including annotations outside the original test canvas.
    const { x, y, width, height } = svg.getBBox();
    const padding = width * 0.006;
    svg.setAttribute('viewBox', [x - padding, y - padding, width + 2 * padding, height + 2 * padding].join(' '));
    svg.style.height = '100%';
  }
  // SVGContext.resize also sets a fixed pixel width on the host.
  host.style.removeProperty('width');
  svg.style.width = '100%';
}

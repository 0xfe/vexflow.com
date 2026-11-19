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
  return { top: width * 0.132, bottom: width * 0.572 };
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
  if (edition.previewSystems) {
    const rows = composition.sheet.getRows();
    if (rows.length > edition.previewSystems) {
      // Cut in the gap between systems so paired staves and tablature stay together.
      const split = edition.fromEnd ? rows.length - edition.previewSystems : edition.previewSystems;
      const boundary = rows[split].y - spec.sheet.rowGap / 2;
      return edition.fromEnd ? { top: boundary } : { bottom: boundary };
    }
  }
}

export const scores = [
  { title: 'Ballade No. 3 in A-flat major', credit: 'Frédéric Chopin · Solo piano, Op. 47', render: ballade },
  { title: 'Minuet in G major', credit: 'Christian Petzold · Keyboard', render: minuet },
  editions.saints,
  { title: 'Greensleeves', credit: 'Traditional English air · Guitar tablature', render: greensleeves },
  { ...editions.prelude, previewSystems: 2 },
  { title: 'Fugue No. 6 in D minor', credit: 'Johann Sebastian Bach · BWV 851', render: fugue },
  editions.kesh,
  { title: 'Ode to Joy', credit: 'Ludwig van Beethoven · Cello duet', render: joy },
  { ...editions.electric, previewSystems: 1, fromEnd: true },
  editions.drums,
  editions.quartertones,
  { ...editions.falseta, previewSystems: 1 },
  { ...editions.sumer, previewSystems: 2 },
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
  // Trim the printed side margins and allow room for annotations at the edges.
  const { x, y, width, height } = svg.getBBox();
  const padding = width * 0.006;
  const top = excerpt?.top ?? y - padding;
  const bottom = excerpt?.bottom ?? y + height + padding;
  svg.setAttribute('viewBox', [x - padding, top, width + 2 * padding, bottom - top].join(' '));
  // Let the sheet width and viewBox determine the displayed size.
  host.style.removeProperty('width');
  svg.style.removeProperty('width');
  svg.style.removeProperty('height');
  svg.removeAttribute('width');
  svg.removeAttribute('height');
}

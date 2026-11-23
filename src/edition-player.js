// Supply VexTab's Player with the notes already engraved by the VexFlow demos.
import { parseScore, Player } from 'vextab/browser';
import VexFlow from 'vexflow-gallery';

function playbackNote(note, tied) {
  const dots = VexFlow.Dot.getDots(note).filter(dot => dot.getIndex() === 0).length;
  const rhythm = ':' + note.getDuration() + '.'.repeat(dots);
  if (note.isRest()) return rhythm + ' rest';
  const pitches = note.getKeys().map(key => {
    const [name, octave] = key.split('/');
    return name[0].toUpperCase() + name.slice(1) + octave + (tied ? '[tie]' : '');
  });
  return rhythm + ' ' + (pitches.length === 1 ? pitches[0] : '(' + pitches.join(' ') + ')');
}

// Measures on the same printed line share one cursor, spanning both piano staves.
function playbackGeometry(bars, voices, model) {
  let row;
  const rows = bars.map(bar => {
    const staves = bar.map(voice => voice[0].getStave());
    const top = staves[0].getYForLine(0) - 7;
    if (row?.top !== top) row = { top, bottom: top, right: 0 };
    for (const stave of staves) {
      row.bottom = Math.max(row.bottom, stave.getYForLine(stave.getNumLines() - 1) + 7);
      row.right = Math.max(row.right, stave.getNoteEndX());
    }
    return row;
  });

  const positions = new Map();
  model.parts[0].staves.forEach((staff, hand) => {
    const events = staff.voices[0].events;
    let index = 0;
    voices[hand].forEach((measure, bar) => {
      for (const note of measure) {
        const ys = note.getYs();
        const heads = note.isRest() ? [] : note.getHeadInk().map((ink, i) => ({
          x: ink.x + ink.w / 2, y: ys[i],
        }));
        positions.set(events[index++].id, { row: rows[bar], x: heads[0]?.x ?? note.getAbsoluteX(), heads });
      }
    });
  });
  return positions;
}

export function mountEditionPlayer({ bars, spans = [], keySignature = 'C', meter }, tempo, playback, svg) {
  const ties = new Set(spans.filter(span => span.kind === 'tie').map(span => span.to));
  const voices = bars[0].map((_, index) => bars.map(bar => bar[index].filter(note => !note.shouldIgnoreTicks())));
  const lanes = voices.map(measures => measures.map(notes => {
    const music = notes.map(note => playbackNote(note, ties.has(note.getAttribute('id'))));
    // A fragment retains the authored length of pickup and closing bars.
    return 'fragment { ' + music.join(' ') + ' }';
  }).join('\n'));
  const instrument = lanes.length === 1
    ? `staff { key ${keySignature}\n${lanes[0]}\n}`
    : `piano { key ${keySignature}\nupper { ${lanes[0]} }\nlower { ${lanes[1]} }\n}`;
  const model = parseScore(`meter ${meter}\n${instrument}`);
  const positions = playbackGeometry(bars, voices, model);
  const player = new Player(model, { playback, tempo, performer: 'robot', controls: { size: 'large' } });
  player.render(svg);
  // VexTab 6.2 installs this internal geometry reader in render() for its own
  // surfaces. Supply the same input for our SVG until Player exposes a public hook.
  player.geometry = () => positions;
  return player;
}

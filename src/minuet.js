/**
 * Petzold’s Minuet in G, adapted from VexFlow’s gallery fixture.
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

// This build includes the Bravura and Academico fonts used by the demo.
import VF from 'vexflow-gallery';

function concat(a, b) { return a.concat(b); }

export function minuet({ elementId }) {
  const registry = new VF.Registry();
  VF.Registry.enableDefaultRegistry(registry);
  const vf = new VF.Factory({
    renderer: { elementId, width: 1100, height: 900 },
  });

  const score = vf.EasyScore({ throwOnError: true });

  const voice = score.voice.bind(score);
  const notes = score.notes.bind(score);
  const beam = score.beam.bind(score);

  let x = 120;
  let y = 80;
  function makeSystem(swidth) {
    const system = vf.System({
      x, y, width: swidth, spaceBetweenStaves: 10,
    });
    x += swidth;
    return system;
  }

  function id(vid) { return registry.getElementById(vid); }

  score.set({ time: '3/4' });

  /*  Measure 1 */
  let system = makeSystem(220);
  system.addStave({
    voices: [
      voice([
        notes('D5/q[id="m1a"]'),
        beam(notes('G4/8, A4, B4, C5', { stem: 'up' })),
      ].reduce(concat)),
      voice([vf.TextDynamics({
        text: 'p', duration: 'h', dots: 1, line: 9,
      })]),
    ],
  })
    .addClef('treble')
    .addKeySignature('G')
    .addTimeSignature('3/4')
    .setTempo({
      name: 'Allegretto', duration: 'q', bpm: 132,
    }, -30);

  system.addStave({ voices: [voice(notes('(G3 B3 D4)/h[id="ped1"], A3/q[id="lift1"]', { clef: 'bass' }))] })
    .addClef('bass').addKeySignature('G').addTimeSignature('3/4');
  system.addConnector('brace');
  system.addConnector('singleRight');
  system.addConnector('singleLeft');

  vf.PedalMarking({ notes: [id('ped1'), id('lift1')] });
  id('m1a').addModifier(vf.Fingering({ number: '5' }));

  /*  Measure 2 */
  system = makeSystem(150);
  system.addStave({ voices: [voice(notes('D5/q[id="m2a"], G4[id="m2b"], G4[id="m2c"]'))] });
  system.addStave({ voices: [voice(notes('B3/h.', { clef: 'bass' }))] });
  system.addConnector('singleRight');

  id('m2a').addModifier(vf.Articulation({ type: 'a.', position: 'above' }));
  id('m2b').addModifier(vf.Articulation({ type: 'a.', position: 'below' }));
  id('m2c').addModifier(vf.Articulation({ type: 'a.', position: 'below' }));

  vf.Curve({
    from: id('m1a'),
    to: id('m2a'),
    options: { cps: [{ x: 0, y: 40 }, { x: 0, y: 40 }] },
  });

  /*  Measure 3 */
  system = makeSystem(150);
  system.addStave({
    voices: [
      voice([
        notes('E5/q[id="m3a"]'),
        beam(notes('C5/8[id="m3cut"], D5, E5, F5', { stem: 'down' })),
      ].reduce(concat)),
    ],
  });
  id('m3cut').addModifier(vf.Ornament('mordent'));
  id('m3a').addModifier(vf.Fingering({ number: '3', position: 'above' }));

  system.addStave({ voices: [voice(notes('C4/h.', { clef: 'bass' }))] });
  system.addConnector('singleRight');

  /*  Measure 4 */
  system = makeSystem(150);
  system.addStave({ voices: [voice(notes('G5/q[id="m4a"], G4[id="m4b"], G4[id="m4c"]'))] });

  system.addStave({ voices: [voice(notes('B3/h.', { clef: 'bass' }))] });
  system.addConnector('singleRight');

  id('m4a').addModifier(vf.Articulation({ type: 'a.', position: 'above' }));
  id('m4b').addModifier(vf.Articulation({ type: 'a.', position: 'below' }));
  id('m4c').addModifier(vf.Articulation({ type: 'a.', position: 'below' }));

  vf.Curve({
    from: id('m3a'),
    to: id('m4a'),
    options: { cps: [{ x: 0, y: 39 }, { x: 0, y: 39 }] },
  });

  /*  Measure 5 */
  system = makeSystem(150);
  system.addStave({
    voices: [
      voice([
        notes('C5/q[id="m5a"]'),
        beam(notes('D5/8, C5, B4, A4', { stem: 'down' })),
      ].reduce(concat)),
    ],
  });
  id('m5a').addModifier(vf.Fingering({ number: '4', position: 'above' }));

  system.addStave({ voices: [voice(notes('A3/h.', { clef: 'bass' }))] });
  system.addConnector('singleRight');

  /*  Measure 6 */
  system = makeSystem(150);
  system.addStave({
    voices: [
      voice([
        notes('B5/q'),
        beam(notes('C5/8, B4, A4, G4[id="m6a"]', { stem: 'up' })),
      ].reduce(concat)),
    ],
  });

  system.addStave({ voices: [voice(notes('G3/h.', { clef: 'bass' }))] });
  system.addConnector('singleRight');

  vf.Curve({
    from: id('m5a'),
    to: id('m6a'),
    options: {
      cps: [{ x: 0, y: 20 }, { x: 0, y: 20 }],
      invert: true,
      positionEnd: 'nearTop',
      yShift: 20,
    },
  });

  /*  Measure 7 (New system) */
  x = 20;
  y += 230;

  system = makeSystem(220);
  system.addStave({
    voices: [
      voice([vf.TextDynamics({ text: 'mf', duration: 'h', dots: 1, line: 10 })]),
      voice([
        notes('F4/q[id="m7a"]'),
        beam(notes('G4/8[id="m7b"], A4, B4, G4', { stem: 'up' })),
      ].reduce(concat)),
    ],
  }).addClef('treble').addKeySignature('G');

  system.addStave({ voices: [voice(notes('D4/q, B3[id="m7c"], G3', { clef: 'bass' }))] })
    .addClef('bass').addKeySignature('G');
  system.addConnector('brace');
  system.addConnector('singleRight');
  system.addConnector('singleLeft');

  id('m7a').addModifier(vf.Articulation({ type: 'a-', position: 'above' }));
  id('m7a').addModifier(vf.Fingering({ number: '2', position: 'below' }));
  id('m7b').addModifier(vf.Fingering({ number: '1' }));
  id('m7c').addModifier(vf.Fingering({ number: '3', position: 'above' }));

  /*  Measure 8 */
  system = makeSystem(180);
  const grace = vf.GraceNote({
    keys: ['b/4'], duration: '8', slash: true,
  });

  system.addStave({ voices: [voice(notes('A4/h.[id="m8c"]'))] });
  system.addStave({
    voices: [
      score.set({ clef: 'bass' }).voice([
        notes('D4/q[id="m8a"]'),
        beam(notes('D3/8, C4, B3[id="m8b"], A3', { stem: 'down' })),
      ].reduce(concat)),
    ],
  });
  system.addConnector('singleRight');

  id('m8b').addModifier(vf.Fingering({ number: '1', position: 'above' }));
  id('m8c').addModifier(vf.GraceNoteGroup({ notes: [grace], slur: true }));

  vf.Curve({
    from: id('m7a'),
    to: id('m8c'),
    options: {
      cps: [{ x: 0, y: 20 }, { x: 0, y: 20 }],
      invert: true,
      position: 'nearTop',
      positionEnd: 'nearTop',
    },
  });

  /*  Measure 9 */
  system = makeSystem(180);
  system.addStave({
    voices: [
      voice([vf.TextDynamics({ text: 'pp', duration: 'h', dots: 1, line: 9 })]),
      score.set({ clef: 'treble' }).voice([
        notes('D5/q[id="m9a"]'),
        beam(notes('G4/8, A4, B4, C5', { stem: 'up' })),
      ].reduce(concat)),
    ],
  });

  system.addStave({ voices: [voice(notes('B3/h, A3/q', { clef: 'bass' }))] });
  system.addConnector('singleRight');

  id('m9a').addModifier(vf.Fingering({ number: '5' }));

  /*  Measure 10 */
  system = makeSystem(170);
  system.addStave({ voices: [voice(notes('D5/q[id="m10a"], G4[id="m10b"], G4[id="m10c"]'))] });
  system.addStave({ voices: [voice(notes('G3/q[id="m10d"], B3, G3', { clef: 'bass' }))] });
  system.addConnector('singleRight');

  id('m10a').addModifier(vf.Articulation({ type: 'a.', position: 'above' }));
  id('m10b').addModifier(vf.Articulation({ type: 'a.', position: 'below' }));
  id('m10c').addModifier(vf.Articulation({ type: 'a.', position: 'below' }));
  id('m10d').addModifier(vf.Fingering({ number: '4' }));

  vf.Curve({
    from: id('m9a'),
    to: id('m10a'),
    options: { cps: [{ x: 0, y: 40 }, { x: 0, y: 40 }] },
  });

  /*  Measure 11 */
  system = makeSystem(150);
  system.addStave({
    voices: [
      voice([
        notes('E5/q[id="m11a"]'),
        beam(notes('C5/8[id="m11cut"], D5, E5, F5', { stem: 'down' })),
      ].reduce(concat)),
    ],
  });
  id('m11cut').addModifier(vf.Ornament('mordent'));
  id('m11a').addModifier(vf.Fingering({ number: '3', position: 'above' }));

  system.addStave({ voices: [voice(notes('C4/h.', { clef: 'bass' }))] });
  system.addConnector('singleRight');

  /*  Measure 12 */
  system = makeSystem(170);
  system.addStave({ voices: [voice(notes('G5/q[id="m12a"], G4[id="m12b"], G4[id="m12c"]'))] });

  system.addStave({
    voices: [
      score.set({ clef: 'bass' }).voice([
        notes('B3/q[id="m12d"]'),
        beam(notes('C4/8, B3, A3, G3[id="m12e"]', { stem: 'down' })),
      ].reduce(concat)),
    ],
  });
  system.addConnector('singleRight');

  id('m12a').addModifier(vf.Articulation({ type: 'a.', position: 'above' }));
  id('m12b').addModifier(vf.Articulation({ type: 'a.', position: 'below' }));
  id('m12c').addModifier(vf.Articulation({ type: 'a.', position: 'below' }));

  id('m12d').addModifier(vf.Fingering({ number: '2', position: 'above' }));
  id('m12e').addModifier(vf.Fingering({ number: '4', position: 'above' }));

  vf.Curve({
    from: id('m11a'),
    to: id('m12a'),
    options: { cps: [{ x: 0, y: 39 }, { x: 0, y: 39 }] },
  });

  /*  Measure 13 (New system) */
  x = 20;
  y += 230;

  system = makeSystem(220);
  system.addStave({
    voices: [
      score.set({ clef: 'treble' }).voice([
        notes('c5/q[id="m13a"]'),
        beam(notes('d5/8, c5, b4, a4', { stem: 'down' })),
      ].reduce(concat)),
    ],
  }).addClef('treble').addKeySignature('G');

  system.addStave({ voices: [voice(notes('a3/h[id="m13b"], f3/q[id="m13c"]', { clef: 'bass' }))] })
    .addClef('bass').addKeySignature('G');

  system.addConnector('brace');
  system.addConnector('singleRight');
  system.addConnector('singleLeft');

  id('m13a').addModifier(vf.Fingering({ number: '4', position: 'above' }));
  id('m13b').addModifier(vf.Fingering({ number: '1' }));
  id('m13c').addModifier(vf.Fingering({ number: '3', position: 'above' }));

  /*  Measure 14 */
  system = makeSystem(180);
  system.addStave({
    voices: [
      score.set({ clef: 'treble' }).voice([
        notes('B4/q'),
        beam(notes('C5/8, b4, a4, g4[id="m14end"]', { stem: 'up' })),
      ].reduce(concat)),
    ],
  });

  system.addStave({ voices: [voice(notes('g3/h[id="m14a"], b3/q[id="m14b"]', { clef: 'bass' }))] });
  system.addConnector('singleRight');

  id('m14a').addModifier(vf.Fingering({ number: '2' }));
  id('m14b').addModifier(vf.Fingering({ number: '1' }));

  /*  Measure 15 */
  system = makeSystem(180);
  system.addStave({
    voices: [
      score.set({ clef: 'treble' }).voice([
        notes('a4/q'),
        beam(notes('b4/8, a4, g4, f4[id="m15a"]', { stem: 'up' })),
      ].reduce(concat)),
    ],
  });

  system.addStave({ voices: [voice(notes('c4/q[id="m15b"], d4, d3', { clef: 'bass' }))] });
  system.addConnector('singleRight');

  id('m15a').addModifier(vf.Fingering({ number: '2' }));
  id('m15b').addModifier(vf.Fingering({ number: '2' }));

  /*  Measure 16 */
  system = makeSystem(130);
  system.addStave({
    voices: [
      score.set({ clef: 'treble' }).voice([
        notes('g4/h.[id="m16a"]'),
      ].reduce(concat)),
    ],
  }).setEndBarType(VF.BarlineType.REPEAT_END);

  system.addStave({ voices: [voice(notes('g3/h[id="m16b"], g2/q[id="lift16"]', { clef: 'bass' }))] })
    .setEndBarType(VF.BarlineType.REPEAT_END);
  system.addConnector('boldDoubleRight');

  id('m16a').addModifier(vf.Fingering({ number: '1' }));
  id('m16b').addModifier(vf.Fingering({ number: '1' }));

  vf.Curve({
    from: id('m13a'),
    to: id('m16a'),
    options: {
      cps: [{ x: 0, y: 50 }, { x: 0, y: 20 }],
      invert: true,
      positionEnd: 'nearTop',
    },
  });

  /* Measure 17 */
  system = makeSystem(180);
  system.addStave({
    voices: [
      score.set({ clef: 'treble' }).voice([
        notes('b5/q[id="m17a"]'),
        beam(notes('g5/8, a5, b5, g5', { stem: 'down' })),
      ].reduce(concat)),
      voice([vf.TextDynamics({
        text: 'mf', duration: 'h', dots: 1, line: 10,
      })]),
    ],
  }).setBegBarType(VF.BarlineType.REPEAT_BEGIN);

  system.addStave({ voices: [voice(notes('g3/h.', { clef: 'bass' }))] })
    .setBegBarType(VF.BarlineType.REPEAT_BEGIN);

  system.addConnector('boldDoubleLeft');
  system.addConnector('singleRight');

  id('m17a').addModifier(vf.Fingering({ number: '5', position: 'above' }));

  /* Measure 18 */
  system = makeSystem(180);
  system.addStave({
    voices: [
      score.set({ clef: 'treble' }).voice([
        notes('a5/q[id="m18a"]'),
        beam(notes('d5/8, e5, f5, d5[id="m18b"]', { stem: 'down' })),
      ].reduce(concat)),
    ],
  });

  system.addStave({ voices: [voice(notes('f3/h.', { clef: 'bass' }))] });
  system.addConnector('singleRight');

  id('m18a').addModifier(vf.Fingering({ number: '4', position: 'above' }));

  vf.Curve({
    from: id('m17a'),
    to: id('m18b'),
    options: {
      cps: [{ x: 0, y: 20 }, { x: 0, y: 30 }],
    },
  });

  vf.StaveHairpin({ from: id('m5a'), to: id('m6a'), type: VF.StaveHairpin.type.CRESC });
  vf.StaveHairpin({ from: id('m13a'), to: id('m14end'), type: VF.StaveHairpin.type.DECRESC });
  vf.PedalMarking({ notes: [id('m16b'), id('lift16')] });

  vf.draw();
  VF.Registry.disableDefaultRegistry();
}

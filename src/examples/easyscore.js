// VexFlow and #score are provided by the preview. Fonts are already loaded.
const vf = new VexFlow.Factory({
  renderer: { elementId: 'score', width: 700, height: 250 },
});
const score = vf.EasyScore();
const system = vf.System({ x: 60, y: 55, width: 580 });

system.addStave({
  voices: [
    score.voice(score.notes('C#5/q, B4, A4, G#4', { stem: 'up' })),
    score.voice(score.notes('C#4/h, C#4', { stem: 'down' })),
  ],
}).addClef('treble').addTimeSignature('4/4');

vf.draw();

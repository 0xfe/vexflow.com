// VexFlow and #score are provided by the preview. Fonts are already loaded.
const host = document.getElementById('score');
const vf = new VexFlow.Factory({
  renderer: { elementId: 'score', width: 600, height: 240 },
});
const score = vf.EasyScore();
const system = vf.System({ x: 10, y: 20, width: 580 });

system.addStave({
  voices: [
    score.voice(score.notes('C#5/q, B4, A4, G#4', { stem: 'up' })),
    score.voice(score.notes('C#4/h, C#4', { stem: 'down' })),
  ],
}).addClef('treble').addTimeSignature('4/4');
vf.draw();

// Fit the score to 80% of the frame width, keeping its proportions and centering it.
const svg = host.querySelector('svg');
const box = svg.getBBox();
const width = box.width + 8;
// The notation occupies 80% of the height: 10% padding above and below.
const height = box.height / 0.8;
const topPadding = (height - box.height) / 2;
const scale = innerWidth * 0.8 / width;
svg.setAttribute('viewBox', `${box.x - 4} ${box.y - topPadding} ${width} ${height}`);
svg.setAttribute('width', width * scale);
svg.setAttribute('height', height * scale);
// Override the renderer's inline pixel dimensions as well as the SVG attributes.
svg.style.width = `${width * scale}px`;
svg.style.height = `${height * scale}px`;
// Let the preview fit the score instead of leaving a fixed-height empty box.
host.style.cssText = 'display: grid; place-items: center;';

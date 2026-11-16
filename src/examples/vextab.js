// vextab and #score are provided by the preview. Fonts are already loaded.
const notation = `tabstave notation=true key=A time=4/4
notes :q =|: (5/2.5/3.7/4) :8 7-5h6/3 ^3^ 5h6-7/5 ^3^ :q 7V/4 |
notes :8 t12p7/4 s5s3/4 :8 3s:16:5-7/5 :q p5/4
text :w, |#segno, ,|, :hd, , #tr`;

const host = document.getElementById('score');
const VF = vextab.Vex.Flow;
const renderer = new VF.Renderer(host, VF.Renderer.Backends.SVG);
// Start lower so the segno and other annotations have room above the stave.
const artist = new vextab.Artist(10, 40, 780, { scale: 1 });
new vextab.VexTab(artist).parse(notation);
artist.render(renderer);

// Fit to 95% of the frame width and center, including the top annotations.
const svg = host.querySelector('svg');
const box = svg.getBBox();
const width = box.width + 8;
// Include every annotation, with 10% padding above and below the notation.
const height = box.height / 0.8;
const topPadding = (height - box.height) / 2;
const scale = innerWidth * 0.95 / width;
svg.setAttribute('viewBox', `${box.x - 4} ${box.y - topPadding} ${width} ${height}`);
svg.setAttribute('width', width * scale);
svg.setAttribute('height', height * scale);
// Override the renderer's inline pixel dimensions as well as the SVG attributes.
svg.style.width = `${width * scale}px`;
svg.style.height = `${height * scale}px`;
// Let the preview fit the score instead of leaving a fixed-height empty box.
host.style.cssText = 'display: grid; place-items: center;';

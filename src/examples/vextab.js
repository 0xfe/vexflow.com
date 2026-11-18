// vextab and #score are provided by the preview. Fonts are already loaded.
const notation = `tabstave notation=true key=A time=4/4
notes :q =|: (5/2.5/3.7/4) :8 7-5h6/3 ^3^ 5h6-7/5 ^3^ :q 7V/4 |
notes :8 t12p7/4 s5s3/4 :8 3s:16:5-7/5 :q p5/4
text :w, |#segno, ,|, :hd, , #tr`;

const host = document.getElementById('score');
const VF = vextab.Vex.Flow;
vextab.Artist.NOLOGO = true;
const renderer = new VF.Renderer(host, VF.Renderer.Backends.SVG);
// Leave room for the segno above the staff and the tablature below.
const artist = new vextab.Artist(10, 115, 780, { bottom_spacing: 110 });
new vextab.VexTab(artist).parse(notation);
artist.render(renderer);

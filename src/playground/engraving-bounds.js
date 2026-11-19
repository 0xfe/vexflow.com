// SVG text boxes include the full music font ascent and descent. Measure the
// actual glyphs so even a single TAB clef sits close to the editor below it.
const measure = document.createElement('canvas').getContext('2d');
export function engravingBounds(svg) {
  const bounds = svg.getBBox();
  const toScore = svg.getCTM().inverse();
  let top = Infinity;
  let bottom = -Infinity;
  for (const mark of svg.querySelectorAll('path, rect, text')) {
    const box = mark.getBBox();
    if (mark.localName === 'text') {
      if (!mark.textContent.trim()) continue;
      const font = getComputedStyle(mark);
      measure.font = [font.fontStyle, font.fontWeight, font.fontSize, font.fontFamily].join(' ');
      const metrics = measure.measureText(mark.textContent);
      const baseline = Number(mark.getAttribute('y'));
      box.y = baseline - metrics.actualBoundingBoxAscent;
      box.height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    }
    // Rotated annotations have their own coordinate system.
    const matrix = toScore.multiply(mark.getCTM());
    for (const x of [box.x, box.x + box.width]) {
      for (const y of [box.y, box.y + box.height]) {
        const point = new DOMPoint(x, y).matrixTransform(matrix);
        top = Math.min(top, point.y);
        bottom = Math.max(bottom, point.y);
      }
    }
  }
  if (bottom >= top) {
    bounds.y = top;
    bounds.height = bottom - top;
  }
  return bounds;
}

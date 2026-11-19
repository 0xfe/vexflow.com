// Execute the example only inside its opaque-origin preview frame.
import { engravingBounds } from './engraving-bounds.js';

export async function runPreview({ code, token }) {
  const report = (type, details) => parent.postMessage({ channel: 'notation-preview', token, type, ...details }, '*');
  const fail = error => report('error', { message: error?.message || String(error) });
  window.addEventListener('error', event => fail(event.error || event.message));
  window.addEventListener('unhandledrejection', event => fail(event.reason));
  try {
    await document.fonts.ready;
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    await new AsyncFunction(code)();
    const score = document.getElementById('score');
    const svg = score.querySelector('svg');
    if (!svg) throw new Error('The example did not produce a score.');

    // Keep the author's horizontal layout and trim the empty space above and below.
    const view = svg.viewBox.baseVal;
    if (view.width > 0 && svg.width.baseVal.value > 0) {
      const box = engravingBounds(svg);
      const scale = svg.width.baseVal.value / view.width;
      const height = box.height + 14;
      svg.setAttribute('viewBox', [view.x, box.y - 7, view.width, height].join(' '));
      svg.setAttribute('height', height * scale);
    }
    report('rendered', { height: score.getBoundingClientRect().height });
  } catch (error) {
    fail(error);
  }
}

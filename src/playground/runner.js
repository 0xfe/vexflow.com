// Execute the example only inside its opaque-origin preview frame.
import { fitPreview } from './engraving-bounds.js';

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
    fitPreview(score);
    report('rendered', { height: score.getBoundingClientRect().height });
  } catch (error) {
    fail(error);
  }
}

// Execute editable JavaScript only inside its opaque-origin preview frame.
import { fitPreview } from './engraving-bounds.js';

export async function runPreview({ code, token }) {
  const report = (type, details) => parent.postMessage({ channel: 'notation-preview', token, type, ...details }, '*');
  // An external script gives syntax errors a browser-reported line number, too.
  // The async wrapper occupies one line and preserves top-level await and return.
  const script = document.createElement('script');
  const url = URL.createObjectURL(new Blob([
    'window.finishPreview((async function () {\n', code, '\n})());',
  ], { type: 'text/javascript' }));
  function fail(error, scriptLine) {
    // Errors thrown inside VexFlow point back to the editor through their first user-code frame.
    if (!scriptLine) {
      const frame = error?.stack?.split('\n').find(line => line.includes(url + ':'));
      scriptLine = frame?.slice(frame.indexOf(url) + url.length + 1).match(/^\d+/)?.[0];
    }
    const line = scriptLine && Math.max(1, Math.min(Number(scriptLine) - 1, code.split('\n').length));
    report('error', { message: error?.message || String(error), line });
  }
  window.addEventListener('error', event => {
    fail(event.error || event.message, event.filename === url ? event.lineno : undefined);
  });
  window.addEventListener('unhandledrejection', event => fail(event.reason));
  window.finishPreview = async result => {
    try {
      await result;
      const score = document.getElementById('score');
      fitPreview(score);
      report('rendered', { height: score.getBoundingClientRect().height });
    } catch (error) {
      fail(error);
    }
  };
  await document.fonts.ready;
  script.src = url;
  script.onload = () => URL.revokeObjectURL(url);
  document.head.append(script);
}

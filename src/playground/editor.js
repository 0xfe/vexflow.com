// Live EasyScore JavaScript editor. Each edit runs in a separate sandbox.
import Prism from 'prismjs/components/prism-core.js';
import 'prismjs/components/prism-clike.js';
import 'prismjs/components/prism-javascript.js';
import easyScoreSource from '../examples/easyscore.js?source';
import { liveSource } from './live-source.js';

const source = document.getElementById('editor');
const preview = document.getElementById('preview');
const error = document.getElementById('error');
const library = new URL(document.body.dataset.runtime, location.href).href;
const policy = `default-src 'none'; script-src 'unsafe-eval' ${location.origin}; style-src 'unsafe-inline'; font-src data:; img-src data:; connect-src 'none';`;
const style = 'html,body{margin:0;background:white}body{padding-inline:1.5%}#score{max-width:100%;margin:auto}#score>svg{display:block;max-width:100%;height:auto!important;margin:auto}';
let pending;
let token;
let timeout;

function discardPending() {
  clearTimeout(timeout);
  pending?.remove();
  pending = undefined;
}

function fail(message) {
  discardPending();
  source.setAttribute('aria-invalid', 'true');
  error.textContent = message;
}

function render(code) {
  discardPending();
  if (!code.trim()) {
    preview.replaceChildren();
    source.removeAttribute('aria-invalid');
    error.textContent = '';
    return;
  }
  token = crypto.randomUUID();
  const config = JSON.stringify({ code, token }).replaceAll('<', '\\u003c');
  pending = document.createElement('iframe');
  pending.title = 'VexFlow score';
  pending.className = 'pending';
  pending.setAttribute('sandbox', 'allow-scripts');
  pending.srcdoc = `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><style>${style}</style><div id="score"></div><script type="application/json" id="example">${config}</script><script src="${library}"></script>`;
  preview.append(pending);
  timeout = setTimeout(() => fail('The score took too long to render.'), 15000);
}

window.addEventListener('message', event => {
  if (!pending || event.source !== pending.contentWindow || event.data?.channel !== 'notation-preview' || event.data.token !== token) return;
  if (event.data.type === 'error') {
    fail(event.data.message);
  } else if (event.data.type === 'rendered') {
    clearTimeout(timeout);
    // Promote in place: reattaching an iframe would reload its document.
    for (const old of preview.querySelectorAll('iframe:not(.pending)')) old.remove();
    pending.style.height = Math.min(1200, Math.ceil(event.data.height)) + 'px';
    pending.classList.remove('pending');
    pending = undefined;
    source.removeAttribute('aria-invalid');
    error.textContent = '';
  }
});

liveSource(source, easyScoreSource, 'javascript', Prism.languages.javascript, render);
const playground = document.querySelector('.playground');
let width = playground.clientWidth;
new ResizeObserver(() => {
  if (window.frameElement) window.frameElement.style.height = Math.ceil(playground.getBoundingClientRect().height) + 'px';
  if (playground.clientWidth !== width) {
    width = playground.clientWidth;
    render(source.textContent);
  }
}).observe(playground);

// Shared tabbed editor: CodeJar handles editing, Prism highlights JavaScript.
import { CodeJar } from 'codejar';
import Prism from 'prismjs/components/prism-core.js';
import 'prismjs/components/prism-clike.js';
import 'prismjs/components/prism-javascript.js';
import easyScoreSource from '../examples/easyscore.js?source';
import vexTabSource from '../examples/vextab.js?source';
import { runPreview } from './runner.js';

Prism.manual = true;
const $ = (id) => document.getElementById(id);
const isVexTab = document.body.dataset.example === 'vextab';
const initialCode = isVexTab ? vexTabSource : easyScoreSource;
const editor = CodeJar($('editor'), (element) => {
  element.innerHTML = Prism.highlight(element.textContent, Prism.languages.javascript, 'javascript');
}, { tab: '  ', catchTab: false });
editor.updateCode(initialCode);
let frame;
let token;
let timer;
let renderedWidth = 0;
let lastCode = initialCode;

// Native tab buttons support both mouse and the standard arrow/home/end keys.
function selectTab(name) {
  for (const tab of document.querySelectorAll('[role="tab"]')) {
    const selected = tab.dataset.panel === name;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    $(tab.getAttribute('aria-controls')).hidden = !selected;
  }
}
const tabs = [...document.querySelectorAll('[role="tab"]')];
for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => {
    selectTab(tab.dataset.panel);
    if (tab.dataset.panel === 'result' && Math.abs($('result-panel').clientWidth - renderedWidth) >= 2) run(lastCode);
  });
  tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectTab(tabs[next].dataset.panel);
    tabs[next].focus();
  });
}

// Never evaluate editor content in the host page. Each run gets its own sandbox.
function run(code = editor.toString()) {
  selectTab('result');
  lastCode = code;
  renderedWidth = $('result-panel').clientWidth;
  clearTimeout(timer);
  $('error').hidden = true;
  $('status').textContent = 'Rendering…';
  token = crypto.randomUUID();
  frame = document.createElement('iframe');
  frame.title = isVexTab ? 'VexTab result' : 'VexFlow result';
  frame.setAttribute('sandbox', 'allow-scripts');
  const library = isVexTab
    ? 'https://unpkg.com/vextab@4.0.5/dist/main.prod.js'
    : new URL(document.body.dataset.runtime, location.href).href;
  const config = JSON.stringify({ code, token, library }).replaceAll('<', '\\u003c');
  const runtime = `(${runPreview.toString()})(${config});`.replace(/<\/script/gi, '<\\/script');
  // The preview may load its library and embedded fonts, but cannot contact other services.
  const policy = `default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' ${location.origin} https://unpkg.com; style-src 'unsafe-inline'; font-src data:; img-src data:; connect-src 'none';`;
  frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><style>html,body{margin:0;background:white}svg{display:block}</style></head><body><div id="score"></div><script>${runtime}</script></body></html>`;
  $('preview').replaceChildren(frame);
  timer = setTimeout(() => showError('The example took too long. Check the code, then try Run or Reset.'), 15000);
}
function showError(message) {
  clearTimeout(timer);
  $('status').textContent = 'Could not render';
  $('error').textContent = message;
  $('error').hidden = false;
}
window.addEventListener('message', (event) => {
  if (event.source !== frame?.contentWindow || event.data?.channel !== 'notation-preview' || event.data.token !== token) return;
  clearTimeout(timer);
  if (event.data.type === 'error') showError(event.data.message);
  if (event.data.type === 'rendered' && $('error').hidden) {
    $('status').textContent = 'Rendered';
    const height = event.data.height;
    if (Number.isFinite(height) && height > 0) {
      $('result-panel').style.height = `${Math.min(1200, Math.ceil(height))}px`;
    }
  }
});
$('run').addEventListener('click', () => run());
$('reset').addEventListener('click', () => { editor.updateCode(initialCode); run(); });
$('editor').addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); run(); }
});
editor.onUpdate(() => { $('status').textContent = 'Edited · Run to update'; });
// Re-render the last executed code when the frame changes width, preserving unrun edits.
let resizeTimer;
new ResizeObserver(() => {
  const playground = document.querySelector('.playground');
  // The local embedding page should fit the active Result or JavaScript panel, too.
  if (window.frameElement) window.frameElement.style.height = `${Math.ceil(playground.getBoundingClientRect().height)}px`;
  const width = playground.clientWidth;
  if (Math.abs(width - renderedWidth) < 2) return;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (!$('result-panel').hidden) run(lastCode);
  }, 100);
}).observe(document.querySelector('.playground'));
run();

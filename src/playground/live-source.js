// Use the same highlighting and short edit delay for JavaScript and VexTab.
import { CodeJar } from 'codejar';
import Prism from 'prismjs/components/prism-core.js';

Prism.manual = true;

export function liveSource(source, initial, language, grammar, render) {
  const editor = CodeJar(source, element => {
    element.innerHTML = Prism.highlight(element.textContent, grammar, language);
  }, { tab: '  ', catchTab: false, addClosing: language === 'javascript' });
  editor.updateCode(initial);

  let last = initial;
  let timer;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const input = editor.toString();
      if (input !== last) {
        last = input;
        render(input);
      }
    }, 100);
  }
  editor.onUpdate(schedule);
  source.addEventListener('input', schedule);
  render(initial);
}

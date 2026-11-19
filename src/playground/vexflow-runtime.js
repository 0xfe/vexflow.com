// The sandbox loads VexFlow and runs the JavaScript supplied by the editor.
import VexFlow from 'vexflow/bravura';
import { runPreview } from './runner.js';

window.VexFlow = VexFlow;
runPreview(JSON.parse(document.getElementById('example').textContent));

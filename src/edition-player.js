// Play the engraved voices of a VexFlow demo through the shared SoundFont.
import { PlaybackTransport } from 'vextab/src/playback/transport.ts';
import VexFlow from 'vexflow-gallery';

export function mountEditionPlayer({ parts, spans = [], keySignature = 'C', program = 0 }, tempo, playback, controls) {
  const transport = new PlaybackTransport();
  const button = document.createElement('button');
  button.type = 'button';
  const status = document.createElement('span');
  status.setAttribute('role', 'status');
  controls.className = 'vextab-playback-controls';
  controls.append(button, status);

  const events = [];
  const highlighted = new Set();
  const secondsPerTick = 240 / (tempo * VexFlow.RESOLUTION);
  const ties = new Map(spans.filter(span => span.kind === 'tie').map(span => [span.to, span.from]));
  const music = new VexFlow.Music();
  const scale = music.createScaleMap(keySignature);
  let duration = 0;
  for (const part of parts) {
    let ticks = 0;
    let previous;
    const attacks = new Map();
    for (const note of part) {
      if (note.shouldIgnoreTicks()) continue;
      const length = note.getTicks().value();
      const seconds = length * secondsPerTick;
      const id = note.getAttribute('id');
      const held = attacks.get(ties.get(id));
      const notes = [];
      if (held) {
        held.duration += seconds;
        attacks.set(id, held);
      } else if (!note.isRest()) {
        const [key, octave] = note.getKeys()[0].toLowerCase().split('/');
        const pitch = 12 * (Number(octave) + 1) + music.getNoteValue(scale[key] ?? key);
        const attack = { pitch, duration: seconds, velocity: 85 };
        attacks.set(id, attack);
        notes.push(attack);
      }
      const mark = () => {
        previous?.classList.remove('playing-note');
        highlighted.delete(previous);
        previous = note.getSVGElement();
        if (previous) {
          previous.classList.add('playing-note');
          highlighted.add(previous);
        }
      };
      events.push({ time: ticks * secondsPerTick, duration: seconds, notes, mark });
      ticks += length;
    }
    duration = Math.max(duration, ticks * secondsPerTick);
  }
  events.sort((a, b) => a.time - b.time);
  function showStopped() {
    for (const element of highlighted) element.classList.remove('playing-note');
    highlighted.clear();
    button.className = 'vextab-play';
    button.textContent = 'Play';
  }
  function stop() {
    transport.stop();
    showStopped();
    status.textContent = '';
  }
  showStopped();
  button.addEventListener('click', async () => {
    if (transport.active) return stop();
    button.className = 'vextab-stop';
    button.textContent = 'Stop';
    status.textContent = 'Loading instrument…';
    try {
      await transport.play(playback, program, { events, duration }, () => { status.textContent = ''; });
    } catch (error) {
      status.textContent = error.message;
    } finally {
      if (!transport.active) showStopped();
    }
  });
  return { stop };
}

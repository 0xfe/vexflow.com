// All scores on a page share one SoundFont, loaded on the first Play gesture.
import { WorkletSynthesizer } from 'spessasynth_lib';
import { createSpessaSynthPlayback } from 'vextab/browser';

let instrument;
const presets = new Set([2, 10, 12, 19, 21, 24, 38, 40, 45, 55, 61, 75, 87, 90, 97, 109, 116]);

function openInstrument() {
  const audio = new AudioContext();
  const lifetime = new AbortController();
  let synth;
  function dispose() {
    if (lifetime.signal.aborted) return;
    if (instrument?.audio === audio) instrument = undefined;
    lifetime.abort();
    synth?.destroy();
    if (audio.state !== 'closed') void audio.close();
  }
  window.addEventListener('pagehide', dispose, { signal: lifetime.signal });

  async function load() {
    await audio.audioWorklet.addModule(AUDIO_PATH + '/spessasynth_processor.min.js');
    const response = await fetch(AUDIO_PATH + '/florestan-subset.sf2', { signal: lifetime.signal });
    if (!response.ok) throw new Error('Could not load the SoundFont.');
    const bank = await response.arrayBuffer();
    lifetime.signal.throwIfAborted();
    synth = new WorkletSynthesizer(audio);
    synth.connect(audio.destination);
    await Promise.all([synth.isReady, synth.soundBankManager.addSoundBank(bank, 'Florestan')]);
    return createSpessaSynthPlayback(synth);
  }

  return { audio, ready: load().catch(error => { dispose(); throw error; }) };
}

export const playback = {
  async open(program, signal) {
    instrument ??= openInstrument();
    const [plugin] = await Promise.all([instrument.ready, instrument.audio.resume()]);
    signal.throwIfAborted();
    // The guide's Florestan bank puts piano at 2 and uses violin for bowed strings.
    const preset = program === 0 ? 2 : program >= 40 && program <= 43 ? 40 : program;
    return plugin.open(presets.has(preset) ? preset : 24, signal);
  },
};

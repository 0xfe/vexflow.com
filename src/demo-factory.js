// Supply the upstream repertoire test with its SVG factory and keep its voices for playback.
import { Factory } from 'vexflow-gallery';

export const VexFlowTests = {
  makeFactory(options, width, height) {
    const factory = new Factory({ renderer: { elementId: options.elementId, width, height } });
    // draw() resets the factory with a new array after engraving.
    options.voices = factory.getVoices();
    return factory;
  },
};

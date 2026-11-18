// Supply the test demos with a real SVG factory on the homepage.
import { Factory } from 'vexflow-gallery';

export const VexFlowTests = {
  makeFactory({ elementId }, width, height) {
    return new Factory({ renderer: { elementId, width, height } });
  },
};

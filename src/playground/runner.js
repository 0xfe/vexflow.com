// This function is serialized into a fresh opaque-origin iframe for each run.
export function runPreview({ code, token, library, isVexTab }) {
  const report = (type, message = '', height) => parent.postMessage({ channel: 'notation-preview', token, type, message, height }, '*');
  const fail = (error) => report('error', error?.message || String(error));
  window.addEventListener('error', (event) => fail(event.error || event.message));
  window.addEventListener('unhandledrejection', (event) => fail(event.reason));

  async function render() {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = library;
      script.onload = resolve;
      script.onerror = () => reject(new Error('The notation library could not be loaded. Try Run again.'));
      document.head.append(script);
    });
    await document.fonts.ready;
    if (isVexTab) {
      const { Artist, Vex, VexTab } = window.vextab;
      Artist.NOLOGO = true;
      const renderer = new Vex.Flow.Renderer(document.getElementById('score'), Vex.Flow.Renderer.Backends.SVG);
      const artist = new Artist(10, 115, 780, { bottom_spacing: 110 });
      new VexTab(artist).parse(code);
      artist.render(renderer);
    } else {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      await new AsyncFunction(code)();
    }
    if (!document.querySelector('#score svg')) throw new Error('The example did not produce a score.');
    report('rendered', '', Math.ceil(document.getElementById('score').getBoundingClientRect().height));
  }
  render().catch(fail);
}

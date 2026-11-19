# Building VexFlow from source

The `vexflow` dependency URL in `package.json` points to a GitHub source archive
at a full commit SHA. npm installs the archive and its runtime dependencies;
it does not install the published VexFlow build or run upstream's development
toolchain. The lockfile records the archive's integrity hash.

`build.mjs` resolves `vexflow/bravura` directly to
`node_modules/vexflow/entry/vexflow-bravura.ts`. Esbuild compiles the upstream
TypeScript and embedded fonts, and fills in VexFlow's version and commit metadata.
The build date is left empty to keep the output deterministic.

The homepage carousel uses the upstream font bundle so the jazz lead sheet can
use Petaluma. The arrangements come from the visual fixtures in `tests/demos` and the
gallery editions in `tests/scores` in that same archive.
The original homepage Minuet lives in `src/minuet.js`.

To update to the current upstream `main` revision:

```sh
revision=$(git ls-remote https://github.com/vexflow/vexflow.git refs/heads/main | cut -f1)
npm install --save-exact "https://codeload.github.com/vexflow/vexflow/tar.gz/$revision"
npm run build
```

Review the changes and commit both package files. Builds continue to use that
revision until the dependency is updated again.

## Updating the carousel demos

Use the gallery in `node_modules/vexflow/tests/flow.html` from the pinned
release as the reference for slide order and excerpt length. Follow each
figure's preview image to see which passage to show and count its systems.
A system is one horizontal row of music and includes all staves played
together, such as both piano staves or a guitar staff and its tablature.

In `src/scores.js`, set `previewSystems` on a gallery edition that needs a
shorter excerpt. It counts from the beginning unless `fromEnd: true` is set.
In 5.5, the Prelude in C major and *Sumer is icumen in* show their first two
systems, *Patio al alba* shows its first, and *High Wire* shows its last.
The Chopin fixture frames its opening two systems in `ballade()`, and the
Kesh Jig uses the opening ensemble system from its print edition.

Run `npm start` and step through every slide at desktop and phone widths.
Compare the first and last visible staves with the gallery image, including
lyrics, dynamics, and other markings near the edges.

# Local examples

The EasyScore playground in `static/examples/easyscore.html` shows the source
from `src/examples/easyscore.js` below its live score. Each edit runs after
100 ms in a fresh sandboxed iframe using the same pinned VexFlow as the carousel.
The preview swaps in the new score when rendering succeeds.

The VexTab pages share `src/playground/vextab-editor.js`. The build bundles
the `vextab/browser` entry from the pinned GitHub release package. The VexTab repository publishes the
[user guide](https://vexflow.com/vextab/guide/) separately. The former
`/vextab/tutorial.html` URL redirects readers to the guide.
The featured example uses `src/examples/example.vextab`. Each preview renders
100 ms after an edit and keeps the last valid score visible during syntax errors.

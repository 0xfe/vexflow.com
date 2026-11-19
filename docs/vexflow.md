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

# Local examples

The EasyScore playground in `static/examples/easyscore.html` shows the source
from `src/examples/easyscore.js` below its live score. Each edit runs after
100 ms in a fresh sandboxed iframe using the same pinned VexFlow as the carousel.
The preview swaps in the new score when rendering succeeds.

The VexTab pages share `src/playground/vextab-editor.js`. The build bundles
the pinned `vextab` npm package locally. Tutorial examples live in
`.vextab-live` elements in `static/vextab/tutorial.html`, alongside the lessons.
The featured example uses `src/examples/example.vextab`. Each preview renders
100 ms after an edit and keeps the last valid score visible during syntax errors.

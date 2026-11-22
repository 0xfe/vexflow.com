# Building VexFlow from source

The `vexflow` dependency URL in `package.json` points to a GitHub source archive
at a full commit SHA. npm installs the archive and its runtime dependencies;
it does not install the published VexFlow build or run upstream's development
toolchain. The lockfile records the archive's integrity hash.

The homepage and EasyScore playground use the pinned VexFlow source. The deployed [version manifest](https://vexflow.com/vexflow-version.json) identifies the exact source revision.

`build.mjs` resolves `vexflow/bravura` directly to
`node_modules/vexflow/entry/vexflow-bravura.ts`. Esbuild compiles the upstream
TypeScript and embedded fonts, and fills in VexFlow's version and commit metadata.
The build date is left empty to keep the output deterministic.

The homepage carousel uses the VexFlow gallery font bundle for Saints and Ode to Joy.
The other three scores use the VexTab npm renderer.

To update to the current upstream `main` revision:

```sh
revision=$(git ls-remote https://github.com/vexflow/vexflow.git refs/heads/main | cut -f1)
npm install --save-exact "https://codeload.github.com/vexflow/vexflow/tar.gz/$revision"
npm run build
```

Review the changes and commit both package files. Builds continue to use that
revision until the dependency is updated again.

## Updating the carousel demos

The carousel is manual. Keep its five entries in the order set in `src/scores.js`.
When updating VexTab, compare the excerpts in `src/examples/carousel/` with the
matching files in `node_modules/vextab/dist/guide/scores/`. Take the opening
bars from every voice and text lane, retaining the original system breaks,
fingerings, diagrams and headings.

| VexTab score | Opening bars | Systems |
| --- | --- | --- |
| Chopin, Ballade No. 3 | 1–12 | 2 |
| Pocket Change | 1–8 | 2 |
| Soleá (flamenco-tab) | 1–4 | 1 |

Keep Saints and Ode to Joy aligned with their VexFlow gallery previews. Ode to Joy uses the
complete eight-bar cello duet from the upstream repertoire tests. Check the full demo
links against the published VexTab guide and VexFlow tests gallery, and link
any published PDF for the same piece.

Run `npm start` and step through the five slides at desktop and phone widths.
Check the final visible bar in each VexTab voice, including the ossia in the
Ballade and the bass and chord diagrams in Soleá. Play each excerpt and switch
slides during playback to check that audio and highlighting stop together.

# Local examples

The homepage and `static/examples/easyscore.html` share the EasyScore editor.
Both draw the bundled `src/examples/easyscore.js` directly on the page and display its source below the score. Each edit runs after
100 ms in a fresh sandboxed iframe using the same pinned VexFlow as the carousel.
The preview swaps in the new score when rendering succeeds.

The VexTab pages share `src/playground/vextab-editor.js`. The build bundles
the `vextab/browser` entry from the pinned npm package. The VexTab repository publishes the
[user guide](https://vexflow.com/vextab/guide/) separately. The former
`/vextab/tutorial.html` URL redirects readers to the guide.
The featured example uses `src/examples/example.vextab`. Each preview renders
100 ms after an edit and keeps the last valid score visible during syntax errors.

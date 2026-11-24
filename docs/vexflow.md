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

The carousel and VexTab pages use the VexTab npm renderer with the full VexFlow
source entry, including the Petaluma fonts used by Pocket Change. The native
VexTab player uses SpessaSynth and the guide’s Florestan SoundFont.

To update to the latest published VexFlow release, resolve its tag to a source commit.

```sh
version=$(npm view vexflow version)
revision=$(git ls-remote https://github.com/vexflow/vexflow.git "refs/tags/${version}^{}" | cut -f1)
test -n "$revision" || exit 1
npm install --save-exact "https://codeload.github.com/vexflow/vexflow/tar.gz/$revision"
npm run build
```

Review the changes and commit both package files. Builds continue to use that
revision until the dependency is updated again.

## Updating the carousel demos

The manual carousel follows the order in `src/scores.js`. Its notation is in
`src/examples/carousel/`. When updating the demos, use `guide/scores/` in the
[VexTab repository](https://github.com/0xfe/vextab/tree/7.0.0/guide/scores)
at the tag matching the site's VexTab dependency. Count the authored system
breaks in the lead voice, then trim every other voice and text lane to the
same ending bar. Shorten repeated skips and tempo changes to match.

| VexTab score | Passage | Systems |
| --- | --- | --- |
| Chopin, Ballade No. 3 | Bars 1–12, including the ossia | 2 |
| Pocket Change | Bars 1–8 | 2 |
| Soleá | Bars 1–4 | 1 |
| Chopin, Étude in thirds | Bars 1–8 | 3 |
| Liszt, Hungarian Rhapsody No. 2 | Complete 19-bar Friska demo | 3 |
| Liszt, Consolation No. 5 | Upbeat and bars 1–10 | 2 |
| All of Me | Bars 1–4 with three centered chord diagrams, fingerings and circled string numbers | 1 |

For All of Me, keep `heading { align center }` without title text. This centers
the diagram row. The fingering, string and expression markings in the homepage
excerpt are editorial additions to the guide score.

Link each slide to its full guide demo and include a score PDF when available.
Run `npm start` and step through the carousel at desktop and phone widths.
Check the final visible bar, play across a system break, and switch slides
during playback to verify that sound and highlighting stop together.

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

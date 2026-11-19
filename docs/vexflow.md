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
use Petaluma. Its eight repertoire arrangements come from `tests/demos` in that
same archive. A small adapter in `src/demo-factory.js` supplies their SVG factory.
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

`static/example.html` supplies both local playground pages. The build includes
`src/examples/easyscore.js` and `src/examples/example.vextab` as text in the editor
bundle. Run executes the EasyScore JavaScript or parses the VexTab notation shown in the source tab.

CodeJar provides editing and undo/redo. Prism highlights JavaScript and VexTab notation. Both packages
are pinned in the lockfile. Tab moves keyboard focus out of the editor;
Cmd/Ctrl+Enter runs the edited example. Reset restores the original snippet.

Each run creates a fresh iframe with `sandbox="allow-scripts"`. Edited code cannot
access the host page or its storage. The preview loads its library, waits for
fonts, and executes the snippet. Errors appear in the Result tab. The preview's
content policy blocks network connections from example code. Resizing re-runs
the last executed code and preserves edits that have not yet been run.

The examples position the notation with VexFlow's `System` and VexTab's
`Artist` options. The preview stylesheet scales their SVGs down to fit narrow
screens and keeps their aspect ratios. The embedding frame fits the result.

The EasyScore preview uses the same pinned upstream VexFlow as the large score.
VexTab uses its pinned 4.0.5 compatibility bundle from unpkg, which includes its
own VexFlow runtime. The existing VexTab tutorial retains its renderer. No
JSFiddle scripts or frames are loaded.

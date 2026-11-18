# vexflow.com

[Vexflow](https://vexflow.com) and [VexTab](https://vexflow.com/vextab) Public Website.

## Develop

Requires Node.js 22 or newer.

```sh
npm ci
npm start
```

Open http://localhost:8091. JavaScript, HTML, and static assets rebuild when edited;
refresh the browser to see changes.

## Build

```sh
npm run build
npm run serve
```

The build writes the site to `dist/`: minified JavaScript with a content hash and
source map, plus HTML and static assets. `npm run serve` builds and previews the
production site at http://localhost:8092.

Esbuild is the only build dependency. The homepage carousel is in `src/index.js`.
Edit its repertoire and credits in `src/scores.js`, the homepage markup in
`index.html`, and CSS/VexTab pages in `static/`.

VexFlow comes from a pinned source archive of
[vexflow/vexflow](https://github.com/vexflow/vexflow), not its npm release.
`npm ci` downloads that GitHub archive; esbuild compiles its TypeScript directly,
including the fonts used for each score. `dist/vexflow-version.json` records
the upstream revision. See [the source build notes](docs/vexflow.md) to update it.

Examples use local Result/JavaScript tabs with editable, highlighted code, Run,
and Reset. Edit their snippets in `src/examples/`, the shared UI in
`static/example.html`, and the editor/preview logic in `src/playground/`.
CodeJar and Prism are bundled locally. VexTab uses its separate compatibility
bundle from unpkg; the VexFlow preview uses the same GitHub source as the homepage.

`npm run build-dev` builds without minification, `npm run watch` rebuilds without a
server, and `npm run clean` removes `dist/`.

## Deploy

```sh
./deploy.sh
```

Requires a clean, committed checkout and authenticated `gcloud storage` access to
`gs://vexflow.com`. The script pushes commits, builds, and uploads the site.

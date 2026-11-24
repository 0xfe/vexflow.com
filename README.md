# vexflow.com

[Vexflow](https://vexflow.com) and [VexTab](https://vexflow.com/vextab) Public Website.

## Develop

Requires Node.js 22.18 or newer.

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

The homepage carousel is in `src/index.js`.
Edit its repertoire and credits in `src/scores.js`, the homepage markup in
`index.html`, and CSS/VexTab pages in `static/`.

VexFlow comes from a pinned source archive of
[vexflow/vexflow](https://github.com/vexflow/vexflow), not its npm release.
`npm ci` downloads that GitHub archive; esbuild compiles its TypeScript directly,
including the fonts used for each score. `dist/vexflow-version.json` records
the upstream revision. See [the source build notes](docs/vexflow.md) to update it.

The homepage carousel plays each visible excerpt with SpessaSynth. Under “Where Do I Start?” the EasyScore editor shows the live score above its JavaScript source.
The VexTab homepage links to the [VexTab User Guide](https://vexflow.com/vextab/guide/)
and shows live scores above their editable notation.
Both editors use CodeJar and Prism. The VexTab editors use grammar v2. The [migration guide](https://github.com/0xfe/vextab/blob/7.0.0/docs/migrate-scores.md) explains how to keep v1 scores working.
Edit the examples in `src/examples/` and `static/vextab/`, and the editors in
`src/playground/`.

`npm run build-dev` builds without minification, `npm run watch` rebuilds without a
server, and `npm run clean` removes `dist/`.

## Deploy

```sh
./deploy.sh
```

Requires a clean, committed checkout and authenticated `gcloud storage` access to
`gs://vexflow.com`. The script pushes commits, builds, and uploads the site.

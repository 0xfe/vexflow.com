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

Esbuild is the only build dependency. Edit the demo in `src/index.js`, the homepage
in `index.html`, and CSS/VexTab pages in `static/`.

`npm run build-dev` builds without minification, `npm run watch` rebuilds without a
server, and `npm run clean` removes `dist/`.

## Deploy

```sh
./deploy.sh
```

Requires a clean, committed checkout and authenticated `gcloud storage` access to
`gs://vexflow.com`. The script pushes commits, builds, and uploads the site.

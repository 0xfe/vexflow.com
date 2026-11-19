// Build the JavaScript demo and copy the static site. Esbuild also serves local previews.
import * as esbuild from 'esbuild';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const dist = join(root, 'dist');
const dev = process.argv.includes('--dev');
const serve = process.argv.includes('--serve');
const watch = process.argv.includes('--watch') || serve;
const packageInfo = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const vexflowRevision = packageInfo.dependencies.vexflow.split('/').at(-1);
const vexflowRoot = join(root, 'node_modules/vexflow');
const vexflowPackage = JSON.parse(await readFile(join(vexflowRoot, 'package.json'), 'utf8'));

// The GitHub source archive has no compiled build/. Compile its TypeScript entry directly.
if (!/^[a-f0-9]{40}$/.test(vexflowRevision)) {
  throw new Error('VexFlow must be pinned to a full GitHub commit SHA in package.json');
}

const options = {
  absWorkingDir: root,
  entryPoints: {
    index: 'src/index.js',
    editor: 'src/playground/editor.js',
    'vextab-editor': 'src/playground/vextab-editor.js',
    'vexflow-runtime': 'src/playground/vexflow-runtime.js',
  },
  outdir: dist,
  entryNames: dev ? '[name]' : '[name].[hash]',
  bundle: true,
  alias: {
    'vexflow/bravura': join(vexflowRoot, 'entry/vexflow-bravura.ts'),
    'vexflow-gallery': join(vexflowRoot, 'entry/vexflow.ts'),
    'vexflow-demos': join(vexflowRoot, 'tests/demos'),
  },
  target: 'es2020',
  minify: !dev,
  sourcemap: 'external',
  write: false,
  logLevel: 'info',
  plugins: [{
    name: 'static-site',
    setup(build) {
      // The repertoire uses just makeFactory from the upstream QUnit harness.
      build.onResolve({ filter: /^\.\.\/vexflow_test_helpers$/ }, ({ resolveDir }) => {
        if (resolveDir === join(vexflowRoot, 'tests/demos')) {
          return { path: join(root, 'src/demo-factory.js') };
        }
      });
      // Load the exact example source into the editor without executing it in the host.
      build.onResolve({ filter: /\?source$/ }, ({ path, resolveDir }) => ({
        path: join(resolveDir, path.slice(0, -7)), namespace: 'example-source',
      }));
      build.onLoad({ filter: /.*/, namespace: 'example-source' }, async ({ path }) => ({
        contents: await readFile(path, 'utf8'), loader: 'text', watchFiles: [path],
      }));
      // Supply the version metadata normally inserted by upstream's Grunt build.
      build.onLoad({ filter: /[/\\]vexflow[/\\]src[/\\]version\.ts$/ }, () => ({
        contents: `export const VERSION = ${JSON.stringify(vexflowPackage.version)};
          export const ID = ${JSON.stringify(vexflowRevision)};
          export const DATE = '';`,
        loader: 'ts',
      }));
      // Include HTML and static assets in esbuild's watcher, including new/deleted files.
      build.onLoad({ filter: /[/\\]src[/\\]index\.js$/ }, async ({ path }) => {
        const staticDir = join(root, 'static');
        const entries = await readdir(staticDir, { recursive: true, withFileTypes: true });
        return {
          contents: await readFile(path, 'utf8'),
          loader: 'js',
          resolveDir: dirname(path),
          watchFiles: [path, join(root, 'index.html'), ...entries
            .filter((entry) => entry.isFile())
            .map((entry) => join(entry.parentPath, entry.name))],
          watchDirs: [staticDir, ...entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => join(entry.parentPath, entry.name))],
        };
      });

      build.onEnd(async (result) => {
        if (result.errors.length) return;
        const asset = (name) => basename(result.outputFiles.find((file) =>
          new RegExp(`^${name}(?:\\.[A-Z0-9]+)?\\.js$`).test(basename(file.path))).path);
        const template = await readFile(join(root, 'index.html'), 'utf8');
        if (!template.includes('{{SCRIPT}}')) throw new Error('index.html is missing {{SCRIPT}}');

        // Clear stale hashes and deleted static files, then publish HTML last.
        await rm(dist, { recursive: true, force: true });
        await mkdir(dist, { recursive: true });
        await cp(join(root, 'static'), dist, { recursive: true });
        for (const file of result.outputFiles) {
          await writeFile(file.path, file.contents);
        }
        await writeFile(join(dist, 'index.html'), template
          .replace('{{VERSION}}', vexflowPackage.version)
          .replace('{{SCRIPT}}', asset('index')));
        const easyScorePage = join(dist, 'examples/easyscore.html');
        const easyScoreHtml = await readFile(easyScorePage, 'utf8');
        await writeFile(easyScorePage, easyScoreHtml.replace('{{RUNTIME}}', asset('vexflow-runtime'))
          .replace('{{EDITOR}}', asset('editor')));
        for (const file of ['index.html', 'tutorial.html', 'example.html']) {
          const page = join(dist, 'vextab', file);
          const html = await readFile(page, 'utf8');
          await writeFile(page, html.replace('{{VEXTAB_EDITOR}}', asset('vextab-editor')));
        }
        await writeFile(join(dist, 'vexflow-version.json'), JSON.stringify({
          repository: 'https://github.com/vexflow/vexflow', revision: vexflowRevision,
        }, null, 2) + '\n');
        console.log(`Built dist/ (${dev ? 'development' : 'production'})`);
      });
    },
  }],
};

if (watch) {
  const context = await esbuild.context(options);
  await context.watch();
  if (serve) {
    const port = dev ? 8091 : 8092;
    await context.serve({ servedir: dist, host: '127.0.0.1', port });
    console.log(`Open http://localhost:${port} (refresh after edits)`);
  }
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      await context.dispose();
      process.exit(0);
    });
  }
} else {
  await esbuild.build(options);
}

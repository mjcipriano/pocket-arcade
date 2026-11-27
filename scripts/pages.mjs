// Build a self-contained release. The public game links stay stable while every
// relative asset (including nested module imports) resolves under the commit.
import {cp, mkdir, readFile, readdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import './catalog.mjs';

const revision = process.env.GITHUB_SHA;
if (!/^[0-9a-f]{40}$/.test(revision ?? '')) throw Error('Expected a full Git commit SHA');
const output = 'dist';
const release = 'releases/' + revision;
await mkdir(output, {recursive:true});
await cp('site', output, {recursive:true});
await cp('site', join(output,release), {recursive:true});
for (const entry of await readdir('site/games', {withFileTypes:true})) {
  if (!entry.isDirectory()) continue;
  const file = join(output,'games',entry.name,'index.html');
  const source = await readFile(file,'utf8');
  const base = '<base href="../../' + release + '/games/' + entry.name + '/">';
  const html = /<head[\s>]/i.test(source)
    ? source.replace(/<head\b[^>]*>/i, tag => tag + base)
    : source.replace(/<html\b[^>]*>/i, tag => tag + '<head>' + base);
  await writeFile(file, html.replace('data-build></span>', 'data-build> · ' + revision.slice(0,7) + '</span>'));
}
const home = join(output,'index.html');
const html = await readFile(home,'utf8');
await writeFile(home,html.replace('src="app.js"', 'src="app.js?v=' + revision + '"')
  .replace('href="style.css"', 'href="style.css?v=' + revision + '"'));

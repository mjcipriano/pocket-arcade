import { readdir, readFile, writeFile, access } from 'node:fs/promises';
const root = new URL('../site/', import.meta.url);
const games = [];
for (const entry of await readdir(new URL('games/',root),{withFileTypes:true})) {
  if (!entry.isDirectory()) continue;
  const id = entry.name;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) throw Error('Invalid game folder: ' + id);
  const base = new URL('games/' + id + '/',root);
  const meta = JSON.parse(await readFile(new URL('game.json',base),'utf8'));
  for (const field of ['title','genre','description','mark','color']) {
    if (typeof meta[field] !== 'string' || !meta[field].trim()) throw Error(id + ': missing ' + field);
  }
  if (!/^#[0-9a-f]{6}$/i.test(meta.color)) throw Error(id + ': use a six-digit hex color');
  await access(new URL('index.html',base));
  games.push({...meta,id});
}
games.sort((a,b) => a.title.localeCompare(b.title,'en') || a.id.localeCompare(b.id,'en'));
await writeFile(new URL('catalog.json',root), JSON.stringify(games,null,2) + '\n');

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const [installerDirectory, brandDirectory] = process.argv.slice(2);
if (!installerDirectory || !brandDirectory) throw new Error('Usage: node scripts/prepare-downloads.mjs INSTALLER_DIRECTORY BRAND_DIRECTORY');
const settings = JSON.parse(fs.readFileSync('site-settings.json', 'utf8').replace(/^\uFEFF/, ''));
const editionFiles = {desktop:`API-Workbench-${settings.version}-Windows-x64-Desktop-Setup.exe`,cli:`API-Workbench-${settings.version}-Windows-x64-Desktop-CLI-Setup.exe`};
const checksumLines = fs.readFileSync(path.join(installerDirectory,'SHA256SUMS.txt'),'utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/);
const checksums = new Map(checksumLines.map(line=>{const [hash,...name]=line.split('  ');return [name.join('  '),hash];}));
const release = {version:settings.version, coffeeUrl:settings.coffeeUrl, editions:{}};
const destination = path.resolve('dist/downloads',settings.version);
fs.mkdirSync(destination,{recursive:true});
for (const [key,filename] of Object.entries(editionFiles)) {
  const bytes=fs.readFileSync(path.join(installerDirectory,filename));
  const hash=createHash('sha256').update(bytes).digest('hex');
  if(checksums.get(filename)!==hash) throw new Error(`Installer checksum mismatch: ${filename}`);
  const chunks=[];
  for(let offset=0,index=1;offset<bytes.length;offset+=16*1024*1024,index++){
    const chunkName=`${key}-${String(index).padStart(3,'0')}.bin`;
    const chunk=bytes.subarray(offset,Math.min(offset+16*1024*1024,bytes.length));
    fs.writeFileSync(path.join(destination,chunkName),chunk);
    chunks.push({url:`downloads/${settings.version}/${chunkName}`,bytes:chunk.length});
  }
  release.editions[key]={name:key==='desktop'?'Desktop':'Desktop + CLI',filename,bytes:bytes.length,mib:(bytes.length/1024/1024).toFixed(2),sha256:hash,chunks};
}
fs.mkdirSync('dist/assets',{recursive:true});
fs.copyFileSync(path.join(brandDirectory,'api-workbench-logo-graphite.png'),'dist/assets/brand-logo.png');
fs.copyFileSync(path.join(brandDirectory,'api-workbench-icon-graphite.png'),'dist/assets/brand-icon.png');
fs.writeFileSync('dist/release.js',`// Generated from verified installer files.\nexport const release = ${JSON.stringify(release,null,2)};\n`);
console.log(JSON.stringify({version:release.version,editions:Object.fromEntries(Object.entries(release.editions).map(([key,e])=>[key,{bytes:e.bytes,mib:e.mib,chunks:e.chunks.length,sha256:e.sha256}]))},null,2));

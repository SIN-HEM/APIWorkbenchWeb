import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {release} from '../dist/release.js';
import {fetchInstaller,validateCoffeeUrl} from '../dist/downloads.js';

const root=path.resolve('dist');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const checks=[];
function pass(message){checks.push(message);console.log(`PASS ${message}`);}
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const target=match[1];if(target.startsWith('#')){if(target.length>1)assert(html.includes(`id="${target.slice(1)}"`),`Missing anchor ${target}`);continue;}
  if(/^https?:/.test(target))continue;
  assert(fs.existsSync(path.join(root,target)),`Missing local asset ${target}`);
}
for(const image of ['workbench-request.png','workbench-tests.png','getting-started.png']){
  const bytes=fs.readFileSync(path.join(root,'assets',image));assert(bytes.length>10000,`Screenshot too small: ${image}`);assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),`Invalid PNG ${image}`);
}
pass('All page anchors and product assets exist.');
assert.equal(validateCoffeeUrl(release.coffeeUrl),'https://buymeacoffee.com/hsrhemant0e');
for(const unsafe of ['javascript:alert(1)','https://buymeacoffee.com.evil.test/user','https://evil.test/user','https://user:pass@buymeacoffee.com/person','https://buymeacoffee.com/'])assert.equal(validateCoffeeUrl(unsafe),null);
pass('Real support link configured; unsafe support destinations rejected.');
const fetchFromDisk=async url=>{
  const pathname=new URL(url).pathname.replace(/^\//,'');
  const file=path.resolve(root,pathname);assert(file.startsWith(root+path.sep));
  return new Response(fs.readFileSync(file),{status:200});
};
for(const [key,edition] of Object.entries(release.editions)){
  assert.equal(edition.chunks.reduce((sum,chunk)=>sum+chunk.bytes,0),edition.bytes);
  for(const chunk of edition.chunks)assert(chunk.bytes<=16*1024*1024,'Asset exceeds 16 MiB deployment chunk size.');
  let progress=0;
  const blob=await fetchInstaller(edition,{baseUrl:'https://site.test/',fetcher:fetchFromDisk,onProgress:(bytes,total)=>{assert(bytes>=progress&&bytes<=total);progress=bytes;}});
  assert.equal(blob.size,edition.bytes);assert.equal(progress,edition.bytes);
  assert.equal(createHash('sha256').update(Buffer.from(await blob.arrayBuffer())).digest('hex'),edition.sha256);
  pass(`${key}: complete installer reassembled with exact size, progress, and SHA256.`);
}
const dummyBytes=Buffer.from('small test installer');
const dummy={filename:'test.exe',bytes:dummyBytes.length,sha256:createHash('sha256').update(dummyBytes).digest('hex'),chunks:[{url:'test.bin',bytes:dummyBytes.length}]};
const controller=new AbortController();controller.abort();let calls=0;
await assert.rejects(()=>fetchInstaller(dummy,{baseUrl:'https://site.test/',signal:controller.signal,fetcher:()=>{calls++;throw Error();}}),error=>error.name==='AbortError');assert.equal(calls,0);
const midCancel=new AbortController();
await assert.rejects(()=>fetchInstaller(dummy,{baseUrl:'https://site.test/',signal:midCancel.signal,fetcher:async()=>new Response(dummyBytes),onProgress:()=>midCancel.abort()}),error=>error.name==='AbortError');
await assert.rejects(()=>fetchInstaller(dummy,{baseUrl:'https://site.test/',fetcher:async()=>new Response('no',{status:500})}),/could not be retrieved/);
await assert.rejects(()=>fetchInstaller(dummy,{baseUrl:'https://site.test/',fetcher:async()=>new Response(dummyBytes.subarray(1))}),/interrupted/);
const wrongBytes=Buffer.from(dummyBytes);wrongBytes[0]^=1;
await assert.rejects(()=>fetchInstaller(dummy,{baseUrl:'https://site.test/',fetcher:async()=>new Response(wrongBytes)}),/integrity check/);
pass('Initial/mid-transfer cancellation, network errors, truncation, and tampering handled.');
const files=[];function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);entry.isDirectory()?visit(full):files.push(full);}}visit(root);
assert(!files.some(file=>/\.(db|sqlite|pfx|p12)$|getting-started-v1\.completed|refresh-token/i.test(file)),'Personal data must not be included.');
pass('Deployment contains no local databases, account tokens, or private key files.');
fs.writeFileSync('verification.json',JSON.stringify({checkedAtUtc:new Date().toISOString(),version:release.version,passed:true,checks},null,2)+'\n');
console.log(`${checks.length} checks passed.`);

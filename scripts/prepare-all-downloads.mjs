import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const releaseRoot=process.argv[2];
if(!releaseRoot)throw new Error('Usage: node scripts/prepare-all-downloads.mjs RELEASES_DIRECTORY');
const settings=JSON.parse(fs.readFileSync('site-settings.json','utf8').replace(/^\uFEFF/,''));
const platforms={
  'win-x64':{name:'Windows · x64',os:'Windows',version:'0.1.0-beta.3',format:'.exe',requirements:'Windows 10 22H2 / Windows 11 · Intel or AMD 64-bit',note:'Installs for your Windows account. No administrator access required.',instructions:'Open the installer, launch API Workbench, then choose Continue locally.',source:path.join(releaseRoot,'0.1.0-beta.3/installers'),pattern:'API-Workbench-0.1.0-beta.3-Windows-x64-EDITION-Setup.exe'},
  'osx-arm64':{name:'macOS · Apple Silicon',os:'macOS',version:'0.1.0-beta.4',format:'.pkg',requirements:'macOS 14 or later · Apple Silicon (M-series)',note:'Unsigned beta. macOS may require security approval. Installer permissions may be required.',instructions:'Open the .pkg installer, launch API Workbench from Applications, then choose Continue locally.'},
  'osx-x64':{name:'macOS · Intel',os:'macOS',version:'0.1.0-beta.4',format:'.pkg',requirements:'macOS 14 or later · Intel 64-bit',note:'Unsigned beta. macOS may require security approval. Installer permissions may be required.',instructions:'Open the .pkg installer, launch API Workbench from Applications, then choose Continue locally.'},
  'linux-x64':{name:'Linux · x64',os:'Linux',version:'0.1.0-beta.4',format:'.deb',requirements:'Ubuntu 24.04 / compatible Debian-family desktop · Intel or AMD 64-bit',note:'Requires a logged-in desktop with an unlocked Secret Service keyring. Package installation requires administrator permissions.',instructions:'Install the .deb with your package manager, open API Workbench from the application menu, then choose Continue locally.'},
  'linux-arm64':{name:'Linux · ARM64',os:'Linux',version:'0.1.0-beta.4',format:'.deb',requirements:'Ubuntu 24.04 / compatible Debian-family desktop · ARM64',note:'Requires a logged-in desktop with an unlocked Secret Service keyring. Package installation requires administrator permissions.',instructions:'Install the .deb with your package manager, open API Workbench from the application menu, then choose Continue locally.'}
};
for(const [id,platform] of Object.entries(platforms)){
  const source=platform.source??path.join(releaseRoot,'0.1.0-beta.4/native-verified',id);
  const pattern=platform.pattern??`API-Workbench-${platform.version}-${id}-EDITION${platform.format}`;
  const sums=new Map(fs.readFileSync(path.join(source,'SHA256SUMS.txt'),'utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/).map(line=>{const [hash,...name]=line.split('  ');return[name.join('  '),hash];}));
  const chunkPrefix=`downloads/${platform.version}`+(id==='win-x64'?'':'/'+id);
  const folder=path.join('dist',chunkPrefix);fs.mkdirSync(folder,{recursive:true});
  platform.editions={};
  for(const [key,editionName] of [['desktop','Desktop'],['cli','Desktop-CLI']]){
    const filename=pattern.replace('EDITION',editionName);
    const bytes=fs.readFileSync(path.join(source,filename));
    const sha256=createHash('sha256').update(bytes).digest('hex');
    if(sums.get(filename)!==sha256)throw new Error(`Source installer failed integrity check: ${filename}`);
    const chunks=[];
    for(let offset=0,index=1;offset<bytes.length;offset+=16*1024*1024,index++){
      const name=`${key}-${String(index).padStart(3,'0')}.bin`;
      const part=bytes.subarray(offset,Math.min(offset+16*1024*1024,bytes.length));
      fs.writeFileSync(path.join(folder,name),part);
      chunks.push({url:`${chunkPrefix}/${name}`,bytes:part.length});
    }
    platform.editions[key]={name:key==='desktop'?'Desktop':'Desktop + CLI',filename,bytes:bytes.length,mib:(bytes.length/1048576).toFixed(2),sha256,chunks};
  }
  delete platform.source;delete platform.pattern;
}
const release={version:platforms['win-x64'].version,coffeeUrl:settings.coffeeUrl,repositoryUrl:'https://github.com/SIN-HEM/ApiCollabPlatform',supportEmail:'support@apiworkbench.in',platforms,editions:platforms['win-x64'].editions};
fs.writeFileSync('dist/release.js',`// Generated from checksum-verified Windows installers and successful native CI artifacts.\nexport const release = ${JSON.stringify(release,null,2)};\n`);
console.log('Prepared 10 verified installers across Windows, macOS and Linux.');

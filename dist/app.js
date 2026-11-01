import { release } from './release.js';
import { fetchInstaller, validateCoffeeUrl } from './downloads.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
$$('[data-version]').forEach(el=>el.textContent=release.version);
for(const [key,edition] of Object.entries(release.editions)){
  $$(`[data-size="${key}"]`).forEach(el=>el.textContent=`${edition.mib} MiB`);
  $$(`[data-hash="${key}"]`).forEach(el=>el.textContent=edition.sha256);
}
const coffeeUrl=validateCoffeeUrl(release.coffeeUrl);
if(coffeeUrl){$('#coffee-link').href=coffeeUrl;$('#coffee-panel').hidden=false;}

let toastTimer;
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000);}
$$('[data-copy-hash]').forEach(button=>button.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(release.editions[button.dataset.copyHash].sha256);toast('Checksum copied.');}
  catch{toast('Select and copy the checksum shown above.');}
}));

const tour={
  requests:{image:'assets/workbench-request.png',alt:'Actual API Workbench request editor and JSON response using isolated product catalog demonstration data',title:'A request and its response, together.',description:'Your collections on the left. The request above. The response below. A practical workspace for everyday API testing.',index:'01'},
  tests:{image:'assets/workbench-tests.png',alt:'Actual API Workbench Tests tab showing response assertions for a demonstration API request',title:'Put expectations into your requests.',description:'Save status, timing, body, header, and JSON checks with a request. Bring those checks into repeatable collection runs.',index:'02'},
  start:{image:'assets/getting-started.png',alt:'Actual API Workbench first-run guide explaining requests, workspaces, tests, and backups',title:'A helpful first step.',description:'A short guide welcomes new local users. Reopen it from the Free Local menu whenever you need a reminder.',index:'03'}
};
let currentTour='requests';
function selectTour(key,focus=false){
  currentTour=key;const item=tour[key];
  $$('[data-tour]').forEach(tab=>{const selected=tab.dataset.tour===key;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&focus)tab.focus();});
  $('#tour-image').src=item.image;$('#tour-image').alt=item.alt;$('#tour-title').textContent=item.title;$('#tour-description').textContent=item.description;$('#tour-index').textContent=item.index;
  $('#tour-panel').setAttribute('aria-labelledby',`tab-${key==='start'?'start':key}`);
  $('.tour-image-wrap').classList.toggle('is-guide',key==='start');
}
$$('[data-tour]').forEach(tab=>{
  tab.addEventListener('click',()=>selectTour(tab.dataset.tour));
  tab.addEventListener('keydown',e=>{
    const keys=Object.keys(tour);let index=keys.indexOf(tab.dataset.tour);
    if(e.key==='ArrowRight')index=(index+1)%keys.length;else if(e.key==='ArrowLeft')index=(index+keys.length-1)%keys.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=keys.length-1;else return;
    e.preventDefault();selectTour(keys[index],true);
  });
});
const imageDialog=$('#image-dialog');
let imageOpener;
$$('.screenshot-open').forEach(button=>button.addEventListener('click',()=>{
  imageOpener=button;const item=button.hasAttribute('data-tour-zoom')?tour[currentTour]:{image:button.dataset.image,alt:button.dataset.alt};
  $('#expanded-image').src=item.image;$('#expanded-image').alt=item.alt;imageDialog.showModal();
}));
$('#close-image').addEventListener('click',()=>imageDialog.close());
imageDialog.addEventListener('click',e=>{if(e.target===imageDialog)imageDialog.close();});
imageDialog.addEventListener('close',()=>imageOpener?.focus());

const dialog=$('#download-dialog');
let activeController=null,lastEdition=null,downloadOpener=null,currentBlobUrl=null;
function releasePreviousBlob(){if(currentBlobUrl){const previous=currentBlobUrl;currentBlobUrl=null;setTimeout(()=>URL.revokeObjectURL(previous),120000);}}
function showDownloadState(state){for(const name of ['busy','success','error'])$(`#download-${name}`).hidden=name!==state;dialog.setAttribute('aria-labelledby',state==='busy'?'download-title':`download-${state}-title`);}
$('#download-success h2').id='download-success-title';$('#download-error h2').id='download-error-title';
function stopDownload(){activeController?.abort();activeController=null;dialog.close();}
$$('[data-close-download]').forEach(button=>button.addEventListener('click',stopDownload));
$('#cancel-download').addEventListener('click',stopDownload);
dialog.addEventListener('cancel',()=>{activeController?.abort();activeController=null;});
dialog.addEventListener('close',()=>{activeController?.abort();activeController=null;releasePreviousBlob();downloadOpener?.focus();});
async function startDownload(key,opener){
  if(activeController)activeController.abort();
  releasePreviousBlob();
  lastEdition=key;downloadOpener=opener||downloadOpener;
  const edition=release.editions[key];const controller=new AbortController();activeController=controller;
  showDownloadState('busy');$('#download-progress').value=0;$('#download-percent').textContent='0%';$('#download-status').textContent='Connecting…';
  $('#download-description').textContent=`Fetching API Workbench ${edition.name} (${edition.mib} MiB), then checking its SHA256 checksum.`;
  if(!dialog.open)dialog.showModal();
  try{
    const blob=await fetchInstaller(edition,{signal:controller.signal,onProgress:(bytes,total,phase)=>{
      if(activeController!==controller)return;
      const percent=Math.min(100,Math.floor(bytes/total*100));$('#download-progress').value=percent;$('#download-percent').textContent=`${percent}%`;
      $('#download-status').textContent=phase==='verifying'?'Verifying installer checksum…':`${(bytes/1024/1024).toFixed(1)} / ${(total/1024/1024).toFixed(1)} MiB`;
    }});
    if(controller.signal.aborted||activeController!==controller)return;
    currentBlobUrl=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=currentBlobUrl;anchor.download=edition.filename;document.body.append(anchor);anchor.click();anchor.remove();
    let saveAgain=$('#save-again');if(!saveAgain){saveAgain=document.createElement('a');saveAgain.id='save-again';saveAgain.className='text-link';saveAgain.textContent='Download not appearing? Save the installer again ↗';saveAgain.style.marginBottom='22px';$('#success-file').after(saveAgain);}saveAgain.href=currentBlobUrl;saveAgain.download=edition.filename;
    activeController=null;$('#success-file').textContent=`${edition.filename} · SHA256 verified`;showDownloadState('success');$('#download-success h2').tabIndex=-1;$('#download-success h2').focus();
  }catch(error){
    if(controller.signal.aborted||activeController!==controller)return;
    activeController=null;$('#download-error-message').textContent=error.message||'Check your connection and try again.';showDownloadState('error');$('#retry-download').focus();
  }
}
$$('[data-download]').forEach(button=>button.addEventListener('click',()=>startDownload(button.dataset.download,button)));
$('#retry-download').addEventListener('click',()=>startDownload(lastEdition));

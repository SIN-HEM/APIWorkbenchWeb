import {release} from './release.js';
import {fetchInstaller,validateCoffeeUrl} from './downloads.js';

const $=selector=>document.querySelector(selector);
const $$=selector=>Array.from(document.querySelectorAll(selector));
let selectedPlatform='win-x64';
const platformSelect=$('#platform-select');
function selectPlatform(id){
  if(!release.platforms[id])return;
  selectedPlatform=id;
  platformSelect.value=id;
  const platform=release.platforms[id];
  $$('[data-version]').forEach(el=>el.textContent=platform.version);
  $('#platform-requirements').textContent=platform.requirements;
  $('#platform-note').textContent=platform.note;
  $$('[data-format]').forEach(el=>el.textContent=platform.os+' installer · '+platform.format);
  for(const [key,edition] of Object.entries(platform.editions)){
    $$('[data-size="'+key+'"]').forEach(el=>el.textContent=edition.mib+' MiB');
    $$('[data-hash="'+key+'"]').forEach(el=>el.textContent=edition.sha256);
    $('[data-download="'+key+'"]').setAttribute('aria-label','Download '+edition.name+' for '+platform.name);
    $('[data-copy-hash="'+key+'"]').setAttribute('aria-label','Copy '+edition.name+' checksum for '+platform.name);
  }
}
const requestedPlatform=new URL(location.href).searchParams.get('platform');
selectPlatform(release.platforms[requestedPlatform]?requestedPlatform:'win-x64');
platformSelect.addEventListener('change',()=>selectPlatform(platformSelect.value));

const coffeeUrl=validateCoffeeUrl(release.coffeeUrl);
if(coffeeUrl){$('#coffee-link').href=coffeeUrl;$('#coffee-panel').hidden=false;}
let toastTimer;
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000);}
$$('[data-copy-hash]').forEach(button=>button.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(release.platforms[selectedPlatform].editions[button.dataset.copyHash].sha256);toast('Checksum copied.');}
  catch{toast('Select and copy the checksum shown above.');}
}));

function bindTabs(selector,keys,choose){
  $$(selector).forEach(tab=>{
    tab.addEventListener('click',()=>choose(tab.dataset.tour??tab.dataset.appearance));
    tab.addEventListener('keydown',event=>{
      let index=keys.indexOf(tab.dataset.tour??tab.dataset.appearance);
      if(event.key==='ArrowRight')index=(index+1)%keys.length;
      else if(event.key==='ArrowLeft')index=(index+keys.length-1)%keys.length;
      else if(event.key==='Home')index=0;
      else if(event.key==='End')index=keys.length-1;
      else return;
      event.preventDefault();choose(keys[index],true);
    });
  });
}
const tour={
  requests:{image:'assets/workbench-request.png',alt:'Actual API Workbench request editor and JSON response using isolated demonstration data',title:'A request and its response, together.',description:'Collections on the left, your request above, and the response below. Keep the details of a check together in one workspace.',index:'01'},
  tests:{image:'assets/workbench-tests.png',alt:'Actual API Workbench Tests tab with passing response assertions for a demonstration API request',title:'Make your expectations repeatable.',description:'Save status, duration, body, header and JSON expectations with a request. Rerun the checks when the endpoint changes.',index:'02'},
  start:{image:'assets/getting-started.png',alt:'Actual API Workbench first-run guide for workspaces, requests, tests and backups',title:'A useful first step.',description:'A short guide helps you get started without adding demo data to your workspace. Reopen it from the Free Local menu when you need a reminder.',index:'03'}
};
let currentTour='requests';
function selectTour(key,focus=false){
  currentTour=key;const item=tour[key];
  $$('[data-tour]').forEach(tab=>{const selected=tab.dataset.tour===key;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&focus)tab.focus();});
  $('#tour-image').src=item.image;$('#tour-image').alt=item.alt;
  $('#tour-title').textContent=item.title;$('#tour-description').textContent=item.description;$('#tour-index').textContent=item.index;
  $('#tour-panel').setAttribute('aria-labelledby','tab-'+key);
  $('.tour-image-wrap').classList.toggle('is-guide',key==='start');
}
bindTabs('[data-tour]',Object.keys(tour),selectTour);

const appearances={
  daylight:{name:'Daylight',description:'Crisp white surfaces and blue accents for a bright workspace.'},
  graphite:{name:'Graphite',description:'Neutral charcoal surfaces and restrained blue accents for everyday focus.'},
  ocean:{name:'Ocean',description:'Deep teal surfaces with a softer, sea-green accent.'},
  midnight:{name:'Midnight',description:'Dark navy surfaces and clear blue accents for a late-night session.'},
  'warm-paper':{name:'Warm Paper',description:'Ivory surfaces and earthy accents for a warmer, lighter workspace.'}
};
let currentAppearance='daylight';
function appearanceImage(key){return{image:'assets/appearance-'+key+'.png',alt:'Actual API Workbench in the '+appearances[key].name+' theme, with identical isolated demonstration request and response data'};}
function selectAppearance(key,focus=false){
  currentAppearance=key;const item=appearances[key],shot=appearanceImage(key);
  $$('[data-appearance]').forEach(tab=>{const selected=tab.dataset.appearance===key;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&focus)tab.focus();});
  $('#appearance-image').src=shot.image;$('#appearance-image').alt=shot.alt;
  $('#appearance-title').textContent=item.name;$('#appearance-description').textContent=item.description;
  $('#appearance-panel').setAttribute('aria-labelledby','appearance-'+key+'-tab');
  $('[data-appearance-zoom]').setAttribute('aria-label','Enlarge '+item.name+' appearance screenshot');
}
bindTabs('[data-appearance]',Object.keys(appearances),selectAppearance);

const imageDialog=$('#image-dialog');let imageOpener;
$$('.screenshot-open').forEach(button=>button.addEventListener('click',()=>{
  imageOpener=button;
  const item=button.hasAttribute('data-tour-zoom')?tour[currentTour]:button.hasAttribute('data-appearance-zoom')?appearanceImage(currentAppearance):{image:button.dataset.image,alt:button.dataset.alt};
  $('#expanded-image').src=item.image;$('#expanded-image').alt=item.alt;imageDialog.showModal();
}));
$('#close-image').addEventListener('click',()=>imageDialog.close());
imageDialog.addEventListener('click',event=>{if(event.target===imageDialog)imageDialog.close();});
imageDialog.addEventListener('close',()=>imageOpener?.focus());

const dialog=$('#download-dialog');let activeController=null,lastDownload=null,downloadOpener=null,currentBlobUrl=null;
function releasePreviousBlob(){if(currentBlobUrl){const previous=currentBlobUrl;currentBlobUrl=null;setTimeout(()=>URL.revokeObjectURL(previous),120000);}}
function showDownloadState(state){for(const name of ['busy','success','error'])$('#download-'+name).hidden=name!==state;dialog.setAttribute('aria-labelledby',state==='busy'?'download-title':'download-'+state+'-title');}
$('#download-success h2').id='download-success-title';$('#download-error h2').id='download-error-title';
function stopDownload(){activeController?.abort();activeController=null;dialog.close();}
$$('[data-close-download]').forEach(button=>button.addEventListener('click',stopDownload));
$('#cancel-download').addEventListener('click',stopDownload);
dialog.addEventListener('cancel',()=>{activeController?.abort();activeController=null;});
dialog.addEventListener('close',()=>{activeController?.abort();activeController=null;releasePreviousBlob();downloadOpener?.focus();});

async function startDownload(key,opener,platformId=selectedPlatform){
  activeController?.abort();releasePreviousBlob();
  const platform=release.platforms[platformId],edition=platform.editions[key];
  lastDownload={key,platformId};downloadOpener=opener||downloadOpener;
  const controller=new AbortController();activeController=controller;
  showDownloadState('busy');$('#download-progress').value=0;$('#download-percent').textContent='0%';$('#download-status').textContent='Connecting…';
  $('#download-platform-label').textContent='API WORKBENCH / '+platform.name.toUpperCase();
  $('#download-description').textContent='Fetching '+edition.name+' for '+platform.name+' ('+edition.mib+' MiB), then checking its SHA256 checksum.';
  if(!dialog.open)dialog.showModal();
  try{
    const blob=await fetchInstaller(edition,{signal:controller.signal,onProgress:(bytes,total,phase)=>{
      if(activeController!==controller)return;
      const percent=Math.min(100,Math.floor(bytes/total*100));$('#download-progress').value=percent;$('#download-percent').textContent=percent+'%';
      $('#download-status').textContent=phase==='verifying'?'Verifying installer checksum…':(bytes/1048576).toFixed(1)+' / '+(total/1048576).toFixed(1)+' MiB';
    }});
    if(controller.signal.aborted||activeController!==controller)return;
    currentBlobUrl=URL.createObjectURL(blob);
    const anchor=document.createElement('a');anchor.href=currentBlobUrl;anchor.download=edition.filename;document.body.append(anchor);anchor.click();anchor.remove();
    let saveAgain=$('#save-again');
    if(!saveAgain){saveAgain=document.createElement('a');saveAgain.id='save-again';saveAgain.className='text-link';saveAgain.textContent='Download not appearing? Save the installer again ↗';saveAgain.style.marginBottom='22px';$('#success-file').after(saveAgain);}
    saveAgain.href=currentBlobUrl;saveAgain.download=edition.filename;
    $('#download-install-help').textContent='Your download has started. '+platform.instructions;
    activeController=null;$('#success-file').textContent=edition.filename+' · SHA256 verified';showDownloadState('success');$('#download-success h2').tabIndex=-1;$('#download-success h2').focus();
  }catch(error){
    if(controller.signal.aborted||activeController!==controller)return;
    activeController=null;$('#download-error-message').textContent=error.message||'Check your connection and try again.';showDownloadState('error');$('#retry-download').focus();
  }
}
$$('[data-download]').forEach(button=>button.addEventListener('click',()=>startDownload(button.dataset.download,button)));
$('#retry-download').addEventListener('click',()=>startDownload(lastDownload.key,null,lastDownload.platformId));

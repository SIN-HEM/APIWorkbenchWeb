export function validateCoffeeUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['buymeacoffee.com','www.buymeacoffee.com'].includes(url.hostname) || url.username || url.password || url.port || url.pathname === '/') return null;
    return url.href;
  } catch { return null; }
}

export async function fetchInstaller(edition, { signal, onProgress = () => {}, fetcher = globalThis.fetch.bind(globalThis), baseUrl = globalThis.location?.href } = {}) {
  if (!edition?.chunks?.length || !/^[a-f0-9]{64}$/.test(edition.sha256)) throw new Error('This installer is not available. Please try again later.');
  const parts=[];
  let received=0;
  signal?.throwIfAborted();
  for(const chunk of edition.chunks){
    const response=await fetcher(new URL(chunk.url,baseUrl),{signal,cache:'default'});
    if(!response.ok) throw new Error('The download could not be retrieved. Check your connection and try again.');
    let chunkReceived=0;
    if(response.body?.getReader){
      const reader=response.body.getReader();
      try {
        while(true){
          signal?.throwIfAborted();
          const {done,value}=await reader.read();
          if(done) break;
          chunkReceived+=value.byteLength;received+=value.byteLength;
          if(chunkReceived>chunk.bytes || received>edition.bytes) throw new Error('The download did not match the expected size. Please try again.');
          parts.push(value);onProgress(received,edition.bytes,'downloading');
        }
      } finally { reader.releaseLock(); }
    } else {
      const bytes=new Uint8Array(await response.arrayBuffer());
      chunkReceived=bytes.byteLength;received+=bytes.byteLength;parts.push(bytes);
      onProgress(received,edition.bytes,'downloading');
    }
    if(chunkReceived!==chunk.bytes) throw new Error('The download was interrupted. Please try again.');
  }
  if(received!==edition.bytes) throw new Error('The download was incomplete. Please try again.');
  signal?.throwIfAborted();
  onProgress(received,edition.bytes,'verifying');
  const blob=new Blob(parts,{type:'application/octet-stream'});
  const digest=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());
  signal?.throwIfAborted();
  const actual=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  if(actual!==edition.sha256) throw new Error('The installer failed its integrity check. It has not been downloaded. Please try again later.');
  return blob;
}

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.bin':'application/octet-stream'};
const port=Number(process.env.PORT||4173);
http.createServer((req,res)=>{
  let filename;
  try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);filename=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));}catch{res.writeHead(400).end();return;}
  if(!filename.startsWith(root+path.sep)||!fs.existsSync(filename)||!fs.statSync(filename).isFile()){res.writeHead(404).end('Not found');return;}
  const size=fs.statSync(filename).size;
  res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Content-Length':size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD'){res.end();return;}
  fs.createReadStream(filename).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));

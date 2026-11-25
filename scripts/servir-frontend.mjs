import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
const base=fileURLToPath(new URL('../frontend-compilado/',import.meta.url));
const port=Number(process.env.FRONTEND_PORT||4200);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 try{
  const url=new URL(req.url,'http://localhost');
  let path=resolve(base,'.'+decodeURIComponent(url.pathname));
  if(path!==resolve(base)&&!path.startsWith(resolve(base)+sep)){res.writeHead(403);res.end();return;}
  try{if(!(await stat(path)).isFile())path=resolve(base,'index.html');}
  catch{if(extname(url.pathname)){res.writeHead(404);res.end();return;}path=resolve(base,'index.html');}
  const bytes=await readFile(path);
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(400);res.end('Solicitud inválida');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Angular compilado: http://localhost:${port}/conexion`));
server.on('error',e=>{console.error(e.message);process.exitCode=1;});

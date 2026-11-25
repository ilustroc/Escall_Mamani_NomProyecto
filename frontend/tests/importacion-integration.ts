import '@angular/compiler';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createEnvironmentInjector,Injector,runInInjectionContext} from '@angular/core';
import {HttpClient,HttpRequest,HttpResponse,HttpErrorResponse} from '@angular/common/http';
import {from} from 'rxjs';
import {OperacionesService} from '../src/app/core/operaciones.service';
import {ImportacionesPage} from '../src/app/pages/importaciones/importaciones';
const base='http://localhost:8080/api';
const login=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({usuario:process.env['CRM_TEST_USER']||'admin',password:process.env['CRM_TEST_PASSWORD']||'Admin12345'})});assert.equal(login.status,200);const token=(await login.json()).token;
const registros:any[]=[];
// Adaptador HTTP de prueba en Node: conserva HttpRequest y FormData reales de Angular.
const handler={handle:(req:HttpRequest<any>)=>from((async()=>{
 const headers=new Headers();for(const k of req.headers.keys())headers.set(k,req.headers.get(k)!);headers.set('Authorization','Bearer '+token);
 const tipo=req.detectContentTypeHeader();if(tipo&&!headers.has('Content-Type'))headers.set('Content-Type',tipo);
 const r=await fetch(req.urlWithParams,{method:req.method,headers,body:req.serializeBody() as any});const text=await r.text();const body=text?JSON.parse(text):null;
 registros.push({metodo:req.method,url:req.urlWithParams,http:r.status});
 if(!r.ok)throw new HttpErrorResponse({status:r.status,error:body});
 return new HttpResponse({status:r.status,body});
})())};
const env=createEnvironmentInjector([{provide:HttpClient,useValue:new HttpClient(handler as any)},OperacionesService],Injector.NULL as any);
const page=runInInjectionContext(env,()=>new ImportacionesPage());
const esperar=async(cond:()=>boolean)=>{const inicio=Date.now();while(!cond()){if(Date.now()-inicio>15000)throw Error('Tiempo agotado');await new Promise(r=>setTimeout(r,30));}};
await esperar(()=>!page.consultando());
const sufijo=String(Date.now());const documento=String(10000000+Math.floor(Math.random()*80000000));
const hoy=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima'}).format(new Date());
async function archivo(nombre:string){let texto=await readFile(new URL('./fixtures/'+nombre,import.meta.url),'utf8');texto=texto.replaceAll('APF3-1811-01','APF3-'+sufijo+'-01').replaceAll('APF3-1811-02','APF3-'+sufijo+'-02').replaceAll('96781118',documento).replaceAll('96781119',String(Number(documento)+1)).replaceAll('E2E-1811-01','E2E-'+sufijo).replaceAll('2026-11-18',hoy);return new File([texto],nombre,{type:'text/csv'});}
page.seleccionar({target:{files:[await archivo('estructura-invalida.csv')],value:''}} as any);page.importar();await esperar(()=>!page.cargando());assert.match(page.error(),/Faltan las columnas/);assert.equal(page.resultado(),null);assert.ok(page.archivo());
page.seleccionar({target:{files:[await archivo('asignaciones-e2e.csv')],value:''}} as any);page.importar();await esperar(()=>!page.cargando());const asignaciones=page.resultado();assert.equal(asignaciones?.aceptados,1);assert.equal(asignaciones?.rechazados,2);assert.equal(page.archivo(),null);
page.cambiarTipo('pagos');page.seleccionar({target:{files:[await archivo('pagos-e2e.csv')],value:''}} as any);page.importar();await esperar(()=>!page.cargando());const pagos=page.resultado();assert.equal(pagos?.aceptados,1);assert.equal(pagos?.rechazados,2);await esperar(()=>!page.consultando());assert.equal(page.historial()[0].id,pagos?.id);
await mkdir(new URL('./resultados/',import.meta.url),{recursive:true});
await writeFile(new URL('./resultados/importacion-angular-mysql.json',import.meta.url),JSON.stringify({entorno:'Lógica Angular en Node con HttpClient y FormData; transporte fetch de prueba, no selector visual de Chrome',asignaciones,pagos,historial:page.historial(),peticiones:registros},null,2));
console.log('Integración Angular–MySQL: estructura inválida rechazada; asignaciones 1/2 y pagos 1/2; historial actualizado.');env.destroy();

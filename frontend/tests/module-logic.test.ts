import '@angular/compiler';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createEnvironmentInjector,Injector,runInInjectionContext,signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { of,Subject,throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { OperacionesService } from '../src/app/core/operaciones.service';
import { AuthService } from '../src/app/core/auth.service';
import { ImportacionesPage } from '../src/app/pages/importaciones/importaciones';
import { ReportesPage } from '../src/app/pages/reportes/reportes';
import { UsuariosPage } from '../src/app/pages/usuarios/usuarios';
function crear<T>(Clase:new()=>T,api:any,rol='ADMIN'):T{
 const servicio={
  ...api,
  getBatchLoads:api.getBatchLoads??api.cargas??(()=>of([])),
  importData:api.importData??api.importar??(()=>of(null)),
  getFilterOptions:api.getFilterOptions??api.filtros??(()=>of({carteras:[],cosechas:[],asesores:[]})),
  getReport:api.getReport??api.reporte??(()=>of([])),
  getUsers:api.getUsers??api.usuarios??(()=>of([])),
  getSupervisors:api.getSupervisors??api.supervisores??(()=>of([]))
 };
 const env=createEnvironmentInjector([{provide:FormBuilder,useValue:new FormBuilder()},{provide:OperacionesService,useValue:servicio},{provide:AuthService,useValue:{sesion:signal({usuario:{id:1,rol}})}}],Injector.NULL as any);
 return runInInjectionContext(env,()=>new Clase());
}
const carga={id:2,tipo:'ASIGNACION',total:3,aceptados:1,rechazados:2,errores:['Fila 3: duplicada'],nombreArchivo:'test.csv',usuario:'admin',creadoEn:'2026-11-18T00:00:00Z'};
function evento(file:File){return {target:{files:[file],value:file.name}} as any;}
test('Importación rechaza vacío, extensión no admitida y más de 10 MB sin enviar nada',()=>{
 let peticiones=0;const p=crear(ImportacionesPage,{cargas:()=>of([]),importar:()=>{peticiones++;return of(carga);}});
 p.seleccionar(evento(new File([],'vacio.csv')));assert.equal(p.archivo(),null);assert.match(p.error(),/vacío/);
 p.seleccionar(evento(new File(['a'],'datos.xlsx')));assert.equal(p.archivo(),null);
 p.seleccionar(evento(new File([new Uint8Array(10*1024*1024+1)],'grande.csv')));assert.equal(p.archivo(),null);assert.match(p.error(),/10 MB/);
 p.importar();assert.equal(peticiones,0);
});
test('La carga válida conserva el archivo, bloquea duplicados y presenta aceptados/rechazados',()=>{
 const respuesta=new Subject<any>();let llamadas=0;let enviado:File|undefined;
 const p=crear(ImportacionesPage,{cargas:()=>of([carga]),importar:(tipo:string,f:File)=>{assert.equal(tipo,'asignaciones');enviado=f;llamadas++;return respuesta;}});
 const archivo=new File(['documento;nombres\n12345678;Prueba'],'asignaciones.csv');p.seleccionar(evento(archivo));p.importar();p.importar();assert.equal(llamadas,1);assert.equal(enviado,archivo);assert.equal(p.cargando(),true);
 respuesta.next(carga);respuesta.complete();assert.equal(p.resultado()?.aceptados,1);assert.equal(p.resultado()?.rechazados,2);assert.equal(p.archivo(),null);assert.equal(p.cargando(),false);
});
test('Errores del servidor conservan archivo para reintento y no fingen una carga exitosa',()=>{
 const p=crear(ImportacionesPage,{cargas:()=>of([]),importar:()=>throwError(()=>new HttpErrorResponse({status:409,error:{mensaje:'Faltan columnas'}}))});const f=new File(['x'],'estructura.csv');p.seleccionar(evento(f));p.importar();assert.equal(p.resultado(),null);assert.equal(p.archivo(),f);assert.match(p.error(),/Faltan columnas/);assert.equal(p.cargando(),false);
});
test('Cambiar tipo de carga limpia selección y resultados anteriores',()=>{
 const p=crear(ImportacionesPage,{cargas:()=>of([])});p.seleccionar(evento(new File(['x'],'a.csv')));p.resultado.set(carga);p.cambiarTipo('pagos');assert.equal(p.tipo(),'pagos');assert.equal(p.archivo(),null);assert.equal(p.resultado(),null);
});
function reporteApi(){return {filtros:()=>of({carteras:[],cosechas:[],asesores:[]}),reporte:()=>of(Array.from({length:60},(_,i)=>({id:i+1,monto:i}))) };}
test('Reportes bloquean fechas invertidas y rangos mayores de un año',()=>{
 const p=crear(ReportesPage,reporteApi());p.form.patchValue({periodo:'PERSONALIZADO',desde:'2026-11-18',hasta:'2026-11-01'});p.cambiarPeriodo();assert.equal(p.form.invalid,true);
 p.form.patchValue({desde:'2024-01-01',hasta:'2026-11-18'});assert.equal(p.form.invalid,true);
 p.form.patchValue({desde:'2026-11-01',hasta:'2026-11-18'});assert.equal(p.form.valid,true);
});
test('Paginación usa páginas de 25 y al consultar reinicia en la primera',()=>{
 const p=crear(ReportesPage,reporteApi());assert.equal(p.paginas(),3);assert.equal(p.visibles().length,25);p.pagina.set(3);assert.equal(p.visibles().length,10);p.consultar();assert.equal(p.pagina(),1);
});
test('Los filtros enviados mantienen tipo, asesor, cartera y fechas elegidos',()=>{
 const api=reporteApi();let consulta:any;api.reporte=((tipo:any,filtros:any)=>{consulta={tipo,filtros};return of([]);}) as any;const p=crear(ReportesPage,api);p.form.patchValue({tipo:'pagos',periodo:'PERSONALIZADO',desde:'2026-11-01',hasta:'2026-11-18',asesorId:'4',cartera:'Prueba',cosecha:'2026-11'});p.cambiarPeriodo();p.consultar();assert.equal(consulta.tipo,'pagos');assert.deepEqual(consulta.filtros,{asesorId:'4',cartera:'Prueba',cosecha:'2026-11',desde:'2026-11-01',hasta:'2026-11-18'});
});
const apiUsuarios={usuarios:()=>of([]),supervisores:()=>of([])};
test('Crear asesor requiere contraseña inicial y supervisor; crear supervisor no exige equipo',()=>{
 const p=crear(UsuariosPage,apiUsuarios);p.abrir();p.form.patchValue({usuario:'prueba',nombre:'Prueba',email:'p@example.com',password:'Prueba123'});assert.equal(p.form.invalid,true);p.form.controls.supervisorId.setValue(2);assert.equal(p.form.valid,true);p.form.controls.rol.setValue('SUPERVISOR');p.reglas();assert.equal(p.form.controls.supervisorId.value,null);assert.equal(p.form.valid,true);
});
test('Editar usuario no exige otra contraseña y el supervisor solo administra asesores',()=>{
 const p=crear(UsuariosPage,apiUsuarios,'SUPERVISOR');p.abrir({id:7,usuario:'prueba',nombre:'Prueba',email:'p@example.com',rol:'ASESOR',activo:true,supervisorId:2});assert.equal(p.form.valid,true);assert.equal(p.esAdmin(),false);assert.equal(p.form.controls.password.value,'');
});
test('Formulario de restablecimiento rechaza confirmaciones distintas y claves cortas',()=>{
 const p=crear(UsuariosPage,apiUsuarios);p.passwordForm.setValue({password:'123',confirmacion:'123'});assert.equal(p.passwordForm.invalid,true);p.passwordForm.setValue({password:'Prueba123',confirmacion:'OtraClave'});assert.equal(p.passwordForm.invalid,true);p.passwordForm.controls.confirmacion.setValue('Prueba123');assert.equal(p.passwordForm.valid,true);
});

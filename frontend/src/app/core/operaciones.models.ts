import { Rol } from './models';
export interface FiltrosReporte {periodo?:string;desde?:string;hasta?:string;asesorId?:string;cartera?:string;cosecha?:string;}
export type TipoReporte='gestiones'|'pagos'|'promesas';
export interface FilaReporte {id:number;numeroOperacion:string;cartera:string;clienteDocumento:string;clienteNombres:string;asesorNombre:string;fechaHora?:string;fechaPago?:string;fechaCompromiso?:string;nivel1?:string;nivel2?:string;telefono?:string;observacion?:string;monto?:number;referencia?:string;estado?:string;}
export interface OpcionesFiltro {carteras:string[];cosechas:string[];asesores:{id:number;nombre:string}[];}
export interface UsuarioEntrada {usuario:string;nombre:string;email:string;rol:Rol;supervisorId:number|null;password?:string;}
export type TipoCarga='asignaciones'|'pagos';
export interface Carga {id:number;tipo:string;nombreArchivo:string;usuario:string;total:number;aceptados:number;rechazados:number;errores:string[];creadoEn:string;}

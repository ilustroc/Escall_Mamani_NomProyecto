export type Rol = 'ADMIN' | 'SUPERVISOR' | 'ASESOR';
export interface Usuario {id:number; usuario:string; nombre:string; email:string; rol:Rol; activo:boolean; supervisorId?:number|null; supervisorNombre?:string|null; creadoEn?:string;}
export interface Sesion {token:string; expiraEn:string; usuario:Usuario;}
export interface ClienteResumen {id:number; tipoDocumento:string; documento:string; nombres:string; cuentas:number; deudaTotal:number;}
export interface ClienteEntrada {tipoDocumento:string; documento:string; nombres:string; email:string; direccion:string;}
export interface Cuenta {id:number; numeroOperacion:string; entidad:string; producto:string; cartera:string; deudaTotal:number; totalPagado:number; saldo:number; asesorNombre:string;}
export interface Gestion {id:number; fechaHora:string; numeroOperacion:string; telefono:string; nivel1:string; nivel2:string; observacion:string; asesorNombre:string;}
export interface Pago {id:number; fechaPago:string; monto:number; referencia:string; numeroOperacion:string;}
export interface Promesa {id:number; fechaCompromiso:string; monto:number; estado:string; numeroOperacion:string;}
export interface ClienteDetalle extends Omit<ClienteResumen,'cuentas'|'deudaTotal'> {email:string; direccion:string; telefonos:{id:number; numero:string; tipo:string}[]; cuentas:Cuenta[]; gestiones:Gestion[]; pagos:Pago[]; promesas:Promesa[];}
export interface Tipificacion {id:number; nombre:string; resultados:{id:number; nombre:string; requiereCompromiso:boolean}[];}
export interface Dashboard {desde:string; hasta:string; gestiones:number; contactos:number; tasaContacto:number; promesas:number; montoPromesas:number; pagos:number; montoPagos:number; porAsesor:{asesorId:number; asesor:string; gestiones:number; contactos:number; promesas:number; montoPagos:number}[];}

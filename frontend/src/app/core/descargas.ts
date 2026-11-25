// Neutraliza fórmulas de celdas de texto antes de exportar a Excel.
export function descargarCsv(nombre:string,filas:unknown[][]){
 const celda=(v:unknown)=>{let s=String(v??'');if(/^[\s]*[=+@-]/.test(s)&&typeof v!=='number')s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
 const csv='\uFEFF'+filas.map(f=>f.map(celda).join(';')).join('\r\n')+'\r\n';
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
 const a=document.createElement('a');a.href=url;a.download=nombre;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

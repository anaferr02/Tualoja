export function getAlojamientos(){
 return JSON.parse(localStorage.getItem("alojamientos")) || [];
}

export function saveAlojamientos(data){
 localStorage.setItem("alojamientos", JSON.stringify(data));
}

export function addAlojamiento(a){
 const list = getAlojamientos();
 list.push(a);
 saveAlojamientos(list);
}

export function uid(){
 return Date.now().toString();
}

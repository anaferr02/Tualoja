// storage.js
const STORAGE_KEY = "tualoja_alojamientos";

export function getAlojamientos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveAlojamientos(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addAlojamiento(aloj) {
  const list = getAlojamientos();
  list.unshift(aloj);
  saveAlojamientos(list);
  return aloj;
}

export function getAlojamientoById(id) {
  const list = getAlojamientos();
  return list.find((x) => String(x.id) === String(id)) || null;
}

export function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

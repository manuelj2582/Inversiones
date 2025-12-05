// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, doc, getDocs, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD3gZ2BI7uAZuk0CnLGXZglEh2KQBdeFEU",
  authDomain: "inversiones-sistema.firebaseapp.com",
  projectId: "inversiones-sistema",
  storageBucket: "inversiones-sistema.firebasestorage.app",
  messagingSenderId: "480964599568",
  appId: "1:480964599568:web:688ca647f4ea9e5273cf95"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Guardar cliente
export const guardarCliente = async (cliente) => {
  const docRef = await addDoc(collection(db, 'clientes'), cliente);
  return docRef.id;
};

// Guardar préstamo
export const guardarPrestamo = async (prestamo) => {
  const docRef = await addDoc(collection(db, 'prestamos'), prestamo);
  return docRef.id;
};

// Actualizar préstamo
export const actualizarPrestamo = async (id, datos) => {
  const prestamoRef = doc(db, 'prestamos', id);
  await updateDoc(prestamoRef, datos);
};

// Obtener todos los clientes
export const obtenerClientes = async () => {
  const snapshot = await getDocs(collection(db, 'clientes'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Obtener todos los préstamos
export const obtenerPrestamos = async () => {
  const snapshot = await getDocs(collection(db, 'prestamos'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Actualizar vendedora
export const actualizarVendedora = async (id, datos) => {
  const vendedoraRef = doc(db, 'vendedoras', `vendedora_${id}`);
  await setDoc(vendedoraRef, datos, { merge: true });
};

// Obtener vendedoras
export const obtenerVendedoras = async () => {
  const snapshot = await getDocs(collection(db, 'vendedoras'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export { db };// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD3gZ2BI7uAZuk0CnLGXZglEh2KQBdeFEU",
  authDomain: "inversiones-sistema.firebaseapp.com",
  projectId: "inversiones-sistema",
  storageBucket: "inversiones-sistema.firebasestorage.app",
  messagingSenderId: "480964599568",
  appId: "1:480964599568:web:688ca647f4ea9e5273cf95"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Funciones para Clientes
export const agregarCliente = async (cliente) => {
  try {
    const docRef = await addDoc(collection(db, 'clientes'), {
      ...cliente,
      fechaCreacion: new Date().toISOString()
    });
    return { id: docRef.id, ...cliente };
  } catch (error) {
    console.error('Error agregando cliente:', error);
    throw error;
  }
};

export const obtenerClientes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'clientes'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    throw error;
  }
};

export const actualizarCliente = async (id, datos) => {
  try {
    const clienteRef = doc(db, 'clientes', id);
    await updateDoc(clienteRef, datos);
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    throw error;
  }
};

// Funciones para Préstamos
export const agregarPrestamo = async (prestamo) => {
  try {
    const docRef = await addDoc(collection(db, 'prestamos'), {
      ...prestamo,
      fechaCreacion: new Date().toISOString()
    });
    return { id: docRef.id, ...prestamo };
  } catch (error) {
    console.error('Error agregando préstamo:', error);
    throw error;
  }
};

export const obtenerPrestamos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'prestamos'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error obteniendo préstamos:', error);
    throw error;
  }
};

export const actualizarPrestamo = async (id, datos) => {
  try {
    const prestamoRef = doc(db, 'prestamos', id);
    await updateDoc(prestamoRef, datos);
  } catch (error) {
    console.error('Error actualizando préstamo:', error);
    throw error;
  }
};

// Funciones para Vendedoras
export const obtenerVendedoras = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'vendedoras'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error obteniendo vendedoras:', error);
    throw error;
  }
};

export const actualizarVendedora = async (id, datos) => {
  try {
    const vendedoraRef = doc(db, 'vendedoras', id);
    await updateDoc(vendedoraRef, datos);
  } catch (error) {
    console.error('Error actualizando vendedora:', error);
    throw error;
  }
};

// Listener en tiempo real para cambios
export const escucharCambios = (coleccion, callback) => {
  const q = query(collection(db, coleccion));
  return onSnapshot(q, (querySnapshot) => {
    const datos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(datos);
  });
};

export { db };
import { collection, addDoc, updateDoc, doc, getDocs, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseClient';

// Guardar cliente
export const guardarCliente = async (cliente) => {
  try {
    const docRef = await addDoc(collection(db, 'clientes'), {
      ...cliente,
      fechaCreacion: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error guardando cliente:', error);
    throw error;
  }
};

// Guardar préstamo
export const guardarPrestamo = async (prestamo) => {
  try {
    const docRef = await addDoc(collection(db, 'prestamos'), {
      ...prestamo,
      fechaCreacion: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error guardando préstamo:', error);
    throw error;
  }
};

// Actualizar préstamo
export const actualizarPrestamo = async (id, datos) => {
  try {
    const prestamoRef = doc(db, 'prestamos', id);
    await updateDoc(prestamoRef, datos);
  } catch (error) {
    console.error('Error actualizando préstamo:', error);
    throw error;
  }
};

// Obtener clientes (una vez)
export const obtenerClientes = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'clientes'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    return [];
  }
};

// Obtener préstamos (una vez)
export const obtenerPrestamos = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'prestamos'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error obteniendo préstamos:', error);
    return [];
  }
};

// Escuchar cambios en tiempo real - CLIENTES
export const escucharClientes = (callback) => {
  return onSnapshot(collection(db, 'clientes'), (snapshot) => {
    const clientes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(clientes);
  });
};

// Escuchar cambios en tiempo real - PRÉSTAMOS
export const escucharPrestamos = (callback) => {
  return onSnapshot(collection(db, 'prestamos'), (snapshot) => {
    const prestamos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(prestamos);
  });
};

// Actualizar vendedora
export const actualizarVendedora = async (id, datos) => {
  try {
    const vendedoraRef = doc(db, 'vendedoras', `vendedora_${id}`);
    await setDoc(vendedoraRef, datos, { merge: true });
  } catch (error) {
    console.error('Error actualizando vendedora:', error);
    throw error;
  }
};

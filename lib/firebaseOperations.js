import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseClient';

export const obtenerClientes = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'clientes'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obtenerClientes:', error);
    return [];
  }
};

export const obtenerPrestamos = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'prestamos'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obtenerPrestamos:', error);
    return [];
  }
};

export const guardarCliente = async (clienteData) => {
  try {
    const docRef = await addDoc(collection(db, 'clientes'), {
      ...clienteData,
      fechaCreacion: serverTimestamp(),
      estado: 'activo',
      totalPrestado: 0,
      totalPagado: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error guardarCliente:', error);
    throw error;
  }
};

export const guardarPrestamo = async (prestamoData) => {
  try {
    const docRef = await addDoc(collection(db, 'prestamos'), {
      ...prestamoData,
      fechaCreacion: serverTimestamp(),
      estado: 'activo',
      cuotasPagadas: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error guardarPrestamo:', error);
    throw error;
  }
};

export const actualizarPrestamo = async (prestamoId, datos) => {
  try {
    const prestamoRef = doc(db, 'prestamos', prestamoId);
    await updateDoc(prestamoRef, datos);
    return true;
  } catch (error) {
    console.error('Error actualizarPrestamo:', error);
    throw error;
  }
};

export const actualizarCliente = async (clienteId, datos) => {
  try {
    const clienteRef = doc(db, 'clientes', clienteId);
    await updateDoc(clienteRef, datos);
    return true;
  } catch (error) {
    console.error('Error actualizarCliente:', error);
    throw error;
  }
};

export const eliminarCliente = async (clienteId) => {
  try {
    await deleteDoc(doc(db, 'clientes', clienteId));
    return true;
  } catch (error) {
    console.error('Error eliminarCliente:', error);
    throw error;
  }
};

export const escucharClientes = (callback) => {
  try {
    return onSnapshot(collection(db, 'clientes'), (snapshot) => {
      const clientes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(clientes);
    });
  } catch (error) {
    console.error('Error escucharClientes:', error);
  }
};

export const escucharPrestamos = (callback) => {
  try {
    return onSnapshot(collection(db, 'prestamos'), (snapshot) => {
      const prestamos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(prestamos);
    });
  } catch (error) {
    console.error('Error escucharPrestamos:', error);
  }
};

export const actualizarVendedora = async (vendedoraId, datos) => {
  try {
    const vendedoraRef = doc(db, 'vendedoras', vendedoraId);
    await updateDoc(vendedoraRef, datos);
    return true;
  } catch (error) {
    console.error('Error actualizarVendedora:', error);
    throw error;
  }
};

export default {
  obtenerClientes,
  obtenerPrestamos,
  guardarCliente,
  guardarPrestamo,
  actualizarPrestamo,
  actualizarCliente,
  eliminarCliente,
  escucharClientes,
  escucharPrestamos,
  actualizarVendedora
};
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseClient';

// Obtener todos los clientes
export const obtenerClientes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'clientes'));
    const clientes = [];
    querySnapshot.forEach((doc) => {
      clientes.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    console.log('obtenerClientes:', clientes);
    return clientes;
  } catch (error) {
    console.error('Error en obtenerClientes:', error);
    return [];
  }
};

// Obtener vendedoras
export const obtenerVendedoras = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'vendedoras'));
    const vendedoras = [];
    querySnapshot.forEach((doc) => {
      vendedoras.push({
        id: doc.data().id,
        ...doc.data(),
        _docId: doc.id,
      });
    });
    console.log('obtenerVendedoras:', vendedoras);
    return vendedoras;
  } catch (error) {
    console.error('Error en obtenerVendedoras:', error);
    return [];
  }
};

// Obtener todos los préstamos
export const obtenerPrestamos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'prestamos'));
    const prestamos = [];
    querySnapshot.forEach((doc) => {
      prestamos.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    console.log('obtenerPrestamos:', prestamos);
    return prestamos;
  } catch (error) {
    console.error('Error en obtenerPrestamos:', error);
    return [];
  }
};

// Guardar cliente
export const guardarCliente = async (clienteData) => {
  try {
    console.log('guardarCliente - datos:', clienteData);
    console.log('guardarCliente - db:', db);
    console.log('guardarCliente - collection:', collection(db, 'clientes'));
    
    const docRef = await addDoc(collection(db, 'clientes'), {
      nombre: clienteData.nombre || '',
      telefono: clienteData.telefono || '',
      direccion: clienteData.direccion || '',
      vendedoraId: clienteData.vendedoraId || null,
      estado: 'activo',
      fechaCreacion: new Date().toISOString(),
      totalPrestado: 0,
      totalPagado: 0,
    });
    
    console.log('guardarCliente - ID creado:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('ERROR EN guardarCliente:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

// Guardar préstamo
export const guardarPrestamo = async (prestamoData) => {
  try {
    console.log('guardarPrestamo - datos:', prestamoData);
    
    const docRef = await addDoc(collection(db, 'prestamos'), {
      clienteId: prestamoData.clienteId || '',
      monto: prestamoData.monto || prestamoData.valorTotal || 0,
      valorTotal: prestamoData.valorTotal || prestamoData.monto || 0,
      interes: (prestamoData.monto || prestamoData.valorTotal || 0) * 0.2,
      estado: 'activo',
      cuotasPagadas: 0,
      cuotasPendientes: 24,
      fechaCreacion: serverTimestamp(),
    });
    
    console.log('guardarPrestamo - ID creado:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error en guardarPrestamo:', error);
    throw error;
  }
};

// Actualizar préstamo
export const actualizarPrestamo = async (prestamoId, datos) => {
  try {
    console.log('actualizarPrestamo:', { prestamoId, datos });
    
    const prestamoRef = doc(db, 'prestamos', prestamoId);
    await updateDoc(prestamoRef, datos);
    
    console.log('Préstamo actualizado');
    return true;
  } catch (error) {
    console.error('Error en actualizarPrestamo:', error);
    throw error;
  }
};

// Actualizar cliente
export const actualizarCliente = async (clienteId, datos) => {
  try {
    console.log('actualizarCliente:', { clienteId, datos });
    
    const clienteRef = doc(db, 'clientes', clienteId);
    await updateDoc(clienteRef, datos);
    
    console.log('Cliente actualizado');
    return true;
  } catch (error) {
    console.error('Error en actualizarCliente:', error);
    throw error;
  }
};

// Eliminar cliente
export const eliminarCliente = async (clienteId) => {
  try {
    console.log('eliminarCliente:', clienteId);
    
    await deleteDoc(doc(db, 'clientes', clienteId));
    
    console.log('Cliente eliminado');
    return true;
  } catch (error) {
    console.error('Error en eliminarCliente:', error);
    throw error;
  }
};

// Escuchar cambios en clientes
export const escucharClientes = (callback) => {
  try {
    console.log('Iniciando escucha de clientes...');
    
    return onSnapshot(collection(db, 'clientes'), (snapshot) => {
      const clientes = [];
      snapshot.forEach((doc) => {
        clientes.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      console.log('Clientes actualizados (listener):', clientes.length);
      callback(clientes);
    });
  } catch (error) {
    console.error('Error en escucharClientes:', error);
  }
};

// Escuchar cambios en vendedoras
export const escucharVendedoras = (callback) => {
  try {
    console.log('Iniciando escucha de vendedoras...');
    
    return onSnapshot(collection(db, 'vendedoras'), (snapshot) => {
      const vendedoras = [];
      snapshot.forEach((doc) => {
        vendedoras.push({
          id: doc.data().id,
          ...doc.data(),
          _docId: doc.id,
        });
      });
      console.log('Vendedoras actualizadas (listener):', vendedoras);
      callback(vendedoras);
    });
  } catch (error) {
    console.error('Error en escucharVendedoras:', error);
  }
};

// Escuchar cambios en préstamos
export const escucharPrestamos = (callback) => {
  try {
    console.log('Iniciando escucha de préstamos...');
    
    return onSnapshot(collection(db, 'prestamos'), (snapshot) => {
      const prestamos = [];
      snapshot.forEach((doc) => {
        prestamos.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      console.log('Préstamos actualizados (listener):', prestamos.length);
      callback(prestamos);
    });
  } catch (error) {
    console.error('Error en escucharPrestamos:', error);
  }
};

// Actualizar vendedora
export const actualizarVendedora = async (vendedoraId, datos) => {
  try {
    console.log('actualizarVendedora:', { vendedoraId, datos });
    
    const vendedoraRef = doc(db, 'vendedoras', vendedoraId.toString());
    await updateDoc(vendedoraRef, datos);
    
    console.log('Vendedora actualizada');
    return true;
  } catch (error) {
    console.error('Error en actualizarVendedora:', error);
    // Si no existe, crear
    try {
      await addDoc(collection(db, 'vendedoras'), {
        id: vendedoraId,
        ...datos,
      });
      console.log('Vendedora creada');
      return true;
    } catch (err) {
      console.error('Error creando vendedora:', err);
      throw err;
    }
  }
};

// Obtener clientes en mora (sin pagar en más de 2 días)
export const obtenerClientesEnMora = async (prestamos, clientes) => {
  try {
    const hoy = new Date();
    const clientesEnMora = [];

    prestamos.forEach(p => {
      if (p.estado === 'activo' && p.ultimoPago) {
        const ultimoPago = new Date(p.ultimoPago);
        const diasSinPagar = Math.floor((hoy - ultimoPago) / (1000 * 60 * 60 * 24));
        
        if (diasSinPagar > 2) {
          const cliente = clientes.find(c => c.id === p.clienteId);
          if (cliente) {
            clientesEnMora.push({
              ...cliente,
              prestamo: p,
              diasAtrasado: diasSinPagar,
              cuotasPendientes: 24 - (p.cuotasPagadas || 0),
            });
          }
        }
      }
    });

    return clientesEnMora;
  } catch (error) {
    console.error('Error en obtenerClientesEnMora:', error);
    return [];
  }
};

// Eliminar préstamo
export const eliminarPrestamo = async (prestamoId) => {
  try {
    console.log('eliminarPrestamo:', prestamoId);
    
    const prestamoRef = doc(db, 'prestamos', prestamoId);
    await deleteDoc(prestamoRef);
    
    console.log('Préstamo eliminado');
    return true;
  } catch (error) {
    console.error('Error en eliminarPrestamo:', error);
    throw error;
  }
};

// Actualizar permisos de vendedora
export const actualizarPermisosVendedora = async (vendedoraId, permisos) => {
  try {
    console.log('actualizarPermisosVendedora:', { vendedoraId, permisos });
    
    const vendedoraRef = doc(db, 'vendedoras', vendedoraId.toString());
    await updateDoc(vendedoraRef, { permisos });
    
    console.log('Permisos actualizados');
    return true;
  } catch (error) {
    console.error('Error en actualizarPermisosVendedora:', error);
    throw error;
  }
};

export default {
  obtenerClientes,
  obtenerPrestamos,
  obtenerVendedoras,
  guardarCliente,
  guardarPrestamo,
  actualizarPrestamo,
  actualizarCliente,
  eliminarCliente,
  escucharClientes,
  escucharPrestamos,
  actualizarVendedora,
  obtenerClientesEnMora,
  eliminarPrestamo,
  actualizarPermisosVendedora,
  escucharVendedoras,
};

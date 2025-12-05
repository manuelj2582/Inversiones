import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebaseClient';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import LoginView from '../components/LoginView';
import HomeView from '../components/HomeView';

const Home = () => {
  const [usuario, setUsuario] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [vendedoraActiva, setVendedoraActiva] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Vendedoras del sistema
  const vendedoras = [
    { id: 'carolina', nombre: 'Carolina', pin: '1234' },
    { id: 'patricia', nombre: 'Patricia', pin: '5678' },
  ];

  // Manejo de login
  const manejarLogin = (vendedoraId) => {
    const vendedora = vendedoras.find((v) => v.id === vendedoraId);
    if (vendedora) {
      setUsuario(vendedora);
      setVendedoraActiva(vendedoraId);
      cargarClientes(vendedoraId);
    }
  };

  // Cargar clientes de Firebase
  const cargarClientes = async (vendedoraId) => {
    try {
      setCargando(true);
      const clientesRef = collection(db, 'clientes');
      const q = query(clientesRef, where('vendedora', '==', vendedoraId));
      const snapshot = await getDocs(q);

      const clientesData = [];
      for (const clienteDoc of snapshot.docs) {
        const cliente = { id: clienteDoc.id, ...clienteDoc.data() };

        // Cargar préstamos del cliente
        const prestamosRef = collection(db, 'clientes', clienteDoc.id, 'prestamos');
        const prestamosSnapshot = await getDocs(prestamosRef);
        cliente.prestamos = prestamosSnapshot.docs.map((prestamoDoc) => ({
          id: prestamoDoc.id,
          ...prestamoDoc.data(),
        }));

        clientesData.push(cliente);
      }

      setClientes(clientesData);
      setError(null);
    } catch (err) {
      console.error('Error cargando clientes:', err);
      setError('No se pudieron cargar los clientes');
    } finally {
      setCargando(false);
    }
  };

  // Agregar nuevo cliente
  const manejarAgregarCliente = async (datosCliente) => {
    try {
      setCargando(true);
      const clienteRef = await addDoc(collection(db, 'clientes'), {
        ...datosCliente,
        vendedora: vendedoraActiva,
        fechaCreacion: serverTimestamp(),
        estadoGeneral: 'activo',
        totalPrestado: 0,
        totalPagado: 0,
      });

      // Crear subcolección de préstamos vacía
      await addDoc(collection(db, 'clientes', clienteRef.id, 'prestamos'), {
        placeholder: true,
      });

      // Recargar clientes
      await cargarClientes(vendedoraActiva);
      setError(null);
    } catch (err) {
      console.error('Error agregando cliente:', err);
      setError('No se pudo agregar el cliente');
    } finally {
      setCargando(false);
    }
  };

  // Agregar préstamo a un cliente
  const manejarAgregarPrestamo = async (clienteId, datosPrestamo) => {
    try {
      setCargando(true);
      console.log('Agregando préstamo:', { clienteId, datosPrestamo });

      const clienteRef = doc(db, 'clientes', clienteId);
      const cliente = clientes.find((c) => c.id === clienteId);

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      // Calcular datos del préstamo
      const monto = parseFloat(datosPrestamo.monto || datosPrestamo);
      
      if (isNaN(monto) || monto <= 0) {
        throw new Error('Monto inválido');
      }

      const interes = monto * 0.2; // 20% de interés
      const montoTotal = monto + interes;
      const cuotaDiaria = montoTotal / 24; // 24 cuotas

      console.log('Calculado:', { monto, interes, montoTotal, cuotaDiaria });

      // Crear préstamo en Firestore
      await addDoc(
        collection(db, 'clientes', clienteId, 'prestamos'),
        {
          monto,
          interes,
          montoTotal,
          cuotaDiaria,
          cuotasPagadas: 0,
          cuotasPendientes: 24,
          estado: 'activo',
          fechaCreacion: serverTimestamp(),
        }
      );

      console.log('Préstamo creado');

      // Actualizar estadísticas del cliente
      const nuevoTotalPrestado = (cliente.totalPrestado || 0) + monto;
      await updateDoc(clienteRef, {
        totalPrestado: nuevoTotalPrestado,
      });

      console.log('Cliente actualizado');

      // Recargar clientes
      await cargarClientes(vendedoraActiva);
      setError(null);
    } catch (err) {
      console.error('Error agregando préstamo:', err);
      setError('No se pudo agregar el préstamo: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  // Actualizar cliente
  const manejarActualizarCliente = async (clienteId) => {
    try {
      setCargando(true);
      await cargarClientes(vendedoraActiva);
      setError(null);
    } catch (err) {
      console.error('Error actualizando cliente:', err);
      setError('No se pudo actualizar el cliente');
    } finally {
      setCargando(false);
    }
  };

  // Eliminar cliente
  const manejarEliminarCliente = async (clienteId) => {
    if (!confirm('¿Está seguro de que desea eliminar este cliente?')) {
      return;
    }

    try {
      setCargando(true);

      // Eliminar todos los préstamos del cliente
      const prestamosRef = collection(db, 'clientes', clienteId, 'prestamos');
      const prestamosSnapshot = await getDocs(prestamosRef);
      for (const prestamoDoc of prestamosSnapshot.docs) {
        await deleteDoc(prestamoDoc.ref);
      }

      // Eliminar el cliente
      await deleteDoc(doc(db, 'clientes', clienteId));

      // Recargar clientes
      await cargarClientes(vendedoraActiva);
      setError(null);
    } catch (err) {
      console.error('Error eliminando cliente:', err);
      setError('No se pudo eliminar el cliente');
    } finally {
      setCargando(false);
    }
  };

  // Cambiar vendedora activa
  const manejarCambiarVendedora = (vendedoraId) => {
    manejarLogin(vendedoraId);
  };

  // Logout
  const manejarLogout = () => {
    setUsuario(null);
    setVendedoraActiva(null);
    setClientes([]);
    setError(null);
  };

  // Si no hay usuario, mostrar login
  if (!usuario) {
    return <LoginView vendedoras={vendedoras} onLogin={manejarLogin} />;
  }

  // Mostrar HomeView con todo refactorizado
  return (
    <>
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 font-bold text-xl"
          >
            ✕
          </button>
        </div>
      )}

      {cargando && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-8 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      )}

      <HomeView
        clientes={clientes}
        vendedoras={vendedoras}
        vendedoraActiva={vendedoraActiva}
        onAgregarCliente={manejarAgregarCliente}
        onAgregarPrestamo={manejarAgregarPrestamo}
        onActualizarCliente={manejarActualizarCliente}
        onEliminarCliente={manejarEliminarCliente}
        onCambiarVendedora={manejarCambiarVendedora}
      />

      {/* Botón de logout en la esquina */}
      <button
        onClick={manejarLogout}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all"
      >
        Salir ({usuario.nombre})
      </button>
    </>
  );
};

export default Home;
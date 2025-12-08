import React, { useState, useEffect } from 'react';
import LoginView from '../components/LoginView';
import HomeView from '../components/HomeView';
import AdminDashboard from '../components/AdminDashboard';
import firebaseOperations from '../lib/firebaseOperations';

export default function SistemaInversiones() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [vendedoras, setVendedoras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datosVendedoras = await firebaseOperations.obtenerClientes('vendedoras');
        const datosClientes = await firebaseOperations.obtenerClientes('clientes');
        const datosPrestamos = await firebaseOperations.obtenerPrestamos('prestamos');

        setVendedoras(datosVendedoras || []);
        setClientes(datosClientes || []);
        setPrestamos(datosPrestamos || []);
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Listeners en tiempo real de Firebase
  useEffect(() => {
    const unsubscribeClientes = firebaseOperations.escucharClientes((datosActualizados) => {
      setClientes(datosActualizados);
    });

    const unsuscribePrestamos = firebaseOperations.escucharPrestamos((datosActualizados) => {
      setPrestamos(datosActualizados);
    });

    return () => {
      if (unsubscribeClientes) unsubscribeClientes();
      if (unsuscribePrestamos) unsuscribePrestamos();
    };
  }, []);

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleLogin = (vendedora) => {
    setUsuarioActual(vendedora);
  };

  const handleCerrarSesion = () => {
    setUsuarioActual(null);
  };

  const handleCrearCliente = async (datosCliente) => {
    try {
      const nuevoCliente = {
        ...datosCliente,
        fechaCreacion: new Date().toISOString(),
      };
      await firebaseOperations.guardarCliente(nuevoCliente);
    } catch (error) {
      console.error('Error creando cliente:', error);
      throw error;
    }
  };

  const handleCrearPrestamo = async (datosPrestamo) => {
    try {
      const nuevoPrestamo = {
        ...datosPrestamo,
        cuotaDiaria: (datosPrestamo.monto * 1.2) / 24,
        montoTotal: datosPrestamo.monto * 1.2,
        cuotasPagadas: 0,
        estado: 'activo',
        fechaCreacion: new Date().toISOString(),
        vendedoraId: usuarioActual.id,
      };
      await firebaseOperations.guardarPrestamo(nuevoPrestamo);
    } catch (error) {
      console.error('Error creando préstamo:', error);
      throw error;
    }
  };

  const handleRegistrarPago = async (clienteId) => {
    try {
      const prestamoActivo = prestamos.find(
        p => p.clienteId === clienteId && p.estado === 'activo'
      );

      if (!prestamoActivo) {
        alert('No hay préstamo activo para este cliente');
        return;
      }

      const cuotasPagadas = (prestamoActivo.cuotasPagadas || 0) + 1;
      const nuevaDatos = {
        ...prestamoActivo,
        cuotasPagadas,
        ultimoPago: new Date().toISOString(),
        estado: cuotasPagadas >= 24 ? 'pagado' : 'activo',
      };

      await firebaseOperations.actualizarPrestamo(prestamoActivo.id, nuevaDatos);
    } catch (error) {
      console.error('Error registrando pago:', error);
      alert('Error registrando pago: ' + error.message);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // Vista de login
  if (!usuarioActual) {
    return <LoginView vendedoras={vendedoras} onLogin={handleLogin} />;
  }

  // Vista de admin
  if (usuarioActual.esAdmin) {
    return (
      <AdminDashboard
        usuarioActual={usuarioActual}
        vendedoras={vendedoras}
        clientes={clientes}
        prestamos={prestamos}
        formatCurrency={formatCurrency}
        onCerrarSesion={handleCerrarSesion}
        firebaseOperations={firebaseOperations}
      />
    );
  }

  // Vista de vendedora
  return (
    <HomeView
      usuarioActual={usuarioActual}
      clientes={clientes}
      prestamos={prestamos}
      vendedoras={vendedoras}
      onRegistrarPago={handleRegistrarPago}
      onCrearCliente={handleCrearCliente}
      onCrearPrestamo={handleCrearPrestamo}
      onCerrarSesion={handleCerrarSesion}
      formatCurrency={formatCurrency}
      firebaseOperations={firebaseOperations}
    />
  );
}

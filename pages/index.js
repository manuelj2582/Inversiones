import React, { useState, useEffect } from 'react';
import LoginView from '../components/LoginView';
import HomeView from '../components/HomeView';

export default function SistemaInversiones() {
  const [vistaActual, setVistaActual] = useState('login');
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [firebaseOperations, setFirebaseOperations] = useState(null);
  
  const [vendedoras, setVendedoras] = useState([
    { id: 1, nombre: 'Carolina', pin: '1234', color: '#ef4444', capitalDisponible: 2500000 },
    { id: 2, nombre: 'Patricia', pin: '5678', color: '#3b82f6', capitalDisponible: 3200000 },
    { id: 'admin', nombre: 'Admin', pin: '0000', color: '#8b5cf6', esAdmin: true }
  ]);
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('../lib/firebaseOperations').then(module => {
        setFirebaseOperations(module);
        cargarDatos(module);
      }).catch(err => {
        console.error('Error cargando firebaseOperations:', err);
        setCargando(false);
      });
    } else {
      setCargando(false);
    }
  }, []);

  const cargarDatos = async (operations) => {
    try {
      const clientesDB = await operations.obtenerClientes();
      const prestamosDB = await operations.obtenerPrestamos();
      
      if (clientesDB && clientesDB.length > 0) setClientes(clientesDB);
      if (prestamosDB && prestamosDB.length > 0) setPrestamos(prestamosDB);
      
      if (operations.escucharClientes) {
        operations.escucharClientes(setClientes);
      }
      if (operations.escucharPrestamos) {
        operations.escucharPrestamos(setPrestamos);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleLogin = (vendedora) => {
    setUsuarioActual(vendedora);
    setVistaActual('home');
  };

  const handleRegistrarPago = async (clienteId) => {
    if (!firebaseOperations) return;
    
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const prestamo = prestamos.find(p => p.clienteId === clienteId && p.estado === 'activo');
      
      if (prestamo) {
        await firebaseOperations.actualizarPrestamo(prestamo.id, {
          cuotasPagadas: (prestamo.cuotasPagadas || 0) + 1,
          ultimoPago: hoy
        });
      }
    } catch (error) {
      console.error('Error registrando pago:', error);
    }
  };

  const handleCrearCliente = async (clienteData) => {
    if (!firebaseOperations) return null;
    try {
      const id = await firebaseOperations.guardarCliente(clienteData);
      return { ...clienteData, id };
    } catch (error) {
      console.error('Error creando cliente:', error);
      return null;
    }
  };

  const handleCrearPrestamo = async (prestamoData) => {
    if (!firebaseOperations) return;
    
    try {
      await firebaseOperations.guardarPrestamo(prestamoData);
      
      const nuevasVendedoras = vendedoras.map(v => {
        if (v.id === usuarioActual.id) {
          return { 
            ...v, 
            capitalDisponible: (v.capitalDisponible || 0) - (prestamoData.valorTotal || 0) 
          };
        }
        return v;
      });
      setVendedoras(nuevasVendedoras);
      
      const vendedoraActualizada = nuevasVendedoras.find(v => v.id === usuarioActual.id);
      setUsuarioActual(vendedoraActualizada);
      
      if (firebaseOperations.actualizarVendedora) {
        await firebaseOperations.actualizarVendedora(usuarioActual.id, { 
          capitalDisponible: vendedoraActualizada.capitalDisponible 
        });
      }
    } catch (error) {
      console.error('Error creando préstamo:', error);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (vistaActual === 'login') {
    return (
      <LoginView 
        vendedoras={vendedoras}
        onLogin={handleLogin}
        cargando={cargando}
      />
    );
  }

  if (vistaActual === 'home' && usuarioActual && !usuarioActual.esAdmin) {
    return (
      <HomeView
        usuarioActual={usuarioActual}
        clientes={clientes}
        prestamos={prestamos}
        vendedoras={vendedoras}
        onRegistrarPago={handleRegistrarPago}
        onCrearCliente={handleCrearCliente}
        onCrearPrestamo={handleCrearPrestamo}
        onCerrarSesion={() => {
          setUsuarioActual(null);
          setVistaActual('login');
        }}
        formatCurrency={formatCurrency}
        firebaseOperations={firebaseOperations}
      />
    );
  }

  return null;
}
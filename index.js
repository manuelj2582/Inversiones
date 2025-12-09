import React, { useState, useEffect } from 'react';
import LoginView from '../components/LoginView';
import HomeView from '../components/HomeView';
import AdminDashboard from '../components/AdminDashboard';

export default function DistribuidoraPro() {
  const [vistaActual, setVistaActual] = useState('login');
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [firebaseOperations, setFirebaseOperations] = useState(null);
  
  const [ejecutivas, setEjecutivas] = useState([
    { id: 1, nombre: 'Yaney', pin: '1234', color: '#ef4444', capitalDisponible: 20000000 },
    { id: 2, nombre: 'Patricia', pin: '5678', color: '#3b82f6', capitalDisponible: 3200000 },
    { id: 'admin', nombre: 'Admin', pin: '0000', color: '#8b5cf6', esAdmin: true }
  ]);
  const [puntosVenta, setPuntosVenta] = useState([]);
  const [distribuciones, setDistribuciones] = useState([]);

  useEffect(() => {
    cargarFirebase();
  }, []);

  useEffect(() => {
    if (firebaseOperations) {
      console.log('Agregando listeners de Firebase...');
      
      const unsubscribeClientes = firebaseOperations.escucharClientes((clientesActualizados) => {
        console.log('Puntos de Venta actualizados:', clientesActualizados);
        setPuntosVenta(clientesActualizados);
      });
      
      const unsubscribePrestamos = firebaseOperations.escucharPrestamos((prestamosActualizados) => {
        console.log('Distribuciones actualizadas:', prestamosActualizados);
        setDistribuciones(prestamosActualizados);
      });

      const unsubscribeVendedoras = firebaseOperations.escucharVendedoras((vendedorasActualizadas) => {
        console.log('Ejecutivas actualizadas:', vendedorasActualizadas);
        setEjecutivas(vendedorasActualizadas);
        
        // Si el usuario está logueado, actualizar sus datos
        if (usuarioActual) {
          const ejecutivaActualizada = vendedorasActualizadas.find(v => v.id === usuarioActual.id);
          if (ejecutivaActualizada) {
            setUsuarioActual({
              ...usuarioActual,
              capitalDisponible: ejecutivaActualizada.capitalDisponible,
            });
          }
        }
      });
      
      return () => {
        if (unsubscribeClientes) unsubscribeClientes();
        if (unsubscribePrestamos) unsubscribePrestamos();
        if (unsubscribeVendedoras) unsubscribeVendedoras();
      };
    }
  }, [firebaseOperations, usuarioActual]);

  const cargarFirebase = async () => {
    try {
      const module = await import('../lib/firebaseOperations');
      console.log('Firebase cargado:', module);
      setFirebaseOperations(module);
      
      // Intentar cargar ejecutivas de Firebase
      try {
        const ejecutivasDB = await module.obtenerVendedoras();
        if (ejecutivasDB && ejecutivasDB.length > 0) {
          console.log('Ejecutivas desde Firebase:', ejecutivasDB);
          setEjecutivas(ejecutivasDB);
        } else {
          // Si no hay vendedoras, inicializar automáticamente
          console.log('No hay vendedoras en Firebase, inicializando...');
          await inicializarVendedoras(module);
        }
      } catch (err) {
        console.log('No se pudieron cargar ejecutivas de Firebase, intentando inicializar...');
        await inicializarVendedoras(module);
      }
    } catch (error) {
      console.error('Error cargando Firebase:', error);
    } finally {
      setCargando(false);
    }
  };

  const inicializarVendedoras = async (firebaseModule) => {
    try {
      const { setDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebaseClient');

      const vendedorasIniciales = [
        { id: '1', nombre: 'Yaney', pin: '1234', color: '#ef4444', capitalDisponible: 20000000, esAdmin: false },
        { id: '2', nombre: 'Patricia', pin: '5678', color: '#3b82f6', capitalDisponible: 3200000, esAdmin: false },
        { id: '0', nombre: 'Admin', pin: '0000', color: '#a855f7', capitalDisponible: 0, esAdmin: true },
      ];

      for (const vendedora of vendedorasIniciales) {
        const vendedoraRef = doc(db, 'vendedoras', vendedora.id);
        await setDoc(vendedoraRef, {
          ...vendedora,
          createdAt: new Date().toISOString(),
        });
      }

      console.log('✅ Vendedoras inicializadas en Firebase');
      setEjecutivas(vendedorasIniciales);
    } catch (error) {
      console.error('Error inicializando vendedoras:', error);
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
    console.log('Login:', vendedora);
    setUsuarioActual(vendedora);
    setVistaActual(vendedora.esAdmin ? 'admin' : 'home');
  };

  const handleCrearPuntoVenta = async (puntoVentaData) => {
    try {
      console.log('handleCrearPuntoVenta - datos:', puntoVentaData);
      
      if (!firebaseOperations || !firebaseOperations.guardarCliente) {
        throw new Error('firebaseOperations no disponible');
      }

      const datosGuardar = {
        ...puntoVentaData,
        vendedoraId: usuarioActual.id,
      };
      
      console.log('Guardando:', datosGuardar);
      const id = await firebaseOperations.guardarCliente(datosGuardar);
      console.log('Punto de Venta guardado con ID:', id);
      
      return { ...puntoVentaData, id };
    } catch (error) {
      console.error('Error handleCrearPuntoVenta:', error);
      alert('Error: ' + error.message);
      throw error;
    }
  };

  const handleCrearDistribucion = async (distribucionData) => {
    try {
      if (!firebaseOperations) throw new Error('Firebase no disponible');
      
      const monto = distribucionData.monto || distribucionData.valorTotal;
      
      // Guardar distribución
      await firebaseOperations.guardarPrestamo({
        ...distribucionData,
        vendedoraId: usuarioActual.id,
      });
      
      // Actualizar inventario disponible de la ejecutiva (restar)
      const nuevoCapitalDisponible = usuarioActual.capitalDisponible - monto;
      
      await firebaseOperations.actualizarVendedora(usuarioActual.id, {
        capitalDisponible: nuevoCapitalDisponible,
      });
      
      // Actualizar estado local
      setUsuarioActual({
        ...usuarioActual,
        capitalDisponible: nuevoCapitalDisponible,
      });
      
      // Recargar ejecutivas si es necesario
      const vendedorasActualizadas = vendedoras.map(v => 
        v.id === usuarioActual.id 
          ? { ...v, capitalDisponible: nuevoCapitalDisponible }
          : v
      );
      
      console.log('Préstamo creado, capital actualizado');
    } catch (error) {
      console.error('Error handleCrearPrestamo:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleRegistrarPago = async (clienteId, prestamoIdx) => {
    try {
      if (!firebaseOperations) throw new Error('Firebase no disponible');
      
      const prestamosDelCliente = prestamos.filter(p => p.clienteId === clienteId && p.estado === 'activo');
      
      if (prestamoIdx !== undefined && prestamosDelCliente[prestamoIdx]) {
        const prestamo = prestamosDelCliente[prestamoIdx];
        const cuotaDiaria = prestamo.cuotaDiaria || prestamo.monto * 1.2 / 24;
        const nuevosCuotasPagadas = (prestamo.cuotasPagadas || 0) + 1;
        
        // Si llegó a 24 cuotas, marcar como pagado
        const nuevoEstado = nuevosCuotasPagadas >= 24 ? 'pagado' : 'activo';
        
        // Actualizar préstamo
        await firebaseOperations.actualizarPrestamo(prestamo.id, {
          cuotasPagadas: nuevosCuotasPagadas,
          estado: nuevoEstado,
          ultimoPago: new Date().toISOString(), // Guardar fecha del pago
        });
        
        // Actualizar capital disponible de la vendedora (sumar cuota)
        const nuevoCapitalDisponible = usuarioActual.capitalDisponible + cuotaDiaria;
        
        await firebaseOperations.actualizarVendedora(usuarioActual.id, {
          capitalDisponible: nuevoCapitalDisponible,
        });
        
        // Actualizar estado local
        setUsuarioActual({
          ...usuarioActual,
          capitalDisponible: nuevoCapitalDisponible,
        });
        
        console.log('Pago registrado, capital disponible actualizado');
        if (nuevoEstado === 'pagado') {
          alert('✅ ¡Préstamo completamente pagado!');
        }
      }
    } catch (error) {
      console.error('Error handleRegistrarPago:', error);
      alert('Error: ' + error.message);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (vistaActual === 'login') {
    return (
      <LoginView 
        vendedoras={vendedoras}
        onLogin={handleLogin}
      />
    );
  }

  if (vistaActual === 'admin' && usuarioActual && usuarioActual.esAdmin) {
    return (
      <AdminDashboard
        usuarioActual={usuarioActual}
        vendedoras={vendedoras}
        clientes={clientes}
        prestamos={prestamos}
        formatCurrency={formatCurrency}
        onCerrarSesion={() => {
          setUsuarioActual(null);
          setVistaActual('login');
        }}
        firebaseOperations={firebaseOperations}
      />
    );
  }

  if (vistaActual === 'home' && usuarioActual) {
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

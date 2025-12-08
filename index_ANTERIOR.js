import React, { useState, useEffect, useMemo } from 'react';
import LoginView from '../components/LoginView';
import HomeView from '../components/HomeView';
import AdminDashboard from '../components/AdminDashboard';

export default function Home() {
  const [firebaseOperations, setFirebaseOperations] = useState(null);
  const [vistaActual, setVistaActual] = useState('login');
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [vendedoras, setVendedoras] = useState([
    { id: 1, nombre: 'Yaney', pin: '1234', color: '#ef4444', capitalDisponible: 20000000 },
    { id: 2, nombre: 'Patricia', pin: '5678', color: '#3b82f6', capitalDisponible: 3200000 },
    { id: 'admin', nombre: 'Admin', pin: '0000', color: '#8b5cf6', esAdmin: true }
  ]);
  const [cargando, setCargando] = useState(true);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarModalPrestamo, setMostrarModalPrestamo] = useState(false);

  // Cargar Firebase
  const cargarFirebase = async () => {
    try {
      const module = await import('../lib/firebaseOperations');
      console.log('Firebase cargado:', module);
      setFirebaseOperations(module);
      
      // Intentar cargar vendedoras de Firebase
      try {
        const vendedorasDB = await module.obtenerVendedoras();
        if (vendedorasDB && vendedorasDB.length > 0) {
          console.log('Vendedoras desde Firebase:', vendedorasDB);
          setVendedoras(vendedorasDB);
        }
      } catch (err) {
        console.log('No se pudieron cargar vendedoras de Firebase, usando predeterminadas');
      }
    } catch (error) {
      console.error('Error cargando Firebase:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarFirebase();
  }, []);

  // Listeners de Firebase
  useEffect(() => {
    if (firebaseOperations) {
      console.log('Agregando listeners de Firebase...');
      
      const unsubscribeClientes = firebaseOperations.escucharClientes((clientesActualizados) => {
        console.log('Clientes actualizados:', clientesActualizados);
        setClientes(clientesActualizados);
      });
      
      const unsubscribePrestamos = firebaseOperations.escucharPrestamos((prestamosActualizados) => {
        console.log('Préstamos actualizados:', prestamosActualizados);
        setPrestamos(prestamosActualizados);
      });

      const unsubscribeVendedoras = firebaseOperations.escucharVendedoras((vendedorasActualizadas) => {
        console.log('Vendedoras actualizadas:', vendedorasActualizadas);
        setVendedoras(vendedorasActualizadas);
        
        // Si el usuario está logueado, actualizar sus datos
        if (usuarioActual) {
          const vendedoraActualizada = vendedorasActualizadas.find(v => v.id === usuarioActual.id);
          if (vendedoraActualizada) {
            setUsuarioActual({
              ...usuarioActual,
              capitalDisponible: vendedoraActualizada.capitalDisponible,
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

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleLogin = (vendedora) => {
    console.log('Login con:', vendedora);
    setUsuarioActual(vendedora);
    setVistaActual('home');
  };

  const handleCerrarSesion = () => {
    setUsuarioActual(null);
    setVistaActual('login');
  };

  const handleCrearPrestamo = async (prestamoData) => {
    try {
      if (!firebaseOperations) throw new Error('Firebase no disponible');
      
      const monto = prestamoData.monto || prestamoData.valorTotal;
      
      // Guardar préstamo
      await firebaseOperations.guardarPrestamo({
        ...prestamoData,
        vendedoraId: usuarioActual.id,
      });
      
      // Actualizar capital disponible de la vendedora (restar)
      const nuevoCapitalDisponible = usuarioActual.capitalDisponible - monto;
      
      await firebaseOperations.actualizarVendedora(usuarioActual.id, {
        capitalDisponible: nuevoCapitalDisponible,
      });
      
      // Actualizar estado local
      setUsuarioActual({
        ...usuarioActual,
        capitalDisponible: nuevoCapitalDisponible,
      });
      
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
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg font-semibold">Cargando Inversiones...</p>
        </div>
      </div>
    );
  }

  if (vistaActual === 'login') {
    return <LoginView vendedoras={vendedoras} onLogin={handleLogin} />;
  }

  if (usuarioActual.esAdmin) {
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

  return (
    <HomeView
      usuarioActual={usuarioActual}
      clientes={clientes}
      prestamos={prestamos}
      formatCurrency={formatCurrency}
      onCerrarSesion={handleCerrarSesion}
      onCrearPrestamo={handleCrearPrestamo}
      onRegistrarPago={handleRegistrarPago}
      clienteSeleccionado={clienteSeleccionado}
      mostrarModalPrestamo={mostrarModalPrestamo}
      setMostrarModalPrestamo={setMostrarModalPrestamo}
      setClienteSeleccionado={setClienteSeleccionado}
    />
  );
}

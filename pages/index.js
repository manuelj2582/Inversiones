import React, { useState, useEffect } from 'react';
import LoginView from '../components/LoginView';
import HomeView from '../components/HomeView';

export default function Home() {
  const [vistaActual, setVistaActual] = useState('login');
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [firebaseOps, setFirebaseOps] = useState(null);
  
  const [vendedoras, setVendedoras] = useState([
    { id: 1, nombre: 'Carolina', pin: '1234', color: '#ef4444', capitalDisponible: 2500000 },
    { id: 2, nombre: 'Patricia', pin: '5678', color: '#3b82f6', capitalDisponible: 3200000 },
    { id: 'admin', nombre: 'Admin', pin: '0000', color: '#8b5cf6', esAdmin: true }
  ]);

  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('../lib/firebaseOperations').then(ops => {
        setFirebaseOps(ops);
        cargarDatos(ops);
      }).catch(() => setCargando(false));
    }
  }, []);

  const cargarDatos = async (ops) => {
    try {
      const [c, p] = await Promise.all([
        ops.obtenerClientes(),
        ops.obtenerPrestamos()
      ]);
      setClientes(c);
      setPrestamos(p);
      
      ops.escucharClientes(setClientes);
      ops.escucharPrestamos(setPrestamos);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const handleLogin = (vendedora) => {
    setUsuarioActual(vendedora);
    setVistaActual('home');
  };

  if (vistaActual === 'login') {
    return <LoginView vendedoras={vendedoras} onLogin={handleLogin} cargando={cargando} />;
  }

  return (
    <HomeView 
      usuario={usuarioActual}
      clientes={clientes}
      prestamos={prestamos}
      vendedoras={vendedoras}
      setVendedoras={setVendedoras}
      setUsuarioActual={setUsuarioActual}
      firebaseOps={firebaseOps}
      onLogout={() => {
        setUsuarioActual(null);
        setVistaActual('login');
      }}
    />
  );
}
import React, { useState } from 'react';

const SistemaInversiones = () => {
  const [vistaActual, setVistaActual] = useState('login');
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('pendientes');
  const [mostrarModalPrestamo, setMostrarModalPrestamo] = useState(false);
  const [mostrarReportes, setMostrarReportes] = useState(false);
  const [paso, setPaso] = useState(1); // 1: elegir acción, 2: buscar/crear cliente, 3: confirmar préstamo
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    zona: '',
    direccion: ''
  });
  const [montoPrestamo, setMontoPrestamo] = useState('');

  const [vendedoras, setVendedoras] = useState([
    { id: 1, nombre: 'Carolina', pin: '1234', color: '#ef4444', capitalDisponible: 2500000 },
    { id: 2, nombre: 'Patricia', pin: '5678', color: '#3b82f6', capitalDisponible: 3200000 }
  ]);

  const [clientes, setClientes] = useState([
    {
      id: 1,
      nombre: 'Juan Pérez',
      cedula: '123456789',
      telefono: '3001234567',
      zona: 'Centro',
      vendedoraId: 1
    },
    {
      id: 2,
      nombre: 'María García',
      cedula: '987654321',
      telefono: '3109876543',
      zona: 'Norte',
      vendedoraId: 1
    },
    {
      id: 3,
      nombre: 'Carlos Rodríguez',
      cedula: '456789123',
      telefono: '3156789012',
      zona: 'Sur',
      vendedoraId: 2
    }
  ]);

  const [prestamos, setPrestamos] = useState([
    {
      id: 1,
      clienteId: 1,
      vendedoraId: 1,
      valorTotal: 500000,
      cuotaDiaria: 25000,
      cuotasPagadas: 10,
      totalCuotas: 24,
      ultimoPago: '2025-01-25',
      estado: 'activo'
    },
    {
      id: 2,
      clienteId: 2,
      vendedoraId: 1,
      valorTotal: 300000,
      cuotaDiaria: 15000,
      cuotasPagadas: 5,
      totalCuotas: 24,
      ultimoPago: '2025-01-24',
      estado: 'activo'
    },
    {
      id: 3,
      clienteId: 3,
      vendedoraId: 2,
      valorTotal: 400000,
      cuotaDiaria: 20000,
      cuotasPagadas: 15,
      totalCuotas: 24,
      ultimoPago: '2025-01-25',
      estado: 'activo'
    }
  ]);

  const crearCliente = () => {
    if (!nuevoCliente.nombre || !nuevoCliente.cedula || !nuevoCliente.telefono) {
      alert('Por favor completa nombre, cédula y teléfono');
      return;
    }

    const cliente = {
      id: Date.now(),
      ...nuevoCliente,
      vendedoraId: usuarioActual.id
    };

    setClientes([...clientes, cliente]);
    setClienteSeleccionado(cliente);
    setPaso(3);
    setNuevoCliente({ nombre: '', cedula: '', telefono: '', zona: '', direccion: '' });
  };

  const crearPrestamo = () => {
    const monto = parseFloat(montoPrestamo);
    
    if (!monto || monto <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    if (monto > usuarioActual.capitalDisponible) {
      alert('No tienes suficiente capital disponible');
      return;
    }

    const montoTotal = monto * 1.20;
    const cuotaDiaria = Math.round(montoTotal / 24);

    const prestamo = {
      id: Date.now(),
      clienteId: clienteSeleccionado.id,
      vendedoraId: usuarioActual.id,
      valorTotal: monto,
      cuotaDiaria: cuotaDiaria,
      cuotasPagadas: 0,
      totalCuotas: 24,
      ultimoPago: null,
      estado: 'activo'
    };

    setPrestamos([...prestamos, prestamo]);
    
    // Actualizar capital disponible de la vendedora
    const nuevasVendedoras = vendedoras.map(v => {
      if (v.id === usuarioActual.id) {
        return { ...v, capitalDisponible: v.capitalDisponible - monto };
      }
      return v;
    });
    setVendedoras(nuevasVendedoras);
    
    // Actualizar usuario actual
    const vendedoraActualizada = nuevasVendedoras.find(v => v.id === usuarioActual.id);
    setUsuarioActual(vendedoraActualizada);

    alert('¡Préstamo creado exitosamente!');
    cerrarModal();
  };

  const cerrarModal = () => {
    setMostrarModalPrestamo(false);
    setPaso(1);
    setClienteSeleccionado(null);
    setBusquedaCliente('');
    setMontoPrestamo('');
  };

  const misClientesSinPrestamo = clientes
    .filter(c => c.vendedoraId === usuarioActual?.id)
    .filter(c => !prestamos.find(p => p.clienteId === c.id && p.estado === 'activo'))
    .filter(c => c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) || 
                 c.cedula.includes(busquedaCliente));

  const getDiasAtraso = (clienteId) => {
    const prestamo = getPrestamoActivo(clienteId);
    if (!prestamo || !prestamo.ultimoPago) return 0;
    
    const hoy = new Date();
    const ultimoPago = new Date(prestamo.ultimoPago);
    const diffTime = Math.abs(hoy - ultimoPago);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEstadoMora = (clienteId) => {
    const dias = getDiasAtraso(clienteId);
    if (dias === 0) return 'al-dia';
    if (dias === 1) return 'alerta';
    return 'mora';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const registrarPago = (clienteId) => {
    const hoy = new Date().toISOString().split('T')[0];
    setPrestamos(prestamos.map(p => {
      if (p.clienteId === clienteId && p.estado === 'activo') {
        return {
          ...p,
          cuotasPagadas: p.cuotasPagadas + 1,
          ultimoPago: hoy
        };
      }
      return p;
    }));
  };

  const yaPagoHoy = (clienteId) => {
    const hoy = new Date().toISOString().split('T')[0];
    const prestamo = prestamos.find(p => p.clienteId === clienteId && p.estado === 'activo');
    return prestamo && prestamo.ultimoPago === hoy;
  };

  const getPrestamoActivo = (clienteId) => {
    return prestamos.find(p => p.clienteId === clienteId && p.estado === 'activo');
  };

  const misClientes = clientes.filter(c => c.vendedoraId === usuarioActual?.id);
  
  const clientesFiltrados = misClientes.filter(c => {
    const prestamo = getPrestamoActivo(c.id);
    if (!prestamo) return false;
    
    const cumpleBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          c.cedula.includes(busqueda) ||
                          c.zona.toLowerCase().includes(busqueda.toLowerCase());
    
    if (filtro === 'pendientes') {
      return cumpleBusqueda && !yaPagoHoy(c.id) && prestamo.cuotasPagadas < prestamo.totalCuotas;
    } else if (filtro === 'cobrados') {
      return cumpleBusqueda && yaPagoHoy(c.id);
    }
    return cumpleBusqueda && prestamo.cuotasPagadas < prestamo.totalCuotas;
  });

  const estadisticas = {
    pendientes: misClientes.filter(c => {
      const prestamo = getPrestamoActivo(c.id);
      return prestamo && !yaPagoHoy(c.id) && prestamo.cuotasPagadas < prestamo.totalCuotas;
    }).length,
    cobradosHoy: misClientes.filter(c => yaPagoHoy(c.id)).length,
    totalRecaudarHoy: misClientes.reduce((sum, c) => {
      const prestamo = getPrestamoActivo(c.id);
      if (prestamo && !yaPagoHoy(c.id) && prestamo.cuotasPagadas < prestamo.totalCuotas) {
        return sum + prestamo.cuotaDiaria;
      }
      return sum;
    }, 0),
    recaudadoHoy: misClientes.reduce((sum, c) => {
      const prestamo = getPrestamoActivo(c.id);
      if (prestamo && yaPagoHoy(c.id)) {
        return sum + prestamo.cuotaDiaria;
      }
      return sum;
    }, 0)
  };

  const LoginView = () => {
    const [pin, setPin] = useState('');
    const [vendedoraSeleccionada, setVendedoraSeleccionada] = useState(null);

    const handleLogin = () => {
      if (!vendedoraSeleccionada) {
        alert('Por favor selecciona tu usuario');
        return;
      }
      const vendedora = vendedoras.find(v => v.id === vendedoraSeleccionada && v.pin === pin);
      if (vendedora) {
        setUsuarioActual(vendedora);
        setVistaActual('home');
      } else {
        alert('PIN incorrecto');
      }
    };

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          padding: '40px',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              background: '#d1fae5',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '40px'
            }}>📦</div>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>Inversiones</h1>
            <p style={{ color: '#6b7280' }}>Control de Inventario</p>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              Selecciona tu usuario
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {vendedoras.map(v => (
                <button
                  key={v.id}
                  onClick={() => setVendedoraSeleccionada(v.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '16px',
                    borderRadius: '12px',
                    border: vendedoraSeleccionada === v.id ? '3px solid #10b981' : '2px solid #e5e7eb',
                    background: vendedoraSeleccionada === v.id ? '#d1fae5' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: v.color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginRight: '12px'
                  }}>
                    {v.nombre.charAt(0)}
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>{v.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Ingresa tu PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              maxLength="4"
              placeholder="••••"
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                border: '2px solid #d1d5db',
                borderRadius: '12px',
                padding: '16px',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={!vendedoraSeleccionada}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '18px',
              fontWeight: 'bold',
              background: vendedoraSeleccionada ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' : '#d1d5db',
              color: 'white',
              cursor: vendedoraSeleccionada ? 'pointer' : 'not-allowed',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            Ingresar
          </button>
        </div>
      </div>
    );
  };

  const HomeView = () => (
    <div style={{ minHeight: '100vh', background: '#f9fafb', paddingBottom: '100px' }}>
      {/* Botones navegación inferior */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        padding: '12px',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        zIndex: 50
      }}>
        <button
          onClick={() => setMostrarReportes(false)}
          style={{
            flex: 1,
            padding: '12px',
            background: !mostrarReportes ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' : 'transparent',
            color: !mostrarReportes ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            margin: '0 4px'
          }}
        >
          🏠 Inicio
        </button>
        <button
          onClick={() => setMostrarReportes(true)}
          style={{
            flex: 1,
            padding: '12px',
            background: mostrarReportes ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' : 'transparent',
            color: mostrarReportes ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            margin: '0 4px'
          }}
        >
          📊 Reportes
        </button>
      </div>

      {!mostrarReportes ? (
        <>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
        color: 'white',
        padding: '24px',
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Hola, {usuarioActual?.nombre}! 👋</h2>
            <p style={{ fontSize: '14px', opacity: 0.9, margin: '4px 0 0 0' }}>
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm('¿Cerrar sesión?')) {
                setUsuarioActual(null);
                setVistaActual('login');
              }
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            👤
          </button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>💰 Capital Disponible</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatCurrency(usuarioActual?.capitalDisponible || 0)}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Pendientes Hoy</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{estadisticas.pendientes}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>{formatCurrency(estadisticas.totalRecaudarHoy)}</div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Recaudados Hoy</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{estadisticas.cobradosHoy}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>{formatCurrency(estadisticas.recaudadoHoy)}</div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar cliente..."
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            border: '2px solid #e5e7eb',
            borderRadius: '16px',
            outline: 'none'
          }}
        />
      </div>

      {/* Filtros */}
      <div style={{ padding: '0 16px', marginBottom: '16px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {['pendientes', 'cobrados', 'todos'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: '12px 24px',
              borderRadius: '20px',
              border: 'none',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              background: filtro === f ? '#10b981' : 'white',
              color: filtro === f ? 'white' : '#6b7280',
              cursor: 'pointer',
              border: filtro === f ? 'none' : '2px solid #e5e7eb'
            }}
          >
            {f === 'pendientes' ? '⏰ Pendientes' : f === 'cobrados' ? '✓ Cobrados' : '📦 Todos'}
          </button>
        ))}
      </div>

      {/* Tarjetas de clientes */}
      <div style={{ padding: '0 16px' }}>
        {clientesFiltrados.map(cliente => {
          const prestamo = getPrestamoActivo(cliente.id);
          if (!prestamo) return null;
          
          const pagado = yaPagoHoy(cliente.id);
          const progreso = (prestamo.cuotasPagadas / prestamo.totalCuotas) * 100;

          return (
            <div
              key={cliente.id}
              style={{
                background: pagado ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 
                           getEstadoMora(cliente.id) === 'mora' ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' :
                           getEstadoMora(cliente.id) === 'alerta' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' :
                           'white',
                border: pagado ? '2px solid #10b981' : 
                       getEstadoMora(cliente.id) === 'mora' ? '2px solid #ef4444' :
                       getEstadoMora(cliente.id) === 'alerta' ? '2px solid #f59e0b' :
                       '2px solid #e5e7eb',
                borderRadius: '16px',
                marginBottom: '16px',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{cliente.nombre}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>📍 {cliente.zona}</p>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>📞 {cliente.telefono}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    {pagado && (
                      <div style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        ✓ PAGÓ
                      </div>
                    )}
                    {!pagado && getEstadoMora(cliente.id) === 'mora' && (
                      <div style={{
                        background: '#ef4444',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        🚨 MORA {getDiasAtraso(cliente.id)} días
                      </div>
                    )}
                    {!pagado && getEstadoMora(cliente.id) === 'alerta' && (
                      <div style={{
                        background: '#f59e0b',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        ⚠️ 1 día atraso
                      </div>
                    )}
                    {!pagado && (
                      <a 
                        href={`tel:${cliente.telefono}`}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textDecoration: 'none'
                        }}
                      >
                        📞 Llamar
                      </a>
                    )}
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Cuota Diaria</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{formatCurrency(prestamo.cuotaDiaria)}</div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span>Progreso</span>
                    <span style={{ fontWeight: 'bold' }}>{prestamo.cuotasPagadas}/{prestamo.totalCuotas}</span>
                  </div>
                  <div style={{ width: '100%', height: '12px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${progreso}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981 0%, #14b8a6 100%)',
                      transition: 'width 0.5s'
                    }}></div>
                  </div>
                </div>
              </div>

              {!pagado && (
                <button
                  onClick={() => {
                    if (confirm(`¿Confirmar pago de ${formatCurrency(prestamo.cuotaDiaria)}?`)) {
                      registrarPago(cliente.id);
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '20px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ✓ REGISTRAR PAGO
                </button>
              )}
            </div>
          );
        })}

        {clientesFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <p style={{ color: '#6b7280' }}>No hay clientes para mostrar</p>
          </div>
        )}
      </div>

      {/* Botón flotante Nuevo Préstamo */}
      {!mostrarReportes && (
        <button
          onClick={() => setMostrarModalPrestamo(true)}
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            fontSize: '32px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
        >
          ➕
        </button>
      )}
        </>
      ) : (
        <ReportesView />
      )}

      {/* Modal Nuevo Préstamo */}
      {mostrarModalPrestamo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* PASO 1: Elegir acción */}
            {paso === 1 && (
              <>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Nuevo Préstamo</h2>
                
                <button
                  onClick={() => setPaso(2)}
                  style={{
                    width: '100%',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🔍 Buscar Cliente Existente
                </button>

                <button
                  onClick={() => { setPaso(2); setBusquedaCliente('NUEVO'); }}
                  style={{
                    width: '100%',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ➕ Crear Nuevo Cliente
                </button>

                <button
                  onClick={cerrarModal}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </>
            )}

            {/* PASO 2: Buscar o crear cliente */}
            {paso === 2 && (
              <>
                {busquedaCliente === 'NUEVO' ? (
                  <>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Crear Nuevo Cliente</h2>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={nuevoCliente.nombre}
                        onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                        placeholder="Juan Pérez"
                        autoComplete="off"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        Cédula *
                      </label>
                      <input
                        type="text"
                        value={nuevoCliente.cedula}
                        onChange={(e) => setNuevoCliente({...nuevoCliente, cedula: e.target.value})}
                        placeholder="1234567890"
                        autoComplete="off"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={nuevoCliente.telefono}
                        onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                        placeholder="3001234567"
                        autoComplete="off"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        Zona/Barrio
                      </label>
                      <input
                        type="text"
                        value={nuevoCliente.zona}
                        onChange={(e) => setNuevoCliente({...nuevoCliente, zona: e.target.value})}
                        placeholder="Centro"
                        autoComplete="off"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={nuevoCliente.direccion}
                        onChange={(e) => setNuevoCliente({...nuevoCliente, direccion: e.target.value})}
                        placeholder="Calle 123 #45-67"
                        autoComplete="off"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <button
                      onClick={crearCliente}
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Continuar con Préstamo
                    </button>

                    <button
                      onClick={() => { setPaso(1); setBusquedaCliente(''); }}
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: '#f3f4f6',
                        color: '#6b7280',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Atrás
                    </button>
                  </>
                ) : (
                  <>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Buscar Cliente</h2>
                    
                    <input
                      type="text"
                      value={busquedaCliente}
                      onChange={(e) => setBusquedaCliente(e.target.value)}
                      placeholder="🔍 Buscar por nombre o cédula..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        marginBottom: '16px'
                      }}
                    />

                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                      {misClientesSinPrestamo.map(cliente => (
                        <button
                          key={cliente.id}
                          onClick={() => {
                            setClienteSeleccionado(cliente);
                            setPaso(3);
                          }}
                          style={{
                            width: '100%',
                            padding: '16px',
                            background: 'white',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            marginBottom: '8px',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{cliente.nombre}</div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>📍 {cliente.zona} | 📞 {cliente.telefono}</div>
                        </button>
                      ))}

                      {misClientesSinPrestamo.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                          No hay clientes disponibles
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setPaso(1)}
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: '#f3f4f6',
                        color: '#6b7280',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Atrás
                    </button>
                  </>
                )}
              </>
            )}

            {/* PASO 3: Confirmar préstamo */}
            {paso === 3 && clienteSeleccionado && (
              <>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Confirmar Préstamo</h2>
                
                <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>Cliente:</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>{clienteSeleccionado.nombre}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>📍 {clienteSeleccionado.zona}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>📞 {clienteSeleccionado.telefono}</div>
                </div>

                <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', marginBottom: '4px' }}>Tu capital disponible:</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                    {formatCurrency(usuarioActual.capitalDisponible)}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Monto a Prestar *
                  </label>
                  <input
                    type="number"
                    value={montoPrestamo}
                    onChange={(e) => setMontoPrestamo(e.target.value)}
                    placeholder="500000"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '20px',
                      fontWeight: 'bold'
                    }}
                  />
                </div>

                {montoPrestamo && (
                  <div style={{ background: '#d1fae5', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>Resumen:</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Monto prestado:</span>
                      <span style={{ fontWeight: 'bold' }}>{formatCurrency(parseFloat(montoPrestamo))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Total a recibir (+20%):</span>
                      <span style={{ fontWeight: 'bold' }}>{formatCurrency(parseFloat(montoPrestamo) * 1.20)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Cuota diaria (24 días):</span>
                      <span style={{ fontWeight: 'bold', color: '#10b981' }}>
                        {formatCurrency(Math.round((parseFloat(montoPrestamo) * 1.20) / 24))}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={crearPrestamo}
                  disabled={!montoPrestamo || parseFloat(montoPrestamo) <= 0}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: montoPrestamo && parseFloat(montoPrestamo) > 0 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                      : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    cursor: montoPrestamo && parseFloat(montoPrestamo) > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  ✓ Crear Préstamo
                </button>

                <button
                  onClick={() => { setPaso(2); setMontoPrestamo(''); }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Atrás
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const ReportesView = () => {
    const misClientesActivos = clientes.filter(c => {
      const prestamo = getPrestamoActivo(c.id);
      return c.vendedoraId === usuarioActual.id && prestamo;
    });

    const totalPrestado = misClientesActivos.reduce((sum, c) => {
      const prestamo = getPrestamoActivo(c.id);
      return sum + (prestamo?.valorTotal || 0);
    }, 0);

    const totalPorRecaudar = misClientesActivos.reduce((sum, c) => {
      const prestamo = getPrestamoActivo(c.id);
      if (!prestamo) return sum;
      return sum + (prestamo.cuotaDiaria * (prestamo.totalCuotas - prestamo.cuotasPagadas));
    }, 0);

    const interesesGenerados = misClientesActivos.reduce((sum, c) => {
      const prestamo = getPrestamoActivo(c.id);
      if (!prestamo) return sum;
      const totalRecaudado = prestamo.cuotaDiaria * prestamo.cuotasPagadas;
      return sum + Math.max(0, totalRecaudado - prestamo.valorTotal);
    }, 0);

    const clientesMora = misClientesActivos.filter(c => getEstadoMora(c.id) === 'mora').length;
    const clientesAlerta = misClientesActivos.filter(c => getEstadoMora(c.id) === 'alerta').length;

    return (
      <div style={{ padding: '20px', paddingBottom: '80px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', marginTop: '20px' }}>
          📊 Mis Reportes
        </h2>

        {/* Resumen financiero */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>💰 Resumen Financiero</h3>
          
          <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Capital Disponible</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
              {formatCurrency(usuarioActual.capitalDisponible)}
            </div>
          </div>

          <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Prestado</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {formatCurrency(totalPrestado)}
            </div>
          </div>

          <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Por Recaudar</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              {formatCurrency(totalPorRecaudar)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Intereses Generados</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
              {formatCurrency(interesesGenerados)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', background: '#f3f4f6', padding: '8px', borderRadius: '8px' }}>
              <div>• 65% Reinversión: {formatCurrency(interesesGenerados * 0.65)}</div>
              <div>• 25% Para ti: {formatCurrency(interesesGenerados * 0.25)}</div>
              <div>• 10% Dueño: {formatCurrency(interesesGenerados * 0.10)}</div>
            </div>
          </div>
        </div>

        {/* Estado de cartera */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>📈 Estado de Cartera</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#d1fae5', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{misClientesActivos.length}</div>
              <div style={{ fontSize: '14px', color: '#059669' }}>Clientes Activos</div>
            </div>

            <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{estadisticas.cobradosHoy}</div>
              <div style={{ fontSize: '14px', color: '#2563eb' }}>Cobrados Hoy</div>
            </div>

            <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{clientesAlerta}</div>
              <div style={{ fontSize: '14px', color: '#d97706' }}>En Alerta (1 día)</div>
            </div>

            <div style={{ background: '#fee2e2', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>{clientesMora}</div>
              <div style={{ fontSize: '14px', color: '#dc2626' }}>En Mora (2+ días)</div>
            </div>
          </div>
        </div>

        {/* Lista de clientes en mora */}
        {(clientesMora > 0 || clientesAlerta > 0) && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>
              🚨 Clientes con Atraso
            </h3>
            
            {misClientesActivos
              .filter(c => getEstadoMora(c.id) !== 'al-dia' && !yaPagoHoy(c.id))
              .sort((a, b) => getDiasAtraso(b.id) - getDiasAtraso(a.id))
              .map(cliente => {
                const prestamo = getPrestamoActivo(cliente.id);
                const diasAtraso = getDiasAtraso(cliente.id);
                const estadoMora = getEstadoMora(cliente.id);

                return (
                  <div
                    key={cliente.id}
                    style={{
                      background: estadoMora === 'mora' ? '#fee2e2' : '#fef3c7',
                      border: estadoMora === 'mora' ? '2px solid #ef4444' : '2px solid #f59e0b',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{cliente.nombre}</div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>📍 {cliente.zona}</div>
                      </div>
                      <div style={{
                        background: estadoMora === 'mora' ? '#ef4444' : '#f59e0b',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {diasAtraso} día{diasAtraso > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                      Debe: <strong>{formatCurrency(prestamo?.cuotaDiaria || 0)}</strong>
                    </div>
                    <a
                      href={`tel:${cliente.telefono}`}
                      style={{
                        display: 'inline-block',
                        background: '#3b82f6',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      📞 Llamar ahora
                    </a>
                  </div>
                );
              })}
          </div>
        )}

        {/* Resumen semanal */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>📅 Esta Semana</h3>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            Recaudado hoy: <strong style={{ color: '#10b981' }}>{formatCurrency(estadisticas.recaudadoHoy)}</strong>
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            Pendiente hoy: <strong style={{ color: '#f59e0b' }}>{formatCurrency(estadisticas.totalRecaudarHoy)}</strong>
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Clientes pendientes: <strong>{estadisticas.pendientes}</strong>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {vistaActual === 'login' && <LoginView />}
      {vistaActual === 'home' && usuarioActual && <HomeView />}
    </div>
  );
};

export default SistemaInversiones;
import React, { useState } from 'react';

const SistemaInversiones = () => {
  const [vistaActual, setVistaActual] = useState('login');
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('pendientes');
  const [mostrarModalPrestamo, setMostrarModalPrestamo] = useState(false);
  const [paso, setPaso] = useState(1); // 1: elegir acción, 2: buscar/crear cliente, 3: confirmar préstamo

  const [vendedoras] = useState([
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
                background: pagado ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'white',
                border: pagado ? '2px solid #10b981' : '2px solid #e5e7eb',
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
                  {pagado && (
                    <div style={{
                      background: '#10b981',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      height: 'fit-content'
                    }}>
                      ✓ PAGÓ
                    </div>
                  )}
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
      <button
        onClick={() => setMostrarModalPrestamo(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
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

      {/* Modal Nuevo Préstamo - CONTINUARÁ EN SIGUIENTE PARTE */}
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
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Nuevo Préstamo</h2>
            
            <button
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
              onClick={() => setMostrarModalPrestamo(false)}
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
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {vistaActual === 'login' && <LoginView />}
      {vistaActual === 'home' && usuarioActual && <HomeView />}
    </div>
  );
};

export default SistemaInversiones;
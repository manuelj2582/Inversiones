import React, { useState } from 'react';

const SistemaInversiones = () => {
  const [vistaActual, setVistaActual] = useState('login');
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('pendientes');

  const vendedoras = [
    { id: 1, nombre: 'Carolina', pin: '1234', color: '#ef4444' },
    { id: 2, nombre: 'Patricia', pin: '5678', color: '#3b82f6' }
  ];

  const [clientes, setClientes] = useState([
    {
      id: 1,
      nombre: 'Juan Pérez',
      cedula: '123456789',
      telefono: '3001234567',
      zona: 'Centro',
      vendedoraId: 1,
      pedido: {
        valorTotal: 500000,
        cuotaDiaria: 25000,
        cuotasPagadas: 10,
        totalCuotas: 24,
        ultimoPago: '2025-01-25'
      }
    },
    {
      id: 2,
      nombre: 'María García',
      cedula: '987654321',
      telefono: '3109876543',
      zona: 'Norte',
      vendedoraId: 1,
      pedido: {
        valorTotal: 300000,
        cuotaDiaria: 15000,
        cuotasPagadas: 5,
        totalCuotas: 24,
        ultimoPago: '2025-01-24'
      }
    },
    {
      id: 3,
      nombre: 'Carlos Rodríguez',
      cedula: '456789123',
      telefono: '3156789012',
      zona: 'Sur',
      vendedoraId: 2,
      pedido: {
        valorTotal: 400000,
        cuotaDiaria: 20000,
        cuotasPagadas: 15,
        totalCuotas: 24,
        ultimoPago: '2025-01-25'
      }
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
    setClientes(clientes.map(c => {
      if (c.id === clienteId) {
        return {
          ...c,
          pedido: {
            ...c.pedido,
            cuotasPagadas: c.pedido.cuotasPagadas + 1,
            ultimoPago: hoy
          }
        };
      }
      return c;
    }));
  };

  const yaPagoHoy = (cliente) => {
    const hoy = new Date().toISOString().split('T')[0];
    return cliente.pedido.ultimoPago === hoy;
  };

  const clientesFiltrados = clientes
    .filter(c => c.vendedoraId === usuarioActual?.id)
    .filter(c => {
      const cumpleBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            c.cedula.includes(busqueda) ||
                            c.zona.toLowerCase().includes(busqueda.toLowerCase());
      
      if (filtro === 'pendientes') {
        return cumpleBusqueda && !yaPagoHoy(c) && c.pedido.cuotasPagadas < c.pedido.totalCuotas;
      } else if (filtro === 'cobrados') {
        return cumpleBusqueda && yaPagoHoy(c);
      }
      return cumpleBusqueda && c.pedido.cuotasPagadas < c.pedido.totalCuotas;
    });

  const estadisticas = {
    pendientes: clientes.filter(c => c.vendedoraId === usuarioActual?.id && !yaPagoHoy(c) && c.pedido.cuotasPagadas < c.pedido.totalCuotas).length,
    cobradosHoy: clientes.filter(c => c.vendedoraId === usuarioActual?.id && yaPagoHoy(c)).length,
    totalRecaudarHoy: clientes
      .filter(c => c.vendedoraId === usuarioActual?.id && !yaPagoHoy(c) && c.pedido.cuotasPagadas < c.pedido.totalCuotas)
      .reduce((sum, c) => sum + c.pedido.cuotaDiaria, 0),
    recaudadoHoy: clientes
      .filter(c => c.vendedoraId === usuarioActual?.id && yaPagoHoy(c))
      .reduce((sum, c) => sum + c.pedido.cuotaDiaria, 0)
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

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
            Sistema v1.0
          </div>
        </div>
      </div>
    );
  };

  const HomeView = () => (
    <div style={{ minHeight: '100vh', background: '#f9fafb', paddingBottom: '80px' }}>
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
          placeholder="🔍 Buscar cliente, zona o cédula..."
          style={{
            width: '100%',
            padding: '16px 16px 16px 40px',
            fontSize: '16px',
            border: '2px solid #e5e7eb',
            borderRadius: '16px',
            outline: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        />
      </div>

      {/* Filtros */}
      <div style={{ padding: '0 16px', marginBottom: '16px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        <button
          onClick={() => setFiltro('pendientes')}
          style={{
            padding: '12px 24px',
            borderRadius: '20px',
            border: 'none',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            background: filtro === 'pendientes' ? '#ef4444' : 'white',
            color: filtro === 'pendientes' ? 'white' : '#6b7280',
            cursor: 'pointer',
            boxShadow: filtro === 'pendientes' ? '0 4px 12px rgba(239,68,68,0.3)' : 'none',
            border: filtro === 'pendientes' ? 'none' : '2px solid #e5e7eb'
          }}
        >
          ⏰ Pendientes ({estadisticas.pendientes})
        </button>
        <button
          onClick={() => setFiltro('cobrados')}
          style={{
            padding: '12px 24px',
            borderRadius: '20px',
            border: 'none',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            background: filtro === 'cobrados' ? '#10b981' : 'white',
            color: filtro === 'cobrados' ? 'white' : '#6b7280',
            cursor: 'pointer',
            boxShadow: filtro === 'cobrados' ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
            border: filtro === 'cobrados' ? 'none' : '2px solid #e5e7eb'
          }}
        >
          ✓ Cobrados ({estadisticas.cobradosHoy})
        </button>
        <button
          onClick={() => setFiltro('todos')}
          style={{
            padding: '12px 24px',
            borderRadius: '20px',
            border: 'none',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            background: filtro === 'todos' ? '#10b981' : 'white',
            color: filtro === 'todos' ? 'white' : '#6b7280',
            cursor: 'pointer',
            boxShadow: filtro === 'todos' ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
            border: filtro === 'todos' ? 'none' : '2px solid #e5e7eb'
          }}
        >
          📦 Todos
        </button>
      </div>

      {/* Tarjetas */}
      <div style={{ padding: '0 16px' }}>
        {clientesFiltrados.map(cliente => {
          const pagado = yaPagoHoy(cliente);
          const progreso = (cliente.pedido.cuotasPagadas / cliente.pedido.totalCuotas) * 100;
          const completado = cliente.pedido.cuotasPagadas >= cliente.pedido.totalCuotas;

          return (
            <div
              key={cliente.id}
              style={{
                background: pagado ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'white',
                border: pagado ? '2px solid #10b981' : '2px solid #e5e7eb',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                marginBottom: '16px',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{cliente.nombre}</h3>
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
                      height: 'fit-content',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
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
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{formatCurrency(cliente.pedido.cuotaDiaria)}</div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '500' }}>Progreso del Pedido</span>
                    <span style={{ fontWeight: 'bold' }}>{cliente.pedido.cuotasPagadas}/{cliente.pedido.totalCuotas} cuotas</span>
                  </div>
                  <div style={{ width: '100%', height: '12px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${progreso}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981 0%, #14b8a6 100%)',
                      transition: 'width 0.5s'
                    }}></div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>
                    {progreso.toFixed(0)}%
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ background: '#dbeafe', padding: '12px', borderRadius: '8px', border: '1px solid #93c5fd' }}>
                    <div style={{ fontSize: '11px', color: '#1e40af' }}>Valor Total</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af' }}>
                      {formatCurrency(cliente.pedido.valorTotal)}
                    </div>
                  </div>
                  <div style={{ background: '#fed7aa', padding: '12px', borderRadius: '8px', border: '1px solid #fb923c' }}>
                    <div style={{ fontSize: '11px', color: '#9a3412' }}>Saldo Restante</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#9a3412' }}>
                      {formatCurrency(cliente.pedido.cuotaDiaria * (cliente.pedido.totalCuotas - cliente.pedido.cuotasPagadas))}
                    </div>
                  </div>
                </div>
              </div>

              {!pagado && !completado && (
                <button
                  onClick={() => {
                    if (confirm(`¿Confirmar pago de ${formatCurrency(cliente.pedido.cuotaDiaria)} de ${cliente.nombre}?`)) {
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
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  ✓ REGISTRAR PAGO {formatCurrency(cliente.pedido.cuotaDiaria)}
                </button>
              )}

              {pagado && (
                <div style={{
                  width: '100%',
                  background: '#10b981',
                  color: 'white',
                  padding: '16px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  ✓ Registrado Hoy
                </div>
              )}
            </div>
          );
        })}

        {clientesFiltrados.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <p style={{ fontSize: '18px', fontWeight: '500', color: '#6b7280' }}>No hay clientes para mostrar</p>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>Intenta cambiar el filtro o la búsqueda</p>
          </div>
        )}
      </div>
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
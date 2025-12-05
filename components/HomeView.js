import React, { useState } from 'react';
import TarjetaCliente from './TarjetaCliente';
import ModalPrestamo from './ModalPrestamo';

export default function HomeView({ 
  usuarioActual, 
  clientes, 
  prestamos, 
  vendedoras,
  onRegistrarPago, 
  onCrearCliente,
  onCrearPrestamo,
  onCerrarSesion,
  formatCurrency,
  firebaseOperations 
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('pendientes');
  const [mostrarModalPrestamo, setMostrarModalPrestamo] = useState(false);

  const getPrestamoActivo = (clienteId) => {
    return prestamos.find(p => p.clienteId === clienteId && p.estado === 'activo');
  };

  const yaPagoHoy = (clienteId) => {
    const hoy = new Date().toISOString().split('T')[0];
    const prestamo = getPrestamoActivo(clienteId);
    return prestamo && prestamo.ultimoPago === hoy;
  };

  const getDiasAtraso = (clienteId) => {
    const prestamo = getPrestamoActivo(clienteId);
    if (!prestamo || !prestamo.ultimoPago) return 0;
    
    const hoy = new Date();
    const ultimoPago = new Date(prestamo.ultimoPago);
    const diffTime = Math.abs(hoy - ultimoPago);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const misClientes = clientes.filter(c => c.vendedoraId === usuarioActual?.id);
  
  const clientesFiltrados = misClientes.filter(c => {
    const prestamo = getPrestamoActivo(c.id);
    if (!prestamo) return false;
    
    const cumpleBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          c.cedula?.includes(busqueda) ||
                          c.zona?.toLowerCase().includes(busqueda.toLowerCase());
    
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

  return (
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
                onCerrarSesion();
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
        {clientesFiltrados.map(cliente => (
          <TarjetaCliente
            key={cliente.id}
            cliente={cliente}
            prestamo={getPrestamoActivo(cliente.id)}
            yaPagoHoy={yaPagoHoy(cliente.id)}
            diasAtraso={getDiasAtraso(cliente.id)}
            onRegistrarPago={onRegistrarPago}
            formatCurrency={formatCurrency}
          />
        ))}

        {clientesFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <p style={{ color: '#6b7280' }}>No hay clientes para mostrar</p>
          </div>
        )}
      </div>

      {/* Botón flotante */}
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

      {/* Modal */}
      {mostrarModalPrestamo && (
        <ModalPrestamo
          usuarioActual={usuarioActual}
          clientes={misClientes}
          prestamos={prestamos}
          onCrearCliente={onCrearCliente}
          onCrearPrestamo={onCrearPrestamo}
          onCerrar={() => setMostrarModalPrestamo(false)}
          formatCurrency={formatCurrency}
          firebaseOperations={firebaseOperations}
          vendedoras={vendedoras}
        />
      )}
    </div>
  );
}

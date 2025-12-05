import React, { useState } from 'react';

export default function ModalPrestamo({
  usuarioActual,
  clientes,
  prestamos,
  onCrearCliente,
  onCrearPrestamo,
  onCerrar,
  formatCurrency,
  firebaseOperations
}) {
  const [paso, setPaso] = useState(1);
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

  const misClientesSinPrestamo = clientes
    .filter(c => !prestamos.find(p => p.clienteId === c.id && p.estado === 'activo'))
    .filter(c => c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) || 
                 c.cedula?.includes(busquedaCliente));

  const handleCrearCliente = async () => {
    if (!nuevoCliente.nombre || !nuevoCliente.cedula || !nuevoCliente.telefono) {
      alert('Por favor completa nombre, cédula y teléfono');
      return;
    }

    const clienteData = {
      ...nuevoCliente,
      vendedoraId: usuarioActual.id
    };

    const cliente = await onCrearCliente(clienteData);
    setClienteSeleccionado(cliente);
    setPaso(3);
    setNuevoCliente({ nombre: '', cedula: '', telefono: '', zona: '', direccion: '' });
  };

  const handleCrearPrestamo = async () => {
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

    const prestamoData = {
      clienteId: clienteSeleccionado.id,
      vendedoraId: usuarioActual.id,
      valorTotal: monto,
      cuotaDiaria: cuotaDiaria,
      cuotasPagadas: 0,
      totalCuotas: 24,
      ultimoPago: null,
      estado: 'activo'
    };

    await onCrearPrestamo(prestamoData);
    alert('¡Préstamo creado exitosamente!');
    onCerrar();
  };

  return (
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
              onClick={onCerrar}
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

        {paso === 2 && busquedaCliente === 'NUEVO' && (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Crear Nuevo Cliente</h2>
            
            {['nombre', 'cedula', 'telefono', 'zona', 'direccion'].map(campo => (
              <div key={campo} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  {campo.charAt(0).toUpperCase() + campo.slice(1)} {['nombre', 'cedula', 'telefono'].includes(campo) && '*'}
                </label>
                <input
                  type="text"
                  value={nuevoCliente[campo]}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, [campo]: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
            ))}

            <button
              onClick={handleCrearCliente}
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
              Continuar
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
        )}

        {paso === 2 && busquedaCliente !== 'NUEVO' && (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Buscar Cliente</h2>
            
            <input
              type="text"
              value={busquedaCliente}
              onChange={(e) => setBusquedaCliente(e.target.value)}
              placeholder="🔍 Buscar..."
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

        {paso === 3 && clienteSeleccionado && (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Confirmar Préstamo</h2>
            
            <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#10b981' }}>{clienteSeleccionado.nombre}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>📍 {clienteSeleccionado.zona}</div>
            </div>

            <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', marginBottom: '4px' }}>Capital disponible:</div>
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
                  <span>Total a recibir (+20%):</span>
                  <span style={{ fontWeight: 'bold' }}>{formatCurrency(parseFloat(montoPrestamo) * 1.20)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cuota diaria (24 días):</span>
                  <span style={{ fontWeight: 'bold', color: '#10b981' }}>
                    {formatCurrency(Math.round((parseFloat(montoPrestamo) * 1.20) / 24))}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleCrearPrestamo}
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
  );
}
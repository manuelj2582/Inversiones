import React, { useState } from 'react';

export default function ModalPrestamo({ 
  mostrar, 
  onCerrar, 
  clientes, 
  usuarioActual,
  onCrearCliente,
  onCrearPrestamo,
  formatCurrency 
}) {
  const [paso, setPaso] = useState(1);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [montoPrestamo, setMontoPrestamo] = useState('');
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    zona: '',
    direccion: ''
  });

  const clientesSinPrestamo = clientes.filter(c => 
    c.vendedoraId === usuarioActual?.id &&
    (c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) || 
     c.cedula.includes(busquedaCliente))
  );

  const handleCerrar = () => {
    setPaso(1);
    setBusquedaCliente('');
    setClienteSeleccionado(null);
    setMontoPrestamo('');
    setNuevoCliente({ nombre: '', cedula: '', telefono: '', zona: '', direccion: '' });
    onCerrar();
  };

  const handleCrearCliente = () => {
    if (!nuevoCliente.nombre || !nuevoCliente.cedula || !nuevoCliente.telefono) {
      alert('Por favor completa nombre, cédula y teléfono');
      return;
    }
    
    const cliente = {
      ...nuevoCliente,
      id: Date.now().toString(),
      vendedoraId: usuarioActual.id
    };
    
    onCrearCliente(cliente);
    setClienteSeleccionado(cliente);
    setPaso(3);
    setNuevoCliente({ nombre: '', cedula: '', telefono: '', zona: '', direccion: '' });
  };

  const handleCrearPrestamo = () => {
    const monto = parseFloat(montoPrestamo);
    
    if (!monto || monto <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    if (monto > usuarioActual.capitalDisponible) {
      alert('No tienes suficiente capital disponible');
      return;
    }

    onCrearPrestamo(clienteSeleccionado, monto);
    handleCerrar();
  };

  if (!mostrar) return null;

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
              onClick={handleCerrar}
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
                    placeholder="4241234567"
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
                  {clientesSinPrestamo.map(cliente => (
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
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        📍 {cliente.zona} | 📞 {cliente.telefono}
                      </div>
                    </button>
                  ))}

                  {clientesSinPrestamo.length === 0 && (
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

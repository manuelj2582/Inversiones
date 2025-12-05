import React, { useState } from 'react';

export default function LoginView({ vendedoras, onLogin, cargando }) {
  const [pin, setPin] = useState('');
  const [vendedoraSeleccionada, setVendedoraSeleccionada] = useState(null);

  const handleLogin = () => {
    if (!vendedoraSeleccionada) {
      alert('Por favor selecciona tu usuario');
      return;
    }
    const vendedora = vendedoras.find(v => v.id === vendedoraSeleccionada && v.pin === pin);
    if (vendedora) {
      onLogin(vendedora);
    } else {
      alert('PIN incorrecto');
    }
  };

  if (cargando) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Cargando Firebase...</div>
        </div>
      </div>
    );
  }

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
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
            Inversiones
          </h1>
          <p style={{ color: '#6b7280' }}>Control de Inventario</p>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
            Selecciona tu usuario
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {vendedoras.filter(v => !v.esAdmin).map(v => (
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
}

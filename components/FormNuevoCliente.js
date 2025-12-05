import React, { useState } from 'react';

export default function FormNuevoCliente({ onCrear, onCancelar }) {
  const [datos, setDatos] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    zona: '',
    direccion: ''
  });

  const handleSubmit = () => {
    if (!datos.nombre || !datos.cedula || !datos.telefono) {
      alert('Por favor completa nombre, cédula y teléfono');
      return;
    }
    onCrear(datos);
  };

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Crear Nuevo Cliente
      </h2>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          Nombre Completo *
        </label>
        <input
          type="text"
          value={datos.nombre}
          onChange={(e) => setDatos({...datos, nombre: e.target.value})}
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
          value={datos.cedula}
          onChange={(e) => setDatos({...datos, cedula: e.target.value})}
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
          value={datos.telefono}
          onChange={(e) => setDatos({...datos, telefono: e.target.value})}
          placeholder="4141234567"
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
          value={datos.zona}
          onChange={(e) => setDatos({...datos, zona: e.target.value})}
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
          value={datos.direccion}
          onChange={(e) => setDatos({...datos, direccion: e.target.value})}
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
        onClick={handleSubmit}
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
        onClick={onCancelar}
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
    </div>
  );
}

import React, { useState } from 'react';
import { collection, setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';

export default function Setup() {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleInicializar = async () => {
    setCargando(true);
    setMensaje('⏳ Inicializando...');
    
    try {
      const vendedoras = [
        {
          id: '1',
          nombre: 'Yaney',
          pin: '1234',
          color: '#ef4444',
          capitalDisponible: 20000000,
          esAdmin: false,
        },
        {
          id: '2',
          nombre: 'Patricia',
          pin: '5678',
          color: '#3b82f6',
          capitalDisponible: 3200000,
          esAdmin: false,
        },
        {
          id: 'admin',
          nombre: 'Admin',
          pin: '0000',
          color: '#a855f7',
          capitalDisponible: 0,
          esAdmin: true,
        },
      ];

      // Guardar vendedoras en Firebase
      for (const vendedora of vendedoras) {
        const vendedoraRef = doc(db, 'vendedoras', vendedora.id);
        await setDoc(vendedoraRef, {
          id: vendedora.id,
          nombre: vendedora.nombre,
          pin: vendedora.pin,
          color: vendedora.color,
          capitalDisponible: vendedora.capitalDisponible,
          esAdmin: vendedora.esAdmin,
          createdAt: new Date().toISOString(),
        });
        console.log(`✅ Vendedora "${vendedora.nombre}" creada`);
      }

      setMensaje('✅ ¡Sistema inicializado correctamente! Ahora puedes hacer login.');
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setMensaje('❌ Error: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🔧</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Configuración Inicial</h1>
        <p className="text-gray-600 mb-6">
          Haz clic para inicializar los datos en Firebase.
        </p>

        <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
          <p className="text-sm text-blue-800 font-semibold mb-2">📋 Se configurará:</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ Yaney - PIN: 1234</li>
            <li>✅ Patricia - PIN: 5678</li>
            <li>✅ Admin - PIN: 0000</li>
          </ul>
        </div>

        {mensaje && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-semibold ${
            mensaje.includes('✅') 
              ? 'bg-green-100 text-green-800' 
              : mensaje.includes('❌')
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {mensaje}
          </div>
        )}

        <button
          onClick={handleInicializar}
          disabled={cargando}
          className={`w-full py-3 rounded-lg font-bold text-white transition ${
            cargando
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          }`}
        >
          {cargando ? '⏳ Inicializando...' : '🚀 Inicializar Sistema'}
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Esto solo se ejecuta una vez. Los datos se guardarán en Firebase.
        </p>

        <a href="/" className="text-xs text-blue-500 hover:text-blue-700 underline mt-4 inline-block">
          ← Volver al login
        </a>
      </div>
    </div>
  );
}

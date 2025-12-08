import React, { useState } from 'react';
import { inicializarDatos } from '../lib/inicializarFirebase';

const Setup = () => {
  const [cargando, setCargando] = useState(false);

  const handleInicializar = async () => {
    setCargando(true);
    await inicializarDatos();
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🔧</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Configuración Inicial</h1>
        <p className="text-gray-600 mb-6">
          Primera vez usando el sistema? Haz clic para inicializar los datos en Firebase.
        </p>

        <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
          <p className="text-sm text-blue-800 font-semibold mb-2">📋 Se configurará:</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ Yaney - PIN: 1234</li>
            <li>✅ Patricia - PIN: 5678</li>
            <li>✅ Admin - PIN: 0000</li>
          </ul>
        </div>

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
      </div>
    </div>
  );
};

export default Setup;

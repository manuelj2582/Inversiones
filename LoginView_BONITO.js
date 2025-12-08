import React, { useState } from 'react';

const LoginView = ({ vendedoras, onLogin }) => {
  const [pinIngresado, setPinIngresado] = useState('');
  const [vendedoraSeleccionada, setVendedoraSeleccionada] = useState(null);
  const [error, setError] = useState('');
  const [mostrarPin, setMostrarPin] = useState(false);

  const manejarLogin = () => {
    if (!vendedoraSeleccionada) {
      setError('Selecciona un usuario');
      return;
    }

    const vendedora = vendedoras.find((v) => v.id === vendedoraSeleccionada);
    
    if (!vendedora) {
      setError('Usuario no encontrado');
      return;
    }

    if (pinIngresado !== vendedora.pin) {
      setError('PIN incorrecto');
      setPinIngresado('');
      return;
    }

    onLogin(vendedora);
  };

  const manejarKeyPress = (e) => {
    if (e.key === 'Enter') {
      manejarLogin();
    }
  };

  const getBackgroundGradient = () => {
    if (!vendedoraSeleccionada) return 'from-slate-900 via-slate-800 to-slate-900';
    const vendedora = vendedoras.find(v => v.id === vendedoraSeleccionada);
    if (vendedora?.esAdmin) return 'from-purple-900 via-purple-800 to-purple-900';
    if (vendedora?.color === '#ef4444') return 'from-red-900 via-red-800 to-red-900';
    if (vendedora?.color === '#3b82f6') return 'from-blue-900 via-blue-800 to-blue-900';
    return 'from-slate-900 via-slate-800 to-slate-900';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} flex items-center justify-center p-4 transition-all duration-500`}>
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -ml-48 -mb-48"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl sm:text-4xl">📦</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Gestión Distribuidora</h1>
          <p className="text-blue-200 text-sm sm:text-base">Control de Ventas y Stock</p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm bg-opacity-95">
          
          {/* Selección de Usuario */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-800 mb-4">
              👤 Selecciona tu Usuario
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {vendedoras.map((vendedora) => (
                <button
                  key={vendedora.id}
                  onClick={() => {
                    setVendedoraSeleccionada(vendedora.id);
                    setPinIngresado('');
                    setError('');
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 font-semibold flex flex-col items-center justify-center min-h-28 ${
                    vendedoraSeleccionada === vendedora.id
                      ? 'border-opacity-100 text-white shadow-lg scale-105'
                      : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
                  }`}
                  style={
                    vendedoraSeleccionada === vendedora.id
                      ? {
                          backgroundColor: vendedora.color,
                          borderColor: vendedora.color,
                          boxShadow: `0 10px 30px ${vendedora.color}40`,
                        }
                      : {}
                  }
                >
                  <span className="text-2xl mb-2">
                    {vendedora.esAdmin ? '👑' : '👨‍💼'}
                  </span>
                  <span className="text-sm font-bold text-center leading-tight">
                    {vendedora.nombre}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* PIN Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-800 mb-3">
              🔐 Ingresa tu PIN
            </label>
            <div className="relative">
              <input
                type={mostrarPin ? 'text' : 'password'}
                value={pinIngresado}
                onChange={(e) => setPinIngresado(e.target.value.slice(0, 4))}
                onKeyPress={manejarKeyPress}
                placeholder="••••"
                autoFocus
                disabled={!vendedoraSeleccionada}
                maxLength="4"
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-center text-3xl tracking-widest font-mono font-bold transition-colors disabled:bg-gray-100 disabled:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setMostrarPin(!mostrarPin)}
                disabled={!vendedoraSeleccionada || !pinIngresado}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 transition-colors"
              >
                {mostrarPin ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {vendedoraSeleccionada && (
              <p className="text-xs text-gray-500 mt-2">
                💡 {vendedoras.find(v => v.id === vendedoraSeleccionada)?.pin === pinIngresado ? '✅ PIN correcto' : 'Ingresa 4 dígitos'}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-shake">
              <p className="text-red-700 font-semibold text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* Botón Login */}
          <button
            onClick={manejarLogin}
            disabled={!vendedoraSeleccionada || pinIngresado.length !== 4}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            <span>🚀</span>
            <span>Ingresar al Sistema</span>
          </button>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              🔒 Sistema seguro y encriptado
            </p>
            <p className="text-center text-xs text-gray-400 mt-1">
              © 2024 Gestión Distribuidora
            </p>
          </div>
        </div>

        {/* Info Mobile */}
        <div className="mt-6 text-center text-blue-100 text-xs sm:hidden">
          <p>📱 Optimizado para móvil</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default LoginView;

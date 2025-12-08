import React, { useState } from 'react';

const LoginView = ({ vendedoras, onLogin }) => {
  const [pinIngresado, setPinIngresado] = useState('');
  const [vendedoraSeleccionada, setVendedoraSeleccionada] = useState(null);
  const [error, setError] = useState('');

  const manejarLogin = () => {
    if (!vendedoraSeleccionada) {
      setError('Selecciona una vendedora');
      return;
    }

    const vendedora = vendedoras.find((v) => v.id === vendedoraSeleccionada);
    
    if (!vendedora) {
      setError('Vendedora no encontrada');
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

  const getBackgroundColor = () => {
    if (!vendedoraSeleccionada) return 'from-blue-600 to-blue-800';
    const vendedora = vendedoras.find(v => v.id === vendedoraSeleccionada);
    if (vendedora?.esAdmin) return 'from-purple-600 to-purple-800';
    if (vendedora?.color === '#ef4444') return 'from-red-600 to-red-800';
    if (vendedora?.color === '#3b82f6') return 'from-blue-600 to-blue-800';
    return 'from-blue-600 to-blue-800';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundColor()} flex items-center justify-center p-4 transition-all duration-300`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-white rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Inversiones</h1>
          <p className="text-gray-500 text-sm mt-2">Sistema de Préstamos Gota a Gota</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Selecciona Usuario</label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {vendedoras.map((vendedora) => (
                <button
                  key={vendedora.id}
                  onClick={() => {
                    setVendedoraSeleccionada(vendedora.id);
                    setError('');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all font-semibold text-base ${
                    vendedoraSeleccionada === vendedora.id
                      ? 'border-opacity-100 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  style={
                    vendedoraSeleccionada === vendedora.id
                      ? {
                          backgroundColor: vendedora.color,
                          borderColor: vendedora.color,
                        }
                      : {}
                  }
                >
                  {vendedora.nombre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ingresa PIN</label>
            <input
              type="password"
              value={pinIngresado}
              onChange={(e) => setPinIngresado(e.target.value)}
              onKeyPress={manejarKeyPress}
              placeholder="••••"
              autoFocus
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-center text-2xl tracking-widest font-mono"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={manejarLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
          >
            Ingresar
          </button>

          <p className="text-xs text-gray-500 text-center">
            Sistema seguro • Datos encriptados
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;

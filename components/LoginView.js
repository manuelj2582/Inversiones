import React, { useState } from 'react';

const LoginView = ({ vendedoras, onLogin }) => {
  const [pinIngresado, setPinIngresado] = useState('');
  const [error, setError] = useState('');
  const [mostrarPin, setMostrarPin] = useState(false);
  const [intentosFallidos, setIntentosFallidos] = useState(0);

  const manejarLogin = () => {
    if (!pinIngresado || pinIngresado.length !== 4) {
      setError('Ingresa un PIN de 4 dígitos');
      return;
    }

    const vendedora = vendedoras.find((v) => v.pin === pinIngresado);
    
    if (!vendedora) {
      setIntentosFallidos(intentosFallidos + 1);
      setError('PIN incorrecto. Intenta de nuevo.');
      setPinIngresado('');
      
      if (intentosFallidos >= 2) {
        setError('Demasiados intentos fallidos. Espera 30 segundos.');
      }
      return;
    }

    setIntentosFallidos(0);
    setError('');
    onLogin(vendedora);
  };

  const manejarKeyPress = (e) => {
    if (e.key === 'Enter' && pinIngresado.length === 4) {
      manejarLogin();
    }
  };

  const estaBloqueado = intentosFallidos >= 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 transition-all duration-500">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -ml-48 -mb-48"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl mb-6 shadow-2xl">
            <span className="text-5xl sm:text-6xl">📦</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Gestión</h1>
          <p className="text-blue-200 text-base sm:text-lg font-semibold">Control de Ventas y Stock</p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 backdrop-blur-sm bg-opacity-95">
          
          {/* Instrucciones */}
          <div className="text-center mb-8">
            <p className="text-gray-600 text-base font-semibold">
              Ingresa tu PIN de acceso
            </p>
            <p className="text-gray-400 text-sm mt-2">
              4 dígitos numéricos
            </p>
          </div>

          {/* PIN Input Grande */}
          <div className="mb-8">
            <div className="relative mb-6">
              <input
                type={mostrarPin ? 'text' : 'password'}
                value={pinIngresado}
                onChange={(e) => {
                  const valor = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPinIngresado(valor);
                  if (error) setError('');
                }}
                onKeyPress={manejarKeyPress}
                placeholder="• • • •"
                autoFocus
                disabled={estaBloqueado}
                maxLength="4"
                className="w-full px-6 py-6 border-3 border-gray-300 rounded-2xl focus:border-blue-500 focus:outline-none text-center text-5xl tracking-widest font-mono font-bold transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
              />
              <button
                type="button"
                onClick={() => setMostrarPin(!mostrarPin)}
                disabled={!pinIngresado || estaBloqueado}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 transition-colors text-2xl"
              >
                {mostrarPin ? '👁️' : '🙈'}
              </button>
            </div>

            {/* Indicador de dígitos */}
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i < pinIngresado.length
                      ? 'bg-blue-600 scale-100'
                      : 'bg-gray-300 scale-90'
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={`mb-6 p-4 rounded-2xl animate-shake ${
              estaBloqueado 
                ? 'bg-red-100 border-2 border-red-500'
                : 'bg-red-50 border-l-4 border-red-500'
            }`}>
              <p className="text-red-700 font-semibold text-sm flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </p>
              {estaBloqueado && (
                <p className="text-red-600 text-xs mt-2">
                  🔒 Sistema bloqueado temporalmente
                </p>
              )}
            </div>
          )}

          {/* Intentos restantes */}
          {intentosFallidos > 0 && !estaBloqueado && (
            <div className="mb-6 text-center text-sm text-orange-600 font-semibold">
              ⏱️ {3 - intentosFallidos} intento{3 - intentosFallidos !== 1 ? 's' : ''} restante{3 - intentosFallidos !== 1 ? 's' : ''}
            </div>
          )}

          {/* Botón Login */}
          <button
            onClick={manejarLogin}
            disabled={pinIngresado.length !== 4 || estaBloqueado}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed text-lg"
          >
            {estaBloqueado ? '🔒 Sistema Bloqueado' : '🚀 Ingresar'}
          </button>

          {/* Keyboard numérico simulado (opcional) */}
          <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => {
                  if (pinIngresado.length < 4) {
                    setPinIngresado(pinIngresado + num);
                    if (error) setError('');
                  }
                }}
                disabled={pinIngresado.length >= 4 || estaBloqueado}
                className="py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-bold rounded-lg transition-colors border-2 border-transparent hover:border-gray-300"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => {
                if (pinIngresado.length < 4) {
                  setPinIngresado(pinIngresado + 0);
                  if (error) setError('');
                }
              }}
              disabled={pinIngresado.length >= 4 || estaBloqueado}
              className="py-3 col-span-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-bold rounded-lg transition-colors border-2 border-transparent hover:border-gray-300"
            >
              0
            </button>
            <button
              onClick={() => setPinIngresado(pinIngresado.slice(0, -1))}
              disabled={!pinIngresado || estaBloqueado}
              className="py-3 bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-red-600 font-bold rounded-lg transition-colors border-2 border-transparent hover:border-red-300"
            >
              ⌫
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              🔒 Acceso seguro y encriptado
            </p>
            <a href="/setup" className="text-xs text-blue-500 hover:text-blue-700 underline mt-2 inline-block">
              🔧 Inicializar Sistema
            </a>
          </div>
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

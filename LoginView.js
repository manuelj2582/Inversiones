import React, { useState } from 'react';

const LoginView = ({
  vendedoras,
  onLogin,
}) => {
  const [pinIngresado, setPinIngresado] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (pinIngresado.length < 4) {
      setError('PIN incompleto');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const vendedora = vendedoras.find(v => v.pin === pinIngresado);

      if (!vendedora) {
        setError('PIN incorrecto');
        setPinIngresado('');
        setCargando(false);
        return;
      }

      if (vendedora.estado === 'inactivo') {
        setError('Usuario inactivo. Contacta al administrador.');
        setPinIngresado('');
        setCargando(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      onLogin(vendedora);
    } catch (err) {
      setError('Error en el login: ' + err.message);
      setCargando(false);
    }
  };

  const handlePin = (numero) => {
    if (pinIngresado.length < 4) {
      setPinIngresado(pinIngresado + numero);
    }
  };

  const handleBorrar = () => {
    setPinIngresado(pinIngresado.slice(0, -1));
  };

  const handleLimpiar = () => {
    setPinIngresado('');
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-4xl font-bold text-white mb-2">Distribuidora Pro</h1>
          <p className="text-blue-100 text-lg">Sistema de Gestión de Inventario</p>
          <p className="text-blue-200 text-sm mt-2">"Gestiona tu inventario y distribuciones de forma eficiente"</p>
        </div>

        {/* Tarjeta de login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Acceso a Distribuidora Pro
          </h2>
          <p className="text-gray-600 text-center text-sm mb-6">
            Ingresa con tu PIN de ejecutiva
          </p>

          {/* Entrada de PIN */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              PIN de Ejecutiva (4 dígitos)
            </label>
            <input
              type="password"
              value={pinIngresado}
              onChange={(e) => setPinIngresado(e.target.value.slice(0, 4))}
              onKeyPress={handleKeyPress}
              placeholder="••••"
              maxLength="4"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-center text-3xl font-mono tracking-widest"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              {pinIngresado.length}/4 dígitos
            </p>
          </div>

          {/* Mostrar error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-3 mb-6 rounded">
              <p className="text-red-700 font-semibold text-sm">❌ {error}</p>
            </div>
          )}

          {/* Teclado numérico */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handlePin(num.toString())}
                disabled={pinIngresado.length >= 4 || cargando}
                className="py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-800 font-bold rounded-lg transition text-xl"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Botón 0 y controles */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button
              onClick={() => handlePin('0')}
              disabled={pinIngresado.length >= 4 || cargando}
              className="col-span-1 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-800 font-bold rounded-lg transition text-xl"
            >
              0
            </button>
            <button
              onClick={handleBorrar}
              disabled={pinIngresado.length === 0 || cargando}
              className="col-span-1 py-3 bg-orange-100 hover:bg-orange-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-orange-700 font-bold rounded-lg transition"
            >
              ⌫
            </button>
            <button
              onClick={handleLimpiar}
              disabled={pinIngresado.length === 0 || cargando}
              className="col-span-1 py-3 bg-yellow-100 hover:bg-yellow-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-yellow-700 font-bold rounded-lg transition text-sm"
            >
              Limpiar
            </button>
          </div>

          {/* Botón login */}
          <button
            onClick={handleLogin}
            disabled={pinIngresado.length < 4 || cargando}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg transition shadow-lg disabled:cursor-not-allowed"
          >
            {cargando ? '⏳ Validando...' : '✓ Ingresar'}
          </button>
        </div>

        {/* Footer info */}
        <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-4 text-center">
          <p className="text-blue-100 text-xs">
            <span className="font-semibold">Distribuidora Pro</span> • Sistema de Gestión de Inventario
          </p>
          <p className="text-blue-200 text-xs mt-1">v1.0 • Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;

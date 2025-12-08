import React, { useState } from 'react';

const ModalPrestamo = ({ cliente, onConfirmar, onCancelar, formatCurrency }) => {
  const [monto, setMonto] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarConfirmar = async () => {
    setError('');

    if (!monto || isNaN(monto) || parseFloat(monto) <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    try {
      setCargando(true);
      await onConfirmar({
        monto: parseFloat(monto),
        valorTotal: parseFloat(monto) * 1.2,
      });
    } catch (err) {
      setError('Error: ' + err.message);
      setCargando(false);
    }
  };

  const manejarKeyPress = (e) => {
    if (e.key === 'Enter' && !cargando) {
      manejarConfirmar();
    }
  };

  const montoNum = parseFloat(monto) || 0;
  const interes = montoNum * 0.2;
  const montoTotal = montoNum + interes;
  const cuotaDiaria = montoTotal / 24;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Nuevo Préstamo</h2>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 font-semibold">{cliente.nombre}</p>
          {cliente.cedula && <p className="text-sm text-gray-600">📋 {cliente.cedula}</p>}
          <p className="text-sm text-gray-600">📱 {cliente.telefono}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Monto del Préstamo</label>
            <input
              type="number"
              value={monto}
              onChange={(e) => {
                setMonto(e.target.value);
                setError('');
              }}
              onKeyPress={manejarKeyPress}
              placeholder="50000"
              disabled={cargando}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none disabled:bg-gray-100 text-lg"
              autoFocus
            />
          </div>

          {monto && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg space-y-3 text-sm border border-gray-200">
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-600">Monto Original:</span>
                <span className="font-bold text-gray-800">{formatCurrency(montoNum)}</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-600">Interés (20%):</span>
                <span className="font-semibold text-orange-600">{formatCurrency(interes)}</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-600 font-semibold">Total a Pagar:</span>
                <span className="font-bold text-lg text-blue-600">{formatCurrency(montoTotal)}</span>
              </div>
              <div className="flex justify-between bg-yellow-50 -m-2 p-3 rounded border-l-4 border-yellow-500">
                <span className="text-yellow-800">Cuota Diaria (÷24):</span>
                <span className="font-bold text-yellow-700">{formatCurrency(cuotaDiaria)}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onCancelar}
            disabled={cargando}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={manejarConfirmar}
            disabled={cargando}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            {cargando ? 'Guardando...' : 'Crear Préstamo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPrestamo;

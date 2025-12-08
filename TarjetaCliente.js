import React from 'react';

const TarjetaCliente = ({
  cliente,
  prestamoActivo,
  onAgregarPrestamo,
  onRegistrarPago,
  formatCurrency,
}) => {
  // Calcular total por cobrar del préstamo activo
  let porCobrar = 0;
  let cuotasPagadas = 0;
  let cuotasRestantes = 0;

  if (prestamoActivo) {
    const cuotaDiaria = prestamoActivo.cuotaDiaria || prestamoActivo.monto * 1.2 / 24;
    const montoTotal = prestamoActivo.montoTotal || prestamoActivo.monto * 1.2;
    
    cuotasPagadas = prestamoActivo.cuotasPagadas || 0;
    cuotasRestantes = 24 - cuotasPagadas;
    
    const restante = montoTotal - (cuotasPagadas * cuotaDiaria);
    porCobrar = Math.max(0, restante);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-blue-500">
      {/* Encabezado */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{cliente.nombre}</h3>
          <p className="text-sm text-gray-600">Cédula: {cliente.cedula}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
          prestamoActivo ? 'bg-green-600' : 'bg-gray-400'
        }`}>
          {prestamoActivo ? '✓ Activo' : 'Sin préstamo'}
        </span>
      </div>

      {/* Contacto */}
      <div className="mb-4 space-y-1 text-sm text-gray-600">
        <p>📱 {cliente.telefono}</p>
        <p>📍 {cliente.direccion}</p>
      </div>

      {/* Información del préstamo */}
      {prestamoActivo ? (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">Monto Inicial</p>
              <p className="font-bold text-blue-600">{formatCurrency(prestamoActivo.monto)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Total (+20%)</p>
              <p className="font-bold text-blue-600">
                {formatCurrency(prestamoActivo.montoTotal || prestamoActivo.monto * 1.2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">Cuotas Pagadas</p>
              <p className="font-bold text-green-600">{cuotasPagadas}/24</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Cuotas Restantes</p>
              <p className="font-bold text-orange-600">{cuotasRestantes}/24</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1">Por Cobrar</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(porCobrar)}</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200 text-center">
          <p className="text-gray-600 text-sm">Sin préstamos activos</p>
        </div>
      )}

      {/* Botones */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onAgregarPrestamo}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm"
        >
          {prestamoActivo ? '📦 Nuevo' : '➕ Préstamo'}
        </button>
        <button
          onClick={onRegistrarPago}
          disabled={!prestamoActivo}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition text-sm"
        >
          ✓ Pago
        </button>
      </div>
    </div>
  );
};

export default TarjetaCliente;

import React from 'react';

const TarjetaCliente = ({
  cliente,
  prestamoActivo,
  onAgregarPrestamo,
  onRegistrarPago,
  formatCurrency,
}) => {
  const restante = prestamoActivo
    ? (prestamoActivo.montoTotal || prestamoActivo.monto * 1.2) - 
      ((prestamoActivo.cuotasPagadas || 0) * (prestamoActivo.cuotaDiaria || prestamoActivo.monto * 1.2 / 24))
    : 0;

  // Total prestado por cobrar (solo los que faltan)
  const totalPorCobrar = restante;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border-t-4 border-blue-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b">
        <h3 className="text-lg font-bold text-gray-800">{cliente.nombre}</h3>
        <p className="text-xs text-gray-600 mt-1">
          {cliente.cedula && `📋 ${cliente.cedula}`}
        </p>
        <p className="text-xs text-gray-600">
          {cliente.telefono && `📱 ${cliente.telefono}`}
        </p>
        {cliente.direccion && (
          <p className="text-xs text-gray-600">
            📍 {cliente.direccion}
          </p>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {prestamoActivo ? (
          <div className="space-y-3">
            {/* Préstamo Activo */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-xs text-gray-600 mb-1 font-semibold">PRÉSTAMO ACTIVO</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(prestamoActivo.monto)}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div>
                  <p className="text-gray-600">Cuota Diaria</p>
                  <p className="font-bold text-gray-800">
                    {formatCurrency(prestamoActivo.cuotaDiaria || prestamoActivo.monto * 1.2 / 24)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Cuotas Pagadas</p>
                  <p className="font-bold text-gray-800">
                    {prestamoActivo.cuotasPagadas || 0}/24
                  </p>
                </div>
              </div>
            </div>

            {/* Total Prestado por Cobrar */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-xs text-gray-600 mb-1 font-semibold">TOTAL PRESTADO POR COBRAR</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalPorCobrar)}
              </p>
              <div className="mt-2 bg-red-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-600 h-full transition-all"
                  style={{
                    width: `${((prestamoActivo.cuotasPagadas || 0) / 24) * 100}%`
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1 text-center">
                {Math.round(((prestamoActivo.cuotasPagadas || 0) / 24) * 100)}% cobrado
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-sm mb-2">Sin préstamos activos</p>
            <p className="text-xs text-gray-400">Agrega un préstamo para comenzar</p>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="p-4 border-t bg-gray-50 space-y-2">
        <button
          onClick={onAgregarPrestamo}
          className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
        >
          ➕ Agregar Préstamo
        </button>
        {prestamoActivo && prestamoActivo.cuotasPagadas < 24 && (
          <>
            <button
              onClick={onRegistrarPago}
              className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              ✅ Registrar Pago
            </button>
            <button
              onClick={() => {
                const numero = cliente.telefono;
                window.open(`https://wa.me/${numero}?text=Hola%20${cliente.nombre},%20debes%20${formatCurrency(totalPorCobrar)}`, '_blank');
              }}
              className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
            >
              💬 WhatsApp
            </button>
            <button
              onClick={() => window.open(`tel:${cliente.telefono}`)}
              className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
            >
              📞 Llamar
            </button>
          </>
        )}
        {prestamoActivo && prestamoActivo.cuotasPagadas >= 24 && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center text-sm font-semibold">
            ✅ Préstamo completamente pagado
          </div>
        )}
      </div>
    </div>
  );
};

export default TarjetaCliente;

import React from 'react';

const TarjetaCliente = ({
  cliente,
  prestamoActivo,
  vendedoraColor,
  onAgregarPrestamo,
  onRegistrarPago,
  formatCurrency,
}) => {
  // Calcular deuda restante correctamente
  const montoTotal = prestamoActivo?.montoTotal || (prestamoActivo?.monto * 1.2) || 0;
  const cuotasDiarias = prestamoActivo?.cuotaDiaria || (montoTotal / 24) || 0;
  const pagado = (prestamoActivo?.cuotasPagadas || 0) * cuotasDiarias;
  const deudaRestante = prestamoActivo ? Math.max(montoTotal - pagado, 0) : 0;

  const porcentajePagado = prestamoActivo 
    ? Math.min(((prestamoActivo.cuotasPagadas || 0) / 24) * 100, 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border-t-4" style={{ borderTopColor: vendedoraColor }}>
      {/* Encabezado del cliente */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800">{cliente.nombre}</h3>
        <p className="text-sm text-gray-500">Cédula: {cliente.cedula}</p>
        <p className="text-sm text-gray-500">📱 {cliente.telefono}</p>
        <p className="text-sm text-gray-500">📍 {cliente.direccion}</p>
      </div>

      {prestamoActivo ? (
        <>
          {/* Información del préstamo */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Monto Préstamo</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(prestamoActivo.monto)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">Deuda Restante</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(deudaRestante)}</p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-gray-300 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 text-center">
              {prestamoActivo.cuotasPagadas || 0} de 24 cuotas pagadas
            </p>
          </div>

          {/* Detalles de cuota */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Cuota Diaria</p>
              <p className="font-bold text-gray-800">{formatCurrency(prestamoActivo.cuotaDiaria)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Interés Total</p>
              <p className="font-bold text-gray-800">{formatCurrency(prestamoActivo.interes)}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg mb-4 text-center border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-sm font-semibold">Sin préstamos activos</p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="space-y-2">
        <button
          onClick={onAgregarPrestamo}
          className="w-full px-4 py-3 rounded-lg font-semibold transition text-white"
          style={{ backgroundColor: vendedoraColor }}
        >
          💰 Agregar Préstamo
        </button>
        {prestamoActivo && (
          <>
            <button
              onClick={onRegistrarPago}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
            >
              ✓ Registrar Pago
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const mensaje = `Hola ${cliente.nombre}, sobre tu préstamo de ${formatCurrency(prestamoActivo.monto)}. Debes: ${formatCurrency(deudaRestante)}`;
                  window.open(`https://wa.me/57${cliente.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`, '_blank');
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition text-sm"
              >
                💬 WhatsApp
              </button>
              <button
                onClick={() => window.open(`tel:${cliente.telefono}`)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition text-sm"
              >
                ☎️ Llamar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TarjetaCliente;

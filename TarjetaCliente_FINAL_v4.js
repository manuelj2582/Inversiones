import React, { useState } from 'react';

const TarjetaCliente = ({
  cliente,
  prestamosActivos,
  prestamosPagados,
  onAgregarPrestamo,
  onRegistrarPago,
  formatCurrency,
}) => {
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Calcular total por cobrar de todos los préstamos activos
  const totalPorCobrarTodos = prestamosActivos.reduce((sum, p) => {
    const restante = (p.montoTotal || p.monto * 1.2) - 
      ((p.cuotasPagadas || 0) * (p.cuotaDiaria || p.monto * 1.2 / 24));
    return sum + Math.max(0, restante);
  }, 0);

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
        {prestamosActivos && prestamosActivos.length > 0 ? (
          <div className="space-y-3">
            {/* Préstamos Activos */}
            {prestamosActivos.map((prestamoActivo, idx) => {
              const restante = (prestamoActivo.montoTotal || prestamoActivo.monto * 1.2) - 
                ((prestamoActivo.cuotasPagadas || 0) * (prestamoActivo.cuotaDiaria || prestamoActivo.monto * 1.2 / 24));
              
              return (
                <div key={idx}>
                  {/* Préstamo Activo */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="text-xs text-gray-600 mb-1 font-semibold">PRÉSTAMO {idx + 1}</p>
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
                    <p className="text-xs text-gray-600 mb-1 font-semibold">POR COBRAR</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(Math.max(0, restante))}
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

                  {/* Botones para este préstamo */}
                  {prestamoActivo.cuotasPagadas < 24 && (
                    <div className="mt-2 space-y-2">
                      <button
                        onClick={() => onRegistrarPago(cliente.id, idx)}
                        className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        ✅ Pagar Cuota {prestamoActivo.cuotasPagadas + 1}
                      </button>
                    </div>
                  )}

                  {prestamoActivo.cuotasPagadas >= 24 && (
                    <div className="mt-2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg text-center text-xs font-semibold">
                      ✅ Completamente pagado
                    </div>
                  )}
                </div>
              );
            })}

            {/* Total General */}
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500 mt-2">
              <p className="text-xs text-gray-600 mb-1 font-semibold">TOTAL POR COBRAR (TODOS)</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(totalPorCobrarTodos)}
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

      {/* Botones principales */}
      <div className="p-4 border-t bg-gray-50 space-y-2">
        <button
          onClick={onAgregarPrestamo}
          className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
        >
          ➕ Agregar Préstamo
        </button>

        {prestamosActivos && prestamosActivos.length > 0 && (
          <>
            <button
              onClick={() => {
                const numero = cliente.telefono;
                window.open(`https://wa.me/${numero}?text=Hola%20${cliente.nombre},%20debes%20${formatCurrency(totalPorCobrarTodos)}`, '_blank');
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

        {/* Botón Historial */}
        {prestamosPagados && prestamosPagados.length > 0 && (
          <button
            onClick={() => setMostrarHistorial(!mostrarHistorial)}
            className="w-full px-4 py-2 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition"
          >
            📜 Historial ({prestamosPagados.length})
          </button>
        )}
      </div>

      {/* Historial */}
      {mostrarHistorial && prestamosPagados && prestamosPagados.length > 0 && (
        <div className="border-t bg-gray-100 p-4">
          <h4 className="font-bold text-gray-800 mb-3">Préstamos Pagados</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {prestamosPagados.map((p, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border-l-4 border-green-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{formatCurrency(p.monto)}</p>
                    <p className="text-xs text-gray-600">24 cuotas pagadas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Total pagado:</p>
                    <p className="text-sm font-bold text-green-600">{formatCurrency(p.montoTotal || p.monto * 1.2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TarjetaCliente;

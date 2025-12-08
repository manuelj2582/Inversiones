import React, { useState, useEffect } from 'react';

const PanelMora = ({
  prestamos,
  clientes,
  formatCurrency,
  firebaseOperations,
}) => {
  const [clientesEnMora, setClientesEnMora] = useState([]);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    const cargarMora = async () => {
      if (firebaseOperations) {
        const mora = await firebaseOperations.obtenerClientesEnMora(prestamos, clientes);
        setClientesEnMora(mora);
      }
    };
    cargarMora();
  }, [prestamos, clientes, firebaseOperations]);

  const clientesFiltrados = filtro === 'critico' 
    ? clientesEnMora.filter(c => c.diasAtrasado > 5)
    : clientesEnMora;

  const diasPromedio = clientesEnMora.length > 0
    ? Math.round(clientesEnMora.reduce((sum, c) => sum + c.diasAtrasado, 0) / clientesEnMora.length)
    : 0;

  const montoEnMora = clientesEnMora.reduce((sum, c) => {
    const montoTotal = c.prestamo.montoTotal || c.prestamo.monto * 1.2;
    const cuotaDiaria = c.prestamo.cuotaDiaria || c.prestamo.monto * 1.2 / 24;
    const restante = montoTotal - ((c.prestamo.cuotasPagadas || 0) * cuotaDiaria);
    return sum + Math.max(0, restante);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Alertas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg">
          <p className="text-red-800 text-sm font-semibold mb-1">⚠️ Clientes en Mora</p>
          <p className="text-3xl font-bold text-red-600">{clientesEnMora.length}</p>
          <p className="text-xs text-red-600 mt-1">Más de 2 días sin pagar</p>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-600 p-6 rounded-lg">
          <p className="text-orange-800 text-sm font-semibold mb-1">📊 Días Promedio de Atraso</p>
          <p className="text-3xl font-bold text-orange-600">{diasPromedio}</p>
          <p className="text-xs text-orange-600 mt-1">Promedio de atraso</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg">
          <p className="text-yellow-800 text-sm font-semibold mb-1">💰 Monto en Mora</p>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(montoEnMora)}</p>
          <p className="text-xs text-yellow-600 mt-1">Por cobrar de clientes atrasados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filtro === 'todos'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
          }`}
        >
          Todos ({clientesEnMora.length})
        </button>
        <button
          onClick={() => setFiltro('critico')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filtro === 'critico'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
          }`}
        >
          Crítico ({clientesEnMora.filter(c => c.diasAtrasado > 5).length})
        </button>
      </div>

      {/* Lista de clientes en mora */}
      {clientesFiltrados.length > 0 ? (
        <div className="space-y-3">
          {clientesFiltrados
            .sort((a, b) => b.diasAtrasado - a.diasAtrasado)
            .map((cliente) => {
              const montoTotal = cliente.prestamo.montoTotal || cliente.prestamo.monto * 1.2;
              const cuotaDiaria = cliente.prestamo.cuotaDiaria || cliente.prestamo.monto * 1.2 / 24;
              const restante = montoTotal - ((cliente.prestamo.cuotasPagadas || 0) * cuotaDiaria);
              
              const porcentajeAtraso = cliente.diasAtrasado / 24 * 100;
              let colorAtraso = 'bg-yellow-100 border-yellow-400';
              let iconoAtraso = '⚠️';
              
              if (cliente.diasAtrasado > 10) {
                colorAtraso = 'bg-red-100 border-red-400';
                iconoAtraso = '🚨';
              } else if (cliente.diasAtrasado > 5) {
                colorAtraso = 'bg-orange-100 border-orange-400';
                iconoAtraso = '⚡';
              }

              return (
                <div
                  key={cliente.id}
                  className={`${colorAtraso} border-l-4 p-4 rounded-lg`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {iconoAtraso} {cliente.nombre}
                      </h4>
                      <p className="text-sm text-gray-600">
                        📋 {cliente.cedula} | 📱 {cliente.telefono}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">
                        {cliente.diasAtrasado} días sin pagar
                      </p>
                      <p className="text-xs text-gray-600">
                        {Math.round(porcentajeAtraso)}% de atraso
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="bg-white bg-opacity-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Préstamo</p>
                      <p className="font-bold">{formatCurrency(cliente.prestamo.monto)}</p>
                    </div>
                    <div className="bg-white bg-opacity-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Pagadas</p>
                      <p className="font-bold">{cliente.prestamo.cuotasPagadas || 0}/24</p>
                    </div>
                    <div className="bg-white bg-opacity-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Pendientes</p>
                      <p className="font-bold">{cliente.cuotasPendientes}</p>
                    </div>
                    <div className="bg-white bg-opacity-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Por Cobrar</p>
                      <p className="font-bold">{formatCurrency(Math.max(0, restante))}</p>
                    </div>
                  </div>

                  <div className="mb-3 bg-white bg-opacity-50 p-2 rounded">
                    <p className="text-xs text-gray-600 mb-1">Cuota Diaria: {formatCurrency(cuotaDiaria)}</p>
                    <div className="bg-gray-300 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-red-600 h-full transition-all"
                        style={{ width: `${(cliente.diasAtrasado / 24) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`https://wa.me/${cliente.telefono}?text=Hola%20${cliente.nombre},%20observamos%20que%20no%20has%20pagado%20en%20${cliente.diasAtrasado}%20días.%20Tienes%20${cliente.cuotasPendientes}%20cuotas%20pendientes%20por%20${formatCurrency(restante)}.%20Por%20favor,%20realiza%20el%20pago%20hoy.`, '_blank')}
                      className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded text-sm transition"
                    >
                      💬 WhatsApp Cobranza
                    </button>
                    <button
                      onClick={() => window.open(`tel:${cliente.telefono}`)}
                      className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded text-sm transition"
                    >
                      📞 Llamar
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg text-center">
          <p className="text-green-700 text-lg font-bold">✅ ¡Excelente!</p>
          <p className="text-green-600">No hay clientes en mora</p>
        </div>
      )}
    </div>
  );
};

export default PanelMora;

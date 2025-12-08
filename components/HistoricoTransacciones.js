import React, { useState, useMemo } from 'react';

const HistoricoTransacciones = ({
  prestamos,
  clientes,
  formatCurrency,
}) => {
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const transacciones = useMemo(() => {
    const trans = [];

    prestamos.forEach(p => {
      const cliente = clientes.find(c => c.id === p.clienteId);
      if (cliente) {
        trans.push({
          prestamoId: p.id,
          clienteId: p.clienteId,
          clienteNombre: cliente.nombre,
          monto: p.monto,
          montoTotal: p.montoTotal || p.monto * 1.2,
          cuotasPagadas: p.cuotasPagadas || 0,
          fechaCreacion: p.fechaCreacion,
          ultimoPago: p.ultimoPago,
          estado: p.estado,
          interes: p.interes || p.monto * 0.2,
        });
      }
    });

    // Filtrar
    let filtradas = trans;

    if (filtroCliente) {
      filtradas = filtradas.filter(t =>
        t.clienteNombre.toLowerCase().includes(filtroCliente.toLowerCase())
      );
    }

    if (filtroEstado !== 'todos') {
      filtradas = filtradas.filter(t => t.estado === filtroEstado);
    }

    // Ordenar por fecha más reciente
    return filtradas.sort((a, b) => {
      const fechaA = new Date(a.ultimoPago || a.fechaCreacion);
      const fechaB = new Date(b.ultimoPago || b.fechaCreacion);
      return fechaB - fechaA;
    });
  }, [prestamos, clientes, filtroCliente, filtroEstado]);

  const totalMonto = transacciones.reduce((sum, t) => sum + t.monto, 0);
  const totalInteres = transacciones.reduce((sum, t) => sum + t.interes, 0);
  const totalCobrado = transacciones.reduce((sum, t) => {
    const cuotaDiaria = t.montoTotal / 24;
    return sum + (t.cuotasPagadas * cuotaDiaria);
  }, 0);

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Buscar Cliente:
          </label>
          <input
            type="text"
            placeholder="Nombre o cédula..."
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Estado:
          </label>
          <div className="flex gap-2">
            {['todos', 'activo', 'pagado'].map(est => (
              <button
                key={est}
                onClick={() => setFiltroEstado(est)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filtroEstado === est
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {est === 'todos' ? 'Todos' : est === 'activo' ? 'Activos' : 'Pagados'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <p className="text-blue-800 text-xs font-semibold mb-1">Total Monto</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(totalMonto)}</p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg">
          <p className="text-green-800 text-xs font-semibold mb-1">Total Interés</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalInteres)}</p>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">
          <p className="text-purple-800 text-xs font-semibold mb-1">Total Cobrado</p>
          <p className="text-xl font-bold text-purple-600">{formatCurrency(totalCobrado)}</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-lg">
          <p className="text-yellow-800 text-xs font-semibold mb-1">Préstamos</p>
          <p className="text-xl font-bold text-yellow-600">{transacciones.length}</p>
        </div>
      </div>

      {/* Tabla de transacciones */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Cliente</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Monto</th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Cuotas</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Cobrado</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Fecha Creación</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Último Pago</th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transacciones.length > 0 ? (
              transacciones.map((t) => {
                const cuotaDiaria = t.montoTotal / 24;
                const cobrado = t.cuotasPagadas * cuotaDiaria;
                const restante = t.montoTotal - cobrado;

                return (
                  <tr key={t.prestamoId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{t.clienteNombre}</td>
                    <td className="px-4 py-3 text-blue-600 font-bold">{formatCurrency(t.monto)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        t.cuotasPagadas === 24 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {t.cuotasPagadas}/24
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">{formatCurrency(cobrado)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatearFecha(t.fechaCreacion)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatearFecha(t.ultimoPago)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        t.estado === 'activo'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {t.estado === 'activo' ? '🔄 Activo' : '✅ Pagado'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No hay transacciones
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoricoTransacciones;

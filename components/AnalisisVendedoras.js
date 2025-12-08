import React, { useMemo } from 'react';

const AnalisisVendedoras = ({
  vendedoras,
  clientes,
  prestamos,
  formatCurrency,
}) => {
  const analisis = useMemo(() => {
    const stats = [];

    vendedoras.forEach(v => {
      if (!v.esAdmin) {
        const clientesVendedora = clientes.filter(c => c.vendedoraId === v.id);
        const prestamosVendedora = prestamos.filter(p =>
          clientesVendedora.some(c => c.id === p.clienteId)
        );
        const prestamosActivos = prestamosVendedora.filter(p => p.estado === 'activo');
        const prestamosPagados = prestamosVendedora.filter(p => p.estado === 'pagado');

        let capitalEnCalle = 0;
        let interesCobrable = 0;

        prestamosActivos.forEach(p => {
          const montoTotal = p.montoTotal || p.monto * 1.2;
          const cuotaDiaria = p.cuotaDiaria || p.monto * 1.2 / 24;
          const restante = montoTotal - ((p.cuotasPagadas || 0) * cuotaDiaria);
          capitalEnCalle += Math.max(0, restante);
          interesCobrable += (p.interes || p.monto * 0.2);
        });

        let capitalCobrado = 0;
        prestamosPagados.forEach(p => {
          capitalCobrado += p.monto || 0;
        });

        const ganancia = interesCobrable * 0.25;

        stats.push({
          id: v.id,
          nombre: v.nombre,
          color: v.color,
          pin: v.pin,
          clientes: clientesVendedora.length,
          prestamosActivos: prestamosActivos.length,
          prestamosPagados: prestamosPagados.length,
          capitalEnCalle,
          capitalCobrado,
          interesCobrable,
          ganancia,
          capitalDisponible: v.capitalDisponible || 0,
        });
      }
    });

    return stats.sort((a, b) => b.capitalEnCalle - a.capitalEnCalle);
  }, [vendedoras, clientes, prestamos]);

  const totalClientes = analisis.reduce((sum, v) => sum + v.clientes, 0);
  const totalPrestamosActivos = analisis.reduce((sum, v) => sum + v.prestamosActivos, 0);
  const totalCapitalEnCalle = analisis.reduce((sum, v) => sum + v.capitalEnCalle, 0);
  const totalGanancia = analisis.reduce((sum, v) => sum + v.ganancia, 0);

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <p className="text-blue-800 text-xs font-semibold mb-1">Total Vendedoras</p>
          <p className="text-2xl font-bold text-blue-600">{analisis.length}</p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg">
          <p className="text-green-800 text-xs font-semibold mb-1">Total Clientes</p>
          <p className="text-2xl font-bold text-green-600">{totalClientes}</p>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">
          <p className="text-purple-800 text-xs font-semibold mb-1">Préstamos Activos</p>
          <p className="text-2xl font-bold text-purple-600">{totalPrestamosActivos}</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-lg">
          <p className="text-yellow-800 text-xs font-semibold mb-1">Total Ganancia</p>
          <p className="text-lg font-bold text-yellow-600">{formatCurrency(totalGanancia)}</p>
        </div>
      </div>

      {/* Tabla comparativa */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Vendedora</th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Clientes</th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Activos</th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Pagados</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">En la Calle</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Ganancia</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Disponible</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {analisis.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: v.color }}
                    ></div>
                    <span className="font-bold text-gray-800">{v.nombre}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-semibold">{v.clientes}</td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-bold">
                    {v.prestamosActivos}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-bold">
                    {v.prestamosPagados}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(v.capitalEnCalle)}</td>
                <td className="px-4 py-3 text-right font-bold text-green-600">{formatCurrency(v.ganancia)}</td>
                <td className="px-4 py-3 text-right font-bold text-blue-600">{formatCurrency(v.capitalDisponible)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas detalladas */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">📊 Detalle por Vendedora</h3>
        {analisis.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-lg shadow-md p-6 border-t-4"
            style={{ borderColor: v.color }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold text-gray-800">{v.nombre}</h4>
                <p className="text-xs text-gray-600 mt-1">PIN: {v.pin}</p>
              </div>
              <div
                className="px-4 py-2 rounded-lg text-white font-bold"
                style={{ backgroundColor: v.color }}
              >
                Ranking #{analisis.indexOf(v) + 1}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-xs mb-1">Clientes</p>
                <p className="text-2xl font-bold text-gray-800">{v.clientes}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((v.clientes / totalClientes) * 100).toFixed(1)}% del total
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800 text-xs mb-1">Préstamos Activos</p>
                <p className="text-2xl font-bold text-blue-600">{v.prestamosActivos}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {((v.prestamosActivos / totalPrestamosActivos) * 100).toFixed(1)}% del total
                </p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-green-800 text-xs mb-1">Pagados</p>
                <p className="text-2xl font-bold text-green-600">{v.prestamosPagados}</p>
                <p className="text-xs text-green-600 mt-1">Completamente pagados</p>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-purple-800 text-xs mb-1">Ganancia</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(v.ganancia)}</p>
                <p className="text-xs text-purple-600 mt-1">
                  {((v.ganancia / totalGanancia) * 100).toFixed(1)}% del total
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                <p className="text-red-800 text-sm">
                  💰 Capital en la Calle: <span className="font-bold">{formatCurrency(v.capitalEnCalle)}</span>
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                <p className="text-green-800 text-sm">
                  ✅ Capital Disponible: <span className="font-bold">{formatCurrency(v.capitalDisponible)}</span>
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-800 text-sm">
                  📊 Total (En Calle + Disponible): <span className="font-bold">{formatCurrency(v.capitalEnCalle + v.capitalDisponible)}</span>
                </p>
              </div>
            </div>

            {/* Barra de progreso de capital */}
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-gray-700 text-xs font-semibold mb-2">Distribución de Capital</p>
              <div className="flex gap-2 h-6">
                <div
                  className="bg-red-500 rounded-l-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    width: `${((v.capitalEnCalle / (v.capitalEnCalle + v.capitalDisponible)) * 100) || 0}%`,
                    minWidth: v.capitalEnCalle > 0 ? '40px' : '0px',
                  }}
                >
                  {v.capitalEnCalle > 0 && (
                    <span>{((v.capitalEnCalle / (v.capitalEnCalle + v.capitalDisponible)) * 100).toFixed(0)}%</span>
                  )}
                </div>
                <div
                  className="bg-green-500 rounded-r-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    width: `${((v.capitalDisponible / (v.capitalEnCalle + v.capitalDisponible)) * 100) || 0}%`,
                    minWidth: v.capitalDisponible > 0 ? '40px' : '0px',
                  }}
                >
                  {v.capitalDisponible > 0 && (
                    <span>{((v.capitalDisponible / (v.capitalEnCalle + v.capitalDisponible)) * 100).toFixed(0)}%</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>En la Calle: {formatCurrency(v.capitalEnCalle)}</span>
                <span>Disponible: {formatCurrency(v.capitalDisponible)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalisisVendedoras;

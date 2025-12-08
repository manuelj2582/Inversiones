import React, { useState, useMemo } from 'react';

const PanelMetas = ({
  clientes,
  prestamos,
  vendedoras,
  formatCurrency,
}) => {
  const [metas, setMetas] = useState({
    capitalEnLaCalle: 50000000,
    clientesTotales: 150,
    prestamosPorVendedora: 50,
  });

  const [editando, setEditando] = useState(false);
  const [nuevasMetas, setNuevasMetas] = useState(metas);

  const estadisticas = useMemo(() => {
    let capitalTotal = 0;
    let prestamosActivos = 0;

    prestamos.forEach(p => {
      if (p.estado === 'activo') {
        const montoTotal = p.montoTotal || p.monto * 1.2;
        const cuotaDiaria = p.cuotaDiaria || p.monto * 1.2 / 24;
        const restante = montoTotal - ((p.cuotasPagadas || 0) * cuotaDiaria);
        capitalTotal += Math.max(0, restante);
        prestamosActivos += 1;
      }
    });

    const stats = {};
    vendedoras.forEach(v => {
      if (!v.esAdmin) {
        const clientesVendedora = clientes.filter(c => c.vendedoraId === v.id);
        const prestamosVendedora = prestamos.filter(p =>
          clientesVendedora.some(c => c.id === p.clienteId) && p.estado === 'activo'
        );

        stats[v.id] = {
          nombre: v.nombre,
          clientes: clientesVendedora.length,
          prestamos: prestamosVendedora.length,
        };
      }
    });

    return {
      capitalTotal,
      clientesTotales: clientes.length,
      prestamosTotales: prestamosActivos,
      estadisticasVendedoras: stats,
    };
  }, [prestamos, clientes, vendedoras]);

  const calcularProgreso = (actual, meta) => {
    return meta > 0 ? Math.min((actual / meta) * 100, 100) : 0;
  };

  const guardarMetas = () => {
    setMetas(nuevasMetas);
    setEditando(false);
    // Aquí irían guardados a Firebase si fuera necesario
  };

  return (
    <div className="space-y-6">
      {/* Botón editar metas */}
      <div className="flex justify-end">
        {!editando ? (
          <button
            onClick={() => {
              setNuevasMetas(metas);
              setEditando(true);
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            ⚙️ Editar Metas
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditando(false)}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              onClick={guardarMetas}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              Guardar Metas
            </button>
          </div>
        )}
      </div>

      {/* Metas principales */}
      {editando ? (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📝 Editar Metas</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Capital en la Calle (Meta):
            </label>
            <input
              type="number"
              value={nuevasMetas.capitalEnLaCalle}
              onChange={(e) =>
                setNuevasMetas({
                  ...nuevasMetas,
                  capitalEnLaCalle: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Actual: {formatCurrency(estadisticas.capitalTotal)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Total de Clientes (Meta):
            </label>
            <input
              type="number"
              value={nuevasMetas.clientesTotales}
              onChange={(e) =>
                setNuevasMetas({
                  ...nuevasMetas,
                  clientesTotales: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Actual: {estadisticas.clientesTotales} clientes
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Préstamos por Vendedora (Meta):
            </label>
            <input
              type="number"
              value={nuevasMetas.prestamosPorVendedora}
              onChange={(e) =>
                setNuevasMetas({
                  ...nuevasMetas,
                  prestamosPorVendedora: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Meta individual por vendedora
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Capital en la Calle */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-300">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-blue-800 text-sm font-semibold mb-1">💰 Capital en la Calle</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(estadisticas.capitalTotal)}</p>
              </div>
              <p className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                {Math.round(calcularProgreso(estadisticas.capitalTotal, metas.capitalEnLaCalle))}%
              </p>
            </div>
            <p className="text-xs text-blue-600 mb-2">Meta: {formatCurrency(metas.capitalEnLaCalle)}</p>
            <div className="bg-blue-300 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all"
                style={{
                  width: `${calcularProgreso(estadisticas.capitalTotal, metas.capitalEnLaCalle)}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-blue-600 mt-2 text-right">
              Falta: {formatCurrency(Math.max(0, metas.capitalEnLaCalle - estadisticas.capitalTotal))}
            </p>
          </div>

          {/* Total de Clientes */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-300">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-green-800 text-sm font-semibold mb-1">👥 Total de Clientes</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.clientesTotales}</p>
              </div>
              <p className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                {Math.round(calcularProgreso(estadisticas.clientesTotales, metas.clientesTotales))}%
              </p>
            </div>
            <p className="text-xs text-green-600 mb-2">Meta: {metas.clientesTotales}</p>
            <div className="bg-green-300 rounded-full h-3 overflow-hidden">
              <div
                className="bg-green-600 h-full transition-all"
                style={{
                  width: `${calcularProgreso(estadisticas.clientesTotales, metas.clientesTotales)}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-green-600 mt-2 text-right">
              Faltan: {Math.max(0, metas.clientesTotales - estadisticas.clientesTotales)}
            </p>
          </div>

          {/* Préstamos Totales */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-2 border-purple-300">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-purple-800 text-sm font-semibold mb-1">📊 Préstamos Activos</p>
                <p className="text-2xl font-bold text-purple-600">{estadisticas.prestamosTotales}</p>
              </div>
              <p className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                {Math.round(calcularProgreso(estadisticas.prestamosTotales, metas.prestamosPorVendedora * (vendedoras.filter(v => !v.esAdmin).length)))}%
              </p>
            </div>
            <p className="text-xs text-purple-600 mb-2">
              Meta: {metas.prestamosPorVendedora * (vendedoras.filter(v => !v.esAdmin).length)}
            </p>
            <div className="bg-purple-300 rounded-full h-3 overflow-hidden">
              <div
                className="bg-purple-600 h-full transition-all"
                style={{
                  width: `${calcularProgreso(estadisticas.prestamosTotales, metas.prestamosPorVendedora * (vendedoras.filter(v => !v.esAdmin).length))}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-purple-600 mt-2 text-right">
              Faltan: {Math.max(0, (metas.prestamosPorVendedora * (vendedoras.filter(v => !v.esAdmin).length)) - estadisticas.prestamosTotales)}
            </p>
          </div>
        </div>
      )}

      {/* Performance por vendedora */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Performance por Vendedora</h3>
        <div className="space-y-4">
          {Object.entries(estadisticas.estadisticasVendedoras).map(([id, stats]) => (
            <div key={id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-gray-800">{stats.nombre}</p>
                <p className="text-sm text-gray-600">
                  {stats.prestamos}/{metas.prestamosPorVendedora} préstamos
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="bg-green-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Clientes</p>
                  <p className="font-bold text-green-600">{stats.clientes}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Préstamos Activos</p>
                  <p className="font-bold text-blue-600">{stats.prestamos}</p>
                </div>
              </div>
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all"
                  style={{
                    width: `${calcularProgreso(stats.prestamos, metas.prestamosPorVendedora)}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {Math.round(calcularProgreso(stats.prestamos, metas.prestamosPorVendedora))}% de la meta
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PanelMetas;

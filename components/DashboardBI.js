import React, { useMemo } from 'react';

const DashboardBI = ({
  prestamos,
  clientes,
  vendedoras,
  formatCurrency,
}) => {
  const kpis = useMemo(() => {
    let capitalTotal = 0;
    let prestamosActivos = 0;
    let prestamosPagados = 0;
    let tasaMorosidad = 0;
    let rendimientoPromedio = 0;
    let crecimientoMensual = 0;

    // Cálculos
    prestamos.forEach(p => {
      if (p.estado === 'activo') {
        const montoTotal = p.montoTotal || p.monto * 1.2;
        const cuotaDiaria = p.cuotaDiaria || p.monto * 1.2 / 24;
        const restante = montoTotal - ((p.cuotasPagadas || 0) * cuotaDiaria);
        capitalTotal += Math.max(0, restante);
        prestamosActivos += 1;
      } else if (p.estado === 'pagado') {
        prestamosPagados += 1;
      }
    });

    // Tasa de morosidad (clientes sin pagar en más de 2 días)
    const clientesEnMora = prestamos.filter(p => {
      if (!p.ultimoPago || p.estado !== 'activo') return false;
      const hoy = new Date();
      const ultimoPago = new Date(p.ultimoPago);
      const diasSinPagar = Math.floor((hoy - ultimoPago) / (1000 * 60 * 60 * 24));
      return diasSinPagar > 2;
    }).length;

    tasaMorosidad = prestamosActivos > 0 ? (clientesEnMora / prestamosActivos) * 100 : 0;

    // Rendimiento promedio
    if (prestamos.length > 0) {
      const interesCobrado = prestamos.reduce((sum, p) => sum + (p.interes || p.monto * 0.2), 0);
      const capitalPrestado = prestamos.reduce((sum, p) => sum + (p.monto || 0), 0);
      rendimientoPromedio = capitalPrestado > 0 ? (interesCobrado / capitalPrestado) * 100 : 0;
    }

    return {
      capitalTotal,
      prestamosActivos,
      prestamosPagados,
      tasaMorosidad,
      rendimientoPromedio,
      totalClientes: clientes.length,
      prestamosCompletados: prestamosPagados,
    };
  }, [prestamos, clientes]);

  // Distribución por vendedora
  const distribucionVendedoras = useMemo(() => {
    return vendedoras
      .filter(v => !v.esAdmin)
      .map(v => {
        const clientesVendedora = clientes.filter(c => c.vendedoraId === v.id);
        const prestamosVendedora = prestamos.filter(p =>
          clientesVendedora.some(c => c.id === p.clienteId) && p.estado === 'activo'
        );

        let capital = 0;
        prestamosVendedora.forEach(p => {
          const montoTotal = p.montoTotal || p.monto * 1.2;
          const cuotaDiaria = p.cuotaDiaria || p.monto * 1.2 / 24;
          const restante = montoTotal - ((p.cuotasPagadas || 0) * cuotaDiaria);
          capital += Math.max(0, restante);
        });

        return {
          nombre: v.nombre,
          clientes: clientesVendedora.length,
          prestamos: prestamosVendedora.length,
          capital,
          porcentaje: (prestamosVendedora.length / prestamos.filter(p => p.estado === 'activo').length) * 100 || 0,
        };
      });
  }, [vendedoras, clientes, prestamos]);

  // Top 5 clientes por capital adeudado
  const top5Clientes = useMemo(() => {
    const clientesConCapital = clientes.map(c => {
      const prestamosCliente = prestamos.filter(p => p.clienteId === c.id && p.estado === 'activo');
      let capital = 0;
      prestamosCliente.forEach(p => {
        const montoTotal = p.montoTotal || p.monto * 1.2;
        const cuotaDiaria = p.cuotaDiaria || p.monto * 1.2 / 24;
        const restante = montoTotal - ((p.cuotasPagadas || 0) * cuotaDiaria);
        capital += Math.max(0, restante);
      });

      return {
        nombre: c.nombre,
        capital,
        prestamos: prestamosCliente.length,
      };
    });

    return clientesConCapital
      .filter(c => c.capital > 0)
      .sort((a, b) => b.capital - a.capital)
      .slice(0, 5);
  }, [clientes, prestamos]);

  // Tendencia de préstamos
  const tendenciaPrestaamos = useMemo(() => {
    const ultimos6Meses = [];
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() - i);
      const mes = fecha.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' });

      const prestamosMes = prestamos.filter(p => {
        if (!p.fechaCreacion) return false;
        const fechaP = new Date(p.fechaCreacion);
        return (
          fechaP.getMonth() === fecha.getMonth() &&
          fechaP.getFullYear() === fecha.getFullYear()
        );
      }).length;

      ultimos6Meses.push({
        mes,
        prestamos: prestamosMes,
        monto: prestamos
          .filter(p => {
            if (!p.fechaCreacion) return false;
            const fechaP = new Date(p.fechaCreacion);
            return (
              fechaP.getMonth() === fecha.getMonth() &&
              fechaP.getFullYear() === fecha.getFullYear()
            );
          })
          .reduce((sum, p) => sum + (p.monto || 0), 0),
      });
    }
    return ultimos6Meses;
  }, [prestamos]);

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-blue-100 text-sm mb-2">Capital en la Calle</p>
          <p className="text-3xl font-bold">{formatCurrency(kpis.capitalTotal)}</p>
          <p className="text-xs text-blue-200 mt-2">Total de préstamos activos</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-green-100 text-sm mb-2">Préstamos Activos</p>
          <p className="text-3xl font-bold">{kpis.prestamosActivos}</p>
          <p className="text-xs text-green-200 mt-2">En proceso de cobro</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-purple-100 text-sm mb-2">Completados</p>
          <p className="text-3xl font-bold">{kpis.prestamosPagados}</p>
          <p className="text-xs text-purple-200 mt-2">Préstamos pagados</p>
        </div>

        <div className={`bg-gradient-to-br ${kpis.tasaMorosidad > 10 ? 'from-red-500 to-red-600' : 'from-yellow-500 to-yellow-600'} text-white p-6 rounded-lg shadow-lg`}>
          <p className="text-yellow-100 text-sm mb-2">Tasa de Morosidad</p>
          <p className="text-3xl font-bold">{kpis.tasaMorosidad.toFixed(1)}%</p>
          <p className="text-xs text-yellow-200 mt-2">Clientes atrasados</p>
        </div>
      </div>

      {/* Gráfico de distribución por vendedora */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Distribución de Préstamos por Vendedora</h3>
        <div className="space-y-4">
          {distribucionVendedoras.map(v => (
            <div key={v.nombre}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">{v.nombre}</span>
                <span className="text-sm text-gray-600">
                  {v.prestamos} préstamos ({v.porcentaje.toFixed(1)}%)
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${v.porcentaje}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>{v.clientes} clientes</span>
                <span>{formatCurrency(v.capital)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 clientes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Top 5 Clientes por Capital Adeudado</h3>
        {top5Clientes.length > 0 ? (
          <div className="space-y-3">
            {top5Clientes.map((cliente, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <div>
                  <p className="font-semibold text-gray-800">#{idx + 1} {cliente.nombre}</p>
                  <p className="text-xs text-gray-600">{cliente.prestamos} préstamo(s)</p>
                </div>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(cliente.capital)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">No hay préstamos activos</p>
        )}
      </div>

      {/* Tendencia últimos 6 meses */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Tendencia Últimos 6 Meses</h3>
        <div className="space-y-4">
          {tendenciaPrestaamos.map((mes, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">{mes.mes}</span>
                <span className="text-sm text-gray-600">
                  {mes.prestamos} préstamos - {formatCurrency(mes.monto)}
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all"
                  style={{
                    width: `${Math.max(...tendenciaPrestaamos.map(m => m.prestamos)) > 0 
                      ? (mes.prestamos / Math.max(...tendenciaPrestaamos.map(m => m.prestamos))) * 100 
                      : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas de rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border-2 border-orange-300">
          <p className="text-orange-800 font-semibold mb-2">Rendimiento Promedio</p>
          <p className="text-3xl font-bold text-orange-600">{kpis.rendimientoPromedio.toFixed(1)}%</p>
          <p className="text-xs text-orange-700 mt-2">Interés sobre capital prestado</p>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-lg border-2 border-teal-300">
          <p className="text-teal-800 font-semibold mb-2">Tasa de Conversión</p>
          <p className="text-3xl font-bold text-teal-600">
            {((kpis.prestamosCompletados / (kpis.prestamosActivos + kpis.prestamosCompletados)) * 100 || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-teal-700 mt-2">Préstamos completados</p>
        </div>
      </div>

      {/* Información */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-3">ℹ️ Explicación de Métricas</h3>
        <ul className="text-blue-700 text-sm space-y-2">
          <li><strong>Capital en la Calle:</strong> Dinero pendiente por cobrar de préstamos activos</li>
          <li><strong>Tasa de Morosidad:</strong> % de clientes que no han pagado en más de 2 días</li>
          <li><strong>Rendimiento:</strong> Interés generado vs. capital prestado</li>
          <li><strong>Tasa de Conversión:</strong> % de préstamos completados vs. totales</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardBI;

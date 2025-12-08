import React, { useState, useMemo } from 'react';

const ReporteDiario = ({
  prestamos,
  formatCurrency,
}) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split('T')[0]
  );

  const reporteDiario = useMemo(() => {
    const fecha = new Date(fechaSeleccionada);
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    let cuotasPagadas = 0;
    let capitalCobrado = 0;
    let interesCobrado = 0;
    let prestamosAtendidos = 0;

    prestamos.forEach(p => {
      if (p.ultimoPago) {
        const ultimoPago = new Date(p.ultimoPago);
        if (ultimoPago >= fechaInicio && ultimoPago <= fechaFin) {
          cuotasPagadas += 1;
          const cuotaDiaria = p.cuotaDiaria || p.monto * 1.2 / 24;
          const capitalPorCuota = p.monto / 24;
          const interesPorCuota = cuotaDiaria - capitalPorCuota;
          
          capitalCobrado += capitalPorCuota;
          interesCobrado += interesPorCuota;
          prestamosAtendidos += 1;
        }
      }
    });

    const totalCobrado = capitalCobrado + interesCobrado;

    return {
      fecha: new Date(fechaSeleccionada).toLocaleDateString('es-CO'),
      cuotasPagadas,
      capitalCobrado,
      interesCobrado,
      totalCobrado,
      prestamosAtendidos,
    };
  }, [prestamos, fechaSeleccionada]);

  // Meta diaria = 100% de las cuotas que debería cobrar ese día
  const metaDiaria = useMemo(() => {
    const fecha = new Date(fechaSeleccionada);
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    let meta = 0;

    prestamos.forEach(p => {
      if (p.estado === 'activo') {
        // Calcular cuota diaria
        const cuotaDiaria = p.cuotaDiaria || p.monto * 1.2 / 24;
        
        // Si el préstamo está activo y no ha completado 24 cuotas
        if (p.fechaCreacion && (p.cuotasPagadas || 0) < 24) {
          const fechaCreacion = new Date(p.fechaCreacion);
          // Si fue creado antes o en la fecha seleccionada, suma la cuota
          if (fechaCreacion <= fechaFin) {
            meta += cuotaDiaria;
          }
        }
      }
    });

    return meta;
  }, [prestamos, fechaSeleccionada]);

  const porcentajeMeta = metaDiaria > 0 ? (reporteDiario.totalCobrado / metaDiaria) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Selector de fecha */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Seleccionar Fecha:
        </label>
        <input
          type="date"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
        />
      </div>

      {/* Resumen principal */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 rounded-lg shadow-lg text-white">
        <p className="text-blue-100 text-sm mb-2">REPORTE DE {reporteDiario.fecha.toUpperCase()}</p>
        <p className="text-4xl font-bold mb-2">{formatCurrency(reporteDiario.totalCobrado)}</p>
        <p className="text-blue-100">Total cobrado en el día</p>
      </div>

      {/* Progreso a meta */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-3">
          <p className="text-gray-700 font-semibold">Meta Diaria (100% de cuotas): {formatCurrency(metaDiaria)}</p>
          <p className="text-gray-600 text-sm">{Math.round(porcentajeMeta)}%</p>
        </div>
        <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all ${
              porcentajeMeta >= 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(porcentajeMeta, 100)}%` }}
          ></div>
        </div>
        <div className="mt-3 text-sm">
          {porcentajeMeta >= 100 ? (
            <p className="text-green-600 font-bold">✅ ¡Meta alcanzada! Extra: {formatCurrency(reporteDiario.totalCobrado - metaDiaria)}</p>
          ) : (
            <p className="text-orange-600">⏳ Falta: {formatCurrency(metaDiaria - reporteDiario.totalCobrado)}</p>
          )}
        </div>
      </div>

      {/* Detalles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg">
          <p className="text-green-800 text-xs font-semibold mb-1">Cuotas Cobradas</p>
          <p className="text-2xl font-bold text-green-600">{reporteDiario.cuotasPagadas}</p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <p className="text-blue-800 text-xs font-semibold mb-1">Capital Cobrado</p>
          <p className="text-lg font-bold text-blue-600">{formatCurrency(reporteDiario.capitalCobrado)}</p>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">
          <p className="text-purple-800 text-xs font-semibold mb-1">Interés Cobrado</p>
          <p className="text-lg font-bold text-purple-600">{formatCurrency(reporteDiario.interesCobrado)}</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-lg">
          <p className="text-yellow-800 text-xs font-semibold mb-1">Préstamos Atendidos</p>
          <p className="text-2xl font-bold text-yellow-600">{reporteDiario.prestamosAtendidos}</p>
        </div>
      </div>

      {/* Información sobre meta */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-3">📊 Cálculo de Meta Diaria</h3>
        <p className="text-blue-700 text-sm mb-2">
          La meta diaria es el <strong>100% de las cuotas que deberían cobrarse</strong> en ese día.
        </p>
        <p className="text-blue-700 text-sm mb-2">
          Se calcula sumando la cuota diaria de cada préstamo activo que aún no ha completado sus 24 cuotas.
        </p>
        <p className="text-blue-700 text-sm">
          <strong>Meta actual:</strong> {formatCurrency(metaDiaria)} 
          ({reporteDiario.cuotasPagadas > 0 ? 'Cuotas esperadas en el día' : 'Sin cuotas esperadas'})
        </p>
      </div>

      {/* Distribución */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Distribución de Cobros</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-800 font-semibold">Capital (67%)</span>
            <span className="text-blue-600 font-bold">{formatCurrency(reporteDiario.capitalCobrado)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <span className="text-purple-800 font-semibold">Interés (20%)</span>
            <span className="text-purple-600 font-bold">{formatCurrency(reporteDiario.interesCobrado)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-2 border-green-300">
            <span className="text-green-800 font-bold">TOTAL COBRADO</span>
            <span className="text-green-600 font-bold text-lg">{formatCurrency(reporteDiario.totalCobrado)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-2 border-yellow-300">
            <span className="text-yellow-800 font-bold">META DIARIA (100%)</span>
            <span className="text-yellow-600 font-bold text-lg">{formatCurrency(metaDiaria)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReporteDiario;

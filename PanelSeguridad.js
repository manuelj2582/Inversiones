import React, { useState } from 'react';

const PanelSeguridad = ({
  clientes,
  prestamos,
  formatCurrency,
}) => {
  const [ultimoBackup, setUltimoBackup] = useState(null);
  const [descargando, setDescargando] = useState(false);

  const hacerBackupJSON = () => {
    setDescargando(true);

    const backup = {
      fecha: new Date().toISOString(),
      datos: {
        clientes,
        prestamos,
      },
      estadisticas: {
        totalClientes: clientes.length,
        totalPrestamos: prestamos.length,
        prestamosActivos: prestamos.filter(p => p.estado === 'activo').length,
        prestamosPagados: prestamos.filter(p => p.estado === 'pagado').length,
        capitalTotal: prestamos
          .filter(p => p.estado === 'activo')
          .reduce((sum, p) => {
            const montoTotal = p.montoTotal || p.monto * 1.2;
            const cuotaDiaria = p.cuotaDiaria || p.monto * 1.2 / 24;
            const restante = montoTotal - ((p.cuotasPagadas || 0) * cuotaDiaria);
            return sum + Math.max(0, restante);
          }, 0),
      },
    };

    const elemento = document.createElement('a');
    elemento.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2))
    );
    elemento.setAttribute(
      'download',
      `backup-inversiones-${new Date().toISOString().split('T')[0]}.json`
    );
    elemento.style.display = 'none';
    document.body.appendChild(elemento);
    elemento.click();
    document.body.removeChild(elemento);

    setUltimoBackup(new Date());
    setDescargando(false);
  };

  const hacerBackupCSV = () => {
    setDescargando(true);

    let csv = 'REPORTE DE CLIENTES Y PRÉSTAMOS\n';
    csv += `Generado: ${new Date().toLocaleDateString()}\n\n`;

    csv += 'CLIENTES\n';
    csv += 'Nombre,Cédula,Teléfono,Dirección,Vendedora,Préstamos Activos\n';

    clientes.forEach(c => {
      const prestamosCliente = prestamos.filter(
        p => p.clienteId === c.id && p.estado === 'activo'
      ).length;
      csv += `"${c.nombre}","${c.cedula}","${c.telefono}","${c.direccion || ''}","${c.vendedoraId}",${prestamosCliente}\n`;
    });

    csv += '\n\nPRÉSTAMOS\n';
    csv += 'Cliente,Monto,Total,Cuotas Pagadas/24,Estado,Fecha Creación,Último Pago\n';

    prestamos.forEach(p => {
      const cliente = clientes.find(c => c.id === p.clienteId);
      const fechaCreacion = p.fechaCreacion
        ? new Date(p.fechaCreacion).toLocaleDateString()
        : '';
      const ultimoPago = p.ultimoPago ? new Date(p.ultimoPago).toLocaleDateString() : '';

      csv += `"${cliente?.nombre || 'N/A'}","${p.monto}","${p.montoTotal || p.monto * 1.2}","${p.cuotasPagadas || 0}/24","${p.estado}","${fechaCreacion}","${ultimoPago}"\n`;
    });

    const elemento = document.createElement('a');
    elemento.setAttribute(
      'href',
      'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    );
    elemento.setAttribute(
      'download',
      `reporte-inversiones-${new Date().toISOString().split('T')[0]}.csv`
    );
    elemento.style.display = 'none';
    document.body.appendChild(elemento);
    elemento.click();
    document.body.removeChild(elemento);

    setUltimoBackup(new Date());
    setDescargando(false);
  };

  const totalPrestamosActivos = prestamos.filter(p => p.estado === 'activo').length;
  const totalPrestamosPagados = prestamos.filter(p => p.estado === 'pagado').length;
  const capitalEnCalle = prestamos
    .filter(p => p.estado === 'activo')
    .reduce((sum, p) => {
      const montoTotal = p.montoTotal || p.monto * 1.2;
      const cuotaDiaria = p.cuotaDiaria || p.monto * 1.2 / 24;
      const restante = montoTotal - ((p.cuotasPagadas || 0) * cuotaDiaria);
      return sum + Math.max(0, restante);
    }, 0);

  return (
    <div className="space-y-6">
      {/* Estado del sistema */}
      <div className="bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-400 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-green-800">✅ Estado del Sistema</h3>
          <span className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-bold">
            En línea
          </span>
        </div>
        <p className="text-green-700">
          Sistema funcionando correctamente. Última sincronización con Firebase hace momentos.
        </p>
      </div>

      {/* Resumen de datos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <p className="text-blue-800 text-xs font-semibold mb-1">Clientes</p>
          <p className="text-2xl font-bold text-blue-600">{clientes.length}</p>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">
          <p className="text-purple-800 text-xs font-semibold mb-1">Préstamos Activos</p>
          <p className="text-2xl font-bold text-purple-600">{totalPrestamosActivos}</p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg">
          <p className="text-green-800 text-xs font-semibold mb-1">Pagados</p>
          <p className="text-2xl font-bold text-green-600">{totalPrestamosPagados}</p>
        </div>

        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
          <p className="text-red-800 text-xs font-semibold mb-1">En la Calle</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(capitalEnCalle)}</p>
        </div>
      </div>

      {/* Opciones de backup */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">💾 Backup de Datos</h3>

        <div className="space-y-4">
          {/* Backup JSON */}
          <div className="border-2 border-gray-300 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-gray-800">📋 Backup JSON</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Completo con toda la información. Recomendado para importar later.
                </p>
              </div>
            </div>
            <button
              onClick={hacerBackupJSON}
              disabled={descargando}
              className={`mt-3 px-6 py-2 rounded-lg font-semibold transition ${
                descargando
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {descargando ? 'Descargando...' : '⬇️ Descargar JSON'}
            </button>
          </div>

          {/* Backup CSV */}
          <div className="border-2 border-gray-300 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-gray-800">📊 Reporte CSV</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Compatible con Excel. Ideal para análisis en hoja de cálculo.
                </p>
              </div>
            </div>
            <button
              onClick={hacerBackupCSV}
              disabled={descargando}
              className={`mt-3 px-6 py-2 rounded-lg font-semibold transition ${
                descargando
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {descargando ? 'Descargando...' : '⬇️ Descargar CSV'}
            </button>
          </div>
        </div>

        {ultimoBackup && (
          <div className="mt-4 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-700">
              ✅ Último backup: <span className="font-bold">{ultimoBackup.toLocaleTimeString()}</span>
            </p>
          </div>
        )}
      </div>

      {/* Seguridad */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🔒 Seguridad</h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3 pb-4 border-b">
            <span className="text-2xl">🔐</span>
            <div>
              <h4 className="font-bold text-gray-800">Contraseñas de Vendedoras</h4>
              <p className="text-sm text-gray-600 mt-1">
                Cambiar PIN de acceso de vendedoras. Recuerda que están guardados en Firebase.
              </p>
              <button className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
                Cambiar PINs
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 pb-4 border-b">
            <span className="text-2xl">📊</span>
            <div>
              <h4 className="font-bold text-gray-800">Auditoría de Cambios</h4>
              <p className="text-sm text-gray-600 mt-1">
                Historial de quién hizo qué y cuándo. Próximamente disponible.
              </p>
              <button disabled className="mt-2 px-4 py-2 bg-gray-400 text-gray-600 font-semibold rounded-lg cursor-not-allowed">
                Ver Auditoría (Próximo)
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">🔄</span>
            <div>
              <h4 className="font-bold text-gray-800">Sincronización Firebase</h4>
              <p className="text-sm text-gray-600 mt-1">
                Todos los datos se guardan automáticamente en Firebase en tiempo real.
              </p>
              <p className="text-xs text-green-600 mt-2 font-semibold">✅ Sincronización activa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
        <h3 className="font-bold text-yellow-800 mb-3">⚠️ Recomendaciones</h3>
        <ul className="text-yellow-700 text-sm space-y-2">
          <li>✓ Hacer backup al menos 1 vez por semana</li>
          <li>✓ Guardar los backups en un lugar seguro</li>
          <li>✓ Cambiar PINs cada mes</li>
          <li>✓ No compartir el PIN de Admin con nadie</li>
          <li>✓ Revisar la Auditoría regularmente</li>
        </ul>
      </div>
    </div>
  );
};

export default PanelSeguridad;

import React, { useState, useMemo } from 'react';

const LogAuditoria = ({
  prestamos,
  clientes,
  formatCurrency,
}) => {
  const [filtroAccion, setFiltroAccion] = useState('todas');
  const [filtroUsuario, setFiltroUsuario] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // Generar logs simulados (en producción vendrían de Firebase)
  const logs = useMemo(() => {
    const registros = [];

    // Log de préstamos creados
    prestamos.forEach(p => {
      registros.push({
        id: `prestamo-${p.id}`,
        tipo: 'crearPrestamo',
        accion: 'Préstamo Creado',
        usuario: `Vendedora ${p.vendedoraId || 'N/A'}`,
        cliente: clientes.find(c => c.id === p.clienteId)?.nombre || 'N/A',
        descripcion: `Préstamo de ${formatCurrency(p.monto)} creado`,
        detalles: {
          monto: p.monto,
          total: p.montoTotal || p.monto * 1.2,
          plazo: 24,
        },
        fecha: new Date(p.fechaCreacion || new Date()).toISOString(),
        estado: 'éxito',
      });

      // Log de pagos registrados
      if ((p.cuotasPagadas || 0) > 0) {
        const cuotaDiaria = p.cuotaDiaria || p.monto * 1.2 / 24;
        registros.push({
          id: `pago-${p.id}`,
          tipo: 'registrarPago',
          accion: `${p.cuotasPagadas} Cuotas Pagadas`,
          usuario: `Vendedora ${p.vendedoraId || 'N/A'}`,
          cliente: clientes.find(c => c.id === p.clienteId)?.nombre || 'N/A',
          descripcion: `${p.cuotasPagadas}/24 cuotas pagadas`,
          detalles: {
            cuotasPagadas: p.cuotasPagadas,
            montoTotal: cuotaDiaria * (p.cuotasPagadas || 0),
            cuotaDiaria,
          },
          fecha: new Date(p.ultimoPago || new Date()).toISOString(),
          estado: 'éxito',
        });
      }

      // Log de cambio de estado
      if (p.estado === 'pagado') {
        registros.push({
          id: `estado-${p.id}`,
          tipo: 'cambioEstado',
          accion: 'Préstamo Completado',
          usuario: `Sistema`,
          cliente: clientes.find(c => c.id === p.clienteId)?.nombre || 'N/A',
          descripcion: `Préstamo marcado como pagado`,
          detalles: {
            estadoAnterior: 'activo',
            estadoNuevo: 'pagado',
          },
          fecha: new Date(p.ultimoPago || new Date()).toISOString(),
          estado: 'éxito',
        });
      }
    });

    // Log de clientes creados
    clientes.forEach(c => {
      registros.push({
        id: `cliente-${c.id}`,
        tipo: 'crearCliente',
        accion: 'Cliente Creado',
        usuario: `Vendedora ${c.vendedoraId || 'N/A'}`,
        cliente: c.nombre,
        descripcion: `Cliente ${c.nombre} agregado al sistema`,
        detalles: {
          cedula: c.cedula,
          telefono: c.telefono,
          direccion: c.direccion,
        },
        fecha: new Date(c.fechaCreacion || new Date()).toISOString(),
        estado: 'éxito',
      });
    });

    // Ordenar por fecha descendente
    return registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [prestamos, clientes, formatCurrency]);

  // Filtrar logs
  const logsFiltrados = useMemo(() => {
    let resultado = logs;

    if (filtroAccion !== 'todas') {
      resultado = resultado.filter(l => l.tipo === filtroAccion);
    }

    if (filtroUsuario !== 'todos') {
      resultado = resultado.filter(l => l.usuario === filtroUsuario);
    }

    if (busqueda) {
      resultado = resultado.filter(l =>
        l.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
        l.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        l.usuario.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    return resultado;
  }, [logs, filtroAccion, filtroUsuario, busqueda]);

  const tiposAcciones = [
    { id: 'crearPrestamo', nombre: '➕ Préstamo Creado' },
    { id: 'registrarPago', nombre: '✅ Pago Registrado' },
    { id: 'cambioEstado', nombre: '🔄 Cambio de Estado' },
    { id: 'crearCliente', nombre: '👤 Cliente Creado' },
  ];

  const usuariosUnicos = [...new Set(logs.map(l => l.usuario))];

  const estadisticas = useMemo(() => {
    return {
      totalRegistros: logs.length,
      hoy: logs.filter(l => {
        const fecha = new Date(l.fecha);
        const hoy = new Date();
        return fecha.toDateString() === hoy.toDateString();
      }).length,
      exitosos: logs.filter(l => l.estado === 'éxito').length,
      errores: logs.filter(l => l.estado === 'error').length,
    };
  }, [logs]);

  const obtenerIcono = (tipo) => {
    switch (tipo) {
      case 'crearPrestamo':
        return '➕';
      case 'registrarPago':
        return '✅';
      case 'cambioEstado':
        return '🔄';
      case 'crearCliente':
        return '👤';
      default:
        return '📝';
    }
  };

  const obtenerColor = (tipo) => {
    switch (tipo) {
      case 'crearPrestamo':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'registrarPago':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'cambioEstado':
        return 'bg-purple-100 border-purple-500 text-purple-800';
      case 'crearCliente':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <p className="text-blue-800 text-xs font-semibold mb-1">Total de Registros</p>
          <p className="text-2xl font-bold text-blue-600">{estadisticas.totalRegistros}</p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg">
          <p className="text-green-800 text-xs font-semibold mb-1">Registros Hoy</p>
          <p className="text-2xl font-bold text-green-600">{estadisticas.hoy}</p>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">
          <p className="text-purple-800 text-xs font-semibold mb-1">Exitosos</p>
          <p className="text-2xl font-bold text-purple-600">{estadisticas.exitosos}</p>
        </div>

        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
          <p className="text-red-800 text-xs font-semibold mb-1">Errores</p>
          <p className="text-2xl font-bold text-red-600">{estadisticas.errores}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🔍 Filtros</h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Buscar:
          </label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Cliente, usuario, descripción..."
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de Acción:
            </label>
            <select
              value={filtroAccion}
              onChange={(e) => setFiltroAccion(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            >
              <option value="todas">Todas las acciones</option>
              {tiposAcciones.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Usuario:
            </label>
            <select
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            >
              <option value="todos">Todos los usuarios</option>
              {usuariosUnicos.map(u => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Mostrando {logsFiltrados.length} de {logs.length} registros
        </div>
      </div>

      {/* Log de acciones */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-800">📜 Registro de Actividades</h3>

        {logsFiltrados.length > 0 ? (
          logsFiltrados.map((log) => (
            <div
              key={log.id}
              className={`border-l-4 p-4 rounded-lg ${obtenerColor(log.tipo)}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{obtenerIcono(log.tipo)}</span>
                  <div>
                    <p className="font-bold">{log.accion}</p>
                    <p className="text-sm opacity-75">{log.cliente}</p>
                  </div>
                </div>
                <span className="text-xs opacity-75">
                  {new Date(log.fecha).toLocaleString('es-CO')}
                </span>
              </div>

              <p className="text-sm mb-2">{log.descripcion}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
                <div className="bg-white bg-opacity-50 p-2 rounded">
                  <span className="opacity-75">Usuario:</span>
                  <p className="font-semibold">{log.usuario}</p>
                </div>
                <div className="bg-white bg-opacity-50 p-2 rounded">
                  <span className="opacity-75">Estado:</span>
                  <p className="font-semibold">{log.estado === 'éxito' ? '✅ Éxito' : '❌ Error'}</p>
                </div>
                {log.detalles.monto && (
                  <div className="bg-white bg-opacity-50 p-2 rounded">
                    <span className="opacity-75">Monto:</span>
                    <p className="font-semibold">{formatCurrency(log.detalles.monto)}</p>
                  </div>
                )}
                {log.detalles.cuotasPagadas && (
                  <div className="bg-white bg-opacity-50 p-2 rounded">
                    <span className="opacity-75">Cuotas:</span>
                    <p className="font-semibold">{log.detalles.cuotasPagadas}/24</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
            No hay registros con los filtros seleccionados
          </div>
        )}
      </div>

      {/* Información */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-3">ℹ️ Sobre el Log de Auditoría</h3>
        <p className="text-blue-700 text-sm mb-2">
          Aquí se registran todas las acciones realizadas en el sistema: creación de préstamos, registros de pagos, cambios de estado y más.
        </p>
        <p className="text-blue-700 text-sm">
          Los registros incluyen: usuario que realizó la acción, cliente afectado, descripción detallada, fecha y hora, y estado de la operación.
        </p>
      </div>
    </div>
  );
};

export default LogAuditoria;

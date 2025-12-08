import React, { useState, useMemo } from 'react';

const PanelCreditos = ({
  prestamos,
  clientes,
  formatCurrency,
  firebaseOperations,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [prestamoEdicion, setPrestamoEdicion] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formEdicion, setFormEdicion] = useState({});
  const [filtroVendedora, setFiltroVendedora] = useState('todas');

  const prestamosFiltrados = useMemo(() => {
    let resultado = prestamos;

    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(p => p.estado === filtroEstado);
    }

    // Filtrar por vendedora
    if (filtroVendedora !== 'todas') {
      resultado = resultado.filter(p => p.vendedoraId === parseInt(filtroVendedora));
    }

    // Filtrar por búsqueda (cliente)
    if (busqueda) {
      resultado = resultado.filter(p => {
        const cliente = clientes.find(c => c.id === p.clienteId);
        return cliente && (
          cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          cliente.cedula?.includes(busqueda) ||
          cliente.telefono?.includes(busqueda)
        );
      });
    }

    return resultado;
  }, [prestamos, clientes, busqueda, filtroEstado, filtroVendedora]);

  const abrirEdicion = (prestamo) => {
    setPrestamoEdicion(prestamo);
    setFormEdicion({
      monto: prestamo.monto,
      cuotasPagadas: prestamo.cuotasPagadas || 0,
      estado: prestamo.estado,
    });
    setMostrarModal(true);
  };

  const guardarEdicion = async () => {
    try {
      if (!firebaseOperations) throw new Error('Firebase no disponible');

      await firebaseOperations.actualizarPrestamo(prestamoEdicion.id, {
        monto: parseInt(formEdicion.monto),
        cuotasPagadas: parseInt(formEdicion.cuotasPagadas),
        estado: formEdicion.estado,
      });

      setMostrarModal(false);
      setPrestamoEdicion(null);
      alert('✅ Crédito actualizado correctamente');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al actualizar: ' + error.message);
    }
  };

  const eliminarCredito = async (prestamoId) => {
    if (window.confirm('⚠️ ¿Estás seguro de que quieres eliminar este crédito? Se devolverá el capital a la vendedora.')) {
      try {
        if (!firebaseOperations) throw new Error('Firebase no disponible');

        // Encontrar el préstamo
        const prestamo = prestamos.find(p => p.id === prestamoId);
        if (!prestamo) throw new Error('Crédito no encontrado');

        // Obtener vendedora actual
        const vendedoras = await firebaseOperations.obtenerVendedoras();
        const vendedora = vendedoras.find(v => v.id === prestamo.vendedoraId);
        
        if (!vendedora) throw new Error('Vendedora no encontrada');

        // Devolver el capital
        const capitalADevolver = prestamo.monto;
        const nuevoCapitalDisponible = (vendedora.capitalDisponible || 0) + capitalADevolver;

        // Actualizar vendedora
        await firebaseOperations.actualizarVendedora(prestamo.vendedoraId, {
          capitalDisponible: nuevoCapitalDisponible,
        });

        // Marcar préstamo como eliminado
        await firebaseOperations.actualizarPrestamo(prestamoId, {
          estado: 'eliminado',
        });

        alert(`✅ Crédito eliminado\n💰 Capital devuelto: ${formatCurrency(capitalADevolver)}`);
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar: ' + error.message);
      }
    }
  };

  const marcarComoPagado = async (prestamoId) => {
    if (window.confirm('¿Marcar este crédito como completamente pagado?')) {
      try {
        if (!firebaseOperations) throw new Error('Firebase no disponible');

        const prestamo = prestamos.find(p => p.id === prestamoId);
        if (prestamo) {
          await firebaseOperations.actualizarPrestamo(prestamoId, {
            cuotasPagadas: 24,
            estado: 'pagado',
          });

          alert('✅ Crédito marcado como pagado');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
      }
    }
  };

  const deshacerPago = async (prestamoId) => {
    if (window.confirm('¿Deshacer el último pago registrado?')) {
      try {
        if (!firebaseOperations) throw new Error('Firebase no disponible');

        const prestamo = prestamos.find(p => p.id === prestamoId);
        console.log('Deshaciendo pago del préstamo:', prestamo);
        
        if (!prestamo) {
          alert('❌ Préstamo no encontrado');
          return;
        }

        if (prestamo.cuotasPagadas <= 0) {
          alert('❌ No hay pagos para deshacer');
          return;
        }

        const cuotaDiaria = prestamo.cuotaDiaria || prestamo.monto * 1.2 / 24;
        const nuevasCuotas = prestamo.cuotasPagadas - 1;

        console.log('Actualizando préstamo:', { cuotasPagadas: nuevasCuotas, cuotaDiaria });

        // Actualizar préstamo
        await firebaseOperations.actualizarPrestamo(prestamoId, {
          cuotasPagadas: nuevasCuotas,
          estado: 'activo',
        });

        // No necesitamos actualizar vendedora aquí en el admin
        // Solo deshacemos el pago en el crédito

        alert(`✅ Pago deshecho\n💰 Cuota a devolver: ${formatCurrency(cuotaDiaria)}\n\nNota: El admin debe actualizar manualmente el capital de la vendedora si es necesario.`);
      } catch (error) {
        console.error('Error deshaciendo pago:', error);
        alert('❌ Error: ' + error.message);
      }
    }
  };

  const vendedorasUnicas = [...new Set(prestamos.map(p => p.vendedoraId))];

  const estadisticas = {
    total: prestamosFiltrados.length,
    activos: prestamosFiltrados.filter(p => p.estado === 'activo').length,
    pagados: prestamosFiltrados.filter(p => p.estado === 'pagado').length,
    monto: prestamosFiltrados.reduce((sum, p) => {
      if (p.estado === 'activo') {
        const montoTotal = p.montoTotal || p.monto * 1.2;
        const cuotaDiaria = p.cuotaDiaria || p.monto * 1.2 / 24;
        const restante = montoTotal - ((p.cuotasPagadas || 0) * cuotaDiaria);
        return sum + Math.max(0, restante);
      }
      return sum;
    }, 0),
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <p className="text-blue-800 text-xs font-semibold mb-1">Total Créditos</p>
          <p className="text-2xl font-bold text-blue-600">{estadisticas.total}</p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg">
          <p className="text-green-800 text-xs font-semibold mb-1">Activos</p>
          <p className="text-2xl font-bold text-green-600">{estadisticas.activos}</p>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">
          <p className="text-purple-800 text-xs font-semibold mb-1">Pagados</p>
          <p className="text-2xl font-bold text-purple-600">{estadisticas.pagados}</p>
        </div>

        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
          <p className="text-red-800 text-xs font-semibold mb-1">Por Cobrar</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(estadisticas.monto)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🔍 Buscar por Cliente:
          </label>
          <input
            type="text"
            placeholder="Nombre, cédula o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📊 Estado:
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="pagado">Pagados</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              👥 Vendedora:
            </label>
            <select
              value={filtroVendedora}
              onChange={(e) => setFiltroVendedora(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
            >
              <option value="todas">Todas</option>
              {vendedorasUnicas.map(id => (
                <option key={id} value={id}>
                  {id === 1 ? 'Yaney' : id === 2 ? 'Patricia' : `Vendedora ${id}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Créditos */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2">
            <tr>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700">Cliente</th>
              <th className="px-4 py-3 text-center text-xs sm:text-sm font-bold text-gray-700">Monto</th>
              <th className="px-4 py-3 text-center text-xs sm:text-sm font-bold text-gray-700">Cuotas</th>
              <th className="px-4 py-3 text-right text-xs sm:text-sm font-bold text-gray-700">Por Cobrar</th>
              <th className="px-4 py-3 text-center text-xs sm:text-sm font-bold text-gray-700">Estado</th>
              <th className="px-4 py-3 text-center text-xs sm:text-sm font-bold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {prestamosFiltrados.length > 0 ? (
              prestamosFiltrados.map((prestamo) => {
                const cliente = clientes.find(c => c.id === prestamo.clienteId);
                const montoTotal = prestamo.montoTotal || prestamo.monto * 1.2;
                const cuotaDiaria = prestamo.cuotaDiaria || prestamo.monto * 1.2 / 24;
                const restante = montoTotal - ((prestamo.cuotasPagadas || 0) * cuotaDiaria);

                return (
                  <tr key={prestamo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800 text-sm">
                      {cliente?.nombre}
                      <br />
                      <span className="text-xs text-gray-500">{cliente?.telefono}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-blue-600 font-bold text-sm">
                      {formatCurrency(prestamo.monto)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">
                        {prestamo.cuotasPagadas || 0}/24
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-600 text-sm">
                      {formatCurrency(Math.max(0, restante))}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        prestamo.estado === 'activo'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {prestamo.estado === 'activo' ? '🔄 Activo' : '✅ Pagado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        <button
                          onClick={() => abrirEdicion(prestamo)}
                          className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold transition"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        {prestamo.estado === 'activo' && prestamo.cuotasPagadas > 0 && (
                          <button
                            onClick={() => deshacerPago(prestamo.id)}
                            className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-semibold transition"
                            title="Deshacer último pago"
                          >
                            ↩️
                          </button>
                        )}
                        {prestamo.estado === 'activo' && (
                          <button
                            onClick={() => marcarComoPagado(prestamo.id)}
                            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition"
                            title="Marcar como pagado"
                          >
                            ✅
                          </button>
                        )}
                        <button
                          onClick={() => eliminarCredito(prestamo.id)}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No hay créditos con esos filtros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Edición */}
      {mostrarModal && prestamoEdicion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Editar Crédito
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Monto:
                </label>
                <input
                  type="number"
                  value={formEdicion.monto}
                  onChange={(e) => setFormEdicion({ ...formEdicion, monto: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Cuotas Pagadas:
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={formEdicion.cuotasPagadas}
                  onChange={(e) => setFormEdicion({ ...formEdicion, cuotasPagadas: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Estado:
                </label>
                <select
                  value={formEdicion.estado}
                  onChange={(e) => setFormEdicion({ ...formEdicion, estado: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                >
                  <option value="activo">Activo</option>
                  <option value="pagado">Pagado</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setMostrarModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelCreditos;

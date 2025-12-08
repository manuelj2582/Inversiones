import React, { useState, useMemo } from 'react';
import TarjetaCliente from './TarjetaCliente';
import ModalPrestamo from './ModalPrestamo';
import FormNuevoCliente from './FormNuevoCliente';

const HomeView = ({
  usuarioActual,
  clientes,
  prestamos,
  vendedoras,
  onRegistrarPago,
  onCrearCliente,
  onCrearPrestamo,
  onCerrarSesion,
  formatCurrency,
  firebaseOperations,
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarModalPrestamo, setMostrarModalPrestamo] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('activos');

  const clientesDelUsuario = useMemo(
    () => clientes.filter(c => c.vendedoraId === usuarioActual.id),
    [clientes, usuarioActual.id]
  );

  const prestamosDelUsuario = useMemo(
    () => prestamos.filter(p => clientesDelUsuario.some(c => c.id === p.clienteId)),
    [prestamos, clientesDelUsuario]
  );

  const clientesFiltrados = useMemo(() => {
    let resultado = clientesDelUsuario;

    if (busqueda.trim()) {
      resultado = resultado.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.cedula?.includes(busqueda) ||
        c.telefono?.includes(busqueda)
      );
    }

    if (filtro === 'activos') {
      resultado = resultado.filter(c =>
        prestamosDelUsuario.some(p => p.clienteId === c.id && p.estado === 'activo')
      );
    } else if (filtro === 'pagados') {
      resultado = resultado.filter(c =>
        !prestamosDelUsuario.some(p => p.clienteId === c.id && p.estado === 'activo')
      );
    }

    return resultado;
  }, [clientesDelUsuario, prestamosDelUsuario, busqueda, filtro]);

  const estadisticas = useMemo(() => {
    let capitalTotal = 0; // Lo que falta por cobrar
    let capitalDisponible = usuarioActual.capitalDisponible || 0;
    let prestamosPendientes = 0;

    prestamosDelUsuario.forEach(p => {
      if (p.estado === 'activo') {
        // Calcular lo que falta por cobrar
        const montoTotal = p.montoTotal || p.monto * 1.2;
        const cuotaDiaria = p.cuotaDiaria || p.monto * 1.2 / 24;
        const restante = montoTotal - ((p.cuotasPagadas || 0) * cuotaDiaria);
        
        capitalTotal += Math.max(0, restante);
        prestamosPendientes += 1;
      }
    });

    return {
      capitalTotal, // Total por cobrar (no baja con pagos)
      capitalDisponible,
      prestamosPendientes,
      totalClientes: clientesDelUsuario.length,
    };
  }, [prestamosDelUsuario, clientesDelUsuario, usuarioActual]);

  const manejarCrearCliente = async (datosCliente) => {
    try {
      await onCrearCliente(datosCliente);
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error creando cliente:', error);
    }
  };

  const manejarCrearPrestamo = async (datosPrestamo) => {
    try {
      if (clienteSeleccionado) {
        await onCrearPrestamo({
          ...datosPrestamo,
          clienteId: clienteSeleccionado.id,
          valorTotal: datosPrestamo.monto || datosPrestamo.valorTotal,
        });
        setMostrarModalPrestamo(false);
        setClienteSeleccionado(null);
      }
    } catch (error) {
      console.error('Error creando préstamo:', error);
    }
  };

  const manejarClickPrestamo = (cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarModalPrestamo(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Inversiones</h1>
              <p className="text-blue-100 text-sm mt-1">Bienvenido, {usuarioActual.nombre}</p>
            </div>
            <button
              onClick={onCerrarSesion}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition shadow-lg"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <p className="text-gray-600 text-sm mb-1">Total Prestado</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(estadisticas.capitalTotal)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <p className="text-gray-600 text-sm mb-1">Capital Disponible</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(estadisticas.capitalDisponible)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm mb-1">Préstamos Activos</p>
            <p className="text-2xl font-bold text-yellow-600">{estadisticas.prestamosPendientes}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm mb-1">Total Clientes</p>
            <p className="text-2xl font-bold text-purple-600">{estadisticas.totalClientes}</p>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Buscar por nombre, cédula o teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition shadow-md"
            >
              ➕ Nuevo Cliente
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            {['todos', 'activos', 'pagados'].map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filtro === f
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientesFiltrados.length > 0 ? (
            clientesFiltrados.map((cliente) => {
              const prestamosActivos = prestamosDelUsuario.filter(
                p => p.clienteId === cliente.id && p.estado === 'activo'
              );
              const prestamosPagados = prestamosDelUsuario.filter(
                p => p.clienteId === cliente.id && p.estado === 'pagado'
              );
              return (
                <TarjetaCliente
                  key={cliente.id}
                  cliente={cliente}
                  prestamosActivos={prestamosActivos}
                  prestamosPagados={prestamosPagados}
                  onAgregarPrestamo={() => manejarClickPrestamo(cliente)}
                  onRegistrarPago={(clienteId, prestamoIdx) => onRegistrarPago(clienteId, prestamoIdx)}
                  formatCurrency={formatCurrency}
                />
              );
            })
          ) : (
            <div className="col-span-full bg-white p-12 rounded-lg shadow-md text-center">
              <p className="text-gray-500 text-lg mb-4">
                {busqueda ? '❌ No se encontraron clientes' : '📭 No hay clientes registrados'}
              </p>
              {!busqueda && (
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  Crear primer cliente
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {mostrarFormulario && (
        <FormNuevoCliente
          onConfirmar={manejarCrearCliente}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}

      {mostrarModalPrestamo && clienteSeleccionado && (
        <ModalPrestamo
          cliente={clienteSeleccionado}
          onConfirmar={manejarCrearPrestamo}
          onCancelar={() => {
            setMostrarModalPrestamo(false);
            setClienteSeleccionado(null);
          }}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

export default HomeView;

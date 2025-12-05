import React, { useState } from 'react';
import TarjetaCliente from './TarjetaCliente';
import ModalPrestamo from './ModalPrestamo';
import FormNuevoCliente from './FormNuevoCliente';

const HomeView = ({
  clientes,
  vendedoras,
  vendedoraActiva,
  onAgregarCliente,
  onAgregarPrestamo,
  onActualizarCliente,
  onEliminarCliente,
  onCambiarVendedora,
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarModalPrestamo, setMostrarModalPrestamo] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('activos'); // 'activos', 'pagados', 'todos'

  // Filtrar clientes según estado
  const clientesFiltrados = clientes.filter((cliente) => {
    if (filtroEstado === 'activos') {
      return cliente.prestamos && cliente.prestamos.some((p) => p.estado === 'activo');
    }
    if (filtroEstado === 'pagados') {
      return cliente.prestamos && cliente.prestamos.some((p) => p.estado === 'pagado');
    }
    return true; // 'todos'
  });

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    let totalPrestamosActivos = 0;
    let totalCapital = 0;
    let totalInteres = 0;
    let totalRecaudado = 0;

    clientes.forEach((cliente) => {
      if (cliente.prestamos) {
        cliente.prestamos.forEach((prestamo) => {
          if (prestamo.estado === 'activo') {
            totalPrestamosActivos += 1;
            totalCapital += prestamo.monto;
            totalInteres += prestamo.interes;
          } else if (prestamo.estado === 'pagado') {
            totalRecaudado += prestamo.monto + prestamo.interes;
          }
        });
      }
    });

    return {
      totalPrestamosActivos,
      totalCapital,
      totalInteres,
      totalRecaudado,
      totalClientes: clientes.length,
    };
  };

  const estadisticas = calcularEstadisticas();

  const manejarClickPrestamo = (cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarModalPrestamo(true);
  };

  const manejarConfirmarPrestamo = async (datosPrestamo) => {
    if (clienteSeleccionado) {
      await onAgregarPrestamo(clienteSeleccionado.id, datosPrestamo);
      setMostrarModalPrestamo(false);
      setClienteSeleccionado(null);
    }
  };

  const manejarAgregarCliente = async (datosCliente) => {
    await onAgregarCliente(datosCliente);
    setMostrarFormulario(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Header con selector de vendedora */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Sistema Inversiones</h1>
          <div className="flex gap-3">
            {vendedoras.map((vendedora) => (
              <button
                key={vendedora.id}
                onClick={() => onCambiarVendedora(vendedora.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  vendedoraActiva === vendedora.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {vendedora.nombre} ({vendedora.pin})
              </button>
            ))}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-semibold">Total Clientes</p>
            <p className="text-2xl font-bold text-blue-600">{estadisticas.totalClientes}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-semibold">Préstamos Activos</p>
            <p className="text-2xl font-bold text-green-600">{estadisticas.totalPrestamosActivos}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm font-semibold">Capital Activo</p>
            <p className="text-2xl font-bold text-purple-600">
              ${estadisticas.totalCapital.toLocaleString()}
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm font-semibold">Interés Activo</p>
            <p className="text-2xl font-bold text-orange-600">
              ${estadisticas.totalInteres.toLocaleString()}
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <p className="text-gray-600 text-sm font-semibold">Recaudado</p>
            <p className="text-2xl font-bold text-indigo-600">
              ${estadisticas.totalRecaudado.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md"
        >
          ➕ Nuevo Cliente
        </button>

        <div className="flex gap-2 ml-auto">
          {['activos', 'pagados', 'todos'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filtroEstado === estado
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-600'
              }`}
            >
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientesFiltrados.length > 0 ? (
          clientesFiltrados.map((cliente) => (
            <TarjetaCliente
              key={cliente.id}
              cliente={cliente}
              onAgregarPrestamo={() => manejarClickPrestamo(cliente)}
              onActualizar={() => onActualizarCliente(cliente.id)}
              onEliminar={() => onEliminarCliente(cliente.id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No hay clientes para mostrar</p>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="mt-4 text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              Crear el primer cliente
            </button>
          </div>
        )}
      </div>

      {/* Modales */}
      {mostrarFormulario && (
        <FormNuevoCliente
          vendedoraActiva={vendedoraActiva}
          onConfirmar={manejarAgregarCliente}
          onCancelar={() => setMostrarFormulario(false)}
        />
      )}

      {mostrarModalPrestamo && clienteSeleccionado && (
        <ModalPrestamo
          cliente={clienteSeleccionado}
          onConfirmar={manejarConfirmarPrestamo}
          onCancelar={() => {
            setMostrarModalPrestamo(false);
            setClienteSeleccionado(null);
          }}
        />
      )}
    </div>
  );
};

export default HomeView;
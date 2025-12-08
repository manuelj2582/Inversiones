import React, { useState } from 'react';
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

  const clientesDelUsuario = clientes.filter(c => c.vendedoraId === usuarioActual.id);
  const prestamosDelUsuario = prestamos.filter(p => clientesDelUsuario.some(c => c.id === p.clienteId));

  const manejarCrearCliente = async (datosCliente) => {
    try {
      await onCrearCliente({
        ...datosCliente,
        vendedoraId: usuarioActual.id,
      });
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error creando cliente:', error);
      alert('Error: ' + error.message);
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

  const estadisticas = {
    totalClientes: clientesDelUsuario.length,
    prestamosActivos: prestamosDelUsuario.filter(p => p.estado === 'activo').length,
    capitalActivo: prestamosDelUsuario
      .filter(p => p.estado === 'activo')
      .reduce((sum, p) => sum + (p.monto || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Distribuidora Pro</h1>
              <p className="text-gray-600 mt-1">Bienvenido, {usuarioActual.nombre}</p>
            </div>
            <button
              onClick={onCerrarSesion}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm mb-1">Total Clientes</p>
            <p className="text-3xl font-bold text-blue-600">{estadisticas.totalClientes}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm mb-1">Préstamos Activos</p>
            <p className="text-3xl font-bold text-green-600">{estadisticas.prestamosActivos}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm mb-1">Capital Activo</p>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(estadisticas.capitalActivo)}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            ➕ Nuevo Cliente
          </button>
        </div>

        {/* Grid de clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientesDelUsuario.length > 0 ? (
            clientesDelUsuario.map((cliente) => {
              const prestamoActivo = prestamosDelUsuario.find(
                p => p.clienteId === cliente.id && p.estado === 'activo'
              );
              return (
                <TarjetaCliente
                  key={cliente.id}
                  cliente={cliente}
                  prestamoActivo={prestamoActivo}
                  onAgregarPrestamo={() => manejarClickPrestamo(cliente)}
                  onRegistrarPago={() => onRegistrarPago(cliente.id)}
                  formatCurrency={formatCurrency}
                />
              );
            })
          ) : (
            <div className="col-span-full bg-white p-12 rounded-lg shadow text-center">
              <p className="text-gray-500 text-lg mb-4">No hay clientes registrados</p>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Crear primer cliente
              </button>
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

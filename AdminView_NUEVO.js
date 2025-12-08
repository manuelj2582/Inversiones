import React, { useState } from 'react';

const AdminView = ({
  usuarioActual,
  clientes,
  prestamos,
  vendedoras,
  formatCurrency,
  onCerrarSesion,
}) => {
  const [tabActivo, setTabActivo] = useState('dashboard');

  // Cálculos para admin
  const capitalTotal = prestamos
    .filter(p => p.estado === 'activo')
    .reduce((sum, p) => sum + (p.monto || 0), 0);

  const retiroAdmin = capitalTotal * 0.1;

  const clientesConMora = clientes.filter(c => {
    const prestamoDelCliente = prestamos.find(p => p.clienteId === c.id && p.estado === 'activo');
    if (!prestamoDelCliente) return false;
    
    // Considerar mora si tiene más de 3 cuotas sin pagar
    const cuotasPendientes = 24 - (prestamoDelCliente.cuotasPagadas || 0);
    return cuotasPendientes > 3;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-sky-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-cyan-100 mt-1">Panel de Administración</p>
            </div>
            <button
              onClick={onCerrarSesion}
              className="bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setTabActivo('dashboard')}
              className={`px-6 py-4 font-semibold border-b-4 transition ${
                tabActivo === 'dashboard'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setTabActivo('vendedoras')}
              className={`px-6 py-4 font-semibold border-b-4 transition ${
                tabActivo === 'vendedoras'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              👩‍💼 Vendedoras
            </button>
            <button
              onClick={() => setTabActivo('mora')}
              className={`px-6 py-4 font-semibold border-b-4 transition ${
                tabActivo === 'mora'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              ⚠️ Mora ({clientesConMora.length})
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {tabActivo === 'dashboard' && (
          <>
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-cyan-500">
                <p className="text-gray-600 text-sm mb-2 font-semibold">Capital Total</p>
                <p className="text-3xl font-bold text-cyan-600">{formatCurrency(capitalTotal)}</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
                <p className="text-gray-600 text-sm mb-2 font-semibold">Tu Retiro (10%)</p>
                <p className="text-3xl font-bold text-yellow-600">{formatCurrency(retiroAdmin)}</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm mb-2 font-semibold">Total Clientes</p>
                <p className="text-3xl font-bold text-blue-600">{clientes.length}</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                <p className="text-gray-600 text-sm mb-2 font-semibold">Vendedoras Activas</p>
                <p className="text-3xl font-bold text-green-600">{vendedoras.length}</p>
              </div>
            </div>

            {/* Distribución */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-md border-l-4 border-green-500">
                <p className="text-green-900 font-semibold mb-2">Reinversión (65%)</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(capitalTotal * 0.65)}</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-md border-l-4 border-red-500">
                <p className="text-red-900 font-semibold mb-2">Vendedoras (25%)</p>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(capitalTotal * 0.25)}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                <p className="text-purple-900 font-semibold mb-2">Admin (10%)</p>
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(capitalTotal * 0.1)}</p>
              </div>
            </div>
          </>
        )}

        {tabActivo === 'vendedoras' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vendedoras.map((vendedora) => {
              const clientesVendedora = clientes.filter(c => c.vendedoraId === vendedora.id);
              const prestamosVendedora = prestamos.filter(p =>
                clientesVendedora.some(c => c.id === p.clienteId)
              );
              const capitalVendedora = prestamosVendedora
                .filter(p => p.estado === 'activo')
                .reduce((sum, p) => sum + (p.monto || 0), 0);

              return (
                <div key={vendedora.id} className="bg-white p-6 rounded-xl shadow-md border-t-4" style={{ borderTopColor: vendedora.color }}>
                  <h3 className="text-xl font-bold mb-4" style={{ color: vendedora.color }}>
                    {vendedora.nombre}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">PIN:</span>
                      <span className="font-semibold">{vendedora.pin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clientes Activos:</span>
                      <span className="font-semibold">{clientesVendedora.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capital:</span>
                      <span className="font-semibold">{formatCurrency(capitalVendedora)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Comisión (25%):</span>
                      <span className="font-bold text-green-600">{formatCurrency(capitalVendedora * 0.25)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tabActivo === 'mora' && (
          <div className="space-y-4">
            {clientesConMora.length > 0 ? (
              clientesConMora.map((cliente) => {
                const prestamoDelCliente = prestamos.find(p => p.clienteId === cliente.id && p.estado === 'activo');
                const deudaRestante = prestamoDelCliente
                  ? prestamoDelCliente.montoTotal - ((prestamoDelCliente.cuotasPagadas || 0) * (prestamoDelCliente.cuotaDiaria || 0))
                  : 0;

                return (
                  <div key={cliente.id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">{cliente.nombre}</h4>
                        <p className="text-sm text-gray-600">Cédula: {cliente.cedula}</p>
                        <p className="text-sm text-gray-600">Teléfono: {cliente.telefono}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Deuda Pendiente</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(deudaRestante)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          const mensaje = `Recordatorio: Tienes una deuda de ${formatCurrency(deudaRestante)} por tu préstamo.`;
                          window.open(`https://wa.me/57${cliente.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`, '_blank');
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition"
                      >
                        💬 WhatsApp
                      </button>
                      <button
                        onClick={() => window.open(`tel:${cliente.telefono}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                      >
                        ☎️ Llamar
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-green-50 p-12 rounded-xl text-center border-2 border-green-200">
                <p className="text-green-600 text-lg font-semibold">✓ No hay clientes en mora</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;

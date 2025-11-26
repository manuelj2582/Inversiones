import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Package, User, Phone, MapPin, TrendingUp, BarChart3, AlertCircle, Box } from 'lucide-react';

const SistemaInversiones = () => {
  const [vistaActual, setVistaActual] = useState('login');
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('pendientes');

  // Trabajadoras con nombres ficticios
  const [vendedoras] = useState([
    { id: 1, nombre: 'Carolina', pin: '1234', color: '#ef4444' },
    { id: 2, nombre: 'Patricia', pin: '5678', color: '#3b82f6' }
  ]);

  const [clientes, setClientes] = useState([
    {
      id: 1,
      nombre: 'Juan Pérez',
      cedula: '123456789',
      telefono: '3001234567',
      direccion: 'Calle 10 #20-30',
      zona: 'Centro',
      vendedoraId: 1,
      pedido: {
        valorTotal: 500000,
        cuotaDiaria: 25000,
        cuotasPagadas: 10,
        totalCuotas: 24,
        fechaInicio: '2025-01-15',
        ultimoPago: '2025-01-25'
      }
    },
    {
      id: 2,
      nombre: 'María García',
      cedula: '987654321',
      telefono: '3109876543',
      direccion: 'Carrera 5 #15-20',
      zona: 'Norte',
      vendedoraId: 1,
      pedido: {
        valorTotal: 300000,
        cuotaDiaria: 15000,
        cuotasPagadas: 5,
        totalCuotas: 24,
        fechaInicio: '2025-01-20',
        ultimoPago: '2025-01-24'
      }
    },
    {
      id: 3,
      nombre: 'Carlos Rodríguez',
      cedula: '456789123',
      telefono: '3156789012',
      direccion: 'Avenida 8 #30-40',
      zona: 'Sur',
      vendedoraId: 2,
      pedido: {
        valorTotal: 400000,
        cuotaDiaria: 20000,
        cuotasPagadas: 15,
        totalCuotas: 24,
        fechaInicio: '2025-01-10',
        ultimoPago: '2025-01-25'
      }
    },
    {
      id: 4,
      nombre: 'Ana López',
      cedula: '321654987',
      telefono: '3201234567',
      direccion: 'Calle 25 #10-15',
      zona: 'Occidente',
      vendedoraId: 2,
      pedido: {
        valorTotal: 600000,
        cuotaDiaria: 30000,
        cuotasPagadas: 20,
        totalCuotas: 24,
        fechaInicio: '2025-01-05',
        ultimoPago: '2025-01-24'
      }
    }
  ]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const registrarPago = (clienteId) => {
    const hoy = new Date().toISOString().split('T')[0];
    setClientes(clientes.map(c => {
      if (c.id === clienteId) {
        return {
          ...c,
          pedido: {
            ...c.pedido,
            cuotasPagadas: c.pedido.cuotasPagadas + 1,
            ultimoPago: hoy
          }
        };
      }
      return c;
    }));
  };

  const yaPagoHoy = (cliente) => {
    const hoy = new Date().toISOString().split('T')[0];
    return cliente.pedido.ultimoPago === hoy;
  };

  const clientesFiltrados = clientes
    .filter(c => c.vendedoraId === usuarioActual?.id)
    .filter(c => {
      const cumpleBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            c.cedula.includes(busqueda) ||
                            c.zona.toLowerCase().includes(busqueda.toLowerCase());
      
      if (filtro === 'pendientes') {
        return cumpleBusqueda && !yaPagoHoy(c) && c.pedido.cuotasPagadas < c.pedido.totalCuotas;
      } else if (filtro === 'cobrados') {
        return cumpleBusqueda && yaPagoHoy(c);
      } else {
        return cumpleBusqueda && c.pedido.cuotasPagadas < c.pedido.totalCuotas;
      }
    });

  const estadisticas = {
    pendientes: clientes.filter(c => c.vendedoraId === usuarioActual?.id && !yaPagoHoy(c) && c.pedido.cuotasPagadas < c.pedido.totalCuotas).length,
    cobradosHoy: clientes.filter(c => c.vendedoraId === usuarioActual?.id && yaPagoHoy(c)).length,
    totalRecaudarHoy: clientes
      .filter(c => c.vendedoraId === usuarioActual?.id && !yaPagoHoy(c) && c.pedido.cuotasPagadas < c.pedido.totalCuotas)
      .reduce((sum, c) => sum + c.pedido.cuotaDiaria, 0),
    recaudadoHoy: clientes
      .filter(c => c.vendedoraId === usuarioActual?.id && yaPagoHoy(c))
      .reduce((sum, c) => sum + c.pedido.cuotaDiaria, 0)
  };

  // Vista de Login
  const LoginView = () => {
    const [pin, setPin] = useState('');
    const [vendedoraSeleccionada, setVendedoraSeleccionada] = useState(null);

    const handleLogin = () => {
      if (!vendedoraSeleccionada) {
        alert('Por favor selecciona tu usuario');
        return;
      }
      const vendedora = vendedoras.find(v => v.id === vendedoraSeleccionada && v.pin === pin);
      if (vendedora) {
        setUsuarioActual(vendedora);
        setVistaActual('home');
        setPin('');
      } else {
        alert('PIN incorrecto');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={40} className="text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Inversiones</h1>
            <p className="text-gray-600">Control de Inventario</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Selecciona tu usuario</label>
            <div className="space-y-3">
              {vendedoras.map(v => (
                <button
                  key={v.id}
                  onClick={() => setVendedoraSeleccionada(v.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${
                    vendedoraSeleccionada === v.id 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3"
                      style={{ backgroundColor: v.color }}
                    >
                      {v.nombre.charAt(0)}
                    </div>
                    <span className="font-semibold text-lg">{v.nombre}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ingresa tu PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full text-center text-2xl font-bold border-2 border-gray-300 rounded-xl p-4 focus:border-emerald-500 focus:outline-none"
              placeholder="••••"
              maxLength="4"
              inputMode="numeric"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={!vendedoraSeleccionada}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition ${
              vendedoraSeleccionada
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Ingresar
          </button>

          <div className="mt-6 text-center text-xs text-gray-500">
            Sistema de Control de Inventario v1.0
          </div>
        </div>
      </div>
    );
  };

  // Vista Principal (Home)
  const HomeView = () => (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-b-3xl shadow-lg mb-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Hola, {usuarioActual?.nombre}! 👋</h2>
            <p className="text-emerald-100 text-sm">
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm('¿Cerrar sesión?')) {
                setUsuarioActual(null);
                setVistaActual('login');
              }
            }}
            className="bg-white/20 backdrop-blur-sm p-3 rounded-full active:scale-95 transition"
          >
            <User size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="text-white/80 text-xs mb-1">Pendientes Hoy</div>
            <div className="text-3xl font-bold">{estadisticas.pendientes}</div>
            <div className="text-xs text-white/80 mt-1">{formatCurrency(estadisticas.totalRecaudarHoy)}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="text-white/80 text-xs mb-1">Recaudados Hoy</div>
            <div className="text-3xl font-bold">{estadisticas.cobradosHoy}</div>
            <div className="text-xs text-white/80 mt-1">{formatCurrency(estadisticas.recaudadoHoy)}</div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente, zona o cédula..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-lg shadow-sm"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="px-4 mb-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFiltro('pendientes')}
          className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition active:scale-95 ${
            filtro === 'pendientes' 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-white text-gray-600 border-2 border-gray-200'
          }`}
        >
          ⏰ Pendientes ({estadisticas.pendientes})
        </button>
        <button
          onClick={() => setFiltro('cobrados')}
          className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition active:scale-95 ${
            filtro === 'cobrados' 
              ? 'bg-green-500 text-white shadow-lg' 
              : 'bg-white text-gray-600 border-2 border-gray-200'
          }`}
        >
          ✓ Cobrados ({estadisticas.cobradosHoy})
        </button>
        <button
          onClick={() => setFiltro('todos')}
          className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition active:scale-95 ${
            filtro === 'todos' 
              ? 'bg-emerald-500 text-white shadow-lg' 
              : 'bg-white text-gray-600 border-2 border-gray-200'
          }`}
        >
          📦 Todos
        </button>
      </div>

      {/* Tarjetas de clientes */}
      <div className="px-4 space-y-3 pb-6">
        {clientesFiltrados.map(cliente => {
          const pagado = yaPagoHoy(cliente);
          const progreso = (cliente.pedido.cuotasPagadas / cliente.pedido.totalCuotas) * 100;
          const completado = cliente.pedido.cuotasPagadas >= cliente.pedido.totalCuotas;

          return (
            <div
              key={cliente.id}
              className={`rounded-2xl shadow-lg overflow-hidden ${
                pagado ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-400' : 
                completado ? 'bg-gray-100 border-2 border-gray-300' :
                'bg-white border-2 border-gray-200'
              }`}
            >
              {/* Header de la tarjeta */}
              <div className="p-4 pb-3">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{cliente.nombre}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <MapPin size={14} className="mr-1" />
                      {cliente.zona}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone size={14} className="mr-1" />
                      {cliente.telefono}
                    </div>
                  </div>
                  {pagado && (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-md">
                      <CheckCircle size={14} className="mr-1" />
                      PAGÓ
                    </div>
                  )}
                  {completado && (
                    <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      COMPLETO
                    </div>
                  )}
                </div>

                {/* Monto grande */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-4 mb-3 shadow-md">
                  <div className="text-xs opacity-90 mb-1">Cuota Diaria</div>
                  <div className="text-3xl font-bold">{formatCurrency(cliente.pedido.cuotaDiaria)}</div>
                </div>

                {/* Progreso */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span className="font-medium">Progreso del Pedido</span>
                    <span className="font-bold">{cliente.pedido.cuotasPagadas}/{cliente.pedido.totalCuotas} cuotas</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progreso}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-sm font-bold text-gray-700 mt-1">{progreso.toFixed(0)}%</div>
                </div>

                {/* Detalles del pedido */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="text-gray-600 mb-1">Valor Total</div>
                    <div className="font-bold text-blue-700">{formatCurrency(cliente.pedido.valorTotal)}</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <div className="text-gray-600 mb-1">Saldo Restante</div>
                    <div className="font-bold text-orange-700">
                      {formatCurrency(cliente.pedido.cuotaDiaria * (cliente.pedido.totalCuotas - cliente.pedido.cuotasPagadas))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de cobro */}
              {!pagado && !completado && (
                <button
                  onClick={() => {
                    if (confirm(`¿Confirmar pago de ${formatCurrency(cliente.pedido.cuotaDiaria)} de ${cliente.nombre}?`)) {
                      registrarPago(cliente.id);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 font-bold text-lg flex items-center justify-center hover:from-green-600 hover:to-emerald-700 transition active:scale-95 shadow-lg"
                >
                  <CheckCircle size={24} className="mr-2" />
                  REGISTRAR PAGO {formatCurrency(cliente.pedido.cuotaDiaria)}
                </button>
              )}

              {pagado && (
                <div className="bg-green-500 text-white py-4 font-bold text-center flex items-center justify-center shadow-inner">
                  <CheckCircle size={20} className="mr-2" />
                  ✓ Registrado Hoy
                </div>
              )}
            </div>
          );
        })}

        {clientesFiltrados.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Box size={40} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No hay clientes para mostrar</p>
            <p className="text-gray-400 text-sm mt-1">Intenta cambiar el filtro o la búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {vistaActual === 'login' && <LoginView />}
      {vistaActual === 'home' && usuarioActual && <HomeView />}
    </div>
  );
};

export default SistemaInversiones;
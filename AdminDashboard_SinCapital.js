import React, { useState, useMemo } from 'react';
import PanelMora from './PanelMora';
import ReporteDiario from './ReporteDiario';
import HistoricoTransacciones from './HistoricoTransacciones';
import PanelCreditos from './PanelCreditos';
import PanelMetas from './PanelMetas';
import AnalisisVendedoras from './AnalisisVendedoras';
import PanelConfiguracion from './PanelConfiguracion';
import PanelSeguridad from './PanelSeguridad';
import GestionUsuarios from './GestionUsuarios';
import DashboardBI from './DashboardBI';
import LogAuditoria from './LogAuditoria';

const AdminDashboard = ({
  usuarioActual,
  vendedoras,
  clientes,
  prestamos,
  formatCurrency,
  onCerrarSesion,
  firebaseOperations,
}) => {

  const [mostrarModalCapital, setMostrarModalCapital] = useState(false);
  const [vendedoraSeleccionada, setVendedoraSeleccionada] = useState(null);
  const [capitalAgregar, setCapitalAgregar] = useState('');

  const estadisticas = useMemo(() => {
    let capitalTotal = 0;
    let interesTotal = 0;
    let miRetiro = 0;
    let totalClientes = 0;
    let prestamosTotales = 0;
    let capitalPorVendedora = {};

    prestamos.forEach(p => {
      if (p.estado === 'activo') {
        const montoTotal = p.montoTotal || p.monto * 1.2;
        const cuotaDiaria = p.cuotaDiaria || p.monto * 1.2 / 24;
        const restante = montoTotal - ((p.cuotasPagadas || 0) * cuotaDiaria);
        const montoRestante = Math.max(0, restante);
        
        capitalTotal += montoRestante;
        interesTotal += (p.interes || p.monto * 0.2);
        prestamosTotales += 1;
      }
    });

    miRetiro = interesTotal * 0.1;
    totalClientes = clientes.length;

    // Capital disponible total (suma de todas las vendedoras)
    let capitalDisponibleTotal = 0;
    vendedoras.forEach(v => {
      if (!v.esAdmin && v.capitalDisponible) {
        capitalDisponibleTotal += v.capitalDisponible;
      }
    });

    // Patrimonio total = capital disponible + capital en la calle
    const patrimonioTotal = capitalDisponibleTotal + capitalTotal;

    vendedoras.forEach(v => {
      if (!v.esAdmin) {
        const clientesVendedora = clientes.filter(c => c.vendedoraId === v.id);
        const prestamosVendedora = prestamos.filter(p => 
          clientesVendedora.some(c => c.id === p.clienteId) && p.estado === 'activo'
        );
        
        let capitalVendedora = 0;
        let interesVendedora = 0;
        
        prestamosVendedora.forEach(p => {
          const montoTotal = p.montoTotal || p.monto * 1.2;
          const cuotaDiaria = p.cuotaDiaria || p.monto * 1.2 / 24;
          const restante = montoTotal - ((p.cuotasPagadas || 0) * cuotaDiaria);
          capitalVendedora += Math.max(0, restante);
          interesVendedora += (p.interes || p.monto * 0.2);
        });
        
        const gananciaVendedora = interesVendedora * 0.25;
        
        capitalPorVendedora[v.id] = {
          nombre: v.nombre,
          clientes: clientesVendedora.length,
          prestamosActivos: prestamosVendedora.length,
          capital: capitalVendedora,
          interes: interesVendedora,
          ganancia: gananciaVendedora,
        };
      }
    });

    return {
      capitalTotal,
      capitalDisponibleTotal,
      patrimonioTotal,
      interesTotal,
      miRetiro,
      totalClientes,
      prestamosTotales,
      capitalPorVendedora,
      numVendedoras: vendedoras.filter(v => !v.esAdmin).length,
    };
  }, [prestamos, clientes, vendedoras]);

  const agregarCapital = async () => {
    try {
      if (!firebaseOperations) throw new Error('Firebase no disponible');
      if (!vendedoraSeleccionada) throw new Error('Vendedora no seleccionada');
      if (!capitalAgregar || capitalAgregar <= 0) {
        alert('❌ Ingresa un monto válido');
        return;
      }

      const monto = parseInt(capitalAgregar);
      const vendedora = vendedoras.find(v => v.id === vendedoraSeleccionada);
      
      if (!vendedora) throw new Error('Vendedora no encontrada');

      const nuevoCapital = (vendedora.capitalDisponible || 0) + monto;

      await firebaseOperations.actualizarVendedora(vendedoraSeleccionada, {
        capitalDisponible: nuevoCapital,
      });

      alert(`✅ Capital agregado\n💰 ${formatCurrency(monto)} a ${vendedora.nombre}\nNuevo capital: ${formatCurrency(nuevoCapital)}`);
      
      setMostrarModalCapital(false);
      setCapitalAgregar('');
      setVendedoraSeleccionada(null);
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">👑 Panel Administrativo</h1>
              <p className="text-purple-100 text-sm mt-1">Bienvenido, {usuarioActual.nombre}</p>
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

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'vendedoras', label: '👥 Vendedoras' },
            
            { id: 'creditos', label: '💳 Créditos' },
            { id: 'finanzas', label: '💰 Finanzas' },
            { id: 'mora', label: '🔴 Mora' },
            { id: 'reportes', label: '📈 Reportes Diarios' },
            { id: 'historico', label: '📜 Histórico' },
            { id: 'metas', label: '🎯 Metas' },
            { id: 'analisis', label: '🔍 Análisis' },
            { id: 'bi', label: '📊 BI' },
            { id: 'usuarios', label: '👨‍💼 Usuarios' },
            { id: 'auditoria', label: '📝 Auditoría' },
            { id: 'configuracion', label: '⚙️ Config' },
            { id: 'seguridad', label: '🔒 Seguridad' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                tab === t.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-6 rounded-lg shadow-lg text-white">
              <p className="text-purple-100 text-sm mb-2">👑 PATRIMONIO TOTAL</p>
              <p className="text-4xl font-bold">{formatCurrency(estadisticas.patrimonioTotal)}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-purple-600 bg-opacity-50 p-3 rounded-lg">
                  <p className="text-purple-100 text-xs">En la Calle</p>
                  <p className="text-xl font-bold">{formatCurrency(estadisticas.capitalTotal)}</p>
                </div>
                <div className="bg-purple-600 bg-opacity-50 p-3 rounded-lg">
                  <p className="text-purple-100 text-xs">Disponible</p>
                  <p className="text-xl font-bold">{formatCurrency(estadisticas.capitalDisponibleTotal)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                <p className="text-gray-600 text-sm mb-1">Capital en la Calle</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(estadisticas.capitalTotal)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                <p className="text-gray-600 text-sm mb-1">Tu Retiro (10%)</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(estadisticas.miRetiro)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm mb-1">Total Clientes</p>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.totalClientes}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                <p className="text-gray-600 text-sm mb-1">Préstamos Activos</p>
                <p className="text-2xl font-bold text-yellow-600">{estadisticas.prestamosTotales}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Distribución de Intereses</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-lg border-l-4 border-green-600">
                  <p className="text-green-800 text-sm font-semibold">Reinversión</p>
                  <p className="text-2xl font-bold text-green-700">65%</p>
                  <p className="text-xs text-green-600 mt-2">{formatCurrency(estadisticas.interesTotal * 0.65)}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-lg border-l-4 border-blue-600">
                  <p className="text-blue-800 text-sm font-semibold">Vendedoras</p>
                  <p className="text-2xl font-bold text-blue-700">25%</p>
                  <p className="text-xs text-blue-600 mt-2">{formatCurrency(estadisticas.interesTotal * 0.25)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-lg border-l-4 border-purple-600">
                  <p className="text-purple-800 text-sm font-semibold">Administrador</p>
                  <p className="text-2xl font-bold text-purple-700">10%</p>
                  <p className="text-xs text-purple-600 mt-2">{formatCurrency(estadisticas.miRetiro)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VENDEDORAS */}
        {tab === 'vendedoras' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">👥 Información de Vendedoras</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vendedoras
                .filter(v => !v.esAdmin)
                .map(vendedora => {
                  const info = estadisticas.capitalPorVendedora[vendedora.id] || {};
                  return (
                    <div
                      key={vendedora.id}
                      className="bg-white p-6 rounded-lg shadow-md border-t-4"
                      style={{ borderColor: vendedora.color }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-800">{vendedora.nombre}</h4>
                        <span
                          className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                          style={{ backgroundColor: vendedora.color }}
                        >
                          PIN: {vendedora.pin}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-600 text-xs font-semibold">Clientes</p>
                          <p className="text-2xl font-bold text-gray-800">{info.clientes || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-600 text-xs font-semibold">Préstamos</p>
                          <p className="text-2xl font-bold text-gray-800">{info.prestamosActivos || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-600 text-xs font-semibold">Capital</p>
                          <p className="text-lg font-bold text-gray-800">
                            {formatCurrency(info.capital || 0)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-800">
                            💰 Interés generado: <span className="font-bold">
                              {formatCurrency(info.interes || 0)}
                            </span>
                          </p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
                            🎁 Ganancia (25%): <span className="font-bold">
                              {formatCurrency(info.ganancia || 0)}
                            </span>
                          </p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm text-purple-800">
                            💵 Capital Disponible: <span className="font-bold">
                              {formatCurrency(vendedora.capitalDisponible || 0)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setVendedoraSeleccionada(vendedora.id);
                          setMostrarModalCapital(true);
                        }}
                        className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                      >
                        ➕ Agregar Capital
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* FINANZAS */}
        {tab === 'finanzas' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-100 to-green-200 p-6 rounded-lg border-l-4 border-green-600">
              <h3 className="text-2xl font-bold text-green-800 mb-2">💰 Tu Retiro Acumulado</h3>
              <p className="text-4xl font-bold text-green-700">{formatCurrency(estadisticas.miRetiro)}</p>
              <p className="text-sm text-green-600 mt-2">Equivalente al 10% del interés total generado</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Resumen Financiero</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Capital Total en la Calle:</span>
                  <span className="font-bold text-lg">{formatCurrency(estadisticas.capitalTotal)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Interés Total Generado (20%):</span>
                  <span className="font-bold text-lg">{formatCurrency(estadisticas.interesTotal)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Para Reinversión (65%):</span>
                  <span className="font-bold text-lg text-green-600">{formatCurrency(estadisticas.interesTotal * 0.65)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Para Vendedoras (25%):</span>
                  <span className="font-bold text-lg text-blue-600">{formatCurrency(estadisticas.interesTotal * 0.25)}</span>
                </div>
                <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg">
                  <span className="text-purple-800 font-bold">Tu Retiro (10%):</span>
                  <span className="font-bold text-lg text-purple-600">{formatCurrency(estadisticas.miRetiro)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CAPITAL */}

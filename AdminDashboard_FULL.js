import React, { useState, useMemo } from 'react';
import PanelMora from './PanelMora';
import ReporteDiario from './ReporteDiario';
import HistoricoTransacciones from './HistoricoTransacciones';
import PanelCreditos from './PanelCreditos';
import PanelCapital from './PanelCapital';
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
  const [tab, setTab] = useState('dashboard');
  const [mostrarModalEditarCapital, setMostrarModalEditarCapital] = useState(null);
  const [mostrarModalEditarPrestamo, setMostrarModalEditarPrestamo] = useState(null);
  const [nuevoCapital, setNuevoCapital] = useState('');
  const [prestamoEditando, setPrestamoEditando] = useState(null);

  const handleActualizarCapital = async (vendedoraId, monto) => {
    try {
      if (!firebaseOperations) throw new Error('Firebase no disponible');
      
      await firebaseOperations.actualizarVendedora(vendedoraId, {
        capitalDisponible: parseFloat(monto),
      });
      
      setMostrarModalEditarCapital(null);
      setNuevoCapital('');
      alert('✅ Capital actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando capital:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleEliminarPrestamo = async (prestamoId) => {
    if (!window.confirm('⚠️ ¿Estás seguro que deseas eliminar este crédito? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      if (!firebaseOperations) throw new Error('Firebase no disponible');
      
      // Obtener el préstamo para recuperar el capital
      const prestamo = prestamos.find(p => p.id === prestamoId);
      if (prestamo) {
        const vendedora = vendedoras.find(v => v.id === prestamo.vendedoraId);
        if (vendedora) {
          // Devolver el capital prestado a la vendedora
          const capitalDevuelto = prestamo.monto;
          const nuevoCapital = (vendedora.capitalDisponible || 0) + capitalDevuelto;
          
          await firebaseOperations.actualizarVendedora(vendedora.id, {
            capitalDisponible: nuevoCapital,
          });
        }
      }
      
      // Eliminar el préstamo
      await firebaseOperations.eliminarPrestamo(prestamoId);
      alert('✅ Crédito eliminado y capital devuelto');
    } catch (error) {
      console.error('Error eliminando préstamo:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleActualizarPrestamo = async (prestamoId, nuosDatos) => {
    try {
      if (!firebaseOperations) throw new Error('Firebase no disponible');
      
      await firebaseOperations.actualizarPrestamo(prestamoId, nuosDatos);
      setMostrarModalEditarPrestamo(null);
      setPrestamoEditando(null);
      alert('✅ Crédito actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando préstamo:', error);
      alert('Error: ' + error.message);
    }
  };

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
            { id: 'capital', label: '💵 Capital' },
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
                          setMostrarModalEditarCapital(vendedora.id);
                          setNuevoCapital(vendedora.capitalDisponible || 0);
                        }}
                        className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                      >
                        ✏️ Editar Capital
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
        {tab === 'capital' && (
          <PanelCapital
            vendedoras={vendedoras}
            clientes={clientes}
            prestamos={prestamos}
            formatCurrency={formatCurrency}
            firebaseOperations={firebaseOperations}
          />
        )}

        {/* CRÉDITOS */}
        {tab === 'creditos' && (
          <PanelCreditos
            prestamos={prestamos}
            clientes={clientes}
            vendedoras={vendedoras}
            formatCurrency={formatCurrency}
            firebaseOperations={firebaseOperations}
            onEditarPrestamo={(prestamo) => {
              setMostrarModalEditarPrestamo(prestamo.id);
              setPrestamoEditando(prestamo);
            }}
            onEliminarPrestamo={handleEliminarPrestamo}
          />
        )}

        {/* MORA */}
        {tab === 'mora' && (
          <PanelMora
            prestamos={prestamos}
            clientes={clientes}
            formatCurrency={formatCurrency}
            firebaseOperations={firebaseOperations}
          />
        )}

        {/* REPORTES DIARIOS */}
        {tab === 'reportes' && (
          <ReporteDiario
            prestamos={prestamos}
            formatCurrency={formatCurrency}
          />
        )}

        {/* HISTÓRICO */}
        {tab === 'historico' && (
          <HistoricoTransacciones
            prestamos={prestamos}
            clientes={clientes}
            formatCurrency={formatCurrency}
          />
        )}

        {/* METAS */}
        {tab === 'metas' && (
          <PanelMetas
            clientes={clientes}
            prestamos={prestamos}
            vendedoras={vendedoras}
            formatCurrency={formatCurrency}
          />
        )}

        {/* ANÁLISIS */}
        {tab === 'analisis' && (
          <AnalisisVendedoras
            vendedoras={vendedoras}
            clientes={clientes}
            prestamos={prestamos}
            formatCurrency={formatCurrency}
          />
        )}

        {/* BI */}
        {tab === 'bi' && (
          <DashboardBI
            prestamos={prestamos}
            clientes={clientes}
            vendedoras={vendedoras}
            formatCurrency={formatCurrency}
          />
        )}

        {/* USUARIOS */}
        {tab === 'usuarios' && (
          <GestionUsuarios
            vendedoras={vendedoras}
            formatCurrency={formatCurrency}
            onActualizarVendedora={(vendedoraActualizada) => {
              // Este callback guardará en Firebase cuando se implementa
              console.log('Vendedora actualizada:', vendedoraActualizada);
            }}
          />
        )}

        {/* AUDITORÍA */}
        {tab === 'auditoria' && (
          <LogAuditoria
            prestamos={prestamos}
            clientes={clientes}
            formatCurrency={formatCurrency}
          />
        )}

        {/* CONFIGURACIÓN */}
        {tab === 'configuracion' && (
          <PanelConfiguracion
            formatCurrency={formatCurrency}
          />
        )}

        {/* SEGURIDAD */}
        {tab === 'seguridad' && (
          <PanelSeguridad
            clientes={clientes}
            prestamos={prestamos}
            formatCurrency={formatCurrency}
          />
        )}
      </div>

      {/* Modal Agregar Capital */}
      {mostrarModalCapital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              ➕ Agregar Capital
            </h3>
            
            {vendedoraSeleccionada && vendedoras.find(v => v.id === vendedoraSeleccionada) && (
              <>
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: vendedoras.find(v => v.id === vendedoraSeleccionada).color + '20' }}>
                  <p className="text-sm text-gray-600 mb-1">Vendedora:</p>
                  <p className="text-lg font-bold text-gray-800">
                    {vendedoras.find(v => v.id === vendedoraSeleccionada).nombre}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 mb-1">Capital Actual:</p>
                  <p className="text-2xl font-bold" style={{ color: vendedoras.find(v => v.id === vendedoraSeleccionada).color }}>
                    {formatCurrency(vendedoras.find(v => v.id === vendedoraSeleccionada).capitalDisponible || 0)}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monto a Agregar:
                  </label>
                  <input
                    type="number"
                    value={capitalAgregar}
                    onChange={(e) => setCapitalAgregar(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none text-lg"
                  />
                  {capitalAgregar && (
                    <p className="mt-3 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                      💰 Nuevo capital: {formatCurrency((vendedoras.find(v => v.id === vendedoraSeleccionada).capitalDisponible || 0) + parseInt(capitalAgregar || 0))}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setMostrarModalCapital(false);
                      setCapitalAgregar('');
                      setVendedoraSeleccionada(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={agregarCapital}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                  >
                    Agregar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Editar Capital */}
      {mostrarModalEditarCapital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Editar Capital - {vendedoras.find(v => v.id === mostrarModalEditarCapital)?.nombre}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Capital Disponible:
              </label>
              <input
                type="number"
                value={nuevoCapital}
                onChange={(e) => setNuevoCapital(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMostrarModalEditarCapital(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleActualizarCapital(mostrarModalEditarCapital, nuevoCapital)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Préstamo */}
      {mostrarModalEditarPrestamo && prestamoEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Editar Crédito
            </h3>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Monto:
                </label>
                <input
                  type="number"
                  defaultValue={prestamoEditando.monto}
                  onChange={(e) => setPrestamoEditando({...prestamoEditando, monto: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cuotas Pagadas:
                </label>
                <input
                  type="number"
                  defaultValue={prestamoEditando.cuotasPagadas || 0}
                  onChange={(e) => setPrestamoEditando({...prestamoEditando, cuotasPagadas: parseInt(e.target.value)})}
                  min="0"
                  max="24"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMostrarModalEditarPrestamo(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleActualizarPrestamo(mostrarModalEditarPrestamo, {
                  monto: prestamoEditando.monto,
                  cuotasPagadas: prestamoEditando.cuotasPagadas,
                })}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
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

export default AdminDashboard;

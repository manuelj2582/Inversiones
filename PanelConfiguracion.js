import React, { useState } from 'react';

const PanelConfiguracion = ({
  formatCurrency,
}) => {
  const [configuracion, setConfiguracion] = useState({
    interesPorcentaje: 20,
    plazo: 24,
    comisionVendedora: 25,
    reinversion: 65,
    retiroAdmin: 10,
    metaDiaria: 500000,
  });

  const [editando, setEditando] = useState(false);
  const [nuevaConfig, setNuevaConfig] = useState(configuracion);

  const guardarConfiguracion = () => {
    setConfiguracion(nuevaConfig);
    setEditando(false);
    // Aquí iría guardado a Firebase
  };

  const validarDistribucion = () => {
    const total = nuevaConfig.comisionVendedora + nuevaConfig.reinversion + nuevaConfig.retiroAdmin;
    return total === 100;
  };

  return (
    <div className="space-y-6">
      {/* Botón editar */}
      <div className="flex justify-end">
        {!editando ? (
          <button
            onClick={() => {
              setNuevaConfig(configuracion);
              setEditando(true);
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            ✏️ Editar Configuración
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditando(false)}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              onClick={guardarConfiguracion}
              disabled={!validarDistribucion()}
              className={`px-6 py-2 font-semibold rounded-lg transition ${
                validarDistribucion()
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              Guardar Configuración
            </button>
          </div>
        )}
      </div>

      {/* Parámetros principales */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">⚙️ Parámetros del Negocio</h3>

        {editando ? (
          <div className="space-y-6">
            {/* Interés */}
            <div className="border-b pb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Porcentaje de Interés (%):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={nuevaConfig.interesPorcentaje}
                onChange={(e) =>
                  setNuevaConfig({
                    ...nuevaConfig,
                    interesPorcentaje: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Ejemplo: Si un cliente toma $1.000.000, pagará $1.200.000 (con 20% de interés)
              </p>
            </div>

            {/* Plazo */}
            <div className="border-b pb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Plazo (días):
              </label>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={nuevaConfig.plazo}
                onChange={(e) =>
                  setNuevaConfig({
                    ...nuevaConfig,
                    plazo: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Número de cuotas diarias. Actual: {nuevaConfig.plazo} cuotas
              </p>
            </div>

            {/* Meta diaria */}
            <div className="border-b pb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meta Diaria de Cobros:
              </label>
              <input
                type="number"
                min="0"
                step="100000"
                value={nuevaConfig.metaDiaria}
                onChange={(e) =>
                  setNuevaConfig({
                    ...nuevaConfig,
                    metaDiaria: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Objetivo diario: {formatCurrency(nuevaConfig.metaDiaria)}
              </p>
            </div>

            {/* Distribución de intereses */}
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <h4 className="font-bold text-gray-800 mb-4">💰 Distribución de Intereses (debe sumar 100%)</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reinversión (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={nuevaConfig.reinversion}
                    onChange={(e) =>
                      setNuevaConfig({
                        ...nuevaConfig,
                        reinversion: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Comisión Vendedoras (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={nuevaConfig.comisionVendedora}
                    onChange={(e) =>
                      setNuevaConfig({
                        ...nuevaConfig,
                        comisionVendedora: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Retiro Administrador (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={nuevaConfig.retiroAdmin}
                    onChange={(e) =>
                      setNuevaConfig({
                        ...nuevaConfig,
                        retiroAdmin: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="bg-white p-3 rounded-lg border-2">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold">TOTAL:</span>
                    <span
                      className={`font-bold text-lg ${
                        validarDistribucion() ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {nuevaConfig.reinversion + nuevaConfig.comisionVendedora + nuevaConfig.retiroAdmin}%
                    </span>
                  </div>
                  {!validarDistribucion() && (
                    <p className="text-xs text-red-600">
                      ⚠️ La distribución debe sumar exactamente 100%
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Parámetros actuales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
                <p className="text-blue-800 text-sm font-semibold mb-1">Interés</p>
                <p className="text-2xl font-bold text-blue-600">{configuracion.interesPorcentaje}%</p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg">
                <p className="text-green-800 text-sm font-semibold mb-1">Plazo</p>
                <p className="text-2xl font-bold text-green-600">{configuracion.plazo} cuotas</p>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">
                <p className="text-purple-800 text-sm font-semibold mb-1">Meta Diaria</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(configuracion.metaDiaria)}</p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-lg">
                <p className="text-yellow-800 text-sm font-semibold mb-1">Ejemplo de Cuota</p>
                <p className="text-lg font-bold text-yellow-600">
                  {formatCurrency(1000000 * (1 + configuracion.interesPorcentaje / 100) / configuracion.plazo)}
                </p>
                <p className="text-xs text-yellow-700 mt-1">Por cada $1.000.000</p>
              </div>
            </div>

            {/* Distribución */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
              <h4 className="font-bold text-gray-800 mb-4">📊 Distribución de Intereses</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-gray-700">Reinversión</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="bg-green-500 rounded-full h-4"
                      style={{
                        width: `${configuracion.reinversion * 2}px`,
                      }}
                    ></div>
                    <span className="font-bold text-green-600 w-12 text-right">
                      {configuracion.reinversion}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-gray-700">Comisión Vendedoras</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="bg-blue-500 rounded-full h-4"
                      style={{
                        width: `${configuracion.comisionVendedora * 2}px`,
                      }}
                    ></div>
                    <span className="font-bold text-blue-600 w-12 text-right">
                      {configuracion.comisionVendedora}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Retiro Administrador</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="bg-purple-500 rounded-full h-4"
                      style={{
                        width: `${configuracion.retiroAdmin * 2}px`,
                      }}
                    ></div>
                    <span className="font-bold text-purple-600 w-12 text-right">
                      {configuracion.retiroAdmin}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
        <h4 className="font-bold text-blue-800 mb-3">ℹ️ Información</h4>
        <p className="text-blue-700 text-sm mb-2">
          <strong>Interés:</strong> Porcentaje que se suma al capital prestado. Se distribuye entre reinversión, vendedoras y admin.
        </p>
        <p className="text-blue-700 text-sm mb-2">
          <strong>Plazo:</strong> Número de cuotas diarias en las que se divide el préstamo.
        </p>
        <p className="text-blue-700 text-sm">
          <strong>Distribución:</strong> Cómo se reparte el interés cobrado. La suma siempre debe ser 100%.
        </p>
      </div>
    </div>
  );
};

export default PanelConfiguracion;

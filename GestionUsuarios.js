import React, { useState } from 'react';

const GestionUsuarios = ({ vendedoras, formatCurrency, firebaseOperations }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [vendedoraEditando, setVendedoraEditando] = useState(null);
  const [formData, setFormData] = useState({});
  const [cargando, setCargando] = useState(false);

  const handleEditar = (vendedora) => {
    setVendedoraEditando(vendedora);
    setFormData({
      nombre: vendedora.nombre,
      pin: vendedora.pin,
      color: vendedora.color,
      capitalDisponible: vendedora.capitalDisponible,
    });
    setMostrarModal(true);
  };

  const handleGuardar = async () => {
    setCargando(true);
    try {
      if (!firebaseOperations) throw new Error('Firebase no disponible');
      
      await firebaseOperations.actualizarVendedora(vendedoraEditando.id, formData);
      setMostrarModal(false);
      setVendedoraEditando(null);
      alert('✅ Vendedora actualizada correctamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">👨‍💼 Gestión de Usuarios</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendedoras.filter(v => !v.esAdmin).map(vendedora => (
          <div key={vendedora.id} className="bg-white p-6 rounded-lg shadow-md border-t-4" style={{ borderColor: vendedora.color }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-800">{vendedora.nombre}</h4>
              <span className="px-3 py-1 rounded-full text-white text-sm font-semibold" style={{ backgroundColor: vendedora.color }}>
                ID: {vendedora.id}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">PIN</p>
                <p className="text-lg font-bold text-gray-800 font-mono">{vendedora.pin}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Color</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: vendedora.color }}></div>
                  <p className="text-sm text-gray-800">{vendedora.color}</p>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Capital Disponible</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(vendedora.capitalDisponible || 0)}</p>
              </div>
            </div>

            <button
              onClick={() => handleEditar(vendedora)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              ✏️ Editar
            </button>
          </div>
        ))}
      </div>

      {/* Modal Editar */}
      {mostrarModal && vendedoraEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">✏️ Editar Vendedora</h3>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre:</label>
                <input
                  type="text"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">PIN (4 dígitos):</label>
                <input
                  type="text"
                  value={formData.pin || ''}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setFormData({...formData, pin: valor});
                  }}
                  maxLength="4"
                  placeholder="0000"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none font-mono text-lg font-bold"
                />
                <p className="text-xs text-gray-500 mt-1">Solo números, máximo 4 dígitos</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Color:</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={formData.color || '#000000'}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-16 h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{formData.color}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Capital Disponible:</label>
                <input
                  type="number"
                  value={formData.capitalDisponible || 0}
                  onChange={(e) => setFormData({...formData, capitalDisponible: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMostrarModal(false)}
                disabled={cargando}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={cargando}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {cargando ? '⏳ Guardando...' : '✅ Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;

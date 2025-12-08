import React, { useState } from 'react';

const FormNuevoCliente = ({ onConfirmar, onCancelar }) => {
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarConfirmar = async () => {
    setError('');

    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!cedula.trim()) {
      setError('La cédula es requerida');
      return;
    }

    if (!telefono.trim()) {
      setError('El teléfono es requerido');
      return;
    }

    if (!direccion.trim()) {
      setError('La dirección es requerida');
      return;
    }

    try {
      setCargando(true);
      await onConfirmar({
        nombre: nombre.trim(),
        cedula: cedula.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        estado: 'activo',
      });
    } catch (err) {
      setError('Error al crear cliente: ' + err.message);
      setCargando(false);
    }
  };

  const manejarKeyPress = (e) => {
    if (e.key === 'Enter' && !cargando) {
      manejarConfirmar();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Nuevo Cliente</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyPress={manejarKeyPress}
              placeholder="Juan Pérez"
              disabled={cargando}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none disabled:bg-gray-100"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cédula</label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              onKeyPress={manejarKeyPress}
              placeholder="1234567890"
              disabled={cargando}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              onKeyPress={manejarKeyPress}
              placeholder="3001234567"
              disabled={cargando}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              onKeyPress={manejarKeyPress}
              placeholder="Calle 1 #2"
              disabled={cargando}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onCancelar}
            disabled={cargando}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={manejarConfirmar}
            disabled={cargando}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            {cargando ? 'Guardando...' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormNuevoCliente;

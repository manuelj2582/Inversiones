import React, { useState, useMemo } from 'react';

const GestionUsuarios = ({
  vendedoras,
  formatCurrency,
  onActualizarVendedora,
}) => {
  const permisosPorRol = {
    vendedora: {
      verClientes: true,
      crearPrestamos: true,
      registrarPagos: true,
      verReportes: false,
      verConfiguracion: false,
      editarClientes: true,
    },
    supervisor: {
      verClientes: true,
      crearPrestamos: false,
      registrarPagos: false,
      verReportes: true,
      verConfiguracion: false,
      editarClientes: false,
    },
    contador: {
      verClientes: false,
      crearPrestamos: false,
      registrarPagos: false,
      verReportes: true,
      verConfiguracion: true,
      editarClientes: false,
    },
  };

  // Convertir vendedoras a usuarios
  const [usuarios, setUsuarios] = useState(
    vendedoras
      .filter(v => !v.esAdmin)
      .map(v => ({
        id: v.id,
        nombre: v.nombre,
        pin: v.pin,
        color: v.color,
        rol: v.rol || 'vendedora',
        estado: v.estado || 'activo',
        fechaCreacion: v.fechaCreacion || new Date().toISOString(),
        capitalInicial: v.capitalDisponible || 0,
        permisos: v.permisos || permisosPorRol['vendedora'],
      }))
  );

  const [editandoUsuario, setEditandoUsuario] = useState(null);

  const rolesDisponibles = [
    { id: 'vendedora', nombre: 'Vendedora', color: '#3b82f6', descripcion: 'Vende y cobra' },
    { id: 'supervisor', nombre: 'Supervisor', color: '#8b5cf6', descripcion: 'Supervisa vendedoras' },
    { id: 'contador', nombre: 'Contador', color: '#10b981', descripcion: 'Ver reportes y finanzas' },
  ];

  const actualizarUsuario = () => {
    if (onActualizarVendedora) {
      onActualizarVendedora({
        ...editandoUsuario,
      });
    }
    setEditandoUsuario(null);
  };

  const cambiarRol = (usuarioId, nuevoRol) => {
    const usuarioActualizado = usuarios.find(u => u.id === usuarioId);
    if (usuarioActualizado && onActualizarVendedora) {
      onActualizarVendedora({
        ...usuarioActualizado,
        rol: nuevoRol,
        permisos: permisosPorRol[nuevoRol],
      });
      
      setUsuarios(
        usuarios.map(u =>
          u.id === usuarioId
            ? {
                ...u,
                rol: nuevoRol,
                permisos: permisosPorRol[nuevoRol],
              }
            : u
        )
      );
    }
  };

  const cambiarEstado = (usuarioId, nuevoEstado) => {
    const usuarioActualizado = usuarios.find(u => u.id === usuarioId);
    if (usuarioActualizado && onActualizarVendedora) {
      onActualizarVendedora({
        ...usuarioActualizado,
        estado: nuevoEstado,
      });
      
      setUsuarios(
        usuarios.map(u =>
          u.id === usuarioId
            ? { ...u, estado: nuevoEstado }
            : u
        )
      );
    }
  };

  const usuariosActivos = usuarios.filter(u => u.estado === 'activo').length;
  const usuariosInactivos = usuarios.filter(u => u.estado === 'inactivo').length;

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
          <p className="text-blue-800 text-xs font-semibold mb-1">Usuarios Activos</p>
          <p className="text-2xl font-bold text-blue-600">{usuariosActivos}</p>
        </div>

        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
          <p className="text-red-800 text-xs font-semibold mb-1">Usuarios Inactivos</p>
          <p className="text-2xl font-bold text-red-600">{usuariosInactivos}</p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg">
          <p className="text-green-800 text-xs font-semibold mb-1">Total Usuarios</p>
          <p className="text-2xl font-bold text-green-600">{usuarios.length}</p>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">👥 Usuarios del Sistema</h3>

        {usuarios.map(usuario => {
          const rolInfo = rolesDisponibles.find(r => r.id === usuario.rol);
          const vendedoraOriginal = vendedoras.find(v => v.id === usuario.id);

          return (
            <div
              key={usuario.id}
              className="bg-white rounded-lg shadow-md p-6 border-t-4"
              style={{ borderColor: usuario.color }}
            >
              {editandoUsuario?.id === usuario.id ? (
                // Modo edición
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        PIN:
                      </label>
                      <input
                        type="text"
                        value={editandoUsuario.pin}
                        onChange={(e) =>
                          setEditandoUsuario({ ...editandoUsuario, pin: e.target.value })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rol:
                      </label>
                      <select
                        value={editandoUsuario.rol}
                        onChange={(e) =>
                          setEditandoUsuario({
                            ...editandoUsuario,
                            rol: e.target.value,
                            permisos: permisosPorRol[e.target.value],
                          })
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                      >
                        {rolesDisponibles.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estado:
                    </label>
                    <select
                      value={editandoUsuario.estado}
                      onChange={(e) =>
                        setEditandoUsuario({ ...editandoUsuario, estado: e.target.value })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                    >
                      <option value="activo">🟢 Activo</option>
                      <option value="inactivo">🔴 Inactivo</option>
                    </select>
                  </div>

                  <div className="space-y-2 p-3 bg-gray-50 rounded">
                    <h4 className="font-bold text-gray-800 mb-2">Permisos:</h4>
                    {Object.keys(editandoUsuario.permisos).map(permiso => (
                      <label key={permiso} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editandoUsuario.permisos[permiso]}
                          onChange={(e) =>
                            setEditandoUsuario({
                              ...editandoUsuario,
                              permisos: {
                                ...editandoUsuario.permisos,
                                [permiso]: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700 text-sm">{permiso}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={actualizarUsuario}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                    >
                      ✅ Guardar
                    </button>
                    <button
                      onClick={() => setEditandoUsuario(null)}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo vista
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{usuario.nombre}</h4>
                      <p className="text-sm text-gray-600">ID: {usuario.id}</p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-white text-sm font-bold"
                      style={{ backgroundColor: rolInfo?.color }}
                    >
                      {rolInfo?.nombre}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600">PIN</p>
                      <p className="font-bold">••••</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Estado</p>
                      <p className={`font-bold text-sm ${usuario.estado === 'activo' ? 'text-green-600' : 'text-red-600'}`}>
                        {usuario.estado === 'activo' ? '🟢 Activo' : '🔴 Inactivo'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Capital</p>
                      <p className="font-bold text-sm">{formatCurrency(vendedoraOriginal?.capitalDisponible || 0)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Creado</p>
                      <p className="font-bold text-sm">
                        {new Date(usuario.fechaCreacion).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Permisos:</strong> {Object.values(usuario.permisos).filter(Boolean).length}/{Object.keys(usuario.permisos).length} activos
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {Object.entries(usuario.permisos)
                        .filter(([_, valor]) => valor)
                        .map(([clave]) => clave)
                        .join(', ')}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setEditandoUsuario(usuario)}
                      className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => cambiarRol(usuario.id, usuario.rol === 'vendedora' ? 'supervisor' : 'vendedora')}
                      className="flex-1 min-w-[120px] px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                    >
                      🔄 {usuario.rol === 'vendedora' ? 'Supervisor' : 'Vendedora'}
                    </button>
                    <button
                      onClick={() => cambiarEstado(usuario.id, usuario.estado === 'activo' ? 'inactivo' : 'activo')}
                      className={`flex-1 min-w-[120px] px-4 py-2 text-white font-semibold rounded-lg transition ${
                        usuario.estado === 'activo'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {usuario.estado === 'activo' ? '🔴 Desactivar' : '🟢 Activar'}
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Información de roles */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-3">ℹ️ Roles Disponibles</h3>
        <div className="space-y-3">
          {rolesDisponibles.map(rol => (
            <div key={rol.id} className="flex items-start gap-3">
              <span
                className="w-4 h-4 rounded mt-1"
                style={{ backgroundColor: rol.color }}
              ></span>
              <div>
                <p className="font-semibold text-blue-800">{rol.nombre}</p>
                <p className="text-sm text-blue-700">{rol.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nota de integración */}
      <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
        <h3 className="font-bold text-green-800 mb-2">✅ Nota Importante</h3>
        <p className="text-green-700 text-sm">
          Los cambios realizados aquí se guardan en la colección <strong>vendedoras</strong> de Firebase. Los campos adicionales (rol, estado, permisos) se sincronizan automáticamente.
        </p>
      </div>
    </div>
  );
};

export default GestionUsuarios;

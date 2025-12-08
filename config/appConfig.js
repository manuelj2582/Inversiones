// Configuración de etiquetas de la aplicación
// Cambia estos valores para rebranding rápido

export const appConfig = {
  // Nombre de la app
  appName: 'Distribuidora Pro',
  appDescription: 'Gestor de Inventario y Distribución',
  
  // Términos clave
  terms: {
    // Lo que era "préstamo"
    prestamo: 'Distribución',
    prestamos: 'Distribuciones',
    crearPrestamo: 'Crear Distribución',
    cuota: 'Pago Retorno',
    cuotas: 'Pagos Retorno',
    
    // Lo que era "cliente"
    cliente: 'Punto de Venta',
    clientes: 'Puntos de Venta',
    
    // Lo que era "vendedora"
    vendedora: 'Ejecutiva',
    vendedoras: 'Ejecutivas',
    
    // Dinero/Capital
    capital: 'Mercancía',
    capitalEnCalle: 'Mercancía en Puntos',
    capitalDisponible: 'Mercancía Disponible',
    monto: 'Valor Mercancía',
    montoTotal: 'Valor Total con Retorno',
    
    // Estados
    activo: 'Distribución Activa',
    pagado: 'Retorno Completado',
    
    // Acciones
    registrarPago: 'Registrar Retorno',
    crearCliente: 'Crear Punto de Venta',
  },

  // Colores principales
  colors: {
    primary: '#3b82f6',    // Azul
    secondary: '#8b5cf6',  // Púrpura
    success: '#10b981',    // Verde
    danger: '#ef4444',     // Rojo
    warning: '#f59e0b',    // Naranja
  },

  // Mensajes
  messages: {
    bienvenida: '¡Bienvenido a Distribuidora Pro!',
    slogan: 'Gestiona tu inventario y distribuciones de forma eficiente',
    loginTitle: 'Acceso a Distribuidora Pro',
    loginDesc: 'Ingresa con tu PIN de ejecutiva',
  },

  // Valores por defecto
  defaults: {
    plazo: 24,           // 24 pagos
    interes: 20,         // 20% de interés/retorno
    metaDiaria: 500000,  // Meta diaria en dinero
  },
};

export default appConfig;

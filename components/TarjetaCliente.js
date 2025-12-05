import React from 'react';

export default function TarjetaCliente({ 
  cliente, 
  prestamo, 
  pagado, 
  estadoMora, 
  diasAtraso,
  onRegistrarPago,
  onEnviarWhatsApp
}) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const progreso = (prestamo.cuotasPagadas / prestamo.totalCuotas) * 100;

  return (
    <div
      style={{
        background: pagado ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 
                   estadoMora === 'mora' ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' :
                   estadoMora === 'alerta' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' :
                   'white',
        border: pagado ? '2px solid #10b981' : 
               estadoMora === 'mora' ? '2px solid #ef4444' :
               estadoMora === 'alerta' ? '2px solid #f59e0b' :
               '2px solid #e5e7eb',
        borderRadius: '16px',
        marginBottom: '16px',
        overflow: 'hidden'
      }}
    >
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{cliente.nombre}</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>📍 {cliente.zona}</p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>📞 {cliente.telefono}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            {pagado && (
              <div style={{
                background: '#10b981',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                ✓ PAGÓ
              </div>
            )}
            {!pagado && estadoMora === 'mora' && (
              <div style={{
                background: '#ef4444',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                🚨 MORA {diasAtraso} días
              </div>
            )}
            {!pagado && estadoMora === 'alerta' && (
              <div style={{
                background: '#f59e0b',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                ⚠️ 1 día atraso
              </div>
            )}
            {!pagado && (
              <>
                <a 
                  href={`tel:${cliente.telefono}`}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    display: 'block'
                  }}
                >
                  📞 Llamar
                </a>
                <button
                  onClick={() => onEnviarWhatsApp(cliente, estadoMora === 'mora' ? 'mora' : 'recordatorio')}
                  style={{
                    background: '#25D366',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  💬 WhatsApp
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '12px'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Cuota Diaria</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{formatCurrency(prestamo.cuotaDiaria)}</div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
            <span>Progreso</span>
            <span style={{ fontWeight: 'bold' }}>{prestamo.cuotasPagadas}/{prestamo.totalCuotas}</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{
              width: `${progreso}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #14b8a6 100%)',
              transition: 'width 0.5s'
            }}></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div style={{ background: '#dbeafe', padding: '12px', borderRadius: '8px', border: '1px solid #93c5fd' }}>
            <div style={{ fontSize: '11px', color: '#1e40af' }}>Valor Total</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af' }}>
              {formatCurrency(prestamo.valorTotal)}
            </div>
          </div>
          <div style={{ background: '#fed7aa', padding: '12px', borderRadius: '8px', border: '1px solid #fb923c' }}>
            <div style={{ fontSize: '11px', color: '#9a3412' }}>Saldo Restante</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#9a3412' }}>
              {formatCurrency(prestamo.cuotaDiaria * (prestamo.totalCuotas - prestamo.cuotasPagadas))}
            </div>
          </div>
        </div>
      </div>

      {!pagado && (
        <button
          onClick={() => {
            if (confirm(`¿Confirmar pago de ${formatCurrency(prestamo.cuotaDiaria)}?`)) {
              onRegistrarPago(cliente.id);
            }
          }}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            padding: '20px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ✓ REGISTRAR PAGO
        </button>
      )}

      {pagado && (
        <div style={{ display: 'flex', gap: '0' }}>
          <button
            onClick={() => onEnviarWhatsApp(cliente, 'felicitacion')}
            style={{
              flex: 1,
              background: '#25D366',
              color: 'white',
              border: 'none',
              padding: '16px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            💬 Felicitar
          </button>
          <div style={{
            flex: 1,
            background: '#10b981',
            color: 'white',
            padding: '16px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            ✓ Pagado
          </div>
        </div>
      )}
    </div>
  );
}

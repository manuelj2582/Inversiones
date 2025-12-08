import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from './firebaseClient';

export const inicializarDatos = async () => {
  try {
    console.log('Inicializando datos en Firebase...');

    // Datos de vendedoras
    const vendedoras = [
      {
        id: 1,
        nombre: 'Yaney',
        pin: '1234',
        color: '#ef4444',
        capitalDisponible: 20000000,
        esAdmin: false,
      },
      {
        id: 2,
        nombre: 'Patricia',
        pin: '5678',
        color: '#3b82f6',
        capitalDisponible: 3200000,
        esAdmin: false,
      },
      {
        id: 0,
        nombre: 'Admin',
        pin: '0000',
        color: '#a855f7',
        capitalDisponible: 0,
        esAdmin: true,
      },
    ];

    // Guardar vendedoras en Firebase
    for (const vendedora of vendedoras) {
      const vendedoraRef = doc(db, 'vendedoras', vendedora.id.toString());
      await setDoc(vendedoraRef, {
        id: vendedora.id,
        nombre: vendedora.nombre,
        pin: vendedora.pin,
        color: vendedora.color,
        capitalDisponible: vendedora.capitalDisponible,
        esAdmin: vendedora.esAdmin,
        createdAt: new Date().toISOString(),
      });
      console.log(`✅ Vendedora "${vendedora.nombre}" creada en Firebase`);
    }

    console.log('✅ Inicialización completada');
    alert('✅ Datos inicializados en Firebase correctamente');
    return true;
  } catch (error) {
    console.error('Error inicializando datos:', error);
    alert('❌ Error: ' + error.message);
    return false;
  }
};

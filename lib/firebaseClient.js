cat > lib/firebaseClient.js << 'EOF'
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD3gZ2BI7uAZuk0CnLGXZglEh2KQBdeFEU",
  authDomain: "inversiones-sistema.firebaseapp.com",
  projectId: "inversiones-sistema",
  storageBucket: "inversiones-sistema.firebasestorage.app",
  messagingSenderId: "480964599568",
  appId: "1:480964599568:web:688ca647f4ea9e5273cf95"
};

// Inicializar solo si no existe
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export { db };
EOF
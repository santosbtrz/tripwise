import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDHF2JW_hBPnvqlOYpKs99330gVrKTvTpU",
  authDomain: "tripwise-project.firebaseapp.com",
  projectId: "tripwise-project",
  storageBucket: "tripwise-project.appspot.com",
  messagingSenderId: "776771892335",
  appId: "1:776771892335:web:82ce1093e67edbda3a099a",
  measurementId: "G-0MEW9RTBXK"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Persistência local configurada');
  })
  .catch((error) => {
    console.error('Erro ao configurar persistência:', error);
  });

export { auth, db };

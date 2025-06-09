import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDHF2JW_hBPnvqlOYpKs99330gVrKTvTpU",
  authDomain: "tripwise-project.firebaseapp.com",
  projectId: "tripwise-project",
  storageBucket: "tripwise-project.appspot.com", // ✅ corrigido aqui
  messagingSenderId: "776771892335",
  appId: "1:776771892335:web:82ce1093e67edbda3a099a",
  measurementId: "G-0MEW9RTBXK"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

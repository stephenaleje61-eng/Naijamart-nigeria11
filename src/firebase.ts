import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCXYG1hGSbni8trGd0SxkjdWVdyvUJo6JE",
  authDomain: "zangamarket1.firebaseapp.com",
  projectId: "zangamarket1",
  storageBucket: "zangamarket1.firebasestorage.app",
  messagingSenderId: "871992428065",
  appId: "1:871992428065:web:aeece6ec26b907e2110560"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;

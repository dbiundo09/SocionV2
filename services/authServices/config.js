import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import auth from '@react-native-firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyADqE5bipW7Y3pljdn9tvNW-T1Fo_liA5M",
  authDomain: "socionv2.firebaseapp.com",
  projectId: "socionv2",
  storageBucket: "socionv2.firebasestorage.app",
  messagingSenderId: "1053555661405",
  appId: "1:1053555661405:web:db35657e536bc51a274bb4",
  measurementId: "G-BVPK47991B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const auth = getAuth(app);

const db = getFirestore(app);


export {db, auth, app};



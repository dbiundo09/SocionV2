// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

const db = getFirestore(app);

const auth = getAuth(app);

export {db, auth, app};



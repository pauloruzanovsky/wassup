import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from 'firebase/auth'
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAm2FYbgkkPP6tyvMWVgOf9Bmrt1rIY1Jo",
    authDomain: "wassup-4a627.firebaseapp.com",
    projectId: "wassup-4a627",
    storageBucket: "wassup-4a627.appspot.com",
    messagingSenderId: "601063612297",
    appId: "1:601063612297:web:369d9fa5eb9e484ea34b58"
  }

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const fireStore = getFirestore(firebaseApp);

const provider = new GoogleAuthProvider();
export {auth, provider, fireStore};
  
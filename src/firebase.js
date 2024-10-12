import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBux2VuIY0lo3GBbUGZKBcIFx42-vLK_Vs",
  authDomain: "redbrick-18b6b.firebaseapp.com",
  projectId: "redbrick-18b6b",
  storageBucket: "redbrick-18b6b.appspot.com",
  messagingSenderId: "564418787802",
  appId: "1:564418787802:web:9e8bf4c67b7318c9b7a8e3",
  measurementId: "G-Z3WX37SD0C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore()


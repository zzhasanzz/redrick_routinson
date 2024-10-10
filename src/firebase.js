import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC1uNaX4LqMReIYre8jgiHTATrT5fWpY_c",
  authDomain: "redrickroutinson.firebaseapp.com",
  projectId: "redrickroutinson",
  storageBucket: "redrickroutinson.appspot.com",
  messagingSenderId: "22132766859",
  appId: "1:22132766859:web:8c40f79383c136494cfc8e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();


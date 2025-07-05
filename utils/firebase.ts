// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClrTjQzQhRp-HF8BHnYTwNbkMnoAglPlw",
  authDomain: "eventease-17c2e.firebaseapp.com",
  projectId: "eventease-17c2e",
  storageBucket: "eventease-17c2e.firebasestorage.app",
  messagingSenderId: "843420457273",
  appId: "1:843420457273:web:04dd0476da9cbd234c70e8",
  measurementId: "G-EGKHPX5B2L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
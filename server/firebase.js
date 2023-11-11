// Import the functions you need from the SDKs you need
const {initializeApp} = require("firebase/app");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
const {getFirestore} = require("firebase/firestore");
const {getStorage} = require("firebase/storage");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAz-Y9r6yhNZ1IS7squxfi7ePIkg1kWjI",
  authDomain: "incomplete-dca97.firebaseapp.com",
  projectId: "incomplete-dca97",
  storageBucket: "incomplete-dca97.appspot.com",
  messagingSenderId: "86311047369",
  appId: "1:86311047369:web:1654085d1d449d2ce23d18"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

module.exports = {db, storage}





import { createContext } from 'react';

import firebase from 'firebase/app';
import firestore from 'firebase/firestore';
import 'firebase/auth';

var firebaseConfig = {
    apiKey: "AIzaSyCyuq43bmtJx5zWVu315EOSO_lfjR-m6qQ",
    authDomain: "bin-night-dev.firebaseapp.com",
    databaseURL: "https://bin-night-dev.firebaseio.com",
    projectId: "bin-night-dev",
    storageBucket: "bin-night-dev.appspot.com",
    messagingSenderId: "435638341644",
    appId: "1:435638341644:web:943a80236298c343c55e29"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const auth = firebase.auth;

const FirebaseContext = createContext([false, db]);

const objectFromDocs = snapshot => {
  const hash = {};
  snapshot.docs.map(doc => hash[doc.id] = doc.data());
  return hash;
}

const logout = () => { auth().signOut() };

export { db, auth, logout, objectFromDocs, FirebaseContext };

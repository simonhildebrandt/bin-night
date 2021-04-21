import { useState, useEffect, createContext } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect'

import firebase from 'firebase/app';
import firestore from 'firebase/firestore';
import 'firebase/auth';

var firebaseConfig = {
    apiKey: "AIzaSyAUZwa3CBeXAAcwCKv-8_nTHCoZOkBjh1Y",
    authDomain: "bin-night-767d0.firebaseapp.com",
    databaseURL: "https://bin-night-767d0.firebaseio.com",
    projectId: "bin-night-767d0",
    storageBucket: "bin-night-767d0.appspot.com",
    messagingSenderId: "483307913341",
    appId: "1:483307913341:web:2ea9c23d265ab4e1157114"
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

const listFromDocs = snapshot => snapshot.docs.map(d => d.data());

const logout = () => { auth().signOut() };


function useFirestoreCollection(path, where) {
  const [data, setData] = useState({});

  useEffect(() => {
    let collection = db.collection(path);
    if (where) collection = collection.where(...where);
    const unsub = collection.onSnapshot(snapshot => {
      setData(objectFromDocs(snapshot));
    });

    return () => { unsub() };
  }, [path]);

  return data;
}

function useFirestoreDocuments(paths) {
  const [data, setData] = useState({});

  useDeepCompareEffect(() => {
    const unsubs = paths.map(path => {
      return db.doc(path).onSnapshot(snapshot => {
        setData(oldData => ({...oldData, [path]: snapshot.data()}));
      });
    })

    return () => {
      unsubs.forEach(unsub => unsub())
    };
  }, [paths]);

  return data;
}

function useFirestoreDocument(path) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const unsub = db.doc(path).onSnapshot(snapshot => {
      setData(snapshot.data());
    });

    return () => { unsub() };
  }, [path]);

  return data;
}

function useAuthChanged(func) {
  useEffect(() => {
    const unsub = auth().onAuthStateChanged(async function(user) {
      func(user);
    });
    return unsub;
  }, []);
}

export {
  db, auth, logout, useAuthChanged, useFirestoreCollection, useFirestoreDocument,
  useFirestoreDocuments, FirebaseContext
};

import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom';

import { auth, FirebaseContext } from './firebase';

import Interface from './interface';


const App = () => {
  const [user, setUser] = useState(false);

  auth().onAuthStateChanged(newUser => {
    setUser(newUser);
  });

  const loggedIn = !!user;

  return <FirebaseContext.Provider value={[user, loggedIn]}>
    <Interface />
  </FirebaseContext.Provider>
};



ReactDOM.render(<App/>, document.getElementById('app'));

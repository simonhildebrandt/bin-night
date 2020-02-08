import React, { useState, useContext } from 'react';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';

import { auth, logout, db, FirebaseContext } from './firebase';



const uiConfig = {
  signInSuccessUrl: location.href,
  signInFlow: 'popup',
  signInOptions: [
    auth.GoogleAuthProvider.PROVIDER_ID
  ]
};

const Interface = () => {
  const [user, loggedIn] = useContext(FirebaseContext);
  const [showLogin, setShowLogin] = useState(false);

  if (user === false) {
    return <CircularProgress />
  }

  return <div>
    { loggedIn && <Button onClick={logout}>Logout</Button> }
    { !loggedIn && <Button onClick={() => setShowLogin(true)}>Login</Button> }
    { showLogin && <div>
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth()} />
      </div>
    }

    <h1>Bin Night</h1>
    <p></p>
    <h2>Reminders</h2>
    <ul>
      <li>Monday (19 hours from now)</li>
    </ul>
    <h2>Create a reminder</h2>
    <input placeholder="council name" />
  </div>
};

export default Interface;

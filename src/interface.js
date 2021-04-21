import React, { useRef, useState, useContext, searchFieldRef } from 'react';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import CouncilList from './council_list';
import Consumer from './consumer';


import { auth, logout, useAuthChanged, db, useCouncilData, FirebaseContext } from './firebase';
import { navigate, NavigationContext } from './navigation';


const uiConfig = {
  //signInSuccessUrl: location.href,
  signInFlow: 'popup',
  signInOptions: [
    auth.GoogleAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false
  }
};

const Interface = () => {
  const [user, loggedIn] = useContext(FirebaseContext);
  const [showLogin, setShowLogin] = useState(false);

  const navHash = useContext(NavigationContext);
  const { editing } = navHash;

  const uiRef = useRef();
  const handleUICallback = ui => uiRef.current = ui;

  useAuthChanged(newUser => {
    setShowLogin(false);
  });

  if (user === false) {
    return <CircularProgress />
  }

  const handleLogout = () => {
    logout();
  };

  return <div>
    { loggedIn && <Button onClick={handleLogout}>Logout</Button> }
    { !loggedIn && <Button onClick={() => setShowLogin(true)}>Login</Button> }

    <Button onClick={() => navigate('/edit')}>Edit</Button>

    { showLogin && <div>
        <StyledFirebaseAuth uiCallback={handleUICallback} uiConfig={uiConfig} firebaseAuth={auth()} />
      </div>
    }

    <Button onClick={() => navigate('/')}>Home</Button>

    { editing ? <CouncilList /> : <Consumer /> }
  </div>
};

export default Interface;

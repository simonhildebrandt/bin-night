import "@babel/polyfill";

import React, { useState, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';


import { db, auth, FirebaseContext } from './firebase';
import { router, NavigationContext } from './navigation';

import Interface from './interface';


// https://github.com/GoogleChromeLabs/web-push-codelab/issues/46
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};


let subscriptionPromise = Promise.resolve(false);

if('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');

  subscriptionPromise = navigator.serviceWorker.ready
  .then(function(registration) {
    return registration.pushManager.getSubscription()
    .then(async function(subscription) {
      if (subscription) {
        return subscription;
      }
      const vapidPublicKey = "BKcgB9sSF6wqdcbcj-WXvFd78xpeJFWoiHW0MXAYOQzHAgrCTYLMj1DNw63oXL-5ZUwFcedex0Kh6VkOfDN4CnE";
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    });
  })
  .then(function(subscription) {
    return JSON.stringify({
      subscription: subscription
    });
  })
  .catch(error => console.error('subscription failed', error));
};

const App = () => {
  const [user, setUser] = useState(false);

  auth().onAuthStateChanged(async function(newUser) {
    if (newUser) {
      const { displayName, email } = newUser;

      const userRec = await db.collection('users').doc(newUser.uid).get();
      if (!userRec.exists) {
        await db.collection('users').doc(newUser.uid).set({});
      }

      db.collection('users').doc(newUser.uid).update({ displayName, email });

      subscriptionPromise.then(sub => {
        if (sub) {
          db.collection('users').doc(newUser.uid).update({ subscription: sub });
        } else {
          console.log('couldn\'t sub user')
        }
      })

      Notification.requestPermission()
      .then(function(result) {
        if(result !== 'granted') {
          db.collection('users').doc(newUser.uid).update({ refusedNotification: new Date() });
        }
      });
    }

    setUser(newUser);
  });

  const loggedIn = !!user;

  const [navHash, setNavHash] = useState({});
  useEffect(() => {
    router.
    on('/', function() {
      setNavHash({})
    }).
    on('edit', function() {
      setNavHash({ editing: true })
    }).
    on('edit/:councilId', function({councilId}) {
      setNavHash({ editing: true, councilId })
    }).
    on(':councilId/:regionId', function({councilId, regionId}) {
      setNavHash({ councilId, regionId })
    }).
    on(':councilId', function({councilId}) {
      setNavHash({ councilId })
    }).
    resolve();
  }, [])

  return <FirebaseContext.Provider value={[user, loggedIn]}>
    <NavigationContext.Provider value={navHash}>
      <Interface />
    </NavigationContext.Provider>
  </FirebaseContext.Provider>
};



ReactDOM.render(<App/>, document.getElementById('app'));

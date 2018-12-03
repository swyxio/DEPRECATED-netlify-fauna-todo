import './login.css';
import React from 'react';

import netlifyIdentity from 'netlify-identity-widget';
netlifyIdentity.init();

function saveLogin() {
  if (netlifyIdentity && netlifyIdentity.currentUser()) {
    const {
      app_metadata,
      created_at,
      confirmed_at,
      email,
      id,
      user_metadata
    } = netlifyIdentity.currentUser();

    localStorage.setItem(
      'faunaNetlifyUser',
      JSON.stringify({
        app_metadata,
        created_at,
        confirmed_at,
        email,
        id,
        user_metadata
      })
    );
    return { app_metadata, created_at, confirmed_at, email, id, user_metadata };
  }
}

function clearLogin() {
  localStorage.removeItem('faunaNetlifyUser');
}

export default function useLogin(onAuthChange) {
  if (!onAuthChange) throw new Error('onAuthChange cannot be falsy');

  const [user, setUser] = React.useState(null);
  const didLogin = noSave => {
    console.log('didLogin', noSave);
    if (!noSave) {
      saveLogin();
    }
    const faunadb_token =
      user && user.app_metadata && user.app_metadata.faunadb_token;
    if (faunadb_token) {
      onAuthChange(faunadb_token);
    } else {
      console.error(
        'Expected user to have a faunadb_token, check logs for the identity-signup.js function.'
      );
      console.log(user);
    }
  };

  const didLogout = () => {
    clearLogin();
    onAuthChange(null);
  };

  const doLogin = () => netlifyIdentity.open();

  const doLogout = () => {
    // remove credentials and refresh model
    netlifyIdentity.logout();
    clearLogin();
    setUser(null);
  };
  var existingUser = localStorage.getItem('faunaNetlifyUser');
  React.useEffect(
    () => {
      if (existingUser) {
        setUser(JSON.parse(existingUser));
        didLogin('noSave');
      } else {
        existingUser = saveLogin(); // does calling user pop a thing? should we set state?
        if (existingUser) {
          setUser(existingUser);
          didLogin('noSave');
        }
      }
      netlifyIdentity.on('login', user => {
        setUser(user);
        didLogin();
      });
      netlifyIdentity.on('logout', user => {
        setUser(null);
        didLogout();
      });
    },
    [existingUser]
  );

  return {
    user,
    doLogout,
    doLogin
  };
}

{
  /* <div className="Login">
{user ? (
  <a onClick={doLogout}>Logout</a>
) : (
  <span>
    <a onClick={doLogin}>Login or Sign Up</a>
  </span>
)}
</div> */
}

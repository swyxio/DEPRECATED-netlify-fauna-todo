import './login.css';
import React from 'react';

// -------------- usage --------------
import netlifyIdentity from 'netlify-identity-widget';
import { useLocalStorage } from './hooks';
netlifyIdentity.init();
export default function useLogin(onAuthChange) {
  if (!onAuthChange) throw new Error('onAuthChange cannot be falsy');
  const itemChangeCallback = _user => {
    if (_user) {
      const faunadb_token =
        _user && _user.app_metadata && _user.app_metadata.faunadb_token;
      if (faunadb_token) onAuthChange(faunadb_token);
      else {
        console.error(
          'Expected _user to have a faunadb_token, check logs for the identity-signup.js function.'
        );
        console.log(_user);
      }
    } else {
      onAuthChange(null);
    }
  };
  const [item, setItem, removeItem] = useLocalStorage(
    'faunaNetlifyUser',
    itemChangeCallback
  );
  React.useEffect(() => {
    netlifyIdentity.on('login', user => setItem(user));
    netlifyIdentity.on('logout', () => removeItem());
  }, []);

  return {
    user: item,
    doLogout: netlifyIdentity.logout,
    doLogin: () => netlifyIdentity.open()
  };
}

/*
   <div className="Login">
{user ? (
  <a onClick={doLogout}>Logout</a>
) : (
  <span>
    <a onClick={doLogin}>Login or Sign Up</a>
  </span>
)}
</div> 
*/

//   app_metadata,
//   created_at,
//   confirmed_at,
//   email,
//   id,
//   user_metadata

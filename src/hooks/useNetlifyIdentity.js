import React from 'react';

// -------------- usage --------------
import netlifyIdentity from 'netlify-identity-widget';
import { useLocalStorage } from '@swyx/hooks';

netlifyIdentity.init();
export default function useNetlifyIdentity(onAuthChange) {
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
    netlifyIdentity.on('logout', () => console.log('logooooo') || removeItem());
  }, []);

  // definition - `item` comes from  useNetlifyIdentity hook
  const genericAuthedFetch = method => (endpoint, obj = {}) => {
    if (!item || !item.token || !item.token.access_token)
      throw new Error('no user token found');
    const defaultObj = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + item.token.access_token
      }
    };
    const finalObj = Object.assign(defaultObj, { method }, obj);
    return fetch(endpoint, finalObj).then(res =>
      finalObj.headers['Content-Type'] === 'application/json' ? res.json() : res
    );
  };
  const authedFetch = {
    get: genericAuthedFetch('GET'),
    post: genericAuthedFetch('POST'),
    put: genericAuthedFetch('PUT'),
    delete: genericAuthedFetch('DELETE')
  };
  const doLogout = () => {
    console.log('logout');
    netlifyIdentity.logout();
  };
  const doLogin = () => {
    console.log('login');
    netlifyIdentity.open();
  };

  return {
    user: item,
    doLogout,
    doLogin,
    authedFetch
  };
}

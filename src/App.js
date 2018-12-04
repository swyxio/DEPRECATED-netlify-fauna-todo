import React, { useState } from 'react';
import { Router, Link } from '@reach/router';
import axios from 'axios';
import './App.css';
import TodoModel from './TodoModel';
import useNetlifyIdentity from './hooks/useNetlifyIdentity';
const model = new TodoModel('react-todos');

let Home = () => {
  const { current } = React.useRef(model);
  const { user, doLogout, doLogin, authedFetch } = useNetlifyIdentity(
    current.onAuthChange
  );
  console.log(current);
  console.log(process.env.REACT_APP_FAUNADB_SERVER_SECRET);
  console.log(process.env.NODE_ENV);
  return (
    <div>
      Home
      <button
        onClick={() =>
          axios.get('.netlify/functions/fauna-gateway').then(console.log)
        }
      >
        sldkjsd2
      </button>
      <div className="Login">
        {user ? (
          <LoggedIn doLogout={doLogout} authedFetch={authedFetch} />
        ) : (
          <span>
            <a onClick={doLogin}>Login or Sign Up</a>
          </span>
        )}
      </div>
    </div>
  );
};
const LoggedIn = ({ doLogout, authedFetch }) => {
  return (
    <div>
      dlskjd
      <a onClick={doLogout}>Logout</a>
      <button
        onClick={() =>
          authedFetch.get('.netlify/functions/fauna-gateway').then(console.log)
        }
      >
        sldkjsd
      </button>
    </div>
  );
};
const NotFound = () => <div>Sorry, nothing here.</div>;

export default function App(props) {
  return (
    <Router>
      <Home path="/" />
      {/* <div path="list">
        <List path=":listId" />
        <List path=":listId/active" />
        <List path=":listId/completed" />
      </div> */}
      <NotFound default />
    </Router>
  );
}

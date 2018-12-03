import React, { useState } from 'react';
import { Router, Link } from '@reach/router';

import './App.css';
import TodoModel from './TodoModel';
import useLogin from './Login';
const model = new TodoModel('react-todos');

let Home = () => {
  const { current } = React.useRef(model);
  const { user, doLogout, doLogin } = useLogin(current.onAuthChange);
  console.log(current);
  console.log(process.env.REACT_APP_FAUNADB_SERVER_SECRET);
  console.log(process.env.NODE_ENV);
  return (
    <div>
      Home
      <div className="Login">
        {user ? (
          <a onClick={doLogout}>Logout</a>
        ) : (
          <span>
            <a onClick={doLogin}>Login or Sign Up</a>
          </span>
        )}
      </div>
    </div>
  );
};
// let List = props => (
//   <div>
//     <h3>List</h3>
//     <pre>{JSON.stringify(props, null, 2)}</pre>
//   </div>
// );
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

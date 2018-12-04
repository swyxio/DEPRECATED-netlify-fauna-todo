import React, { useState } from 'react';
import { Router, Link } from '@reach/router';
import TodoModel from './TodoModel';
import useNetlifyIdentity from './hooks/useNetlifyIdentity';

import './App.css';
import './login.css';
const model = new TodoModel('react-todos');

let Home = () => <div>Home</div>;
let List = props => (
  <div>
    <h3>List</h3>
    <pre>{JSON.stringify(props, null, 2)}</pre>
  </div>
);
const NotFound = () => <div>Sorry, nothing here.</div>;

const LoggedIn = ({ doLogout, authedFetch }) => {
  return (
    <div>
      you are logged in
      <a onClick={doLogout}>Logout</a>
    </div>
  );
};
export default function App(props) {
  const modelRef = React.useRef(new TodoModel('react-todos'));
  const { user, doLogout, doLogin, authedFetch } = useNetlifyIdentity(
    modelRef.current.onAuthChange
  );
  console.log({ modelRef });
  const [faunaToken, setFaunaToken] = useState(null);
  const [editing, setEditing] = useState(null);
  const [newTodo, setNewTodo] = useState('');
  const handleChange = e => setNewTodo(e.target.value);
  const handleNewTodoKeyDown = event => {
    if (event.keyCode !== 13) return;
    event.preventDefault();
    var val = newTodo.trim();
    if (val) {
      modelRef.current.addList(val);
      setNewTodo('');
    }
  };
  return (
    <div>
      <div className="Login">
        {user ? (
          <LoggedIn doLogout={doLogout} authedFetch={authedFetch} />
        ) : (
          <span>
            <a onClick={doLogin}>Login or Sign Up</a>
          </span>
        )}
      </div>
      <Router>
        <Home path="/" />
        <div path="list">
          <List path=":listId" />
          <List path=":listId/active" />
          <List path=":listId/completed" />
        </div>
        <NotFound default />
      </Router>
      <div>
        <h3>new list</h3>
        <input
          className="new-todo"
          placeholder="Create a new list or choose from below."
          value={newTodo}
          onKeyDown={handleNewTodoKeyDown}
          onChange={handleChange}
          autoFocus={true}
        />
      </div>
    </div>
  );
}

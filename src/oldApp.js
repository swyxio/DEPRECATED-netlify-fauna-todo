import React, { useState } from 'react';
import { Router, Link } from '@reach/router';
import TodoModel from './TodoModel';

import './App.css';

let Home = () => <div>Home</div>;
let List = props => (
  <div>
    <h3>List</h3>
    <pre>{JSON.stringify(props, null, 2)}</pre>
  </div>
);
const NotFound = () => <div>Sorry, nothing here.</div>;

export default function App(props) {
  const modelRef = React.useRef(new TodoModel('react-todos'));
  const [faunaToken, setFaunaToken] = useState(null);
  const [editing, setEditing] = useState(null);
  const [newTodo, setNewTodo] = useState('');
  const handleChange = e => setNewTodo(e.target.value);
  const handleNewTodoKeyDown = event => {
    if (event.keyCode !== 13) return;
    event.preventDefault();
    var val = newTodo.trim();
    if (val) {
      props.model.addList(val);
      setNewTodo('');
    }
  };
  return (
    <Router>
      <Home path="/" />
      <div path="list">
        <List path=":listId" />
        <List path=":listId/active" />
        <List path=":listId/completed" />
      </div>
      <NotFound default />
    </Router>
  );
}

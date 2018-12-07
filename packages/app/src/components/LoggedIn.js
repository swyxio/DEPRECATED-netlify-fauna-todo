import React, { useState, useRef } from 'react';
import { FaunaCtx, UserCtx } from 'contexts';

export const LoggedIn = () => {
  const identity = React.useContext(UserCtx);
  const { user, doLogout, doLogin, authedFetch } = identity;

  const [newTodo, setNewTodo] = useState('');
  const handleChange = e => setNewTodo(e.target.value);
  const { addList } = useRef(FaunaCtx);
  const handleNewTodoKeyDown = event => {
    if (event.keyCode !== 13) return;
    event.preventDefault();
    var val = newTodo.trim();
    if (val) {
      addList(val);
      setNewTodo('');
    }
  };
  return (
    <div>
      you are logged in
      <a onClick={doLogout}>Logout</a>
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
};

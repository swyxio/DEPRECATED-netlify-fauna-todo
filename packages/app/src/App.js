import React, { useState } from 'react';
import { Router, Link } from '@reach/router';
import useFauna from './useFauna';
import useNetlifyIdentity from 'hooks/useNetlifyIdentity';
import { useInput } from 'hooks';
import { FaunaCtx, UserCtx } from 'contexts';
import { LoggedIn } from './components/LoggedIn';
import './App.css';
import './login.css';

let Home = () => <div>Home2</div>;
const NotFound = () => <div>Sorry, nothing here.</div>;

function Login() {
  const { user, doLogin, doLogout } = React.useContext(UserCtx);
  var actionForm = (
    <span>
      <a onClick={doLogin}>Login or Sign Up</a>
    </span>
  );
  return (
    <div className="Login">
      {user ? <a onClick={doLogout}>Logout</a> : actionForm}
    </div>
  );
}

function List(props) {
  const { list } = React.useContext(FaunaCtx);
  console.log('showlist', list);
  return (
    <div>
      <h3>List</h3>
      <div className="listNav">
        <label>{list.data.title}</label>
        <button onClick={() => alert('oops')}>back to all lists</button>
      </div>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
}
function AllLists() {
  const { lists } = React.useContext(FaunaCtx);
  return (
    <div>
      <div className="listNav">
        <label>Choose a list.</label>
      </div>
      <section className="main">
        <ul className="todo-list">
          {lists.map(({ data, ref }) => {
            console.log('list', data, ref);
            return (
              <li key={ref.value.id}>
                {/* <label onClick={() => alert('go')}>{data.title}</label> */}
                <label>
                  <Link to={`/list/${ref.value.id}`}>{data.title}</Link>
                </label>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function InputArea() {
  const { addList } = React.useContext(FaunaCtx);
  const { setValue, ...inputProps } = useInput();
  const handleNewTodoKeyDown = event => {
    if (event.keyCode !== 13) return;
    event.preventDefault();
    var val = event.target.value.trim();
    if (val) {
      addList(val);
      // if (this.state.nowShowing === ALL_LISTS) {
      //   modelRef.current.addList(val);
      // } else {
      //   modelRef.current.addTodo(val, modelRef.current.list());
      // }
      setValue('');
    }
  };
  return (
    <input
      className="new-todo"
      placeholder="Create a new list or choose from above."
      onKeyDown={handleNewTodoKeyDown}
      {...inputProps}
      autoFocus={true}
    />
  );
}

export default function App(props) {
  const fauna = useFauna();
  const { onAuthChange } = fauna;
  const identity = useNetlifyIdentity(onAuthChange);
  const { user, doLogout, doLogin, authedFetch } = identity;
  return (
    <FaunaCtx.Provider value={fauna}>
      <UserCtx.Provider value={identity}>
        <div>
          <header className="header">
            <h1>
              <Link to="/">todos</Link>
            </h1>
            <Login />
            <Router>
              <AllLists path="/" />
              <div path="list">
                <List path=":listId" />
                <List path=":listId/active" />
                <List path=":listId/completed" />
              </div>
              <NotFound default />
            </Router>
            <InputArea />
          </header>
          <footer className="footer">footer</footer>
        </div>
      </UserCtx.Provider>
    </FaunaCtx.Provider>
  );
}

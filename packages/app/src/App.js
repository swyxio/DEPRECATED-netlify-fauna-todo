import React, { useState } from 'react';
import { Router, Link } from '@reach/router';
import useFauna from './useFauna';
import useNetlifyIdentity from 'hooks/useNetlifyIdentity';
import { useInput } from 'hooks';
import { FaunaCtx, UserCtx } from 'contexts';
import { LoggedIn } from './components/LoggedIn';
import Spinner from './components/Spinner';
import InputArea from './components/InputArea';

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
  // const oldList = React.useRef(null)
  const { fetchList, isLoading, client, addTodo } = React.useContext(FaunaCtx);
  const [state, setState] = React.useState(null);
  const { listId } = props;
  React.useEffect(() => client && void fetchList(listId).then(setState), [
    client
  ]);
  const { addList } = React.useContext(FaunaCtx);

  return isLoading || !state ? (
    <Spinner />
  ) : (
    console.log({ state }) || (
      <div>
        <h3>List</h3>
        <div className="listNav">
          <label>{state.list.data.title}</label>
          <button onClick={() => alert('oops')}>back to all lists</button>
        </div>
        <pre>{JSON.stringify(state.todos, null, 2)}</pre>
        <InputArea
          onSubmit={title => addTodo(state.list, listId)(title).then(setState)}
          placeholder="Add a new item to your list."
        />
      </div>
    )
  );
}
function AllLists() {
  const { lists, isLoading, addList } = React.useContext(FaunaCtx);
  return (
    <div>
      <div className="listNav">
        <label>Choose a list.</label>
      </div>
      <section className="main">
        {isLoading ? (
          <Spinner />
        ) : (
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
        )}
      </section>
      <InputArea
        onSubmit={addList}
        placeholder="Create a new list or choose from above."
      />
    </div>
  );
}

const Wrapper = props => props.children;

export default function App(props) {
  const fauna = useFauna();
  const { load, onAuthChange, getServerLists } = fauna;
  const identity = useNetlifyIdentity(faunadb_token => {
    onAuthChange(faunadb_token).then(_client => {
      load(getServerLists(_client));
    });
  });
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
              <Wrapper path="list">
                <List path=":listId" />
                <List path=":listId/active" />
                <List path=":listId/completed" />
                <NotFound default />
              </Wrapper>
              <NotFound default />
            </Router>
          </header>
          <footer className="footer">footer</footer>
        </div>
      </UserCtx.Provider>
    </FaunaCtx.Provider>
  );
}

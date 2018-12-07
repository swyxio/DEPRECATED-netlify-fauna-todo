import React from 'react';
import { useProduceState } from 'hooks';
const faunadb = require('faunadb');
const q = faunadb.query;

export default function useFauna() {
  const [lists, setLists] = React.useState([]);
  const [list, setList] = React.useState(null);
  const [_id, set_id] = React.useState(null);
  const [client, setClient] = useProduceState(null, getServerLists);
  const onAuthChange = faunadb_token => {
    if (!faunadb_token) return null;
    const _client = new faunadb.Client({
      secret: faunadb_token
    });
    setClient(_client);
    console.log('onAuthChange', faunadb_token, _client);
    getServerLists(_client);
  };

  function getServerLists(_client = client) {
    console.log('getServerLists', _client);
    if (!_client) return null;
    console.log('getServerLists1');
    return _client
      .query(
        q.Map(
          q.Paginate(
            q.Match(
              // todo use lists_by_owner
              q.Ref('indexes/all_lists')
            )
          ),
          ref => q.Get(ref)
        )
      )
      .then(r => console.log('getServerLists') || r)
      .then(r => {
        console.log({ r });
        if (r.data.length === 0) {
          // create the first list for the user
          const me = q.Select('ref', q.Get(q.Ref('classes/users/self')));

          return client
            .query(
              q.Create(q.Class('lists'), {
                data: {
                  title: 'Default Todo List',
                  owner: q.Select('ref', q.Get(q.Ref('classes/users/self')))
                },
                permissions: {
                  read: me,
                  write: me
                }
              })
            )
            .then(defaultList => setLists([defaultList]));
        } else {
          setLists(r.data);
        }
      });
  }

  const refreshList = async () => {
    if (_id) {
      const _list = await client.query(q.Get(q.Ref('classes/lists/' + _id)));
      // const resp = await client.query(
      //   q.Map(q.Paginate(q.Match(q.Index('todos_by_list'), list.ref)), ref =>
      //     q.Get(ref)
      //   )
      // );
      setList(_list);
      return _list;
    }
  };

  const fetchList = async id => {
    set_id(id);
    return refreshList();
  };

  const addList = title => {
    var newList = { title };
    const me = q.Select('ref', q.Get(q.Ref('classes/users/self')));
    newList.owner = me;
    return client
      .query(
        q.Create(q.Class('lists'), {
          data: newList,
          permissions: {
            read: me,
            write: me
          }
        })
      )
      .then(getServerLists);
  };

  const addTodo = (title, list) => {
    var newTodo = {
      title: title,
      list: list.ref,
      completed: false
    };

    const me = q.Select('ref', q.Get(q.Ref('classes/users/self')));
    newTodo.user = me;
    return client
      .query(
        q.Create(q.Ref('classes/todos'), {
          data: newTodo,
          permissions: {
            read: me,
            write: me
          }
        })
      )
      .then(refreshList);
  };

  // const toggleAll = (checked, list) => {
  //   return client.query(
  //     q.Map(q.Paginate(q.Match(q.Index('todos_by_list'), list.ref)), ref =>
  //       q.Update(q.Select('ref', q.Get(ref)), {
  //         data: {
  //           completed: q.Not(q.Select(['data', 'completed'], q.Get(ref)))
  //         }
  //       })
  //     )
  //   );
  // };

  const toggle = todoToToggle => {
    console.log('todoToToggle', todoToToggle);
    return client
      .query(
        q.Update(todoToToggle.ref, {
          data: {
            completed: !todoToToggle.data.completed
          }
        })
      )
      .then(refreshList);
  };

  const destroy = todo => client.query(q.Delete(todo.ref)).then(refreshList);

  const save = (todoToSave, text) => {
    return client
      .query(
        q.Update(todoToSave.ref, {
          data: { title: text }
        })
      )
      .then(refreshList);
  };

  const clearCompleted = list => {
    return client
      .query(
        q.Map(q.Paginate(q.Match(q.Index('todos_by_list'), list.ref)), ref =>
          q.If(
            q.Select(['data', 'completed'], q.Get(ref)),
            q.Delete(q.Select('ref', q.Get(ref))),
            true
          )
        )
      )
      .then(refreshList);
  };
  return {
    lists,
    list,
    fetchList,
    addList,
    addTodo,
    // toggleAll,
    toggle,
    destroy,
    save,
    clearCompleted,
    onAuthChange
  };
}

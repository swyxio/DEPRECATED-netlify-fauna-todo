import React from 'react';

import { useLoading, useProduceState } from '@swyx/hooks';
const faunadb = require('faunadb');
const q = faunadb.query;

export default function useFauna() {
  const [lists, setLists] = React.useState([]);
  const [client, setClient] = useProduceState(null, getServerLists);
  const [isLoading, load] = useLoading();
  const onAuthChange = async faunadb_token => {
    if (!faunadb_token) return null;
    const _client = new faunadb.Client({
      secret: faunadb_token
    });
    setClient(_client);
    return _client;
  };

  function getServerLists(_client = client) {
    if (!_client) return null;

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
      .then(r => {
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

  const fetchList = async id => {
    if (client) {
      const _list = await client.query(q.Get(q.Ref('classes/lists/' + id)));
      const resp = await client.query(
        q.Map(q.Paginate(q.Match(q.Index('todos_by_list'), _list.ref)), ref =>
          q.Get(ref)
        )
      );
      return { list: _list, todos: resp.data };
    }
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
      .then(() => getServerLists(client));
  };

  const addTodo = (list, id) => title => {
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
      .then(() => fetchList(id));
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

  const toggle = (todoToToggle, id) => {
    return client
      .query(
        q.Update(todoToToggle.ref, {
          data: {
            completed: !todoToToggle.data.completed
          }
        })
      )
      .then(() => fetchList(id));
  };

  const destroy = (todo, id) =>
    client.query(q.Delete(todo.ref)).then(() => fetchList(id));

  const save = text => (todoToSave, id) => {
    return client
      .query(
        q.Update(todoToSave.ref, {
          data: { title: text }
        })
      )
      .then(() => fetchList(id));
  };

  const clearCompleted = (list, id) => {
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
      .then(() => fetchList(id));
  };
  return {
    lists,
    // list,
    fetchList,
    addList,
    addTodo,
    // toggleAll,
    getServerLists,
    load,
    toggle,
    destroy,
    save,
    clearCompleted,
    onAuthChange,
    isLoading,
    client
  };
}

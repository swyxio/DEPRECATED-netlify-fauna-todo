// const request = require('superagent');

const faunadb = require('faunadb');
const q = faunadb.query;

export default class TodoModel {
  constructor(key) {
    this.key = key;
    this.listDatas = {};
    this.listId = null;
    this.todosData = {};
    this.lists = [];
    this.onChanges = [];
  }

  list() {
    return this.listDatas[this.listId];
  }

  todos() {
    return this.todosData[this.listId] || [];
  }

  subscribe(onChange) {
    this.onChanges.push(onChange);
  }

  processChanges() {
    this.onChanges.forEach(function(cb) {
      cb();
    });
  }

  inform() {
    this.getServerLists()
      .then(() => {
        if (this.listId) {
          return this.fetchList(this.listId);
        }
      })
      .then(() => this.processChanges());
  }

  onAuthChange(faunadb_token) {
    this.listDatas = {};
    // this.listId = null;
    this.todosData = {};
    this.lists = [];
    this.client = new faunadb.Client({
      secret: faunadb_token
    });

    console.log('onAuthChange', faunadb_token);
    this.inform();
  }

  getServerLists() {
    return this.client
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
        console.log('getServerLists', r);
        if (r.data.length === 0) {
          // create the first list for the user
          const me = q.Select('ref', q.Get(q.Ref('classes/users/self')));

          return this.client
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
            .then(defaultList => (this.lists = [defaultList]));
        } else {
          this.lists = r.data;
        }
      });
  }

  getList(id) {
    this.listId = id;
    if (this.client) {
      this.fetchList(id).then(() => this.processChanges());
    }
  }

  fetchList(id) {
    // return {list, todos}
    return this.client.query(q.Get(q.Ref('classes/lists/' + id))).then(list => {
      // console.log("fetchList!", list);
      this.listDatas[id] = list;
      return this.client
        .query(
          q.Map(q.Paginate(q.Match(q.Index('todos_by_list'), list.ref)), ref =>
            q.Get(ref)
          )
        )
        .then(resp => {
          // console.log("got todos", resp);
          this.todosData[id] = resp.data;
          return { list, todos: resp.data };
        });
    });
  }

  addList(title) {
    var newList = {
      title: title
    };

    const me = q.Select('ref', q.Get(q.Ref('classes/users/self')));
    newList.owner = me;

    return this.client
      .query(
        q.Create(q.Class('lists'), {
          data: newList,
          permissions: {
            read: me,
            write: me
          }
        })
      )
      .then(r => {
        this.inform();
      });
  }

  addTodo(title, list) {
    var newTodo = {
      title: title,
      list: list.ref,
      completed: false
    };

    const me = q.Select('ref', q.Get(q.Ref('classes/users/self')));
    newTodo.user = me;

    return this.client
      .query(
        q.Create(q.Ref('classes/todos'), {
          data: newTodo,
          permissions: {
            read: me,
            write: me
          }
        })
      )
      .then(r => {
        this.inform();
      });
  }

  toggleAll(checked, list) {
    return this.client
      .query(
        q.Map(q.Paginate(q.Match(q.Index('todos_by_list'), list.ref)), ref =>
          q.Update(q.Select('ref', q.Get(ref)), {
            data: {
              completed: q.Not(q.Select(['data', 'completed'], q.Get(ref)))
            }
          })
        )
      )
      .then(r => {
        this.inform();
      });
  }

  toggle(todoToToggle) {
    console.log('todoToToggle', todoToToggle);
    return this.client
      .query(
        q.Update(todoToToggle.ref, {
          data: {
            completed: !todoToToggle.data.completed
          }
        })
      )
      .then(r => {
        this.inform();
      });
  }

  destroy(todo) {
    return this.client.query(q.Delete(todo.ref)).then(() => this.inform());
  }

  save(todoToSave, text) {
    return this.client
      .query(
        q.Update(todoToSave.ref, {
          data: { title: text }
        })
      )
      .then(r => this.inform());
  }

  clearCompleted(list) {
    return this.client
      .query(
        q.Map(q.Paginate(q.Match(q.Index('todos_by_list'), list.ref)), ref =>
          q.If(
            q.Select(['data', 'completed'], q.Get(ref)),
            q.Delete(q.Select('ref', q.Get(ref))),
            true
          )
        )
      )
      .then(r => this.inform());
  }
}

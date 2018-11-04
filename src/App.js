import React, {createRef, useEffect} from 'react'
import { useProduceState } from './hooks'
import ContentEditable from './components/ContentEditable'
import AppHeader from './components/AppHeader'
import SettingsMenu from './components/SettingsMenu'
import SettingsIcon from './components/SettingsIcon'
import api from './utils/api'
import sortByDate from './utils/sortByDate'
import isLocalHost from './utils/isLocalHost'
import './App.css'

const inputElement = createRef()
export default function App {
  const [state, setState] = useProduceState ({
    todos: [],
    showMenu: false
  })
  const closeModal = (e) => {
    setState(draft => void draft.showMenu = false)
  }
  const openModal = () => {
    setState(draft => void draft.showMenu = true)
  }
  useEffect(() => {
    // Fetch all todos
    api.readAll().then((todos) => {
      if (todos.message === 'unauthorized') {
        if (isLocalHost()) {
          alert('FaunaDB key is not unauthorized. Make sure you set it in terminal session where you ran `npm start`. Visit http://bit.ly/set-fauna-key for more info')
        } else {
          alert('FaunaDB key is not unauthorized. Verify the key `FAUNADB_SERVER_SECRET` set in Netlify enviroment variables is correct')
        }
        return false
      }
      setState(draft => void draft.todos = todos)
    })
  }, [])
  const saveTodo = (e) => {
    e.preventDefault()
    const { todos } = state
    const todoValue = inputElement.current.value

    if (!todoValue) {
      alert('Please add Todo title')
      inputElement.current.focus()
      return false
    }

    // reset input to empty
    inputElement.current.value = ''

    const todoInfo = {
      title: todoValue,
      completed: false,
    }
    // Optimistically add todo to UI
    const newTodoArray = [{
      data: todoInfo,
      ts: new Date().getTime() * 10000
    }]

    const optimisticTodoState = newTodoArray.concat(todos)

    setState(draft => void draft.todos = optimisticTodoState)
    // Make API request to create new todo
    api.create(todoInfo).then((response) => {
      // console.log(response)
      // remove temporaryValue from state and persist API response
      const persistedState = removeOptimisticTodo(todos).concat(response)
      // Set persisted value to state
      setState(draft => void draft.todos = persistedState)
    }).catch((e) => {
      console.log('An API error occurred', e)
      const revertedState = removeOptimisticTodo(todos)
      // Reset to original state
      setState(draft => void draft.todos = revertedState)
    })
  }
  const deleteTodo = (e) => {
    const { todos } = state
    const todoId = e.target.dataset.id

    // Optimistically remove todo from UI
    const filteredTodos = todos.reduce((acc, current) => {
      const currentId = getTodoId(current)
      if (currentId === todoId) {
        // save item being removed for rollback
        acc.rollbackTodo = current
        return acc
      }
      // filter deleted todo out of the todos list
      acc.optimisticState = acc.optimisticState.concat(current)
      return acc
    }, {
      rollbackTodo: {},
      optimisticState: []
    })

    setState(draft => void draft.todos = filteredTodos.optimisticState)

    // Make API request to delete todo
    api.delete(todoId).then(() => {
      console.log(`deleted todo id ${todoId}`)
    }).catch((e) => {
      console.log(`There was an error removing ${todoId}`, e)
      // Add item removed back to list
      setState(draft => void draft.todos = filteredTodos.optimisticState.concat(filteredTodos.rollbackTodo))
    })
  }
  const handleTodoCheckbox = (event) => {
    const { todos } = state
    const { target } = event
    const todoCompleted = target.checked
    const todoId = target.dataset.id

    const updatedTodos = todos.map((todo, i) => {
      const { data } = todo
      const id = getTodoId(todo)
      if (id === todoId && data.completed !== todoCompleted) {
        data.completed = todoCompleted
      }
      return todo
    })

    setState(draft => void draft.todos = updatedTodos, () => {
      api.update(todoId, {
        completed: todoCompleted
      }).then(() => {
        console.log(`update todo ${todoId}`, todoCompleted)
      }).catch((e) => {
        console.log('An API error occurred', e)
      })
    })
  }
  const updateTodoTitle = (event, currentValue) => {
    let isDifferent = false
    const todoId = event.target.dataset.key

    const updatedTodos = state.todos.map((todo, i) => {
      const id = getTodoId(todo)
      if (id === todoId && todo.data.title !== currentValue) {
        todo.data.title = currentValue
        isDifferent = true
      }
      return todo
    })

    // only set state if input different
    if (isDifferent) {

      setState(draft => void draft.todos = updatedTodos, () => {
        api.update(todoId, {
          title: currentValue
        }).then(() => {
          console.log(`update todo ${todoId}`, currentValue)
        }).catch((e) => {
          console.log('An API error occurred', e)
        })
      })
    }
  }
  const clearCompleted = () => {
    const { todos } = state

    // Optimistically remove todos from UI
    const data = todos.reduce((acc, current) => {
      if (current.data.completed) {
        // save item being removed for rollback
        acc.completedTodoIds = acc.completedTodoIds.concat(getTodoId(current))
        return acc
      }
      // filter deleted todo out of the todos list
      acc.optimisticState = acc.optimisticState.concat(current)
      return acc
    }, {
      completedTodoIds: [],
      optimisticState: []
    })

    // only set state if completed todos exist
    if (!data.completedTodoIds.length) {
      alert('Please check off some todos to batch remove them')
      closeModal()
      return false
    }

    setState(draft => void draft.todos = data.optimisticState, () => {
      setTimeout(() => {
        closeModal()
      }, 600)

      api.batchDelete(data.completedTodoIds).then(() => {
        console.log(`Batch removal complete`, data.completedTodoIds)
      }).catch((e) => {
        console.log('An API error occurred', e)
      })
    })

  }
  renderTodos() {
    const { todos } = state

    if (!todos || !todos.length) {
      // Loading State here
      return null
    }

    const timeStampKey = 'ts'
    const orderBy = 'desc' // or `asc`
    const sortOrder = sortByDate(timeStampKey, orderBy)
    const todosByDate = todos.sort(sortOrder)

    return todosByDate.map((todo, i) => {
      const { data, ref } = todo
      const id = getTodoId(todo)
      // only show delete button after create API response returns
      let deleteButton
      if (ref) {
        deleteButton = (
          <button data-id={id} onClick={deleteTodo}>
            delete
          </button>
        )
      }
      const boxIcon = (data.completed) ? '#todo__box__done' : '#todo__box'
      return (
        <div key={i} className='todo-item'>
          <label className="todo">
            <input
              data-id={id}
              className="todo__state"
              type="checkbox"
              onChange={handleTodoCheckbox}
              checked={data.completed}
            />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 25" className="todo__icon">
              <use xlinkHref={`${boxIcon}`} className="todo__box"></use>
              <use xlinkHref="#todo__check" className="todo__check"></use>
            </svg>
            <div className='todo-list-title'>
              <ContentEditable
                tagName='span'
                editKey={id}
                onBlur={updateTodoTitle} // save on enter/blur
                html={data.title}
                // onChange={this.handleDataChange} // save on change
              />
            </div>
          </label>
          {deleteButton}
        </div>
      )
    })
  }
    return (
      <div className='app'>

        <AppHeader />

        <div className='todo-list'>
          <h2>
            Create todo
            <SettingsIcon onClick={openModal} className='mobile-toggle' />
          </h2>
          <form className='todo-create-wrapper' onSubmit={saveTodo}>
            <input
              className='todo-create-input'
              placeholder='Add a todo item'
              name='name'
              ref={inputElement}
              autoComplete='off'
              style={{marginRight: 20}}
            />
            <div className='todo-actions'>
              <button className='todo-create-button'>
                Create todo
              </button>
              <SettingsIcon onClick={openModal}  className='desktop-toggle' />
            </div>
          </form>

          {renderTodos()}
        </div>
        <SettingsMenu
          showMenu={state.showMenu}
          handleModalClose={closeModal}
          handleClearCompleted={clearCompleted}
        />
      </div>
    )
}

function removeOptimisticTodo(todos) {
  // return all 'real' todos
  return todos.filter((todo) => {
    return todo.ref
  })
}

function getTodoId(todo) {
  if (!todo.ref) {
    return null
  }
  return todo.ref['@ref'].split('/').pop()
}

import { useState, useEffect, useCallback } from 'react';
import produce from 'immer';
import { SSL_OP_NO_COMPRESSION } from 'constants';

// -------------- source code --------------
export function useInput(initialValue = '', stateObserver = noop) {
  const [value, setValue] = useState(initialValue);
  const onChange = e => {
    setValue(e.target.value);
    stateObserver(e.target.value);
  };
  return { value, onChange, setValue };
}

function noop() {}
export function useLocalStorage(key, optionalCallback = noop) {
  const [state, setState] = useState(null);
  useEffect(() => {
    // chose to make this async
    const existingValue = localStorage.getItem(key);
    if (existingValue) {
      const parsedValue = JSON.parse(existingValue);
      setState(parsedValue);
      optionalCallback(parsedValue);
    }
  }, []);
  const removeItem = () => {
    setState(null);
    localStorage.removeItem(key);
    optionalCallback(null);
  };
  const setItem = obj => {
    setState(obj);
    localStorage.setItem(key, JSON.stringify(obj));
    optionalCallback(obj);
  };
  return [state, setItem, removeItem];
}

export function useProduceState(initState, observer = noop) {
  const [state, setState] = useState(initState);
  const cb = (mutatorOrValue, next) => {
    if (isFunction(mutatorOrValue)) {
      // is a function, put it through immer
      setState(s => produce(s, d => void mutatorOrValue(d)));
      observer(state);
    } else {
      // is a value
      setState(mutatorOrValue);

      observer(mutatorOrValue);
    }
    if (next) next(); // post setState callback
  };
  // return [state, useCallback(cb, [setState])];
  return [state, cb];
}

// // usage
// const [state, setState] = useProduceState({
//   todos: [],
//   showMenu: false
// });
// const closeModal = e => {
//   setState(draft => draft.showMenu = false);
// };

export function useKeydown(key, handler) {
  useEffect(
    () => {
      const cb = e => e.key === key && handler(e);
      document.body.addEventListener('keydown', cb);
      return () => {
        document.body.removeEventListener('keydown', cb);
      };
    },
    [key, handler]
  );
}

// export function useOptimisticState(initState) {
//   const [state, setState] = useState(initState);
//   const oldState = useRef(state);
//   function optimisticSetState(nextState) {
//     oldState.current = state;
//     setState(nextState);
//   }
//   async function tryAPI(somePromise) {
//     return async function(yay, nay) {
//       try {
//         yay(optimisticSetState);
//         return await somePromise;
//       } catch (err) {
//         nay(err);
//         setState(oldState.current);
//         return err;
//       }
//     };
//   }
//   return [state, tryAPI];
// }

// // usage
// const [state, tryAPI] = useOptimisticState({ count: 0})
// const success = setState => setState({ count : state.count + 1 })
// const failure = error => console.log('Error: ', error)
// const onClick = () => tryAPI(api.plusOne())(success, failure)

// export default function App() {
//   const [state, setState] = useProduceState({ foo: 1, bar: 2 });
//   return (
//     <div>
//       <h1>setoldstate</h1>
//       <div>{JSON.stringify(state)}</div>
//       <button onClick={() => setState(draft => void (draft.foo = 3))}>
//         test
//       </button>
//     </div>
//   );
// }

// https://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
function isFunction(functionToCheck) {
  return (
    functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'
  );
}

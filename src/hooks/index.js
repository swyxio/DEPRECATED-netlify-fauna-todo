import React, { useState, useEffect, useCallback } from 'react';

import produce from 'immer';
export function useProduceState(initState) {
  const [state, setState] = useState(initState);
  const cb = (mutator, next) => {
    setState(s => produce(s, d => void mutator(d)));
    if (next) next();
  };
  return [state, useCallback(cb, [setState])];
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

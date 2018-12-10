import React from 'react';
import { useInput } from 'hooks';

export default function InputArea({ onSubmit, placeholder }) {
  const { setValue, ...inputProps } = useInput();
  const handleNewTodoKeyDown = event => {
    if (event.keyCode !== 13) return;
    event.preventDefault();
    var val = event.target.value.trim();
    if (val) {
      onSubmit(val);
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
      placeholder={placeholder}
      onKeyDown={handleNewTodoKeyDown}
      {...inputProps}
      autoFocus={true}
    />
  );
}

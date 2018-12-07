import React, { useState, useRef } from 'react';
import Editable from './Editable';
import './ContentEditable.css';

export default function ContentEditable(props) {
  const [state, setState] = useState(true);
  const focusRef = useRef(false);
  const handleClick = e => {
    e.preventDefault();
    const event = e || window.event;
    // hacks to give the contenteditable block a better UX
    event.persist();
    if (!focusRef.current) {
      const caretRange = getMouseEventCaretRange(event);
      window.setTimeout(() => {
        selectRange(caretRange);
        focusRef.current = true;
      }, 0);
    }
    // end hacks to give the contenteditable block a better UX
    setState(false);
  };
  const handleClickOutside = evt => {
    const event = evt || window.event;
    // presist blur event for react
    event.persist();
    const value = evt.target.value || evt.target.innerText;
    setState(true);
    focusRef.current = false; // reset single click functionality
    if (props.onBlur) {
      props.onBlur(evt, value);
    }
  };

  const { onChange, content, editKey, tagName } = props;
  return (
    <Editable
      tagName={tagName}
      data-key={editKey}
      className={'editable'}
      onClick={handleClick}
      onBlur={handleClickOutside}
      content={content}
      disabled={state}
      onChange={onChange}
    />
  );
}

function getMouseEventCaretRange(event) {
  const x = event.clientX;
  const y = event.clientY;
  let range;

  if (document.body.createTextRange) {
    // IE
    range = document.body.createTextRange();
    range.moveToPoint(x, y);
  } else if (typeof document.createRange !== 'undefined') {
    // Try Firefox rangeOffset + rangeParent properties
    if (typeof event.rangeParent !== 'undefined') {
      range = document.createRange();
      range.setStart(event.rangeParent, event.rangeOffset);
      range.collapse(true);
    } else if (document.caretPositionFromPoint) {
      // Try the standards-based way next
      const pos = document.caretPositionFromPoint(x, y);
      range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.collapse(true);
    } else if (document.caretRangeFromPoint) {
      // WebKit
      range = document.caretRangeFromPoint(x, y);
    }
  }
  return range;
}

function selectRange(range) {
  if (range) {
    if (typeof range.select !== 'undefined') {
      range.select();
    } else if (typeof window.getSelection !== 'undefined') {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}

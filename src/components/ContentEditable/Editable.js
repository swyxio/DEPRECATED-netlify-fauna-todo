/* fork of https://github.com/lovasoa/react-contenteditable */
import React, { useRef, useEffect } from 'react';

// after
export default React.memo(function Editable(props) {
  const htmlElRef = useRef();
  useEffect(() => {
    const htmlEl = htmlElRef.current;
    if (htmlEl && props.html !== htmlEl.innerHTML) {
      // Perhaps React (whose VDOM gets outdated because we often prevent
      // rerendering) did not update the DOM. So we update it manually now.
      htmlEl.innerHTML = props.html;
    }
  });
  const preventEnter = evt => {
    if (evt.which === 13) {
      evt.preventDefault();

      const htmlEl = htmlElRef.current;
      if (!htmlEl) {
        return false;
      }
      htmlEl.blur();
      return false;
    }
  };
  const lastHtml = useRef();
  const emitChange = evt => {
    const htmlEl = htmlElRef.current;
    if (!htmlEl) {
      return false;
    }
    const html = htmlEl.innerHTML;
    if (props.onChange && html !== lastHtml.current) {
      evt.target.value = html;
      props.onChange(evt, html);
    }
    lastHtml.current = html;
  };

  const { tagName, html, onChange, ...props2 } = props;

  const domNodeType = tagName || 'div';
  const elementProps = {
    ...props2,
    ref: htmlElRef.current,
    onKeyDown: preventEnter,
    onInput: emitChange,
    onBlur: props.onBlur || emitChange,
    contentEditable: !props.disabled
  };

  let children = props.children;
  if (html) {
    elementProps.dangerouslySetInnerHTML = { __html: html };
    children = null;
  }
  return React.createElement(domNodeType, elementProps, children);
});

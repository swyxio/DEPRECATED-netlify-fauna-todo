import React, { ConcurrentMode, StrictMode } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(
  <ConcurrentMode>
    <StrictMode>
      <App model={model} />
    </StrictMode>
  </ConcurrentMode>,
  document.getElementById('root')
);

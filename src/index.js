import React, { ConcurrentMode, StrictMode } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(
  <ConcurrentMode>
    <StrictMode>
      <App />
    </StrictMode>
  </ConcurrentMode>,
  document.getElementById('root')
);

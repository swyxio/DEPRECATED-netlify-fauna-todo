import React, { ConcurrentMode, StrictMode } from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
import 'todomvc-common/base.css';
import 'todomvc-app-css/index.css';
import App from './App';
import AppHeader from './components/AppHeader';

ReactDOM.render(
  <ConcurrentMode>
    <StrictMode>
      <AppHeader />
      <App />
    </StrictMode>
  </ConcurrentMode>,
  document.getElementById('root')
);

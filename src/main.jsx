import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { Prov } from './context/AppContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Prov>
      <App />
    </Prov>
  </React.StrictMode>
);
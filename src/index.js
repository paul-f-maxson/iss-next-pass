import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

if (process.env.NODE_ENV !== 'production') {
  localStorage.setItem('debug', 'iss_next_pass:*');
}

ReactDOM.render(<App className="App"/>, document.getElementById('root'));
registerServiceWorker();

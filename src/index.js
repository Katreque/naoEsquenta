import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner, faTimesCircle} from '@fortawesome/free-solid-svg-icons'

library.add(faSpinner, faTimesCircle);

ReactDOM.render(
    <App />
, document.getElementById('root'));
registerServiceWorker();

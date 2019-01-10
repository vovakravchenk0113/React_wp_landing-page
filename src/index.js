import React from 'react';
import ReactDOM from 'react-dom';
import App from './js/App';
import registerServiceWorker from './js/registerServiceWorker';
import { subscribeTo, sendMessage } from './js/api'

// (function(proxied) {
//     console.log = function() {
//         sendMessage('client-log', arguments)
//         return proxied.apply(this, arguments);
//     };
//   })(console.log);

subscribeTo({
    'subscribe': subscribe => console.log('Subscribed to:', subscribe),
    'login': message => console.log(message),
    'error': error => console.log(error),
    'client-log': message => console.log('Server received message from client:', message),
})

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

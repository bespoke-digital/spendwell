
import Relay from 'react-relay';
import nprogress from 'nprogress';

import { getCookie } from 'utils/cookies';


let pendingRequests = 0;


function finishPromise(arg) {
  pendingRequests--;

  if (pendingRequests === 0)
    nprogress.done();

  return arg;
}

function loadingPromise(promise) {
  nprogress.start();
  pendingRequests++;

  return promise.then(finishPromise, finishPromise);
}


const defaultNetworkLayer = new Relay.DefaultNetworkLayer('/graphql', {
  credentials: 'same-origin',
  headers: {
    'X-CSRFToken': getCookie('csrftoken'),
  },
});


export default Object.assign({}, defaultNetworkLayer, {
  sendMutation(arg) {
    return loadingPromise(defaultNetworkLayer.sendMutation(arg));
  },
  sendQueries(arg) {
    return loadingPromise(defaultNetworkLayer.sendQueries(arg));
  },
});

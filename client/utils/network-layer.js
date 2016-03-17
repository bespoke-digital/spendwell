
import Relay from 'react-relay';
import nprogress from 'nprogress';

import { getCookie } from 'utils/cookies';


function finishPromise(arg) {
  nprogress.done();
  return arg;
}

function loadingPromise(promise) {
  nprogress.start();
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


import _ from 'lodash'
import Relay from 'react-relay'

import { getCookie } from 'utils/cookies'
import store from 'store'

function finishPromise (arg) {
  store.dispatch({ type: 'LOADING_START' })
  return arg
}

function loadingPromise (promise) {
  store.dispatch({ type: 'LOADING_STOP' })
  return promise.then(finishPromise, finishPromise)
}

const defaultNetworkLayer = new Relay.DefaultNetworkLayer('/graphql', {
  credentials: 'same-origin',
  headers: {
    'X-CSRFToken': getCookie('csrftoken'),
  },
})

export default _.assign({}, defaultNetworkLayer, {
  sendMutation (request) {
    return loadingPromise(defaultNetworkLayer.sendMutation(request))
  },
  sendQueries (arg) {
    return loadingPromise(defaultNetworkLayer.sendQueries(arg))
  },
})

export const handleMutationError = function (response) {
  throw response.getError() || new Error('Mutation failed.')
}

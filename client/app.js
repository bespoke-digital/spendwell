
import 'sass/app'
import 'chatlio'
import 'utils/moment-as-utc'
import 'utils/class-list'

import { render } from 'react-dom'
import Relay from 'react-relay'
import { Provider } from 'react-redux'

import networkLayer from 'utils/network-layer'
import routes from 'routes'
import store from 'store'

const userID = document.querySelector('meta[name=user-id]').getAttribute('content')
const userEmail = document.querySelector('meta[name=user-email]').getAttribute('content')

Relay.injectNetworkLayer(networkLayer)

window.onload = () => render(
  <Provider store={store}>{routes}</Provider>,
  document.getElementById('root'),
  () => document.getElementById('loading').remove()
)

// Sentry
if (window.Raven) {
  window.Raven.setUserContext({ email: userEmail, id: userID })
}


import {
  Router,
  Route,
  IndexRedirect,
  applyRouterMiddleware,
  browserHistory,
} from 'react-router'
import Relay from 'react-relay'
import useRelay from 'react-router-relay'

import Dashboard from 'views/dashboard'
import Accounts from 'views/accounts'
import AddAccount from 'views/add-account'
import AccountUpload from 'views/account-upload'
import Bucket from 'views/bucket'
import Transactions from 'views/transactions'
import OnboardingAddAccount from 'views/onboarding/add-account'
import OnboardingAccounts from 'views/onboarding/accounts'
import OnboardingWalkthrough from 'views/onboarding/walkthrough'

import track from 'utils/track'

const queries = { viewer: () => Relay.QL`query { viewer }` }

function render ({ props, element }) {
  if (props) {
    const loading = document.getElementById('loading')
    if (loading) loading.remove()

    return React.cloneElement(element, props)
  }
}

const viewKwargs = { render, queries }

function onUpdate () {
  window.scrollTo(0, 0)
  track(`route: ${document.location.pathname}`)
}

export default (
  <Router
    history={browserHistory}
    onUpdate={onUpdate}
    forceFetch={true}
    render={applyRouterMiddleware(useRelay)}
    environment={Relay.Store}
  >
    <Route path='onboarding'>
      <IndexRedirect to='connect'/>

      <Route path='connect' component={OnboardingAddAccount} {...viewKwargs}/>
      <Route path='accounts' component={OnboardingAccounts} {...viewKwargs}/>
      <Route path='walkthrough' component={OnboardingWalkthrough} {...viewKwargs}/>
    </Route>

    <Route path='app'>
      <IndexRedirect to='dashboard'/>

      <Route path='dashboard' component={Dashboard} {...viewKwargs}/>
      <Route path='dashboard/:year/:month' component={Dashboard} {...viewKwargs}/>

      <Route path='labels/:id' component={Bucket} {...viewKwargs}/>

      <Route path='accounts' component={Accounts} {...viewKwargs}/>
      <Route path='accounts/new' component={AddAccount} {...viewKwargs}/>
      <Route path='accounts/:id/upload' component={AccountUpload} {...viewKwargs}/>

      <Route path='transactions' component={Transactions} {...viewKwargs}/>
    </Route>
  </Router>
)

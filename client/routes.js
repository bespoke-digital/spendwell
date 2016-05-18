
import { Route, IndexRedirect, browserHistory } from 'react-router';
import Relay from 'react-relay';
import { RelayRouter } from 'react-router-relay';

import Dashboard from 'views/dashboard';
import Accounts from 'views/accounts';
import AddAccount from 'views/add-account';
import AccountUpload from 'views/account-upload';
import Bucket from 'views/bucket';
import Goal from 'views/goal';
import Transactions from 'views/transactions';
import OnboardingAddAccount from 'views/onboarding/add-account';
import OnboardingAccounts from 'views/onboarding/accounts';
import OnboardingWalkthrough from 'views/onboarding/walkthrough';

import track from 'utils/track';

const rootQuery = { viewer: ()=> Relay.QL`query { viewer }` };

function onUpdate() {
  window.scrollTo(0, 0);
  track(`route: ${document.location.pathname}`);
}

export default (
  <RelayRouter history={browserHistory} onUpdate={onUpdate} forceFetch={true}>
    <Route path='onboarding'>
      <IndexRedirect to='connect'/>

      <Route path='connect' component={OnboardingAddAccount} queries={rootQuery}/>
      <Route path='accounts' component={OnboardingAccounts} queries={rootQuery}/>
      <Route path='walkthrough' component={OnboardingWalkthrough} queries={rootQuery}/>
    </Route>

    <Route path='app'>
      <IndexRedirect to='dashboard'/>

      <Route path='dashboard' component={Dashboard} queries={rootQuery}/>
      <Route path='dashboard/:year/:month' component={Dashboard} queries={rootQuery}/>

      <Route path='goals/:id' component={Goal} queries={rootQuery}/>
      <Route path='labels/:id' component={Bucket} queries={rootQuery}/>

      <Route path='accounts' component={Accounts} queries={rootQuery}/>
      <Route path='accounts/new' component={AddAccount} queries={rootQuery}/>
      <Route path='accounts/:id/upload' component={AccountUpload} queries={rootQuery}/>

      <Route path='transactions' component={Transactions} queries={rootQuery}/>
    </Route>
  </RelayRouter>
);

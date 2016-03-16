
import { Route, IndexRedirect, browserHistory } from 'react-router';
import Relay from 'react-relay';
import { RelayRouter } from 'react-router-relay';

import OnboardingAddAccount from 'views/onboarding-add-account';
import OnboardingAccounts from 'views/onboarding-accounts';
import OnboardingWalkthrough from 'views/onboarding-walkthrough';


const rootQuery = { viewer: ()=> Relay.QL`query { viewer }` };

export default (
  <RelayRouter history={browserHistory}>
    <Route path='onboarding'>
      <IndexRedirect to='connect'/>
      <Route path='connect' component={OnboardingAddAccount} queries={rootQuery}/>
      <Route path='accounts' component={OnboardingAccounts} queries={rootQuery}/>
      <Route path='walkthrough' component={OnboardingWalkthrough}/>
    </Route>
  </RelayRouter>
);

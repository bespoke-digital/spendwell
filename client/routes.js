
import { Route, IndexRedirect, browserHistory } from 'react-router';
import Relay from 'react-relay';
import { RelayRouter } from 'react-router-relay';

import Dashboard from 'views/dashboard';
import Accounts from 'views/accounts';
import AddPlaid from 'views/add-plaid';
import AddCsv from 'views/add-csv';
import Categories from 'views/categories';
import App from 'views/app';
import CreateGoal from 'views/create-goal';
import CreateBucket from 'views/create-bucket';
import Outgoing from 'views/outgoing';
import Incoming from 'views/incoming';
import Transfers from 'views/transfers';
import Bucket from 'views/bucket';
import AllTransactions from 'views/all-transactions';


const rootQuery = { viewer: ()=> Relay.QL`query { viewer }` };

export default (
  <RelayRouter history={browserHistory}>
    <Route path='app' component={App} queries={rootQuery}>
      <IndexRedirect to='dashboard'/>
      <Route path='dashboard' component={Dashboard} queries={rootQuery}/>
      <Route path='dashboard/:year/:month' component={Dashboard} queries={rootQuery}/>

      <Route path='goals/new' component={CreateGoal} queries={rootQuery}/>

      <Route path='buckets/new' component={CreateBucket} queries={rootQuery}/>
      <Route path='buckets/:id' component={Bucket} queries={rootQuery}/>

      <Route path='transactions' component={AllTransactions} queries={rootQuery}/>
      <Route path='outgoing' component={Outgoing} queries={rootQuery}/>
      <Route path='incoming' component={Incoming} queries={rootQuery}/>
      <Route path='transfers' component={Transfers} queries={rootQuery}/>

      <Route path='accounts' component={Accounts} queries={rootQuery}/>
      <Route path='accounts/add/plaid' component={AddPlaid} queries={rootQuery}/>
      <Route path='accounts/add/upload' component={AddCsv} queries={rootQuery}/>
      <Route path='accounts/:accountId' component={Accounts} queries={rootQuery}/>

      <Route path='categories' component={Categories} queries={rootQuery}/>
    </Route>
  </RelayRouter>
);

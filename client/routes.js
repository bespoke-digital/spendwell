
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
import Outgoing from 'views/outgoing';
import Incoming from 'views/incoming';
import Transfers from 'views/transfers';


const rootQuery = { viewer: ()=> Relay.QL`query { viewer }` };

export default (
  <RelayRouter history={browserHistory}>
    <Route path='app' component={App} queries={rootQuery}>
      <IndexRedirect to='dashboard'/>
      <Route path='dashboard' component={Dashboard} queries={rootQuery}/>
      <Route path='dashboard/:year/:month' component={Dashboard} queries={rootQuery}/>

      <Route path='goals/new' component={CreateGoal} queries={rootQuery}/>

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


// import Buckets from 'views/buckets';
// import Bucket from 'views/bucket';

// <Route path='/buckets' component={Buckets}/>
// <Route path='/buckets/:id' component={Bucket}/>
// <Route path='/goals/:id' component={Goal}/>

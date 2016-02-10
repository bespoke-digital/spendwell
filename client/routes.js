
import { Route, IndexRedirect, browserHistory } from 'react-router';
import Relay from 'react-relay';
import { RelayRouter } from 'react-router-relay';
import { Provider } from 'react-redux';

import store from 'store';

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


const viewerQuery = {
  viewer: ()=> Relay.QL`query { viewer }`,
};

export default (
  <Provider store={store}>
    <RelayRouter history={browserHistory}>
      <Route path='app' component={App} queries={viewerQuery}>
        <IndexRedirect to='dashboard'/>
        <Route path='dashboard' component={Dashboard} queries={viewerQuery}/>
        <Route path='dashboard/:year/:month' component={Dashboard} queries={viewerQuery}/>

        <Route path='goals/new' component={CreateGoal} queries={viewerQuery}/>

        <Route path='outgoing' component={Outgoing} queries={viewerQuery}/>
        <Route path='incoming' component={Incoming} queries={viewerQuery}/>
        <Route path='transfers' component={Transfers} queries={viewerQuery}/>

        <Route path='accounts' component={Accounts} queries={viewerQuery}/>
        <Route path='accounts/add/plaid' component={AddPlaid} queries={viewerQuery}/>
        <Route path='accounts/add/upload' component={AddCsv} queries={viewerQuery}/>
        <Route path='accounts/:accountId' component={Accounts} queries={viewerQuery}/>

        <Route path='categories' component={Categories} queries={viewerQuery}/>
      </Route>
    </RelayRouter>
  </Provider>
);


// import Buckets from 'views/buckets';
// import Bucket from 'views/bucket';

// <Route path='/buckets' component={Buckets}/>
// <Route path='/buckets/:id' component={Bucket}/>
// <Route path='/goals/:id' component={Goal}/>

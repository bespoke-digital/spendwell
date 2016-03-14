
import { Route, IndexRedirect, browserHistory } from 'react-router';
import Relay from 'react-relay';
import { RelayRouter } from 'react-router-relay';

import Dashboard from 'views/dashboard';
import Accounts from 'views/accounts';
import AddPlaid from 'views/add-plaid';
import Categories from 'views/categories';
import CreateGoal from 'views/create-goal';
import CreateBucket from 'views/create-bucket';
import CreateBill from 'views/create-bill';
import UpdateBucket from 'views/update-bucket';
import UpdateGoal from 'views/update-goal';
import Bucket from 'views/bucket';
import Goal from 'views/goal';
import Transactions from 'views/transactions';


const rootQuery = { viewer: ()=> Relay.QL`query { viewer }` };

export default (
  <RelayRouter
    history={browserHistory}
    renderFetched={()=> setTimeout(window.scrollTo.bind(window, 0, 0), 10)}
  >
    <Route path='app'>
      <IndexRedirect to='dashboard'/>
      <Route path='dashboard' component={Dashboard} queries={rootQuery}/>
      <Route path='dashboard/:year/:month' component={Dashboard} queries={rootQuery}/>

      <Route path='goals/new' component={CreateGoal} queries={rootQuery}/>
      <Route path='goals/:id' component={Goal} queries={rootQuery}/>
      <Route path='goals/:id/edit' component={UpdateGoal} queries={rootQuery}/>

      <Route path='labels/new' component={CreateBucket} queries={rootQuery}/>
      <Route path='labels/:id' component={Bucket} queries={rootQuery}/>
      <Route path='labels/:id/edit' component={UpdateBucket} queries={rootQuery}/>

      <Route path='bills/new' component={CreateBill} queries={rootQuery}/>

      <Route path='transactions' component={Transactions} queries={rootQuery}/>

      <Route path='accounts' component={Accounts} queries={rootQuery}/>
      <Route path='accounts/add/plaid' component={AddPlaid} queries={rootQuery}/>
      <Route path='accounts/:accountId' component={Accounts} queries={rootQuery}/>

      <Route path='categories' component={Categories} queries={rootQuery}/>
    </Route>
  </RelayRouter>
);

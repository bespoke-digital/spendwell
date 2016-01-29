
import { Router, Route, browserHistory } from 'react-router';
import { RelayRouter } from 'react-router-relay';

// import Logout from 'views/logout';
// import Login from 'views/login';
// import Signup from 'views/signup';
// import Auth from 'views/auth';
// import Dashboard from 'views/dashboard';
// import ConnectPlaid from 'views/connect';
// import FinicitySearch from 'views/finicitySearch';
// import FinicityConnect from 'views/finicityConnect';
// import Upload from 'views/upload';
// import Buckets from 'views/buckets';
// import Goal from 'views/goal';
// import Bucket from 'views/bucket';
// import Incoming from 'views/incoming';
// import Outgoing from 'views/outgoing';

import Accounts from 'views/accounts';
import Categories from 'views/categories';
import App from 'views/app';


// export default (
//   <Router history={browserHistory}>
//     <Route component={Auth}>
//       <Route path='/login' component={Login}/>
//       <Route path='/logout' component={Logout}/>
//       <Route path='/signup' component={Signup}/>
//     </Route>

//     <Route component={App}>
//       <Route path='/' component={Dashboard}/>
//       <Route path='/dashboard/:year/:month' component={Dashboard}/>

//       <Route path='/incoming' component={Incoming}/>
//       <Route path='/outgoing' component={Outgoing}/>

//       <Route path='/buckets' component={Buckets}/>
//       <Route path='/buckets/:id' component={Bucket}/>

//       <Route path='/goals/new' component={Goal}/>
//       <Route path='/goals/:id' component={Goal}/>

//       <Route path='/accounts' component={Accounts}/>
//       <Route path='/accounts/:accountId' component={Accounts}/>
//       <Route path='/connect/plaid' component={ConnectPlaid}/>
//       <Route path='/connect/finicity' component={FinicitySearch}/>
//       <Route path='/connect/finicity/:institutionId' component={FinicityConnect}/>
//       <Route path='/connect/upload' component={Upload}/>

//       <Route path='/categories' component={Categories}/>
//     </Route>
//   </Router>
// );

const viewerQuery = { viewer: ()=> Relay.QL`query { viewer }` }


export default (
  <RelayRouter history={browserHistory}>
    <Route path='app' component={App}>
      <Route path='accounts' component={Accounts} queries={viewerQuery}/>
      <Route path='accounts/:accountId' component={Accounts} queries={viewerQuery}/>
      <Route path='categories' component={Categories} queries={viewerQuery}/>
    </Route>
  </RelayRouter>
);

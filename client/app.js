
import 'sass/app';
import 'utils/moment-as-utc';

import { render } from 'react-dom';
import Relay from 'react-relay';
import { Provider } from 'react-redux';

import store from 'store';
import appRoutes from 'app-routes';
import networkLayer from 'utils/network-layer';


Relay.injectNetworkLayer(networkLayer);


const renderRoutes = (routes)=> render(
  <Provider store={store}>{routes}</Provider>,
  document.getElementById('root'),
);


window.onload = ()=> renderRoutes(appRoutes);

if (module.hot)
  module.hot.accept('app-routes', ()=> renderRoutes(require('app-routes')));

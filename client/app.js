
import 'sass/app';
import 'utils/moment-as-utc';

import { render } from 'react-dom';
import Relay from 'react-relay';
import { Provider } from 'react-redux';

import store from 'store';
import networkLayer from 'utils/network-layer';
import appRoutes from './app-routes';


Relay.injectNetworkLayer(networkLayer);


const renderRoutes = (routes)=> render(
  <Provider store={store}>{routes}</Provider>,
  document.getElementById('root'),
);


window.onload = ()=> renderRoutes(appRoutes);

if (module.hot) {
  console.log('setting up hot reloading');
  module.hot.accept('./app-routes', ()=> {
    console.log('hot reload');
    renderRoutes(require('./app-routes'));
  });
}

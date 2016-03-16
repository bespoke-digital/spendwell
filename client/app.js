
import 'sass/app';
import 'utils/moment-as-utc';

import { render } from 'react-dom';
import Relay from 'react-relay';

import networkLayer from 'utils/network-layer';
import routes from 'app-routes';


Relay.injectNetworkLayer(networkLayer);


window.onload = ()=> render(routes, document.getElementById('root'));

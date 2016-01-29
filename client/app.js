
import 'sass/app.scss';

import { render } from 'react-dom';
import routes from 'routes';
import Relay from 'react-relay';

import { getCookie } from 'utils/cookies';


Relay.injectNetworkLayer(
  new Relay.DefaultNetworkLayer('/graphql', {
    credentials: 'same-origin',
    headers: {
      'X-CSRFToken': getCookie('csrftoken'),
    },
  })
);


window.onload = ()=> render(routes, document.getElementById('root'));

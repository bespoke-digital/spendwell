
import 'sass/app';
import 'utils/moment-as-utc';

import { render } from 'react-dom';
import Relay from 'react-relay';
import { Provider } from 'react-redux';

import networkLayer from 'utils/network-layer';
import routes from 'routes';
import store from 'store';


const userID = document.querySelector('meta[name=user-id]').getAttribute('content');
const userEmail = document.querySelector('meta[name=user-email]').getAttribute('content');


Relay.injectNetworkLayer(networkLayer);


window.onload = ()=> render(
  <Provider store={store}>{routes}</Provider>,
  document.getElementById('root')
);


// Chatlio
window._chatlio = window._chatlio||[];
!function(){ var t=document.getElementById("chatlio-widget-embed");if(t&&window.ChatlioReact&&_chatlio.init)return void _chatlio.init(t,ChatlioReact);for(var e=function(t){return function(){_chatlio.push([t].concat(arguments)) }},i=["configure","identify","track","show","hide","isShown","isOnline"],a=0;a<i.length;a++)_chatlio[i[a]]||(_chatlio[i[a]]=e(i[a]));var n=document.createElement("script"),c=document.getElementsByTagName("script")[0];n.id="chatlio-widget-embed",n.src="https://w.chatlio.com/w.chatlio-widget.js",n.async=!0,n.setAttribute("data-embed-version","2.1");
   n.setAttribute('data-widget-options', '{"embedSidebar": true}');
   n.setAttribute('data-widget-id','774102f8-2f7a-4252-4cd5-eb9e15039b5d');
   c.parentNode.insertBefore(n,c);
}();
window._chatlio.identify(userID, { email: userEmail });


// Sentry
if (window.Raven)
  Raven.setUserContext({ email: userEmail, id: userID });

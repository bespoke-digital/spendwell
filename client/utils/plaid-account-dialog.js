
import Relay from 'react-relay';

import { handleMutationError } from 'utils/network-layer';
import { ConnectPlaidInstitutionMutation } from 'mutations/institutions';


const PLAID_PRODUCTION = document.querySelector('meta[name=plaid-production]').getAttribute('content') === 'true';
const PLAID_PUBLIC_KEY = document.querySelector('meta[name=plaid-public-key]').getAttribute('content');


export default function({
  plaidInstitutionId,
  viewer,
  onConnecing,
  onConnected,
  fullSync,
}) {
  function openPlaid() {
    window.Plaid.create({
      clientName: 'Spendwell',
      key: PLAID_PUBLIC_KEY,
      product: 'connect',
      longtail: true,
      env: PLAID_PRODUCTION ? 'production' : 'tartan',
      onSuccess(publicToken) {
        if (onConnecing)
          onConnecing();

        Relay.Store.commitUpdate(new ConnectPlaidInstitutionMutation({
          viewer,
          publicToken,
          plaidInstitutionId,
          fullSync: !!fullSync,
        }), {
          onFailure: handleMutationError,
          onSuccess: ()=> {
            console.log('Success: ConnectPlaidInstitutionMutation');

            if (onConnected)
              onConnected();
          },
        });
      },
    }).open(plaidInstitutionId);
  }

  if (!window.Plaid) {
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/stable/link-initialize.js';
    script.onload = script.onreadystatechange = function() {
      script.onload = script.onreadystatechange = null;
      openPlaid();
    };
    document.getElementsByTagName('head')[0].appendChild(script);

  } else {
    openPlaid();
  }
}


import Plaid from 'plaid';

const plaid = new Plaid.Client(
  '5642567be7dbd3891f08e5a4',
  'da9810c55be7680311950088a45d22',
  Plaid.environments.tartan
);

export default function(socket) {
  socket.on('plaid.institutions.search', function(data, clbk) {
    Plaid._publicRequest({
      uri: `${Plaid.environments.tartan}/institutions/search?q=${data.query}&p=connect`,
      method: 'GET',
      body: {},
    }, function(err, results) {
      if (err)
        console.error(err);
      else
        clbk({ results });
    });
  });

  socket.on('plaid.connected', function(data, clbk) {
    if (!socket.user) {
      clbk({ success: false, reason: 'user is not authenticated' });
      return;
    }

    plaid.exchangeToken(data.publicToken, (err, response)=> {
      if (err) {
        console.error(err);
        clbk({ success: false, reason: err.message || 'Plaid error' });
        return;
      }

      socket.user.plaidKey = response.access_token;
      socket.user.save().then(()=> clbk({ success: true }));
    });
  });

  socket.on('plaid.transactions', function(clbk) {
    if (!socket.user) {
      clbk({ success: false, reason: 'user is not authenticated' });
      return;
    }
    if (!socket.user.plaidKey) {
      clbk({ success: false, reason: 'no account connected' });
      return;
    }

    plaid.getConnectUser(socket.user.plaidKey, { gte: '30 days ago' }, (err, response)=> {
      if (err) {
        console.error(err);
        clbk({ success: false, reason: err.message || 'Plaid error' });
        return;
      }

      console.log(response);
      clbk({
        success: true,
        transactions: response.transactions,
        accounts: response.accounts,
      });
    });
  });
}

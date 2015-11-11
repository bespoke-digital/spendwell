
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
      if (err) {
        console.error(err);
      } else {
        clbk({ results });
      }
    });
  });
}

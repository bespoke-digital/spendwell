
import { Component } from 'react';
import Relay from 'react-relay';

import CardList from 'components/card-list';
import Card from 'components/card';
import Money from 'components/money';
import Button from 'components/button';

import { DetectTransfersMutation } from 'mutations/transactions';


class Transfers extends Component {
  constructor() {
    super();
    this.state = {};
  }

  detectTransfers() {
    const { viewer } = this.props;
    Relay.Store.commitUpdate(new DetectTransfersMutation({ viewer }), {
      onSuccess: console.log.bind(console, 'onSuccess'),
      onFailure: console.log.bind(console, 'onFailure'),
    });
  }

  render() {
    const { viewer: { transactions } } = this.props;
    return (
      <div className={`container`}>
        <div className='heading'>
          <h1>Transfers</h1>
          <Button onClick={::this.detectTransfers}>
            <i className='fa fa-refresh'/>
          </Button>
        </div>

        <CardList>
          {transactions.edges.map(({ node })=>
            <Card key={node.id}>
              <div className='summary'>
                <div>
                  {node.description}
                  {' - '}
                  <Money amount={node.amount}/>
                </div>
                <div>
                  <Money amount={node.transferPair.amount}/>
                  {' - '}
                  {node.transferPair.description}
                </div>
              </div>
            </Card>
          )}
        </CardList>
      </div>
    );
  }
}

Transfers = Relay.createContainer(Transfers, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${DetectTransfersMutation.getFragment('viewer')}
        transactions(first: 500, isTransfer: true) {
          edges {
            node {
              id
              description
              amount
              account {
                name
              }
              transferPair {
                description
                amount
                account {
                  name
                }
              }
            }
          }
        }
      }
    `,
  },
});

export default Transfers;

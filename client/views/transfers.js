
import { Component } from 'react';
import Relay from 'react-relay';

import Button from 'components/button';
import TransactionList from 'components/transaction-list';

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

        <TransactionList transactions={transactions}/>
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
          ${TransactionList.getFragment('transactions')}
        }
      }
    `,
  },
});

export default Transfers;

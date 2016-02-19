
import { Component } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import SuperCard from 'components/super-card';
import Button from 'components/button';
import Money from 'components/money';
import TransactionList from 'components/transaction-list';
import { DisableAccountMutation, EnableAccountMutation } from 'mutations/accounts';


export default class Account extends Component {
  toggleOpen() {
    const { open } = this.props.relay.variables;
    this.props.relay.setVariables({ open: !open });
  }

  disable() {
    const { account } = this.props;
    Relay.Store.commitUpdate(new DisableAccountMutation({ account }), {
      onSuccess: console.log.bind(console, 'onSuccess'),
      onFailure: console.log.bind(console, 'onFailure'),
    });
  }

  enable() {
    const { account } = this.props;
    Relay.Store.commitUpdate(new EnableAccountMutation({ account }), {
      onSuccess: console.log.bind(console, 'onSuccess'),
      onFailure: console.log.bind(console, 'onFailure'),
    });
  }

  render() {
    const { account, relay } = this.props;
    const { open, transactionCount } = relay.variables;

    return (
      <SuperCard
        className={`account ${account.disabled ? 'disabled' : ''}`}
        expanded={open}
        summary={
          <Card summary={
            <div onClick={::this.toggleOpen}>
              <div>
                {account.name}
              </div>
              <div>
                {account.currentBalance ?
                  <Money amount={account.currentBalance}/>
                : null}
              </div>
              {!account.disabled ?
                <Button onClick={::this.disable} propagateClick={false}>
                  Disable
                </Button>
              :
                <Button onClick={::this.enable} propagateClick={false}>
                  Enable
                </Button>
              }
            </div>
          }/>
        }
      >
        <TransactionList transactions={account.transactions}/>

        <div className='bottom-load-button'>
          <Button onClick={relay.setVariables.bind(relay, {
            transactionCount: transactionCount + 20,
          })}>Load More</Button>
        </div>
      </SuperCard>
    );
  }
}

Account = Relay.createContainer(Account, {
  initialVariables: {
    open: false,
    transactionCount: 20,
  },
  fragments: {
    account: ()=> Relay.QL`
      fragment on AccountNode {
        ${DisableAccountMutation.getFragment('account')}
        ${EnableAccountMutation.getFragment('account')}
        id
        name
        currentBalance
        disabled
        transactions(first: $transactionCount) @include(if: $open) {
          ${TransactionList.getFragment('transactions')}
        }
      }
    `,
  },
});

export default Account;

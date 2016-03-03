
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import SuperCard from 'components/super-card';
import Button from 'components/button';
import Money from 'components/money';
import TransactionList from 'components/transaction-list';
import { DisableAccountMutation, EnableAccountMutation } from 'mutations/accounts';


export default class Account extends Component {
  static propTypes = {
    expanded: PropTypes.bool,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    expanded: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.expanded !== this.props.expanded)
      this.props.relay.setVariables({ open: nextProps.expanded });
  }

  // toggleOpen() {
  //   const { expanded } = this.props.relay.variables;
  //   this.props.relay.setVariables({ expanded: !expanded });
  // }

  disable() {
    const { account } = this.props;
    Relay.Store.commitUpdate(new DisableAccountMutation({ account }), {
      onFailure: ()=> console.log('Failure: DisableAccountMutation'),
      onSuccess: ()=> console.log('Success: DisableAccountMutation'),
    });
  }

  enable() {
    const { account } = this.props;
    Relay.Store.commitUpdate(new EnableAccountMutation({ account }), {
      onFailure: ()=> console.log('Failure: EnableAccountMutation'),
      onSuccess: ()=> console.log('Success: EnableAccountMutation'),
    });
  }

  loadTransactions() {
    const { relay } = this.props;
    const { transactionCount } = relay.variables;

    relay.setVariables({ transactionCount: transactionCount + 20 });
  }

  render() {
    const { account, relay, onClick } = this.props;
    const { open } = relay.variables;

    return (
      <SuperCard
        className={`account ${account.disabled ? 'disabled' : ''}`}
        expanded={open}
        summary={
          <Card onSummaryClick={onClick} summary={
            <div>
              <div>{account.name}</div>
              <div>
                {account.currentBalance && !account.disabled ?
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
        <TransactionList transactions={account.transactions} abs={false}/>

        {account.transactions && account.transactions.pageInfo.hasNextPage ?
          <div className='bottom-load-button'>
            <Button onClick={::this.loadTransactions}>Load More</Button>
          </div>
        : null}
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
          pageInfo {
            hasNextPage
          }
        }
      }
    `,
  },
});

export default Account;


import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import SuperCard from 'components/super-card';
import Button from 'components/button';
import Money from 'components/money';
import TransactionList from 'components/transaction-list';
import { DisableAccountMutation } from 'mutations/accounts';


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

  disable() {
    const { account } = this.props;
    Relay.Store.commitUpdate(new DisableAccountMutation({ account }), {
      onFailure: ()=> console.log('Failure: DisableAccountMutation'),
      onSuccess: ()=> console.log('Success: DisableAccountMutation'),
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
        className='account'
        expanded={open}
        summary={
          <Card onSummaryClick={onClick} expanded={open} summary={
            <div>
              <div>{account.name}</div>
              <div>
                {account.currentBalance ?
                  <Money amount={account.currentBalance}/>
                : null}
              </div>
            </div>
          }>
            <div className='disable'>
              <Button onClick={::this.disable} propagateClick={false}>
                Disable
              </Button>
            </div>
          </Card>
        }
      >
        <TransactionList transactions={account.transactions} abs={false}/>

        {account.transactions && account.transactions.pageInfo.hasNextPage ?
          <div className='bottom-buttons'>
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

        id
        name
        currentBalance

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

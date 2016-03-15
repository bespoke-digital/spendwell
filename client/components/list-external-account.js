
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import SuperCard from 'components/super-card';
import Button from 'components/button';
import TransactionList from 'components/transaction-list';


class ExternalAccounts extends Component {
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

  loadTransactions() {
    const { relay } = this.props;
    const { transactionCount } = relay.variables;

    relay.setVariables({ transactionCount: transactionCount + 20 });
  }

  render() {
    const { bucket, onClick, relay } = this.props;
    const { open } = relay.variables;

    return (
      <SuperCard
        className='account'
        expanded={open}
        summary={<Card summary={bucket.name}/>}
        onSummaryClick={onClick}
      >
        <TransactionList transactions={bucket.transactions} abs={false}/>

        {bucket.transactions && bucket.transactions.pageInfo.hasNextPage ?
          <div className='bottom-load-button'>
            <Button onClick={::this.loadTransactions}>Load More</Button>
          </div>
        : null}
      </SuperCard>
    );
  }
}

ExternalAccounts = Relay.createContainer(ExternalAccounts, {
  initialVariables: {
    open: false,
    transactionCount: 20,
  },
  fragments: {
    bucket: ()=> Relay.QL`
      fragment on BucketNode {
        name

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

export default ExternalAccounts;

import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import SuperCard from 'components/super-card';
import Button from 'components/button';
import TransactionList from 'components/transaction-list';


class ListExternalAccount extends Component {
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
    const { viewer, bucket, onClick, relay } = this.props;
    const { open } = relay.variables;

    return (
      <SuperCard
        className='account'
        expanded={open}
        onSummaryClick={onClick}
        summary={
          <Card summary={bucket.name} expanded={open}>
            <div className='actions'>
              <Button to={`/app/labels/${bucket.id}/edit`}>Edit</Button>
            </div>
          </Card>
        }
      >
        <TransactionList viewer={viewer} transactions={bucket.transactions} abs={false}/>

        {bucket.transactions && bucket.transactions.pageInfo.hasNextPage ?
          <div className='bottom-buttons'>
            <Button onClick={::this.loadTransactions} flat variant='primary'>Load More</Button>
          </div>
        : null}
      </SuperCard>
    );
  }
}

ListExternalAccount = Relay.createContainer(ListExternalAccount, {
  initialVariables: {
    open: false,
    transactionCount: 20,
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${TransactionList.getFragment('viewer')}
      }
    `,
    bucket: ()=> Relay.QL`
      fragment on BucketNode {
        id
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

export default ListExternalAccount;

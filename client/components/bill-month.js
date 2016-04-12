
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import SuperCard from 'components/super-card';
import Card from 'components/card';
import Money from 'components/money';
import TransactionList from 'components/transaction-list';
import Button from 'components/button';


class BillMonth extends Component {
  static propTypes = {
    month: PropTypes.object.isRequired,
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
    const { viewer, bucketMonth, onClick, relay } = this.props;
    const { open } = relay.variables;

    return (
      <SuperCard expanded={open} summary={
        <Card
          onSummaryClick={onClick}
          expanded={open}
          className={` bucket ${
            bucketMonth.avgAmount < bucketMonth.amount ?
              'bucket-warn' :
              'bucket-success'
          }`}
          summary={
            <div>
              <div>{bucketMonth.name}</div>
              <div className='amount avg'>
                {bucketMonth.avgAmount ?
                  <Money amount={bucketMonth.avgAmount} abs={true}/>
                : '-'}
              </div>
              <div className='amount'>
                <Money amount={bucketMonth.amount} abs={true}/>
              </div>
            </div>
          }
        >
          <div>Average is based on the last 3 months activity</div>
          <div className='actions'>
            <Button to={`/app/labels/${bucketMonth.bucket.id}/edit`}>Edit</Button>
          </div>
        </Card>
      }>
        {bucketMonth.transactions ?
          <TransactionList viewer={viewer} transactions={bucketMonth.transactions}/>
        : null}

        <div className='bottom-buttons'>
          {bucketMonth.transactions && bucketMonth.transactions.pageInfo.hasNextPage ?
            <div>
              <Button onClick={::this.loadTransactions}>Load More</Button>
            </div>
          : null}
          <div>
            <Button
              to={`/app/labels/${bucketMonth.bucket.id}`}
              flat
              variant='primary'
              className='bottom-load-button-right'
            >
              View All Months
            </Button>
          </div>
        </div>
      </SuperCard>
    );
  }
}

BillMonth = Relay.createContainer(BillMonth, {
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
    bucketMonth: ()=> Relay.QL`
      fragment on BucketMonthNode {
        amount
        avgAmount

        bucket {
          id
          name
        }

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

export default BillMonth;

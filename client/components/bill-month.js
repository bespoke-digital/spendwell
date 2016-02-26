
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
    onClick: PropTypes.func,
    selected: PropTypes.bool,
  };

  static defaultProps = {
    selected: false,
  };

  // componentWillReceiveProps(props) {
  //   const { selected, bucketMonth } = props;
  //   console.log('componentWillReceiveProps', selected, bucketMonth.name);
  //   if (relay.variables.loadTransactions !== selected)
  //     relay.setVariables({ loadTransactions: selected });
  // }

  render() {
    const { bucketMonth, onClick, selected, relay } = this.props;
    const { transactionCount } = relay.variables;

    return (
      <SuperCard expanded={selected} summary={
        <Card
          onSummaryClick={onClick}
          expanded={selected}
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
                : 'N/A'}
              </div>
              <div className='amount'>
                <Money amount={bucketMonth.amount} abs={true}/>
              </div>
            </div>
          }
        >
          * Average is based on the last 3 months activity
        </Card>
      }>
        {bucketMonth.transactions ?
          <TransactionList transactions={bucketMonth.transactions} monthHeaders={false}/>
        : null}

        <div className='bottom-load-button'>
          {bucketMonth.transactions && bucketMonth.transactions.pageInfo.hasNextPage ?
            <div>
              <Button onClick={relay.setVariables.bind(relay, {
                transactionCount: transactionCount + 20,
              })}>Load More</Button>
            </div>
          : null}
          <div>
            <Button
              to={`/app/buckets/${bucketMonth.bucket.id}`}
              flat
              variant='primary'
              className='bottom-load-button-right'
            >
              View All
            </Button>
          </div>
        </div>
      </SuperCard>
    );
  }
}

BillMonth = Relay.createContainer(BillMonth, {
  initialVariables: {
    selected: true,
    transactionCount: 20,
  },
  prepareVariables(vars) {
    // console.log('prepareVariables', vars);
    return vars;
  },
  fragments: {
    bucketMonth: ()=> Relay.QL`
      fragment on BucketMonthNode {
        name
        amount
        avgAmount
        transactions(first: $transactionCount) @include(if: $selected) {
          ${TransactionList.getFragment('transactions')}
          pageInfo {
            hasNextPage
          }
        }
        bucket {
          id
        }
      }
    `,
  },
});

export default BillMonth;

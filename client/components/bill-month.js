
import { Component, PropTypes } from 'react';
import moment from 'moment';
import Relay from 'react-relay';

import SuperCard from 'components/super-card';
import Card from 'components/card';
import Money from 'components/money';
import Progress from 'components/progress';
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

  componentWillReceiveProps(props) {
    const { selected, bucketMonth } = props;
    console.log('componentWillReceiveProps', selected, bucketMonth.name);
    // if (relay.variables.loadTransactions !== selected)
    //   relay.setVariables({ loadTransactions: selected });
  }

  render() {
    const { bucketMonth, month, onClick, selected, relay } = this.props;
    const { transactionCount } = relay.variables;

    const progress = parseInt((bucketMonth.amount / bucketMonth.avgAmount) * 100);
    const monthProgress = month.isBefore(moment().subtract(1, 'month')) ? 100 : (
      parseInt((moment().date() / month.clone().endOf('month').date()) * 100)
    );

    return (
      <SuperCard expanded={selected} summary={
        <Card
          onSummaryClick={onClick}
          expanded={selected}
          className={` bucket ${
            progress > 100 ? 'bucket-danger' :
            progress > monthProgress ? 'bucket-warn' :
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
          <Progress
            current={bucketMonth.amount}
            target={bucketMonth.avgAmount}
            marker={monthProgress}
            color={progress > 100 ? 'danger' : progress > monthProgress ? 'warn' : 'success'}
          />
          <div className='progress-numbers'>
            <div>
              <Money amount={bucketMonth.amount} abs={true}/>
            </div>
            <div><Money amount={bucketMonth.avgAmount} abs={true}/></div>
          </div>

          {bucketMonth.bucket ?
            <Button to={`/app/buckets/${bucketMonth.bucket.id}`}>View</Button>
          : null}
        </Card>
      }>
        {bucketMonth.transactions ?
          <TransactionList transactions={bucketMonth.transactions} monthHeaders={false}/>
        : null}

        {bucketMonth.transactions && bucketMonth.transactions.pageInfo.hasNextPage ?
          <div className='bottom-load-button'>
            <Button onClick={relay.setVariables.bind(relay, {
              transactionCount: transactionCount + 20,
            })}>Load More</Button>
          </div>
        : null}
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
    console.log('prepareVariables', vars);
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

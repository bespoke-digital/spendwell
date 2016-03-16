
import { Component, PropTypes } from 'react';
import moment from 'moment';
import Relay from 'react-relay';

import SuperCard from 'components/super-card';
import Card from 'components/card';
import Money from 'components/money';
import Progress from 'components/progress';
import TransactionList from 'components/transaction-list';
import Button from 'components/button';


class BucketMonth extends Component {
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

  render() {
    const { bucketMonth, month, onClick, relay } = this.props;
    const { transactionCount, open } = relay.variables;

    const progress = parseInt((bucketMonth.amount / bucketMonth.avgAmount) * 100);
    const monthProgress = month.isBefore(moment().subtract(1, 'month')) ? 100 : (
      parseInt((moment().date() / month.clone().endOf('month').date()) * 100)
    );

    return (
      <SuperCard expanded={open} summary={
        <Card
          onSummaryClick={onClick}
          expanded={open}
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
                : '-'}
              </div>
              <div className='amount'><Money amount={bucketMonth.amount} abs={true}/></div>
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
            <div><Money amount={bucketMonth.amount} abs={true}/></div>
            <div><Money amount={bucketMonth.avgAmount} abs={true}/></div>
          </div>
          <div className='actions'>
            <Button to={`/app/labels/${bucketMonth.bucket.id}/edit`}>Edit</Button>
          </div>
        </Card>
      }>
        {bucketMonth.transactions ?
          <TransactionList transactions={bucketMonth.transactions}/>
        : null}

        <div className='bottom-buttons'>
          {bucketMonth.transactions && bucketMonth.transactions.pageInfo.hasNextPage ?
            <Button onClick={relay.setVariables.bind(relay, {
              transactionCount: transactionCount + 20,
            })} flat>Load More</Button>
          : null}
          <Button
            to={`/app/labels/${bucketMonth.bucket.id}`}
            flat
            variant='primary'
            className='bottom-load-button-right'
          >
            View All Months
          </Button>
        </div>
      </SuperCard>
    );
  }
}

BucketMonth = Relay.createContainer(BucketMonth, {
  initialVariables: {
    transactionCount: 20,
    open: false,
  },
  fragments: {
    bucketMonth: ()=> Relay.QL`
      fragment on BucketMonthNode {
        name
        amount
        avgAmount
        transactions(first: 20) @include(if: $open) {
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

export default BucketMonth;

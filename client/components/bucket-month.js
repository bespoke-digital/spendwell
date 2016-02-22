
import { Component, PropTypes } from 'react';
import moment from 'moment';
import Relay from 'react-relay';

import SuperCard from 'components/super-card';
import Card from 'components/card';
import Money from 'components/money';
import Progress from 'components/progress';
import TransactionList from 'components/transaction-list';


class BucketMonth extends Component {
  static propTypes = {
    month: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    selected: PropTypes.bool,
  };

  static defaultProps = {
    selected: false,
  };

  render() {
    const { bucketMonth, month, onClick, selected, children } = this.props;

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
          <div className='bucket-children'>{children}</div>
        </Card>
      }>
        {bucketMonth.transactions ?
          <TransactionList transactions={bucketMonth.transactions} monthHeaders={false}/>
        : null}
      </SuperCard>
    );
  }
}

BucketMonth = Relay.createContainer(BucketMonth, {
  initialVariables: {
    selected: false,
  },
  fragments: {
    bucketMonth: ()=> Relay.QL`
      fragment on BucketMonthNode {
        name
        amount
        avgAmount
        transactions(first: 1000) @include(if: $selected) {
          ${TransactionList.getFragment('transactions')}
        }
      }
    `,
  },
});

export default BucketMonth;

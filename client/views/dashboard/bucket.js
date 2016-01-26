
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import moment from 'moment';

import Card from 'components/card';
import Money from 'components/money';
import Progress from 'components/progress';


@reactMixin.decorate(ReactMeteorData)
export default class Bucket extends Component {
  static propTypes = {
    bucket: PropTypes.object.isRequired,
    month: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    selected: PropTypes.bool,
  };

  static defaultProps = {
    selected: false,
  };

  getMeteorData() {
    const { selected, month, bucket } = this.props;

    if (!selected)
      return {};

    return {
      transactions: bucket.transactions({
        date: {
          $gte: month.toDate(),
          $lt: month.clone().add(1, 'month').toDate(),
        },
      }).fetch(),
    };
  }

  render() {
    const { bucket, month, onClick, selected, children } = this.props;
    const { transactions } = this.data;

    const currentAmount = bucket.amount(month);

    const previousMonths = _.dropWhile([
      bucket.amount(month.clone().subtract(1, 'month')),
      bucket.amount(month.clone().subtract(2, 'months')),
      bucket.amount(month.clone().subtract(3, 'months')),
    ], 0);
    const previousAmount = _.sum(previousMonths) / previousMonths.length;

    const progress = parseInt((currentAmount / previousAmount) * 100);
    const monthProgress = month.isBefore(moment().subtract(1, 'month')) ? 100 : (
      parseInt((moment().date() / month.clone().endOf('month').date()) * 100)
    );

    return (
      <Card onClick={onClick} expanded={selected} className={` bucket ${
        progress > 100 ? 'bucket-danger' :
        progress > monthProgress ? 'bucket-warn' :
        'bucket-success'
      }`}>
        <div className='summary'>
          <div>{bucket.name}</div>
          <div className='amount avg'><Money amount={previousAmount} abs={true}/></div>
          <div className='amount'><Money amount={currentAmount} abs={true}/></div>
        </div>
        {selected ?
          <div>
            <Progress
              current={currentAmount}
              target={previousAmount}
              marker={monthProgress}
              color={progress > 100 ? 'danger' : progress > monthProgress ? 'warn' : 'success'}
            />
            <div className='progress-numbers'>
              <div><Money amount={currentAmount} abs={true}/></div>
              <div><Money amount={previousAmount} abs={true}/></div>
            </div>
            {transactions && transactions.length ?
              <table className='mui-table'>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction)=> (
                    <tr key={transaction._id}>
                      <td>{moment(transaction.date).format('Do')}</td>
                      <td>{transaction.name}</td>
                      <td><Money amount={transaction.amount} abs={true}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            : null}
            <div className='bucket-children'>{children}</div>
          </div>
        : null}
      </Card>
    );
  }
}

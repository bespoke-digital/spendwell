
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import moment from 'moment';

import Card from 'components/card';
import CardList from 'components/card-list';
import styles from 'sass/components/transaction-list';


export default class TransactionList extends Component {
  static propTypes = {
    transactions: PropTypes.array.isRequired,
  };

  total(transactions) {
    let sum = 0;
    transactions.forEach((t)=> sum += parseInt(parseFloat(t.amount) * 100));
    return sum / 100;
  }

  render() {
    const { transactions, className } = this.props;

    const monthlyTransactions = transactions.reduce((monthly, transaction)=> {
      const monthKey = moment(transaction.date).format('YYYY-MM-01');
      if (_.isUndefined(monthly[monthKey]))
        monthly[monthKey] = [];
      monthly[monthKey].push(transaction);
      return monthly;
    }, {});

    const listedElements = [];

    _.each(monthlyTransactions, (transactions, month)=> {
      listedElements.push([
        <Card className='month' key={1}>
          <div className='name'>
            {moment(month).format('MMMM YYYY')}
          </div>
          <div className='amount'>
            ${this.total(transactions)}
          </div>
        </Card>,
        transactions.map((transaction)=> (
          <Card key={transaction.id} className='transaction'>
            <div className='name'>{transaction.name}</div>
            <div className='category'>
              {transaction.category ? transaction.category.name : null}
            </div>
            <div className='date'>
              {moment(transaction.date).fromNow()}
            </div>
            <div className='amount'>${transaction.amount}</div>
          </Card>
        )),
      ]);
    });

    return (
      <CardList className={`${styles.root} ${className ? className : ''}`}>
        {listedElements}
      </CardList>
    );
  }
}

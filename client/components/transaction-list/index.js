
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import moment from 'moment';
import reactMixin from 'react-mixin';

import Card from 'components/card';
import CardList from 'components/card-list';
import Money from 'components/money';

import Categories from 'collections/categories';
import Transactions from 'collections/transactions';
import { Bucket } from 'collections/buckets';

import styles from 'sass/components/transaction-list';

import Transaction from './transaction';
import Filters from './filters';


@reactMixin.decorate(ReactMeteorData)
export default class TransactionList extends Component {
  static propTypes = {
    filters: PropTypes.array.isRequired,
    onFiltersChange: PropTypes.func,
    editFilters: PropTypes.bool,
  };

  static defaultProps = {
    editFilters: true,
  };

  constructor() {
    super();
    this.state = {};
  }

  getMeteorData() {
    const { filters } = this.props;

    return {
      categories: Categories.find({ parent: null }).fetch(),
      transactions: Transactions.find(Bucket.convertFilters(filters)).fetch(),
    };
  }

  total(transactions) {
    let sum = 0;
    transactions.forEach((t)=> sum += parseInt(parseFloat(t.amount) * 100));
    return sum / 100;
  }

  updateFilters(filters = {}) {
    this.props.onFiltersChange && this.props.onFiltersChange(filters);
  }

  render() {
    const { className, editFilters, filters, children } = this.props;
    const { transactions } = this.data;

    const monthlyTransactions = transactions.reduce((monthly, transaction)=> {
      const monthKey = moment(transaction.date).format('YYYY-MM-01');
      if (_.isUndefined(monthly[monthKey]))
        monthly[monthKey] = [];
      monthly[monthKey].push(transaction);
      return monthly;
    }, {});

    const months = [];

    Object.keys(monthlyTransactions).sort().reverse().forEach((month)=> {
      const transactions = monthlyTransactions[month];
      months.push(
        <CardList key={month}>
          <Card className='month'>
            {moment(month).format('MMMM YYYY')}
          </Card>
          {_.sortByOrder(transactions, 'date', 'desc').map((transaction)=>
            <Transaction key={transaction._id} transaction={transaction}/>
          )}
          <Card className='total'>
            <div className='summary'>
              <div>Total</div>
              <div className='amount'>
                <Money amount={this.total(transactions)} abs={true}/>
              </div>
            </div>
          </Card>
        </CardList>
      );
    });

    return (
      <div className={`${styles.root} ${className ? className : ''}`}>
        {editFilters ?
          <Filters
            onChange={::this.updateFilters}
            filters={filters}
          >
            {children}
          </Filters>
        : children}
        {months}
      </div>
    );
  }
}

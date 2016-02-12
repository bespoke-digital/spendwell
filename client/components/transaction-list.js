
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import moment from 'moment';
import Relay from 'react-relay';

import Card from 'components/card';
import CardList from 'components/card-list';
import Money from 'components/money';
import ListTransaction from 'components/list-transaction';

import styles from 'sass/components/transaction-list';


const sumTransactions = (transactions)=> transactions.reduce((s, t)=> s + t.amount, 0);

class TransactionList extends Component {
  static propTypes = {
    monthHeaders: PropTypes.bool,
  };

  static defaultProps = {
    monthHeaders: true,
  };

  render() {
    const { transactions, monthHeaders } = this.props;

    if (!monthHeaders) {
      return (
        <div>
          {transactions.edges.map(({ node })=>
            <ListTransaction key={node.id} transaction={node}/>
          )}
        </div>
      );
    } else {
      const monthlyTransactions = transactions.edges.reduce((monthly, { node })=> {
        const monthKey = moment(node.date).format('YYYY/MM');
        if (_.isUndefined(monthly[monthKey]))
          monthly[monthKey] = [];
        monthly[monthKey].push(node);
        return monthly;
      }, {});

      const months = [];

      Object.keys(monthlyTransactions).sort().reverse().forEach((month)=> {
        const transactions = monthlyTransactions[month];
        if (!transactions || transactions.length === 0) return;
        months.push(
          <CardList key={month}>
            <Card className='month'>
              {moment(month, 'YYYY/MM').format('MMMM YYYY')}
            </Card>
            {_.sortBy(transactions, (t)=> t.date).reverse().map((transaction)=>
              <ListTransaction key={transaction.id} transaction={transaction}/>
            )}
            <Card className='total'>
              <div className='summary'>
                <div>Total</div>
                <div className='amount'>
                  <Money amount={sumTransactions(transactions)} abs={true}/>
                </div>
              </div>
            </Card>
          </CardList>
        );
      });

      return (
        <div className={styles.root}>{months}</div>
      );
    }
  }
}

TransactionList = Relay.createContainer(TransactionList, {
  fragments: {
    transactions: ()=> Relay.QL`
      fragment on TransactionNodeDefaultConnection {
        edges {
          node {
            ${ListTransaction.getFragment('transaction')}
            id
            amount
            date
          }
        }
      }
    `,
  },
});

export default TransactionList;

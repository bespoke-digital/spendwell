
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import moment from 'moment';
import Relay from 'react-relay';

import Card from 'components/card';
import CardList from 'components/card-list';
import ListTransaction from 'components/list-transaction';
import Money from 'components/money';

import styles from 'sass/components/transaction-list';


class TransactionList extends Component {
  static propTypes = {
    monthHeaders: PropTypes.bool,
    expand: PropTypes.bool,
    abs: PropTypes.bool,
  };

  static defaultProps = {
    monthHeaders: false,
    expand: true,
    abs: true,
  };

  constructor() {
    super();
    this.state = {};
  }

  toggleSelect(transaction) {
    const { expanded } = this.state;
    if (expanded === transaction.id)
      this.setState({ expanded: null });
    else
      this.setState({ expanded: transaction.id });
  }

  renderTransaction(transaction) {
    const { expand, abs } = this.props;
    const { expanded } = this.state;

    return <ListTransaction
      key={transaction.id}
      transaction={transaction}
      onClick={this.toggleSelect.bind(this, transaction)}
      expanded={expand && expanded === transaction.id}
      abs={abs}
    />;
  }

  render() {
    const { transactions, monthHeaders } = this.props;

    if (_.isNull(transactions) || _.isUndefined(transactions)) return null;

    if (!monthHeaders)
      return (
        <div>
          {transactions.edges.map(({ node })=> this.renderTransaction(node))}
        </div>
      );

    const monthlyTransactions = transactions.edges.reduce((monthly, { node })=> {
      const monthKey = moment(node.date).asUtc().format('YYYY/MM');
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
          <Card className='card-list-headings'>
            {moment(month, 'YYYY/MM').format('MMMM YYYY')}
          </Card>
          {_.sortBy(transactions, (t)=> t.date).reverse().map(::this.renderTransaction)}
          <Card summary={
            <div>
              <div><strong>Total</strong></div>
              <div><strong>
                <Money amount={_.sum(transactions, 'amount')} abs={true}/>
              </strong></div>
            </div>
          }/>
        </CardList>
      );
    });

    return (
      <div className={styles.root}>{months}</div>
    );
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
            date
            amount
          }
        }
      }
    `,
  },
});

export default TransactionList;

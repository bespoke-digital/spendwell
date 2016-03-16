
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import ListTransaction from 'components/list-transaction';

import styles from 'sass/components/transaction-list';


class TransactionList extends Component {
  static propTypes = {
    months: PropTypes.bool,
    expand: PropTypes.bool,
    abs: PropTypes.bool,
  };

  static defaultProps = {
    months: false,
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

  render() {
    const { transactions, expand, abs, months } = this.props;
    const { expanded } = this.state;

    if (_.isNull(transactions) || _.isUndefined(transactions)) return null;

    return (
      <div className={styles.root}>
        {transactions.edges.map(({ node })=>
          <ListTransaction
            key={node.id}
            transaction={node}
            onClick={this.toggleSelect.bind(this, node)}
            expanded={expand && expanded === node.id}
            dateFormat={months ? 'ddd • MMM Do' : 'ddd • Do'}
            abs={abs}
          />
        )}
      </div>
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
          }
        }
      }
    `,
  },
});

export default TransactionList;

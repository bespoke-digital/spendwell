
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';

import Card from 'components/card';
import Money from 'components/money';
import DateTime from 'components/date-time';
import Dropdown from 'components/dropdown';
import Icon from 'components/icon';
import TransactionQuickAdd from 'components/transaction-quick-add';

import styles from 'sass/components/list-transaction';


class ListTransaction extends Component {
  static propTypes = {
    abs: PropTypes.bool.isRequired,
    dateFormat: PropTypes.string.isRequired,
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
    const { viewer, transaction, expanded, onClick, abs, dateFormat, relay } = this.props;

    return (
      <Card
        className={`transaction ${styles.root}`}
        expanded={expanded}
        onSummaryClick={onClick}
        summary={
          <div>
            <div className='name'>
              {transaction.description}
            </div>
            <div className='buckets'>
              {transaction.buckets.edges.map(({ node })=>
                <span key={node.id}>{node.name}</span>
              )}
            </div>
            <div className='date'>
              <DateTime value={transaction.date} format={dateFormat}/>
            </div>
            <div className='amount'>
              <Money amount={transaction.amount} abs={abs}/>
            </div>
          </div>
        }
      >
        {relay.variables.open ?
          <div>
            <Row>
              <Col md='6'>
                <div><strong>{'Date: '}</strong><DateTime value={transaction.date}/></div>
                <div><strong>{'Amount: '}</strong><Money amount={transaction.amount}/></div>
                {transaction.buckets.edges.length ?
                  <div>
                    <strong>{'Labels: '}</strong>
                    <span className='buckets'>
                      {transaction.buckets.edges.map(({ node })=>
                        <span key={node.id}>{node.name}</span>
                      )}
                    </span>
                  </div>
                : null}
              </Col>
              <Col md='6'>
                <div><strong>{'Account: '}</strong>{transaction.account.name}</div>
                <div><strong>{'Institution: '}</strong>{transaction.account.institution.name}</div>
                {transaction.transferPair ?
                  <div><strong>{'Transfer To: '}</strong>{transaction.transferPair.account.name}</div>
                : null}
              </Col>
            </Row>

            <div className='actions'>
              <TransactionQuickAdd viewer={viewer} transaction={transaction}/>
            </div>

          </div>
        : null}
      </Card>
    );
  }
}

ListTransaction = Relay.createContainer(ListTransaction, {
  initialVariables: {
    open: false,
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${TransactionQuickAdd.getFragment('viewer')}
      }
    `,
    transaction: ()=> Relay.QL`
      fragment on TransactionNode {
        ${TransactionQuickAdd.getFragment('transaction')}

        description
        amount
        date

        category {
          name
        }

        buckets(first: 10) {
          edges {
            node {
              id
              name
            }
          }
        }

        fromSavings @include(if: $open)

        transferPair @include(if: $open) {
          account {
            name
          }
        }

        account @include(if: $open) {
          id
          name
          institution {
            id
            name
          }
        }
      }
    `,
  },
});

export default ListTransaction;

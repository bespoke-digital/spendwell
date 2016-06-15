
import _ from 'lodash'
import { Component, PropTypes } from 'react'
import Relay from 'react-relay'

import ListTransaction from 'components/list-transaction'
import Button from 'components/button'

import styles from 'sass/components/transaction-list'


class TransactionList extends Component {
  static propTypes = {
    months: PropTypes.bool,
    expand: PropTypes.bool,
    abs: PropTypes.bool,
    onLoadMore: PropTypes.func,
  };

  static defaultProps = {
    months: false,
    expand: true,
    abs: true,
  };

  constructor () {
    super()
    this.state = {}
  }

  toggleSelect (transaction) {
    const { expanded } = this.state
    if (expanded === transaction.id)
      this.setState({ expanded: null })
    else
      this.setState({ expanded: transaction.id })
  }

  render () {
    const { viewer, transactions, expand, abs, months, onLoadMore } = this.props
    const { expanded } = this.state

    if (_.isNull(transactions) || _.isUndefined(transactions)) return null

    return (
      <div className={styles.root}>
        {transactions.edges.map(({ node }) =>
          <ListTransaction
            key={node.id}
            viewer={viewer}
            transaction={node}
            onClick={this.toggleSelect.bind(this, node)}
            expanded={expand && expanded === node.id}
            months={months}
            abs={abs}
          />
        )}
        {onLoadMore && transactions.pageInfo.hasNextPage ?
          <div className='load-more'>
            <Button onClick={onLoadMore}>Load More</Button>
          </div>
        : null}
      </div>
    )
  }
}

TransactionList = Relay.createContainer(TransactionList, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${ListTransaction.getFragment('viewer')}
      }
    `,
    transactions: () => Relay.QL`
      fragment on TransactionNodeDefaultConnection {
        edges {
          node {
            ${ListTransaction.getFragment('transaction')}

            id
          }
        }

        pageInfo {
          hasNextPage
        }
      }
    `,
  },
})

export default TransactionList

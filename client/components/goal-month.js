
import { Component, PropTypes } from 'react'
import Relay from 'react-relay'

import SuperCard from 'components/super-card'
import Card from 'components/card'
import Money from 'components/money'
import TransactionList from 'components/transaction-list'
import Button from 'components/button'
import CardActions from 'components/card-actions'
import UpdateBucketSheet from 'components/update-bucket-sheet'

import eventEmitter from 'utils/event-emitter'


class GoalMonth extends Component {
  static propTypes = {
    relay: PropTypes.object.isRequired,
    viewer: PropTypes.object.isRequired,
    bucketMonth: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    expanded: PropTypes.bool,
    className: PropTypes.string,
  };

  static defaultProps = {
    expanded: false,
    className: '',
  };

  state = {
    updateBucket: false,
  };

  componentWillReceiveProps (nextProps) {
    if (nextProps.expanded !== this.props.expanded) {
      this.props.relay.setVariables({ open: nextProps.expanded })
    }
  }

  forceFetch () {
    eventEmitter.emit('forceFetch')
  }

  loadTransactions () {
    const { relay } = this.props
    const { transactionCount } = relay.variables

    relay.setVariables({ transactionCount: transactionCount + 20 })
  }

  render () {
    const { relay, viewer, bucketMonth, onClick, className } = this.props
    const { open } = relay.variables
    const { updateBucket } = this.state

    const hasTransaction = (
      bucketMonth.transactions &&
      bucketMonth.transactions.edges &&
      bucketMonth.transactions.edges.length > 0
    )

    return (
      <SuperCard expanded={open} summary={
        <Card
          onSummaryClick={onClick}
          expanded={open}
          className={`goal ${className}`}
          summary={
            <div>
              <div className='icon'>
                {bucketMonth.bucket.avatar ?
                  <img src={bucketMonth.bucket.avatar} alt={bucketMonth.bucket.name}/>
                :
                  <div>{bucketMonth.bucket.name[0]}</div>
                }
              </div>
              <div>{bucketMonth.bucket.name}</div>
              <div className='amount'>
                <Money amount={bucketMonth.amount} abs={true}/>
              </div>
            </div>
          }
        >
          <CardActions>
            <Button onClick={() => this.setState({ updateBucket: true })}>Edit</Button>
          </CardActions>

          <UpdateBucketSheet
            viewer={viewer}
            bucket={bucketMonth.bucket}
            visible={updateBucket}
            onRequestClose={() => this.setState({ updateBucket: false })}
            onUpdated={::this.forceFetch}
            onDeleted={::this.forceFetch}
          />
        </Card>
      }>
        {hasTransaction ?
          <TransactionList viewer={viewer} transactions={bucketMonth.transactions}/>
        : null}

        {hasTransaction && bucketMonth.transactions.pageInfo.hasNextPage ?
          <div className='bottom-buttons'>
            <Button onClick={::this.loadTransactions}>Load More</Button>
          </div>
        : null}
      </SuperCard>
    )
  }
}

GoalMonth = Relay.createContainer(GoalMonth, {
  initialVariables: {
    open: false,
    transactionCount: 20,
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${UpdateBucketSheet.getFragment('viewer')}
      }
    `,
    bucketMonth: () => Relay.QL`
      fragment on BucketMonthNode {
        amount

        bucket {
          ${UpdateBucketSheet.getFragment('bucket')}

          id
          name
          avatar
        }

        transactions(first: $transactionCount) @include(if: $open) {
          ${TransactionList.getFragment('transactions')}

          edges {
            node {
              id
            }
          }

          pageInfo {
            hasNextPage
          }
        }
      }
    `,
  },
})

export default GoalMonth

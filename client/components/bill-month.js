
import { Component, PropTypes } from 'react'
import Relay from 'react-relay'

import SuperCard from 'components/super-card'
import Card from 'components/card'
import Money from 'components/money'
import TransactionList from 'components/transaction-list'
import CardActions from 'components/card-actions'
import Button from 'components/button'
import Icon from 'components/icon'
import IconList from 'components/icon-list'
import UpdateBucketSheet from 'components/update-bucket-sheet'

import eventEmitter from 'utils/event-emitter'


class BillMonth extends Component {
  static propTypes = {
    month: PropTypes.object.isRequired,
    expanded: PropTypes.bool,
    onClick: PropTypes.func,
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
    if (nextProps.expanded !== this.props.expanded)
      this.props.relay.setVariables({ open: nextProps.expanded })
  }

  loadTransactions () {
    const { relay } = this.props
    const { transactionCount } = relay.variables

    relay.setVariables({ transactionCount: transactionCount + 20 })
  }

  forceFetch () {
    eventEmitter.emit('forceFetch')
  }

  render () {
    const { viewer, bucketMonth, onClick, className, relay } = this.props
    const { open } = relay.variables
    const { updateBucket } = this.state

    const hasTransaction = (
      bucketMonth.transactions &&
      bucketMonth.transactions.edges &&
      bucketMonth.transactions.edges.length > 0
    )

    const paid = bucketMonth.amount !== 0 && (
      Math.abs(bucketMonth.avgAmount - bucketMonth.amount) / Math.abs(bucketMonth.avgAmount) < 0.10
    )

    return (
      <SuperCard expanded={open} summary={
        <Card
          onSummaryClick={onClick}
          expanded={open}
          className={`bill ${paid ? 'bucket-success' : 'bucket-warn'} ${className}`}
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
              <div className='amount avg'>
                {bucketMonth.avgAmount ?
                  <Money amount={bucketMonth.avgAmount} abs={true}/>
                : '-'}
              </div>
              <div className='amount'>
                <Money amount={bucketMonth.amount} abs={true}/>
              </div>
            </div>
          }
        >
          <IconList>
            <div className={`${paid ? '' : 'warn'}`}>
              <Icon type={paid ? 'done' : 'alarm' }/>
              <div className='content'>{paid ? 'Paid' : 'Unpaid'}</div>
            </div>
          </IconList>

          <CardActions>
            <Button to={`/app/labels/${bucketMonth.bucket.id}`}>View All</Button>
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

BillMonth = Relay.createContainer(BillMonth, {
  initialVariables: {
    open: false,
    transactionCount: 20,
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${TransactionList.getFragment('viewer')}
        ${UpdateBucketSheet.getFragment('viewer')}
      }
    `,
    bucketMonth: () => Relay.QL`
      fragment on BucketMonthNode {
        amount
        avgAmount

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

export default BillMonth

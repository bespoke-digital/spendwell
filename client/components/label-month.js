
import { Component, PropTypes } from 'react'
import moment from 'moment'
import Relay from 'react-relay'

import SuperCard from 'components/super-card'
import Card from 'components/card'
import Money from 'components/money'
import Progress from 'components/progress'
import TransactionList from 'components/transaction-list'
import Button from 'components/button'
import CardActions from 'components/card-actions'
import UpdateBucketSheet from 'components/update-bucket-sheet'

import eventEmitter from 'utils/event-emitter'


class LabelMonth extends Component {
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

  forceFetch () {
    eventEmitter.emit('forceFetch')
  }

  render () {
    const { viewer, bucketMonth, month, onClick, className, relay } = this.props
    const { transactionCount, open } = relay.variables
    const { updateBucket } = this.state

    const progress = parseInt((bucketMonth.amount / bucketMonth.avgAmount) * 100)
    const monthProgress = month.isBefore(moment().subtract(1, 'month')) ? 100 : (
      parseInt((moment().date() / month.clone().endOf('month').date()) * 100)
    )

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
          className={`bucket ${
            progress > 100 ? 'bucket-danger' :
            progress > monthProgress ? 'bucket-warn' :
            'bucket-success'
          } ${className}`}
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
          <Progress
            current={bucketMonth.amount}
            target={bucketMonth.avgAmount}
            marker={monthProgress}
            color={progress > 100 ? 'danger' : progress > monthProgress ? 'warn' : 'success'}
          />
          <div className='progress-numbers'>
            <div><Money amount={bucketMonth.amount} abs={true}/></div>
            <div><Money amount={bucketMonth.avgAmount} abs={true}/></div>
          </div>

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
            <Button onClick={relay.setVariables.bind(relay, {
              transactionCount: transactionCount + 20,
            })} flat>Load More</Button>
          </div>
        : null}
      </SuperCard>
    )
  }
}

LabelMonth = Relay.createContainer(LabelMonth, {
  initialVariables: {
    transactionCount: 20,
    open: false,
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

        transactions(first: 20) @include(if: $open) {
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

export default LabelMonth

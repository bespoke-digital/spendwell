
import { Component, PropTypes } from 'react'
import Relay from 'react-relay'
import moment from 'moment'

import CardList from 'components/card-list'
import Button from 'components/button'
import TransactionList from 'components/transaction-list'
import ScrollTrigger from 'components/scroll-trigger'
import App from 'components/app'
import MonthSelector from 'components/month-selector'

import styles from 'sass/views/dashboard.scss'


class Dashboard extends Component {
  static propTypes = {
    relay: PropTypes.object,
    viewer: PropTypes.object,
    params: PropTypes.object.isRequired,
  };

  loadTransactions () {
    const { relay } = this.props
    const { transactionCount } = relay.variables

    relay.setVariables({ transactionCount: transactionCount + 20 })
  }

  // Loads mutated variables immediately.
  loadNewTransactions (arg) {
    this.props.relay.setVariables(arg)
    this.props.relay.forceFetch()
  }

  render () {
    const { viewer, relay } = this.props

    return (
      <App
        viewer={viewer}
        title='Transactions'
        className={styles.root}
        onForceFetch={relay.forceFetch}
      >
        <ScrollTrigger onTrigger={::this.loadTransactions}>
          <CardList>
            <MonthSelector
              month={relay.variables.month}
              first={moment(viewer.firstMonth, 'YYYY/MM')}
              onChange={(m) => this.loadNewTransactions({ month: m })}
            />
          </CardList>

          <CardList>
            <TransactionList
              viewer={viewer}
              transactions={viewer.summary.transactions}
              abs={false}
            />

            {viewer.summary.transactions && viewer.summary.transactions.pageInfo.hasNextPage ?
              <div className='bottom-buttons'>
                <Button onClick={::this.loadTransactions} flat>Load More</Button>
              </div>
            : null}
          </CardList>
        </ScrollTrigger>
      </App>
    )
  }
}

const now = moment()

Dashboard = Relay.createContainer(Dashboard, {
  initialVariables: {
    transactionCount: 20,
    month: moment().startOf('month'),
    date: now.format('MM/YYYY'),
  },
  prepareVariables: (variables) => {
    return {
      ...variables,
      date: variables.month.format('YYYY/MM'),
    }
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        ${TransactionList.getFragment('viewer')}

        firstMonth

        summary(month: $date) {
          transactions: transactions(first: $transactionCount) {
            ${TransactionList.getFragment('transactions')}

            pageInfo {
              hasNextPage
            }
          }
        }
      }
    `,
  },
})

export default Dashboard


import { Component } from 'react'
import Relay from 'react-relay'
import { browserHistory } from 'react-router'
import moment from 'moment'

import Card from 'components/card'
import SuperCard from 'components/super-card'
import CardList from 'components/card-list'
import Money from 'components/money'
import Transition from 'components/transition'
import IncomingSummary from 'components/incoming-summary'
import OutgoingSummary from 'components/outgoing-summary'
import MonthSelector from 'components/month-selector'

import styles from 'sass/views/dashboard-summary.scss'


class DashboardSummary extends Component {
  constructor () {
    super()
    this.state = {
      statusOpen: null,
      showInFromSavings: false,
    }
  }

  handleStatusClick (type) {
    const { statusOpen } = this.state
    if (statusOpen === type)
      this.setState({ statusOpen: null })
    else
      this.setState({ statusOpen: type })
  }

  render () {
    const { summary, viewer, periods } = this.props
    const { statusOpen } = this.state

    const {
      income,
      incomeEstimated,
      goalsTotal,
      billsUnpaidTotal,
      spent,
      net,
    } = summary

    const allocated = goalsTotal + billsUnpaidTotal + spent

    return (
      <CardList className={styles.root}>
        <MonthSelector
          month={periods.current}
          first={periods.first}
          onChange={(month) => browserHistory.push(`/app/dashboard/${month.format('YYYY/MM')}`)}
        />

        <Card className={`status ${statusOpen ? 'open' : ''}`}>
          <a
            className={`number ${statusOpen === 'in' ? 'open' : ''}`}
            onClick={this.handleStatusClick.bind(this, 'in')}
            href='#'
          >
            <div className='title'>In</div>
            <div className='amount'>
              <Money amount={income}/>
              <span className='asterisk'>{incomeEstimated ? '*' : ''}</span>
            </div>
          </a>
          <a
            className={`number ${statusOpen === 'out' ? 'open' : ''}`}
            onClick={this.handleStatusClick.bind(this, 'out')}
            href='#'
          >
            <div className='title'>Out</div>
            <div className='amount'>
              <Money amount={allocated} abs={true}/>
              <span className='asterisk'>{billsUnpaidTotal !== 0 ? '*' : ''}</span>
            </div>
          </a>
          <a
            className={`number ${statusOpen === 'net' ? 'open' : ''}`}
            onClick={this.handleStatusClick.bind(this, 'net')}
            href='#'
          >
            <div className='title'>
              {periods.current.isSame(new Date(), 'month') ? 'Safe To Spend' : 'Net'}
            </div>
            <div className='amount'><Money amount={net}/></div>
          </a>
        </Card>

        <Transition name='fade' show={statusOpen === 'in'}>
          <IncomingSummary summary={summary} viewer={viewer}/>
        </Transition>

        <Transition name='fade' show={statusOpen === 'out'}>
          <OutgoingSummary summary={summary}/>
        </Transition>

        <Transition name='fade' show={statusOpen === 'net'}>
          <SuperCard className='net-summary' expanded={true} summary={
            <Card></Card>
          }>
            <Card className='line-item'>
              <div className='name'>In</div>
              <div className='value'><Money amount={income}/></div>
            </Card>
            <Card className='line-item'>
              <div className='name'>Out</div>
              <div className='value'><Money amount={allocated}/></div>
            </Card>
            <Card className='line-item bold'>
              <div className='name'>Total</div>
              <div className='value'><Money amount={income + allocated}/></div>
            </Card>
          </SuperCard>
        </Transition>
      </CardList>
    )
  }
}

DashboardSummary = Relay.createContainer(DashboardSummary, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${IncomingSummary.getFragment('viewer')}
      }
    `,
    summary: () => Relay.QL`
      fragment on Summary {
        ${IncomingSummary.getFragment('summary')}
        ${OutgoingSummary.getFragment('summary')}

        income
        incomeEstimated
        goalsTotal
        billsUnpaidTotal
        spent
        net
      }
    `,
  },
})

export default DashboardSummary

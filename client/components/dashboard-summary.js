
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import moment from 'moment';

import Card from 'components/card';
import SuperCard from 'components/super-card';
import CardList from 'components/card-list';
import Button from 'components/button';
import Money from 'components/money';
import GoalMonth from 'components/goal-month';
import BucketMonth from 'components/bucket-month';
import BillMonth from 'components/bill-month';
import SpentFromSavings from 'components/spent-from-savings';
import TransactionList from 'components/transaction-list';
import ScrollTrigger from 'components/scroll-trigger';
import Transition from 'components/transition';
import App from 'components/app';

import { AssignTransactionsMutation } from 'mutations/buckets';

import styles from 'sass/views/dashboard.scss';


class DashboardSummary extends Component {
  constructor() {
    super();
    this.state = { statusOpen: null };
  }

  handleStatusClick(type) {
    const { statusOpen } = this.state;
    if (statusOpen === type)
      this.setState({ statusOpen: null });
    else
      this.setState({ statusOpen: type });
  }

  render() {
    const { summary, periods } = this.props;
    const { statusOpen } = this.state;

    const {
      income,
      trueIncome,
      incomeEstimated,
      goalsTotal,
      billsTotal,
      spent,
      net,
      transactions,
    } = summary;

    const allocated = goalsTotal + billsTotal + spent;
    const actualIncome = _.sum(transactions.edges, ({ node })=> node.amount);

    return (
      <CardList className='overview'>
        <Card className='month'>
          <Button to={`/app/dashboard/${periods.previous.format('YYYY/MM')}`}>
            <i className='fa fa-chevron-left'/>
          </Button>

          <div className='current'>{periods.current.format('MMMM YYYY')}</div>

          <Button
            to={`/app/dashboard/${periods.next.format('YYYY/MM')}`}
            disabled={periods.next.isAfter(periods.now)}
          >
            <i className='fa fa-chevron-right'/>
          </Button>
        </Card>

        <Card className={`status ${statusOpen ? 'open' : ''}`}>
          <a
            className={`number ${statusOpen === 'in' ? 'open' : ''}`}
            onClick={this.handleStatusClick.bind(this, 'in')}
            href='#'
          >
            <span className='title'>In</span>
            <div className='amount'>
              <Money amount={income}/>
              {incomeEstimated ? '*' : ''}
            </div>
          </a>
          <a
            className={`number ${statusOpen === 'out' ? 'open' : ''}`}
            onClick={this.handleStatusClick.bind(this, 'out')}
            href='#'
          >
            <span className='title'>Out</span>
            <div className='amount'><Money amount={allocated} abs={true}/></div>
          </a>
          <a
            className={`number ${statusOpen === 'net' ? 'open' : ''}`}
            onClick={this.handleStatusClick.bind(this, 'net')}
            href='#'
          >
            <span className='title'>Net</span>
            <div className='amount'><Money amount={net}/></div>
          </a>
        </Card>

        <Transition name='fade'>
          {statusOpen === 'in' ?
            <SuperCard className='status-details' expanded={true} summary={
              <Card summary={incomeEstimated ?
                <span>
                  <strong>*</strong>
                  Estimated based on 3-month average income
                </span>
              : null}/>
            }>
              <TransactionList transactions={transactions}/>
              <Card summary={
                <div>
                  <div><strong>Total</strong></div>
                  <div><strong><Money amount={trueIncome}/></strong></div>
                </div>
              }/>
            </SuperCard>
          : statusOpen == 'out' ?
            <SuperCard className='status-details' expanded={true} summary={
              <Card></Card>
            }>
              <Card summary={
                <div>
                  <div>Goals</div>
                  <div><Money amount={goalsTotal} abs={true}/></div>
                </div>
              }/>
              <Card summary={
                <div>
                  <div>Bills</div>
                  <div><Money amount={billsTotal} abs={true}/></div>
                </div>
              }/>
              <Card summary={
                <div>
                  <div>Expenses</div>
                  <div><Money amount={spent} abs={true}/></div>
                </div>
              }/>
              <Card summary={
                <div>
                  <div><strong>Total</strong></div>
                  <div><strong><Money amount={allocated} abs={true}/></strong></div>
                </div>
              }/>
            </SuperCard>
          : statusOpen ?
            <Card className='status-details'>
              Details on {statusOpen}
            </Card>
          : null}
        </Transition>
      </CardList>
    );
  }
}

const now = moment();

DashboardSummary = Relay.createContainer(DashboardSummary, {
  fragments: {
    summary: ()=> Relay.QL`
      fragment on Summary {
        income
        trueIncome
        incomeEstimated
        goalsTotal
        billsTotal
        spent
        net
        transactions(first: 100, amountGt: 0) {
          ${TransactionList.getFragment('transactions')}
        }
      }
    `,
  },
});

export default DashboardSummary;


import { Component } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import SuperCard from 'components/super-card';
import CardList from 'components/card-list';
import Button from 'components/button';
import Money from 'components/money';
import TransactionList from 'components/transaction-list';
import Transition from 'components/transition';

import styles from 'sass/views/dashboard-summary.scss';


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
      billsUnpaidTotal,
      spent,
      net,
      transactions,
    } = summary;

    const allocated = goalsTotal + billsUnpaidTotal + spent;

    return (
      <CardList className={styles.root}>
        <Card className='month'>
          <Button
            to={`/app/dashboard/${periods.previous.format('YYYY/MM')}`}
            disabled={periods.previous.isSame(periods.first)}
          >
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
            <div className='title'>Net</div>
            <div className='amount'><Money amount={net}/></div>
          </a>
        </Card>

        <Transition name='fade' show={statusOpen === 'in'}>
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
        </Transition>

        <Transition name='fade' show={statusOpen === 'out'}>
          <SuperCard className='status-details' expanded={true} summary={
            <Card>
              {billsUnpaidTotal !== 0 ?
                <div>
                  <strong>*</strong>
                  Includes estimates for unpaid bills based on 3-month average.
                </div>
              : null}
            </Card>
          }>
            <Card summary={
              <div>
                <div>Goals</div>
                <div><Money amount={goalsTotal} abs={true}/></div>
              </div>
            }/>
            <Card summary={
              <div>
                <div>Unpaid Bills</div>
                <div><Money amount={billsUnpaidTotal} abs={true}/></div>
              </div>
            }/>
            <Card summary={
              <div>
                <div>Money Spent</div>
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
        </Transition>

        <Transition name='fade' show={statusOpen === 'net'}>
          <SuperCard className='status-details' expanded={true} summary={
            <Card></Card>
          }>
            <Card summary={
              <div>
                <div>In</div>
                <div><Money amount={income}/></div>
              </div>
            }/>
            <Card summary={
              <div>
                <div>Out</div>
                <div><Money amount={allocated}/></div>
              </div>
            }/>
            <Card summary={
              <div>
                <div><strong>Total</strong></div>
                <div><strong><Money amount={income + allocated}/></strong></div>
              </div>
            }/>
          </SuperCard>
        </Transition>
      </CardList>
    );
  }
}

DashboardSummary = Relay.createContainer(DashboardSummary, {
  fragments: {
    summary: ()=> Relay.QL`
      fragment on Summary {
        income
        trueIncome
        incomeEstimated
        goalsTotal
        billsUnpaidTotal
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

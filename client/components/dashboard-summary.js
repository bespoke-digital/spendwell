
import _ from 'lodash';
import { Component } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import SuperCard from 'components/super-card';
import CardList from 'components/card-list';
import Button from 'components/button';
import Money from 'components/money';
import TransactionList from 'components/transaction-list';
import Transition from 'components/transition';
import MoneyInput from 'components/money-input';
import Dialog from 'components/dialog';

import { SetIncomeFromSavingsMutation } from 'mutations/transactions';

import styles from 'sass/views/dashboard-summary.scss';


class DashboardSummary extends Component {
  constructor() {
    super();
    this.state = {
      statusOpen: null,
      inFromSavings: {
        dialog: false,
        loading: false,
      },
    };
  }

  handleStatusClick(type) {
    const { statusOpen } = this.state;
    if (statusOpen === type)
      this.setState({ statusOpen: null });
    else
      this.setState({ statusOpen: type });
  }

  handleAddFromSavings() {
    this.setState({
      inFromSavings: _.extend(this.state.inFromSavings, { dialog: true }),
    });
  }

  handleAddFromSavingsSubmit() {
    const { viewer, summary } = this.props;
    const { inFromSavings } = this.state;

    this.setState({
      inFromSavings: _.extend(inFromSavings, { loading: true }),
    });

    Relay.Store.commitUpdate(new SetIncomeFromSavingsMutation({
      viewer,
      month: summary.monthStart,
      amount: inFromSavings.amount,
    }), {
      onFailure: ()=> {
        console.log('AssignTransactionsMutation Failure');
        this.setState({
          inFromSavings: _.extend(inFromSavings, { loading: false }),
        });
      },
      onSuccess: ()=> {
        console.log('AssignTransactionsMutation Success');
        this.setState({
          inFromSavings: _.extend(inFromSavings, { loading: false, dialog: false }),
        });
      },
    });
  }

  render() {
    const { summary, periods } = this.props;
    const { statusOpen, inFromSavings } = this.state;

    const {
      income,
      trueIncome,
      fromSavingsIncome,
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

        <Dialog visible={inFromSavings.dialog}>
          <div className='body'>
            <p>
              <strong>This will add extra money to this month's income.</strong><br/>
              It can be helpful to do if you're going to spend some saved money.
            </p>
            <MoneyInput
              label='Amount'
              value={!_.isUndefined(inFromSavings.amount) ? inFromSavings.amount : fromSavingsIncome}
              onChange={(amount)=> this.setState({
                inFromSavings: _.extend(inFromSavings, { amount }),
              })}
              autoFocus={true}
            />
          </div>
          <div className='actions'>
            <Button
              onClick={()=> this.setState({
                inFromSavings: _.extend(inFromSavings, { dialog: false }),
              })}
            >Cancel</Button>
            <Button
              onClick={::this.handleAddFromSavingsSubmit}
              variant='primary'
              loading={inFromSavings.loading}
            >Add</Button>
          </div>
        </Dialog>

        <Transition name='fade' show={statusOpen === 'in'}>
          <SuperCard className='status-details' expanded={true} summary={
            <Card summary={
              <div>
                {incomeEstimated ? <div><strong>*</strong>Estimate</div> : <div/>}
                <Button>Update Income Estimate</Button>
                <Button onClick={::this.handleAddFromSavings}>
                  <i className='fa fa-plus'/>
                  {' From Savings'}
                </Button>
              </div>
            }/>
          }>
            {fromSavingsIncome ?
              <Card summary={
                <div>
                  <div>From Savings</div>
                  <div><Money amount={fromSavingsIncome}/></div>
                </div>
              }/>
            : null}
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
                <div><strong>*</strong>Includes estimates for unpaid bills</div>
              : null}
            </Card>
          }>
            <Card summary={
              <div>
                <div>Goals</div>
                <div><Money amount={goalsTotal} abs={true}/></div>
              </div>
            }/>
            {billsUnpaidTotal < 0 ?
              <Card summary={
                <div>
                  <div>Unpaid Bills</div>
                  <div><Money amount={billsUnpaidTotal} abs={true}/></div>
                </div>
              }/>
            : null}
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
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${SetIncomeFromSavingsMutation.getFragment('viewer')}
      }
    `,
    summary: ()=> Relay.QL`
      fragment on Summary {

        monthStart
        income
        trueIncome
        fromSavingsIncome
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


import { Component } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import SuperCard from 'components/super-card';
import CardList from 'components/card-list';
import Button from 'components/button';
import Money from 'components/money';
import TransactionList from 'components/transaction-list';
import IncomeFromSavingsDialog from 'components/income-from-savings-dialog';


const LineItem = ({ name, value, bold, children })=> (
  <Card summary={
    <div className={bold ? 'bold' : ''}>
      <div>{name}</div>
      {children}
      <div><Money amount={value}/></div>
    </div>
  }/>
);


class IncomingSummary extends Component {
  constructor() {
    super();
    this.state = {
      showInFromSavings: false,
    };
  }

  render() {
    const { summary, viewer } = this.props;
    const {
      trueIncome,
      fromSavingsIncome,
      estimatedIncome,
      incomeEstimated,
      transactions,
    } = summary;
    const { showInFromSavings } = this.state;

    return (
      <SuperCard className='status-details' expanded={true} summary={
        <Card summary={
          <div>
            <div/>
            <Button onClick={()=> this.setState({ showInFromSavings: true })}>
              Add Money
            </Button>
          </div>
        }/>
      }>
        {incomeEstimated ?
          <div>
            <div className='heading'>
              <h3><span className='asterisk'>*</span>Estimated</h3>
            </div>

            <CardList>
              <LineItem name='From Previous Month' value={fromSavingsIncome}/>
              <LineItem name='Income Estimate' value={estimatedIncome}>
                <Button>Edit</Button>
              </LineItem>
              <LineItem name='Total' value={estimatedIncome + fromSavingsIncome} bold/>
            </CardList>

            <div className='heading'>
              <h3>
                Actual
                <small>We'll use this total once it's higher than the estimate</small>
              </h3>
            </div>
          </div>
        : null}

        <CardList className='last'>
          <LineItem name='From Previous Month' value={fromSavingsIncome}/>
          <TransactionList transactions={transactions}/>
          <Card summary={
            <div>
              <div><strong>Total</strong></div>
              <div><strong><Money amount={trueIncome + fromSavingsIncome}/></strong></div>
            </div>
          }/>
        </CardList>

        <IncomeFromSavingsDialog
          summary={summary}
          viewer={viewer}
          visible={showInFromSavings}
          onClose={()=> this.setState({ showInFromSavings: false })}
        />
      </SuperCard>
    );
  }
}

IncomingSummary = Relay.createContainer(IncomingSummary, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${IncomeFromSavingsDialog.getFragment('viewer')}
      }
    `,
    summary: ()=> Relay.QL`
      fragment on Summary {
        ${IncomeFromSavingsDialog.getFragment('summary')}

        trueIncome
        estimatedIncome
        fromSavingsIncome
        incomeEstimated

        transactions(first: 100, amountGt: 0) {
          ${TransactionList.getFragment('transactions')}
        }
      }
    `,
  },
});

export default IncomingSummary;

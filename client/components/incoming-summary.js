
import { Component } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import SuperCard from 'components/super-card';
import CardList from 'components/card-list';
import Money from 'components/money';
import TransactionList from 'components/transaction-list';
import IncomeFromSavingsDialog from 'components/income-from-savings-dialog';
import IncomeEstimateDialog from 'components/income-estimate-dialog';
import Transition from 'components/transition';
import TextActions from 'components/text-actions';
import A from 'components/a';
import ListHeading from 'components/list-heading';

import style from 'sass/components/incoming-summary';


const LineItem = ({ name, value, bold, children })=> (
  <Card className={`line-item ${bold ? 'bold' : ''}`}>
    <div className='info'>
      <div className='name'>{name}</div>
      <div className='value'><Money amount={value}/></div>
    </div>
    {children ? <TextActions>{children}</TextActions> : null}
  </Card>
);


class IncomingSummary extends Component {
  constructor() {
    super();
    this.state = {
      showFromSavingsDialog: false,
      showIncomeEstimateDialog: false,
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
    const { showFromSavingsDialog, showIncomeEstimateDialog } = this.state;

    return (
      <SuperCard className={style.root} expanded={true} summary={
        <Card>
          <TextActions>
            <A onClick={()=> this.setState({ showFromSavingsDialog: true })}>Add Money</A>
          </TextActions>
        </Card>
      }>
        {incomeEstimated ?
          <div>
            <ListHeading>
              <h3><span className='asterisk'>*</span>Estimated</h3>
            </ListHeading>

            <CardList>
              {fromSavingsIncome ?
                <LineItem name='From Previous Month' value={fromSavingsIncome}/>
              : null}
              <LineItem name='Income Estimate' value={estimatedIncome}>
                <A onClick={()=> this.setState({ showIncomeEstimateDialog: true })}>Edit</A>
              </LineItem>
              <LineItem name='Total' value={estimatedIncome + fromSavingsIncome} bold/>
            </CardList>

            <ListHeading>
              <h2>Actual <small>We'll use this total once it's higher than the estimate</small></h2>
            </ListHeading>
          </div>
        : null}

        <CardList className={incomeEstimated ? 'last' : ''}>
          {fromSavingsIncome ?
            <LineItem name='From Previous Month' value={fromSavingsIncome}/>
          : null}
          <TransactionList viewer={viewer} transactions={transactions}/>

          <LineItem name='Total' value={trueIncome + fromSavingsIncome} bold/>
        </CardList>

        {!incomeEstimated ?
          <CardList className='last disabled'>
            <LineItem name={
              <span>
                Income Estimate <br className='visible-xs'/>
                <small>Used when actual incoming money is below this number</small>
              </span>
            } value={estimatedIncome}>
              <A onClick={()=> this.setState({ showIncomeEstimateDialog: true })}>
                Edit
              </A>
            </LineItem>
          </CardList>
        : null}

        <Transition show={showFromSavingsDialog}>
          <IncomeFromSavingsDialog
            summary={summary}
            viewer={viewer}
            onRequestClose={()=> this.setState({ showFromSavingsDialog: false })}
          />
        </Transition>

        <Transition show={showIncomeEstimateDialog}>
          <IncomeEstimateDialog
            viewer={viewer}
            onRequestClose={()=> this.setState({ showIncomeEstimateDialog: false })}
          />
        </Transition>
      </SuperCard>
    );
  }
}

IncomingSummary = Relay.createContainer(IncomingSummary, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${IncomeFromSavingsDialog.getFragment('viewer')}
        ${IncomeEstimateDialog.getFragment('viewer')}
        ${TransactionList.getFragment('viewer')}
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

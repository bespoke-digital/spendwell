
import { Component } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import SuperCard from 'components/super-card';
import Money from 'components/money';


class OutgoingSummary extends Component {
  render() {
    const { summary } = this.props;
    const {
      goalsTotal,
      billsUnpaidTotal,
      billsPaidTotal,
      spent,
    } = summary;

    return (
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
        <Card summary={
          <div>
            <div>Unpaid Bills</div>
            <div><Money amount={billsUnpaidTotal} abs={true}/></div>
          </div>
        }/>
        <Card summary={
          <div>
            <div>Paid Bills</div>
            <div><Money amount={billsPaidTotal} abs={true}/></div>
          </div>
        }/>
        <Card summary={
          <div>
            <div>Money Spent</div>
            <div><Money amount={spent - billsPaidTotal} abs={true}/></div>
          </div>
        }/>
        <Card summary={
          <div>
            <div><strong>Total</strong></div>
            <div><strong><Money amount={goalsTotal + billsUnpaidTotal + spent} abs={true}/></strong></div>
          </div>
        }/>
      </SuperCard>
    );
  }
}

OutgoingSummary = Relay.createContainer(OutgoingSummary, {
  fragments: {
    summary: ()=> Relay.QL`
      fragment on Summary {
        goalsTotal
        billsUnpaidTotal
        billsPaidTotal
        spent
      }
    `,
  },
});

export default OutgoingSummary;

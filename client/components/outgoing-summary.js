
import { Component } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import SuperCard from 'components/super-card';
import Money from 'components/money';

import style from 'sass/components/outgoing-summary';


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
      <SuperCard className={style.root} expanded={true} summary={
        <Card>
          {billsUnpaidTotal !== 0 ?
            <div><strong>*</strong>Includes estimates for unpaid bills</div>
          : null}
        </Card>
      }>
        <Card className='line-item'>
          <div className='name'>Goals</div>
          <div className='value'><Money amount={goalsTotal} abs={true}/></div>
        </Card>
        <Card className='line-item'>
          <div className='name'>Unpaid Bills</div>
          <div className='value'><Money amount={billsUnpaidTotal} abs={true}/></div>
        </Card>
        <Card className='line-item'>
          <div className='name'>Paid Bills</div>
          <div className='value'><Money amount={billsPaidTotal} abs={true}/></div>
        </Card>
        <Card className='line-item'>
          <div className='name'>Money Spent</div>
          <div className='value'><Money amount={spent - billsPaidTotal} abs={true}/></div>
        </Card>
        <Card className='line-item bold'>
          <div className='name'>Total</div>
          <div className='value'><Money amount={goalsTotal + billsUnpaidTotal + spent} abs={true}/></div>
        </Card>
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
